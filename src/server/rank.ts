import { cache } from "react"
import { getCheapestFlights } from "./ryanair"
import { type AirportWeather, getDailyForecast } from "./weather"
import { EasyJet } from "~/server/easyjet"
import { type Flight } from "~/server/flights"
import dayjs from "dayjs"
import { allAirports } from "./airports"

export type WeatherFlight = Flight & AirportWeather
export type RankedFlight = WeatherFlight & {
  score: number
}

export const getRankedFlights = cache(async (airport: string, date: Date) => {
  const limit = process.env.NODE_ENV === "development" ? 5 : 1000
  const ryanairFlights = getCheapestFlights({
    airport,
    dateFrom: date,
    dateTo: date,
    limit,
  })

  const ezj = new EasyJet()
  const easyjetFlights = ezj.getAvailability({
    OriginIatas: airport,
    PreferredOriginIatas: airport,
    StartDate: dayjs(date).format("YYYY-MM-DD"),
    EndDate: dayjs(date).format("YYYY-MM-DD"),
    MaxResults: limit,
  })

  const flights = (
    await Promise.allSettled([ryanairFlights, easyjetFlights])
  ).flatMap((flights) => (flights.status === "fulfilled" ? flights.value : []))
  console.log("total flights", flights.length)

  const airports = new Set(flights.map((flight) => flight.destination))

  console.log("Trying to fetch weather for airports", airports.size)
  const airportWeathers = await getAirportWeatherMap(airports, date)
  console.log("got ", Object.keys(airportWeathers).length, "airport weathers")

  const scoredFlights: WeatherFlight[] = flights.flatMap((flight) => {
    const weather = airportWeathers[flight.destination]
    if (!weather) return []
    const { avgTemp, forecast } = weather
    return [
      {
        ...flight,
        avgTemp,
        forecast,
      },
    ]
  })

  return scoredFlights
})

async function getAirportWeatherMap(airports: Set<string>, dateFrom: Date) {
  const airportWeathers = {} as Record<string, AirportWeather>
  for (const airport of airports) {
    const airportData = allAirports[airport]
    if (airportData) {
      const weather = await getDailyForecast(
        airportData.latitude,
        airportData.longitude,
        dateFrom,
      )
      if (weather) {
        airportWeathers[airport] = weather
      }
    }
  }
  return airportWeathers
}
