import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
// import timezone from "dayjs/plugin/timezone"
import { Flights } from "~/app/_components/flights"
import { geoHeaders } from "~/server/geo"
import { getRankedFlights } from "~/server/rank"

dayjs.extend(utc)
// dayjs.extend(timezone)

export const revalidate = 180

export default async function Airport({
  params,
}: {
  params: { airport: string; dateFrom: string }
}) {
  const parsedDate = dayjs.utc(params.dateFrom)
  const date = parsedDate.isValid() ? parsedDate.toDate() : new Date()

  const airport = params.airport.toUpperCase()
  const flights = await getRankedFlights(airport, date)

  const geo = geoHeaders()

  return <Flights flights={flights} airport={airport} date={date} geo={geo} />
}
