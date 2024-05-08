import { Flights } from "~/app/_components/flights"
import { getClosestAirport } from "~/server/airports"
import { geoHeaders } from "~/server/geo"
import { getRankedFlights } from "~/server/rank"

export const revalidate = 180

export default async function Home() {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)

  const geo = geoHeaders()

  let iata = "STN"

  const { lat, lon } = geo
  // luton test
  // const lat = "51.88739385503539"
  // const lon = "-0.5281088423767155"

  const latitude = lat && parseFloat(lat)
  const longitude = lon && parseFloat(lon)
  if (latitude && longitude) {
    const result = getClosestAirport(latitude, longitude)
    if (result) {
      const { airport } = result
      iata = airport.iata
      console.log(
        `Geo ip (${geo.city}, ${geo.country}) (${latitude}, ${longitude}) closest airport ${iata} at (${airport.latitude}, ${airport.longitude}) (${airport.country}, ${airport.name})`,
      )
    }
  }

  const flights = await getRankedFlights(iata, tomorrow)

  return <Flights flights={flights} airport={iata} date={tomorrow} geo={geo} />
}
