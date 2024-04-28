import { type Flight, getCheapestFlights, ryanairAirports } from "./ryanair"
import { type AirportWeather, getThreeHourlyForecastFiveDays } from "./weather"

export type RankedFlight = Flight &
  AirportWeather & {
    score: number
  }

export const getRankedFlights = async () => {
  // const dateStr = req.query.date || new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0];
  const airport = "STN"
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const twoDays = new Date(tomorrow)
  twoDays.setDate(twoDays.getDate() + 1)
  const threeDays = new Date(twoDays)
  threeDays.setDate(threeDays.getDate() + 1)

  const allFlightsData = await getCheapestFlights({
    airport,
    dateFrom: twoDays,
    dateTo: threeDays,
  })
  console.log("got ", allFlightsData.length, "flights")
  const flightsData = allFlightsData.slice(0, 50)

  const airports = new Set(flightsData.map((flight) => flight.destination))

  const airportWeathers = await getAirportWeatherMap(airports)
  console.log("got ", Object.keys(airportWeathers).length, "airport weathers")
  // console.log(airportWeathers)

  const scoredFlights: RankedFlight[] = flightsData.flatMap((flight) => {
    const weather = airportWeathers[flight.destination]
    if (!weather) return []
    const { maxTemp, dayOfMaxTemp, forecast } = weather
    return [
      {
        ...flight,
        maxTemp,
        dayOfMaxTemp,
        score: maxTemp / flight.price,
        forecast,
      },
    ]
  })

  const flightsGreaterThan20Temp = scoredFlights.filter(
    ({ maxTemp }) => maxTemp !== undefined && maxTemp > 20,
  )

  flightsGreaterThan20Temp.sort((a, b) => b.score - a.score)

  return flightsGreaterThan20Temp
}

async function getAirportWeatherMap(airports: Set<string>) {
  const airportWeathers = {} as Record<string, AirportWeather>
  for (const airport of airports) {
    const airportData = ryanairAirports[airport]
    if (airportData) {
      const weather = await getThreeHourlyForecastFiveDays(
        airportData.latitude,
        airportData.longitude,
      )
      airportWeathers[airport] = weather
    }
  }
  return airportWeathers
}
