import { Flights } from "~/app/_components/flights"
import { geoHeaders } from "~/server/geo"
import { getRankedFlights } from "~/server/rank"

export const revalidate = 180

export default async function Home() {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)

  const airport = "STN"
  const flights = await getRankedFlights(airport, tomorrow)
  const geo = geoHeaders()

  return (
    <Flights flights={flights} airport={airport} date={tomorrow} geo={geo} />
  )
}
