// import { headers } from "next/headers"
import { Flights } from "~/app/_components/flights"
import { getRankedFlights } from "~/server/rank"
import { AirportSelect } from "./_components/airport-select"

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
      {/* dropdown of airports */}
      <AirportSelect airport="STN" />

      <div className="min-w-full md:min-w-[700px] md:gap-8">
        {/* <pre className="text-[8px]"></pre> */}
        <Flights flights={flights} />
      </div>
    </div>
  )
}
