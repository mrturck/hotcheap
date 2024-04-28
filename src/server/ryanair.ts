// Inspired by https://github.com/megaloss/Airfaresearch/blob/25367e1407fd2675c6c0e544fa7e7a859fac180a/ryanair.py#L49
// also used https://github.com/ryanair/ryanair-flight-search-api/blob/main/src/main/java/com/ryanair/flightsearch/api/v1/model/FlightSearchRequest.java

import { type Airport, type RyanairAirport, _ryanairAirports } from "./airports"

// Define interfaces for types used in the module
export type Flight = {
  origin: string
  originFull: string
  destination: string
  destinationFull: string
  departureTime: Date
  flightNumber: string
  price: number
  currency: string
}

// interface Trip {
//   outbound: Flight
//   inbound: Flight
//   totalPrice: number
// }

interface ApiFlight {
  departureAirport: {
    iataCode: string
    name: string
    countryName: string
  }
  arrivalAirport: {
    iataCode: string
    name: string
    countryName: string
  }
  departureDate: string
  flightNumber: string
  price: {
    value: number
    currencyCode: string
  }
}

type ApiResponse = {
  fares: {
    outbound: ApiFlight
    // inbound: ApiFlight
  }[]
  // inbound: ApiFlight[]
}

// Constants
const BASE_SERVICES_API_URL = "https://services-api.ryanair.com/farfnd/v4/"

// Helper functions for formatting dates and times
const formatDateForApi = (d: Date | string): string => {
  if (typeof d === "string") {
    return d
  }
  return d.toISOString().split("T")[0]!
}

const formatTimeForApi = (t: Date | string): string => {
  if (typeof t === "string") {
    return t
  }
  return t.toISOString().split("T")[1]!.slice(0, 5)
}

// Function to perform API queries with retry logic
const retryableQuery = async (
  url: string,
  params: URLSearchParams,
  maxTries = 5,
): Promise<unknown> => {
  for (let i = 0; i < maxTries; i++) {
    try {
      const response = await fetch(`${url}?${params.toString()}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return (await response.json()) as unknown
    } catch (e) {
      console.error(`Attempt ${i + 1}: Failed to fetch data`, e)
      if (i === maxTries - 1) throw e
    }
  }
}

// Function to parse flight data
const parseCheapestFlight = (flight: ApiFlight): Flight => {
  return {
    origin: flight.departureAirport.iataCode,
    originFull: `${flight.departureAirport.name}, ${flight.departureAirport.countryName}`,
    destination: flight.arrivalAirport.iataCode,
    destinationFull: `${flight.arrivalAirport.name}, ${flight.arrivalAirport.countryName}`,
    departureTime: new Date(flight.departureDate),
    flightNumber: `${flight.flightNumber.slice(0, 2)} ${flight.flightNumber.slice(2)}`,
    price: flight.price.value,
    currency: flight.price.currencyCode,
  }
}

// Function to fetch cheapest flights
const getCheapestFlights = async (params: {
  airport: string
  dateFrom: Date | string
  dateTo: Date | string
  destinationCountry?: string
  customParams?: Record<string, string>
  departureTimeFrom?: Date | string
  departureTimeTo?: Date | string
  maxPrice?: number
  destinationAirport?: string
}): Promise<Flight[]> => {
  const queryUrl = `${BASE_SERVICES_API_URL}oneWayFares`
  const queryParams = new URLSearchParams({
    // limit: "50",
    offset: "0",
    // priceValueTo: "4",
    market: "en-gb",
    language: "en",
    departureAirportIataCode: params.airport,
    outboundDepartureDateFrom: formatDateForApi(params.dateFrom),
    outboundDepartureDateTo: formatDateForApi(params.dateTo),
    outboundDepartureTimeFrom: formatTimeForApi(
      params.departureTimeFrom ?? "00:00",
    ),
    outboundDepartureTimeTo: formatTimeForApi(
      params.departureTimeTo ?? "23:59",
    ),
    ...(params.destinationCountry && {
      arrivalCountryCode: params.destinationCountry,
    }),
    ...(params.maxPrice && { priceValueTo: params.maxPrice.toString() }),
    ...(params.destinationAirport && {
      arrivalAirportIataCode: params.destinationAirport,
    }),
    ...params.customParams,
  })

  console.info(queryParams)

  const response = (await retryableQuery(queryUrl, queryParams)) as ApiResponse
  return response.fares.map((fare) => parseCheapestFlight(fare.outbound))
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

export const ryanairAirports = Object.keys(_ryanairAirports).reduce(
  (acc, key) => {
    const airport = _ryanairAirports[key]
    if (airport) {
      acc[key] = { ...withNumericalLatLon(airport), iata: key }
    }
    return acc
  },
  {} as Record<string, Airport>,
)

export {
  getCheapestFlights,
  parseCheapestFlight,
  retryableQuery,
  formatDateForApi,
  formatTimeForApi,
}
