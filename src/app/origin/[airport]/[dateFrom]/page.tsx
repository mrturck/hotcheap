import dayjs from "dayjs"
import { Flights } from "~/app/_components/flights"
import { geoHeaders } from "~/server/geo"
import { getRankedFlights } from "~/server/rank"

export const revalidate = 180

export default async function Airport({
  params,
}: {
  params: { airport: string; dateFrom: string }
}) {
  const dateFromParam = dayjs(params.dateFrom)
  const date = dateFromParam.isValid() ? dateFromParam : dayjs()

  const airport = params.airport.toUpperCase()
  const flights = await getRankedFlights(airport, date.toDate())

  const geo = geoHeaders()

  return (
    <Flights
      flights={flights}
      airport={airport}
      date={date.toDate()}
      geo={geo}
    />
  )
}
