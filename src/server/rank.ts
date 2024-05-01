import { cache } from "react"
import { getCheapestFlights, ryanairAirports } from "./ryanair"
import { type AirportWeather, getDailyForecast } from "./weather"
import { EasyJet } from "~/server/easyjet"
import { Flight } from "~/server/flights"
import dayjs from "dayjs"

export type WeatherFlight = Flight & AirportWeather
export type RankedFlight = WeatherFlight & {
  score: number
}

export const getRankedFlights = cache(async (airport: string, date: Date) => {
  date.setHours(0, 0, 0, 0)
  const dateFrom = new Date(date)

  const dateTo = new Date(dateFrom)
  dateTo.setDate(dateTo.getDate() + 1)
  const ezj = new EasyJet()

  const ryanairFlights = await getCheapestFlights({
    airport,
    dateFrom,
    dateTo,
    maxPrice: 100,
    limit: process.env.NODE_ENV === "development" ? 10 : undefined,
  })

  const easyjetFlights = await ezj.getAvailability({
    OriginIatas: airport,
    PreferredOriginIatas: airport,
    StartDate: dayjs(dateFrom).format("YYYY-MM-DD"),
    EndDate: dayjs(dateTo).format("YYYY-MM-DD"),
    MaxPrice: 100,
    MaxResults: 100,
  })

  const flightsData = [...ryanairFlights, ...easyjetFlights]

  const airports = new Set(flightsData.map((flight) => flight.destination))

  console.log("Trying to fetch weather for airports", airports.size)
  const airportWeathers = await getAirportWeatherMap(airports, dateFrom)
  console.log("got ", Object.keys(airportWeathers).length, "airport weathers")

  const scoredFlights: WeatherFlight[] = flightsData.flatMap((flight) => {
    const weather = airportWeathers[flight.destination]
    if (!weather) return []
    const { maxTemp, dayOfMaxTemp, forecast } = weather
    return [
      {
        ...flight,
        maxTemp,
        dayOfMaxTemp,
        // score: maxTemp / flight.price,
        forecast,
      },
    ]
  })

  // const flightsGreaterThan20Temp = scoredFlights.filter(
  //   ({ maxTemp }) => maxTemp !== undefined && maxTemp > 20,
  // ).sort((a, b) => b.score - a.score)

  return scoredFlights
})

async function getAirportWeatherMap(airports: Set<string>, dateFrom: Date) {
  const airportWeathers = {} as Record<string, AirportWeather>
  for (const airport of airports) {
    const airportData = ryanairAirports[airport]
    if (airportData) {
      airportWeathers[airport] = await getDailyForecast(
        airportData.latitude,
        airportData.longitude,
        dateFrom,
      )
    }
  }
  return airportWeathers
}
