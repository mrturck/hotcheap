import { cache } from "react"
import { type Flight, getCheapestFlights, ryanairAirports } from "./ryanair"
import { type AirportWeather, getDailyForecast } from "./weather"

export type WeatherFlight = Flight & AirportWeather
export type RankedFlight = WeatherFlight & {
  score: number
}

export const getRankedFlights = cache(async (airport: string, date: Date) => {
  const flightsData = await getCheapestFlights({
    airport,
    dateFrom: date,
    dateTo: date,
    limit: process.env.NODE_ENV === "development" ? 10 : undefined,
  })
  console.log("got ", flightsData.length, "flights")

  const airports = new Set(flightsData.map((flight) => flight.destination))

  console.log("Trying to fetch weather for airports", airports.size)
  const airportWeathers = await getAirportWeatherMap(airports, date)
  console.log("got ", Object.keys(airportWeathers).length, "airport weathers")

  const scoredFlights: WeatherFlight[] = flightsData.flatMap((flight) => {
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
    const airportData = ryanairAirports[airport]
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
