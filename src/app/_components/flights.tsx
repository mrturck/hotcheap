"use client"

import dayjs from "dayjs"
import { useMemo, useState } from "react"
import type { WeatherFlight, RankedFlight } from "~/server/rank"
import type { WeatherData } from "~/server/weather"
import { Slider } from "~/components/ui/slider"
import { DateSelect } from "./date-select"
import { AirportSearch } from "./airport-search"
import { type GeoHeaders } from "~/server/geo"

export function Flights({
  flights,
  airport,
  date,
  geo,
}: {
  flights: WeatherFlight[]
  airport: string
  date: Date
  geo: GeoHeaders
}) {
  const [volume, setVolume] = useState(0.5)

  const rankedFlights = useMemo(() => {
    const maxPrice = flights.reduce(
      (max, flight) => (flight.price > max ? flight.price : max),
      -Infinity,
    )
    const minTemp = flights.reduce(
      (min, flight) => (flight.maxTemp < min ? flight.maxTemp : min),
      Infinity,
    )

    const rankedFlights: RankedFlight[] = flights.map((flight) => {
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
    const randomFlight = above20[Math.floor(Math.random() * above20.length)]
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
      <div className="flex flex-col items-start space-y-2 py-4 text-lg md:flex-row md:items-center md:space-x-3 md:space-y-0">
        <span>Depart from: </span>
        <AirportSearch
          airport={airport}
          date={date}
          className="flex-1"
          geo={geo}
        />
      </div>
      <DateSelect airport={airport} date={date} />

      <div>
        <div className="flex space-x-4 text-xl">
          <span>💸🤑💸</span>
          <Slider
            className="flex-1"
            value={[volume]}
            onValueChange={(e) => setVolume(e[0]!)}
            min={0}
            max={1}
            step={0.1}
          />
          <span>🔥🏖️🌡️</span>
        </div>
        <div className="mb-8 flex justify-between text-xs ">
          <div className="flex-1 text-left">Cheapest</div>
          <div className="flex-1 text-center text-xl">↔️</div>
          <div className="flex-1 text-right">Hottest</div>
        </div>
      </div>

      {above20.length !== 0 && (
        <button className="border border-red-500 p-3" onClick={randomFlights}>
          Take me anywhere
        </button>
      )}

      {flights.length === 0 && (
        <div className="text-center">No flights found!</div>
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
        {flight.forecast.map((weather, index) => (
          <WeatherItem key={index} weather={weather} />
        ))}
      </div>
      Departing {flight.origin} at{" "}
      {dayjs(flight.departureTime).format("HH:mm dddd MMM D")}
      <br />
      <small>{flight.originFull}</small>
      <br />
      <br />
      <GetFlightLink flight={flight} />
    </div>
  )
}

const WeatherItem: React.FC<{ weather: WeatherData }> = ({ weather }) => {
  return (
    <div className="pb-4">
      <p>
        {weather.time.getDate()}/{weather.time.getMonth() + 1}
      </p>
      <img src={weather.icon} alt="weather icon" />
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
      <div className="border bg-green-800 py-3 text-center hover:bg-green-600">
        <strong>Buy Now</strong> for {flight.price} {flight.currency}
      </div>
    </a>
  )
}
