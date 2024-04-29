"use client"

import dayjs from "dayjs"
import { useMemo, useState } from "react"
import type { WeatherFlight, RankedFlight } from "~/server/rank"
import { WeatherData } from "~/server/weather"

export function Flights({ flights }: { flights: WeatherFlight[] }) {
  const [volume, setVolume] = useState(0.5)

  const rankedFlights = useMemo(() => {
    // const minPrice = flights.reduce(
    //   (min, flight) => (flight.price < min ? flight.price : min),
    //   Infinity,
    // )
    // const maxTemp = flights.reduce(
    //   (max, flight) => (flight.maxTemp > max ? flight.maxTemp : max),
    //   -Infinity,
    // )
    // console.log(minPrice, maxTemp)

    const maxPrice = flights.reduce(
      (max, flight) => (flight.price > max ? flight.price : max),
      -Infinity,
    )
    const minTemp = flights.reduce(
      (min, flight) => (flight.maxTemp < min ? flight.maxTemp : min),
      Infinity,
    )

    console.log(maxPrice, minTemp)

    const rankedFlights: RankedFlight[] = flights.map((flight) => {
      // V algo
      // const score =
      //   ((1 / flight.price) * (1 - volume) + flight.maxTemp * volume) /
      //   (minPrice * (1 - volume) + maxTemp * volume)

      // C algo
      const tempScore = (flight.maxTemp - minTemp) / minTemp // Normalize temperature to 0-1 range
      const priceScore = 1 - (flight.price - maxPrice) / maxPrice // Normalize price to 0-1 range (assuming max price is 1000)
      const score = volume * tempScore + (1 - volume) * priceScore

      return {
        ...flight,
        score,
      }
    })

    return rankedFlights.sort((a, b) => b.score - a.score)
  }, [flights, volume])

  const [above20, below20] = useMemo(() => {
    const above = rankedFlights.filter((flight) => flight.maxTemp >= 20)
    const below = rankedFlights.filter((flight) => flight.maxTemp < 20)

    return [above, below] as [RankedFlight[], RankedFlight[]]
  }, [rankedFlights])

  function randomFlights(): void {
    const randomFlight =
      rankedFlights[Math.floor(Math.random() * rankedFlights.length)]
    const urlParams = {
      adults: "1",
      teens: "0",
      children: "0",
      infants: "0",
      dateOut: randomFlight!.departureTime.toISOString().slice(0, 10),
      dateIn: "",
      isConnectedFlight: "false",
      discount: "0",
      promoCode: "",
      isReturn: "false",
      originIata: randomFlight!.origin,
      destinationIata: randomFlight!.destination,
    }

    window.open(
      `https://www.ryanair.com/gb/en/trip/flights/select?${new URLSearchParams(urlParams).toString()}`,
      "_blank",
    )
  }

  return (
    <div className="mt-5 flex flex-col gap-2">
      <div className="flex justify-between">
        <div className="text-left">Cheapest</div>
        <div className="text-center text-xl">😎</div>
        <div className="text-right">Hottest</div>
      </div>
      <div className="flex space-x-2">
        <span>💸🤑💸</span>

        <input
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          type="range"
          id="volume"
          name="volume"
          min="0"
          max="1"
          step="0.1"
          className="flex-1"
          value={volume}
        />
        <span>🔥🏖️🌡️</span>
      </div>

      <button className="border border-red-500 p-3" onClick={randomFlights}>
        Take me anywhere
      </button>

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
        {flight.destinationFull}: {Math.round(flight.maxTemp * 10) / 10}°C
      </h2>
      <small>that temp {dayjs(flight.dayOfMaxTemp).format("dddd MMM D")}</small>
      <br />
      <div className="flex justify-center gap-2">
        {flight.forecast.slice(0, 5).map((weather, index) => (
          <WeatherItem key={index} weather={weather} />
        ))}
      </div>
      Departing {flight.origin} at{" "}
      {dayjs(flight.departureTime).format("HH:mm dddd MMM D")}
      <br />
      <small>
        {flight.originFull}
        <br />
        <span>{flight.flightNumber}</span>
        <br />
        {/* score {Math.floor(flight.score * 300) / 100} */}
        score {flight.score}
      </small>
      <br />
      <br />
      <GetFlightLink flight={flight} />
    </div>
  )
}

const WeatherItem: React.FC<{ weather: WeatherData }> = ({ weather }) => {
  return (
    <div className="pb-4">
      <img src={weather.icon} />
      <p>{Math.round(weather.temp * 10) / 10}&deg;C</p>
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
