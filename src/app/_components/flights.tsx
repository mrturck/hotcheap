"use client"

import dayjs from "dayjs"
import { type FlightDestination } from "~/server/api/routers/post"
import { type RankedFlight } from "~/server/rank"

export function Flights({ flights }: { flights: RankedFlight[] }) {
  // console.log(flights)

  return (
    <div className="flex flex-col gap-2">
      {flights?.map((flight) => (
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
