import { cache } from "react"
import { type Flight, getCheapestFlights, ryanairAirports } from "./ryanair"
import { type AirportWeather, getDailyForecast } from "./weather"

export type WeatherFlight = Flight & AirportWeather
export type RankedFlight = WeatherFlight & {
  score: number
}

export const getRankedFlights = cache(async (airport: string, date: Date) => {
  // const dateStr = req.query.date || new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0];
  // const airport = "STN"
  // const today = new Date()
  // today.setHours(0, 0, 0, 0)
  // const tomorrow = new Date(today)
  // tomorrow.setDate(tomorrow.getDate() + 1)
  // const twoDays = new Date(tomorrow)
  // twoDays.setDate(twoDays.getDate() + 1)
  // const threeDays = new Date(twoDays)
  // threeDays.setDate(threeDays.getDate() + 1)

  date.setHours(0, 0, 0, 0)
  const dateFrom = new Date(date)

  const dateTo = new Date(dateFrom)
  dateTo.setDate(dateTo.getDate() + 1)

  const flightsData = await getCheapestFlights({
    airport,
    dateFrom,
    dateTo,
    maxPrice: 100,
    limit: process.env.NODE_ENV === "development" ? 10 : undefined,
  })
  console.log("got ", flightsData.length, "flights")
  // const flightsData = allFlightsData.slice(0, 50)

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
