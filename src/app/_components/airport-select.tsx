"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { ryanairAirports } from "~/server/ryanair"

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
    <div className="flex space-x-3 py-4  text-lg">
      <span>Origin: </span>
      <select
        value={selectedAirport}
        onChange={(e) => handleChange(e)}
        className="flex-1 text-lg text-black"
        name="origin"
        // placeholder="Select an airport"
        // defaultValue="STN"
      >
        {Object.keys(ryanairAirports).map((key) => (
          <option key={key} value={key} className="text-lg ">
            {ryanairAirports[key]?.name}
          </option>
        ))}
      </select>
    </div>
  )
}
