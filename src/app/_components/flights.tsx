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
      (min, flight) => (flight.avgTemp < min ? flight.avgTemp : min),
      Infinity,
    )

    const rankedFlights: RankedFlight[] = flights.map((flight) => {
      // C algo
      const tempScore = (flight.avgTemp - minTemp) / minTemp // Normalize temperature to 0-1 range
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
    const above = rankedFlights.filter((flight) => flight.avgTemp >= 20)
    const below = rankedFlights.filter((flight) => flight.avgTemp < 20)

    return [above, below] as [RankedFlight[], RankedFlight[]]
  }, [rankedFlights])

  function randomFlights(): void {
    const randomFlight = above20[Math.floor(Math.random() * above20.length)]

    window.open(randomFlight!.bookingUrl, "_blank")
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
      {above20.map((flight, index) => (
        <FlightDestination key={flight.flightNumber ?? index} flight={flight} />
      ))}

      {below20.length > 0 && (
        <>
          {above20.length === 0 && (
            <div className="text-center text-lg">No hot flights found. 😔</div>
          )}
          <h3 className="mt-12 text-2xl font-bold text-blue-300">🥶 Cold</h3>
          <div className="mb-4 text-center text-sm">
            Destinations that average below 20°C the five days after arriving
          </div>
        </>
      )}
      {below20.map((flight, index) => (
        <FlightDestination
          key={flight.flightNumber ?? -index - 1}
          flight={flight}
        />
      ))}
    </div>
  )
}

const FlightDestination: React.FC<{ flight: RankedFlight }> = ({ flight }) => {
  return (
    <div className="border border-red-500 p-3">
      <h2 className="text-xl">
        {flight.destinationFull}: {Math.round(flight.avgTemp * 10) / 10}°C
      </h2>
      <div className="flex justify-center gap-2">
        {flight.forecast.map((weather, index) => (
          <WeatherItem key={index} weather={weather} />
        ))}
      </div>
      {flight.airline === "easyjet" && (
        <p>
          Departing {flight.origin} on{" "}
          {dayjs(flight.departureTime).format("dddd MMM D")}
        </p>
      )}
      {flight.airline === "ryanair" && (
        <p>
          Departing {flight.origin} at{" "}
          {dayjs(flight.departureTime).format("HH:mm dddd MMM D")}
        </p>
      )}
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
  return (
    <a href={flight.bookingUrl} target="_blank">
      <div className="border bg-green-800 py-3 text-center hover:bg-green-600">
        <strong>Buy Now</strong> for {flight.price} {flight.currency}
      </div>
    </a>
  )
}
