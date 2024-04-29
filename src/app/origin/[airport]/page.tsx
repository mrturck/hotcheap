import { AirportSelect } from "~/app/_components/airport-select"
import { Flights } from "~/app/_components/flights"
import { getRankedFlights } from "~/server/rank"

export const revalidate = 180

export default async function Airport({
  params,
}: {
  params: { airport: string }
}) {
  const airport = params.airport.toUpperCase()
  const flights = await getRankedFlights(airport, new Date())

  return (
    <div>
      {/* dropdown of airports */}
      <AirportSelect airport={airport} />

      <div className="min-w-full md:min-w-[700px] md:gap-8">
        <Flights flights={flights} />
      </div>
    </div>
  )
}
