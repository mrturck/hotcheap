import { Flights } from "~/app/_components/flights"
import { RankedFlight, getRankedFlights } from "~/server/rank"
import { AirportSelect } from "./_components/airport-select"
import { useMemo } from "react"

export const revalidate = 180

export default async function Home() {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const flights = await getRankedFlights("STN", tomorrow)

  // const headersList = headers()
  // const country = headersList.get("x-vercel-ip-country") ?? "GB"
  // const country = headersList.get("x-vercel-ip-latitude") ?? "GB"
  // const country = headersList.get("x-vercel-ip-longitude") ?? "GB"
  // const countryAirports = Object.values(ryanairAirports).filter(
  //   (airport) => airport.country === country,
  // )

  return (
    <div>
      <AirportSelect airport="STN" />

      <div className="min-w-full md:min-w-[700px] md:gap-8">
        <Flights flights={flights} />
      </div>
    </div>
  )
}
