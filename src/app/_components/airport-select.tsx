"use client"

import { useRouter } from "next-nprogress-bar"
import { useState } from "react"
import { type Airport } from "~/server/airports"
import { ryanairAirports } from "~/server/ryanair"

const airportsByCountry = Object.values(ryanairAirports).reduce(
  (acc, airport) => {
    const country = airport.country
    const ports = acc[country]
    if (ports) {
      ports.push(airport)
    } else {
      acc[country] = [airport]
    }
    return acc
  },
  {} as Record<string, Airport[]>,
)

const countriesAlpha = Object.keys(airportsByCountry).sort()

export const AirportSelect = ({ airport }: { airport: string }) => {
  const router = useRouter()
  const [selectedAirport, setAirport] = useState<
    keyof typeof ryanairAirports | undefined
  >(airport ?? "STN")

  // on select, change page
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAirport(e.target.value)
    router.push(`/origin/${e.target.value}`)
  }

  return (
    <div className="flex flex-col items-start space-y-2 py-4 text-lg md:flex-row md:items-center md:space-x-3 md:space-y-0">
      <span>Depart from: </span>
      <select
        value={selectedAirport}
        onChange={(e) => handleChange(e)}
        className="flex-1 p-2 text-lg text-black"
        name="origin"
      >
        {countriesAlpha.map((country) => (
          <optgroup label={country} key={country}>
            {airportsByCountry[country]?.map((airport) => (
              <option
                key={airport.iata}
                value={airport.iata}
                className="text-lg"
              >
                {airport.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  )
}
