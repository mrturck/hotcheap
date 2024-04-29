import dayjs from "dayjs"
import { useMemo } from "react"
import { type FlightDestination } from "~/server/api/routers/post"
import { type RankedFlight } from "~/server/rank"

export function Flights({ flights }: { flights: RankedFlight[] }) {
  const [above20, below20] = useMemo(() => {
    const above = flights.filter((flight) => flight.maxTemp >= 20)
    const below = flights.filter((flight) => flight.maxTemp < 20)
    return [above, below] as [RankedFlight[], RankedFlight[]]
  }, [flights])

  return (
    <div className="mt-5 flex flex-col gap-2">
      {flights.length === 0 && (
        <div className="text-center">No cheap flights found! (below £100)</div>
      )}
      {above20.map((flight) => (
        <FlightDestination key={flight.flightNumber} flight={flight} />
      ))}

      {below20.length > 0 && (
        <>
          {above20.length === 0 && (
            <div className="text-center text-lg">No hot flights found. 😔</div>
          )}
          <div className="mt-8 text-center text-lg">
            Destinations that won&apos;t go above 20°C in the next 5 days 🥶
          </div>
        </>
      )}
      {below20.map((flight) => (
        <FlightDestination key={flight.flightNumber} flight={flight} />
      ))}
    </div>
  )
}

const FlightDestination: React.FC<{ flight: RankedFlight }> = ({ flight }) => {
  return (
    <div className="border border-red-500 p-3">
      <h2 className="text-xl">
        {flight.destinationFull}: {flight.maxTemp}°C
      </h2>
      <small>that temp {dayjs(flight.dayOfMaxTemp).format("dddd MMM D")}</small>
      <br />
      Departing {flight.origin} at{" "}
      {dayjs(flight.departureTime).format("HH:mm dddd MMM D")}
      <br />
      <small>
        {flight.originFull}
        <br />
        <span>{flight.flightNumber}</span>
        <br />
        score {Math.floor(flight.score * 300) / 100}
      </small>
      <br />
      <br />
      <GetFlightLink flight={flight} />
    </div>
  )
}

const GetFlightLink: React.FC<{ flight: RankedFlight }> = ({
  flight: flight,
}) => {
  const urlParams = {
    adults: "1",
    teens: "0",
    children: "0",
    infants: "0",
    dateOut: flight.departureTime.toISOString().slice(0, 10),
    dateIn: "",
    isConnectedFlight: "false",
    discount: "0",
    promoCode: "",
    isReturn: "false",
    originIata: flight.origin,
    destinationIata: flight.destination,
  }

  return (
    <a
      href={`https://www.ryanair.com/gb/en/trip/flights/select?${new URLSearchParams(urlParams).toString()}`}
      target="_blank"
    >
      <div className="border bg-green-800 py-3 text-center">
        <strong>Buy Now</strong> for {flight.price} {flight.currency}
      </div>
    </a>
  )
}
