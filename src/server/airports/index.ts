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

export const allAirportsArray = Object.values(allAirports).sort((a, b) =>
  a.name.localeCompare(b.name),
)

export const airportsByCountry = allAirportsArray.reduce(
  (acc, airport) => {
    const code = airport.country
    const country = acc[code]
    if (country) {
      country.airports.push(airport)
      // country.airports.sort((a, b) => a.name.localeCompare(b.name))
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

export const closestAirport = (
  airports: Airport[],
  lat: number,
  lon: number,
) => {
  return airports.reduce<
    | {
        distance: number
        airport: Airport
      }
    | undefined
  >((acc, airport) => {
    const distance = haversine(lat, lon, airport.latitude, airport.longitude)
    if (!acc || distance < acc.distance) {
      return { distance, airport }
    }
    return acc
  }, undefined)
}

const haversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371 // Earth's radius in km
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  const distance = R * c // Distance in km
  return distance
}

const toRadians = (degrees: number) => {
  return degrees * (Math.PI / 180)
}

// export const getClosestAirportForCountry = (
//   countryCode: string,
//   lat: number,
//   lon: number,
// ) => {
//   const country = airportsByCountry[countryCode]
//   if (!country) {
//     return undefined
//   }
//   return closestAirport(country.airports, lat, lon)
// }

export const getClosestAirport = (lat: number, lon: number) => {
  return closestAirport(allAirportsArray, lat, lon)
}
