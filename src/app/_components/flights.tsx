"use client"

import dayjs from "dayjs"
import { useMemo, useState } from "react"
import type { WeatherFlight, RankedFlight } from "~/server/rank"
import type { WeatherData } from "~/server/weather"
import { Slider } from "~/components/ui/slider"
import { DateSelect } from "./date-select"
import { AirportSearch } from "./airport-search"
import { type GeoHeaders } from "~/server/geo"
import { airportsByCountry, allAirports } from "~/server/airports"

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
        <div className="group relative w-full cursor-pointer">
          <div className="absolute z-0 h-full w-full opacity-0 transition duration-100 group-hover:bg-[url('/background.jpeg')] group-hover:opacity-5"></div>

          <button
            className="w-full rounded-lg border border-red-500 p-3 group-hover:border-white"
            onClick={randomFlights}
          >
            <span className="inline-block duration-100 group-hover:rotate-90">
              🎲
            </span>
            &nbsp;Take me anywhere
          </button>
        </div>
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
  const airport = allAirports[flight.destination]
  const country = airport && airportsByCountry[airport.country]

  if (!country?.flagUrl) {
    console.log(airport, country)
  }

  return (
    <div className="group relative flex  flex-col gap-6 rounded-lg border border-red-500 hover:border-white">
      <div className="absolute z-0 h-full w-full opacity-0 transition duration-100 group-hover:bg-[url('/background.jpeg')] group-hover:opacity-5"></div>

      <div className="z-10 flex w-full flex-col items-center justify-between gap-2 p-3 sm:flex-row">
        <div className="flex-1 basis-1/4 text-left">
          {country?.flagUrl && (
            <img
              src={country.flagUrl}
              alt={`${country.code} flag`}
              className="inline-block h-6"
            />
          )}
        </div>
        <div className="flex w-full items-center items-center justify-center gap-2">
          <h2 className=" text-center text-2xl font-bold">
            {flight.destinationFull}
          </h2>
          <h2 className="self-end text-center text-lg">
            {Math.round(flight.avgTemp * 10) / 10}°C
          </h2>
        </div>
        <div className="flex basis-1/4 items-center justify-end text-right">
          <img
            src={`/${flight.airline}.svg`}
            className="h-4"
            alt={flight.airline}
          />
        </div>
      </div>
      <div className="z-10 flex justify-center gap-2">
        {flight.forecast.map((weather, index) => (
          <WeatherItem key={index} weather={weather} />
        ))}
      </div>
      <p className="z-10 text-sm">
        {dayjs(flight.departureTime).format(
          flight.airline === "easyjet" ? "dddd MMM D" : "HH:mm dddd MMM D",
        )}{" "}
        <br />
        {flight.origin} 🛬 {flight.destination}
      </p>

      <div className="z-10 flex gap-x-2 p-3">
        <div className="basis-1/3">
          <BookingButton flight={flight} />
        </div>
        <div className="basis-2/3">
          <GetFlightLink flight={flight} />
        </div>
      </div>
    </div>
  )
}

const WeatherItem: React.FC<{ weather: WeatherData }> = ({ weather }) => {
  return (
    <div className="flex flex-col items-center text-xs">
      <p>
        {weather.time.getDate()}/{weather.time.getMonth() + 1}
      </p>
      <img src={weather.icon} alt="weather icon" height={48} width={48} />
      <p>{Math.round(weather.temp * 10) / 10}&deg;C</p>
    </div>
  )
}

const GetFlightLink: React.FC<{ flight: RankedFlight }> = ({
  flight: flight,
}) => {
  return (
    <a href={flight.bookingUrl} target="_blank">
      <div className="rounded-lg border bg-green-800 py-3 text-center hover:bg-green-600">
        🛩️ <strong>Buy Now</strong> for {flight.price} {flight.currency}
      </div>
    </a>
  )
}

const BookingButton: React.FC<{ flight: RankedFlight }> = ({ flight }) => {
  // const href = `https://www.booking.com/searchresults.en-gb.html?ss=Ibiza&efdco=1&label=gen173nr-1FCAEoggI46AdIM1gEaFCIAQGYAQm4AQfIAQzYAQHoAQH4AQuIAgGoAgO4Aoymj7IGwAIB0gIkYWI0OGU1NzYtZTg1MS00NTEwLWFjMjctNmE4NGUwNTNkOTY12AIG4AIB&sid=a1535b034e54352eb8f64879eba6466d&aid=304142&lang=en-gb&sb=1&src_elem=sb&src=index&dest_id=1408&dest_type=region&ac_position=0&ac_click_type=b&ac_langcode=en&ac_suggestion_list_length=5&search_selected=true&search_pageview_id=87f894c6958f0095&ac_meta=GhA4N2Y4OTRjNjk1OGYwMDk1IAAoATICZW46BWliaXphQABKAFAA&checkin=2024-05-16&checkout=2024-05-18&group_adults=2&no_rooms=1&group_children=0`

  const { destinationFull, departureTime } = flight

  if (!departureTime) {
    return null
  }

  const dayjsObject = dayjs(departureTime)

  const checkin = dayjsObject.format("YYYY-MM-DD")
  const checkout = dayjsObject.add(4, "days").format("YYYY-MM-DD")

  const href = `https://www.booking.com/searchresults.html?ss=${destinationFull}&efdco=1&sb=1&src_elem=sb&src=index&dest_type=region&ac_position=0&ac_click_type=b&ac_langcode=en&ac_suggestion_list_length=5&search_selected=true&checkin=${checkin}&checkout=${checkout}&group_adults=2&no_rooms=1&group_children=0`

  return (
    <a href={href} target="_blank">
      <div className="rounded-lg border bg-blue-800 py-3 text-center hover:bg-blue-600">
        🛌 Find a Stay
      </div>
    </a>
  )
}
