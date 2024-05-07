import { _easyjetAirports } from "./easyjet-airports"
import { _ryanairAirports } from "./ryanair-airports"

export type Airport = {
  iata: string
  name: string
  country: string
  countryName?: string
  timeZone?: string
  latitude: number
  longitude: number
  flagUrl?: string
}

export type RyanairAirport = {
  name: string
  country: string
  timeZone: string
  latitude: string
  longitude: string
}

export type EasyJetAirport = {
  name: string
  country: string
  flagUrl: string
  countryCode: string
  latitude: number
  longitude: number
}

export type Country = { code: string; flagUrl?: string; airports: Airport[] }

function convertCoordToFloat(coord: string): number {
  // Determine if the coordinate is latitude or longitude and its direction
  const direction = coord.slice(-1)
  const isNegative = direction === "S" || direction === "W"

  // Remove the direction character
  const numbers = coord.slice(0, -1)

  // Extract degrees, minutes, and seconds
  let degrees = 0
  let minutes = 0
  let seconds = 0

  if (numbers.length === 6) {
    // Assuming format is DDMMSS
    degrees = parseInt(numbers.slice(0, 2), 10)
    minutes = parseInt(numbers.slice(2, 4), 10)
    seconds = parseInt(numbers.slice(4, 6), 10)
  } else if (numbers.length === 7) {
    // Assuming format is DDDMMSS
    degrees = parseInt(numbers.slice(0, 3), 10)
    minutes = parseInt(numbers.slice(3, 5), 10)
    seconds = parseInt(numbers.slice(5, 7), 10)
  }

  // Convert to decimal format
  let decimal = degrees + minutes / 60 + seconds / 3600

  // Apply negative sign for S and W
  if (isNegative) {
    decimal = -decimal
  }

  return decimal
}

const withNumericalLatLon = (airport: RyanairAirport) => {
  const latitude = convertCoordToFloat(airport.latitude)
  const longitude = convertCoordToFloat(airport.longitude)

  return {
    ...airport,
    latitude,
    longitude,
  }
}

const ryanairAirports = Object.keys(_ryanairAirports).reduce(
  (acc, key) => {
    const airport = _ryanairAirports[key]
    if (airport) {
      acc[key] = { ...withNumericalLatLon(airport), iata: key }
    }
    return acc
  },
  {} as Record<string, Airport>,
)

export const allAirports = Object.keys(_easyjetAirports).reduce((acc, key) => {
  const airport = _easyjetAirports[key]
  if (airport) {
    // code to check difference in data sets - easy jet had paris BVA at the location of CDG

    // const ryanairAirport = acc[key]
    // if (
    //   ryanairAirport?.latitude &&
    //   Math.abs(airport.latitude - ryanairAirport.latitude) > 0.1
    // ) {
    //   console.log(
    //     airport.country,
    //     key,
    //     airport.latitude,
    //     airport.longitude,
    //     ryanairAirport.latitude,
    //     ryanairAirport.longitude,
    //   )
    // }

    acc[key] = {
      ...airport,
      ...acc[key], // given the above, ryanair takes precedence
      iata: key,
      country: airport.countryCode,
      countryName: airport.country,
    }
  }
  return acc
}, ryanairAirports)

export const airportsByCountry = Object.values(allAirports).reduce(
  (acc, airport) => {
    const code = airport.country
    const country = acc[code]
    if (country) {
      country.airports.push(airport)
      country.airports.sort((a, b) => a.name.localeCompare(b.name))
      if (!country.flagUrl) {
        country.flagUrl = airport.flagUrl
      }
    } else {
      acc[code] = { code, flagUrl: airport.flagUrl, airports: [airport] }
    }
    return acc
  },
  {} as Record<string, Country>,
)

export const countriesAlpha = Object.keys(airportsByCountry).sort()
