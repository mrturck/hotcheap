"use client"

import { useRouter } from "next-nprogress-bar"
import * as React from "react"
import { useMemo, useState } from "react"

import { Button } from "~/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command"
import { Drawer, DrawerContent, DrawerTrigger } from "~/components/ui/drawer"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"
import { useMediaQuery } from "~/hooks/use-media-query"
import { cn } from "~/lib/utils"
import { type GeoHeaders } from "~/server/geo"
// import { ryanairAirports } from "~/server/ryanair"
import {
  type Airport,
  allAirports,
  countriesAlpha,
  airportsByCountry,
} from "~/server/airports"

export function AirportSearch({
  airport,
  date,
  geo,
  className,
}: {
  airport: string | undefined
  date: Date
  geo: GeoHeaders
  className?: string
}) {
  const router = useRouter()
  const [selectedAirport, setSelectedAirport] = useState<Airport | undefined>(
    airport ? allAirports[airport] : undefined,
  )

  const setAirport = (airport: Airport | undefined) => {
    setSelectedAirport(airport)
    if (airport) {
      router.push(`/origin/${airport.iata}/${date.toISOString().split("T")[0]}`)
    }
  }

  const [open, setOpen] = React.useState(false)
  const isDesktop = useMediaQuery("(min-width: 768px)")

  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn("w-full justify-start text-zinc-700", className)}
          >
            {selectedAirport ? (
              <>{selectedAirport.name}</>
            ) : (
              <>Select Airport</>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <AirportCountryGroups
            setOpen={setOpen}
            setAirport={setAirport}
            geo={geo}
          />
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          className={cn("w-full justify-start text-zinc-700", className)}
        >
          {selectedAirport ? <>{selectedAirport.name}</> : <>Select Airport</>}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mt-4 border-t">
          <AirportCountryGroups
            setOpen={setOpen}
            setAirport={setAirport}
            geo={geo}
          />
        </div>
      </DrawerContent>
    </Drawer>
  )
}

function AirportCountryGroups({
  setOpen,
  setAirport,
  geo,
}: {
  setOpen: (open: boolean) => void
  setAirport: (airport: Airport | undefined) => void
  geo: GeoHeaders
}) {
  const countries = useMemo(() => {
    const currentCountry = countriesAlpha.find((c) => c === geo.country)
    if (currentCountry) {
      const list = countriesAlpha.filter((c) => c !== currentCountry)
      list.unshift(currentCountry)
      return list
    }
    return countriesAlpha
  }, [geo.country])

  return (
    <Command>
      <CommandInput placeholder="Select an airport..." className="text-lg" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {countries.map((country) => (
          <CommandGroup heading={country} key={country}>
            {airportsByCountry[country]?.airports?.map((airport) => (
              <CommandItem
                key={airport.name}
                value={airport.iata}
                onSelect={(value) => {
                  setAirport(allAirports[value])
                  setOpen(false)
                }}
                className="cursor-pointer"
                keywords={[airport.iata, airport.name]}
              >
                {airport.name}{" "}
                <span className="ml-2 text-xs text-gray-400">
                  {airport.iata}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </Command>
  )
}
