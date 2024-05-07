// Inspired by https://github.com/megaloss/Airfaresearch/blob/25367e1407fd2675c6c0e544fa7e7a859fac180a/ryanair.py#L49
// also used https://github.com/ryanair/ryanair-flight-search-api/blob/main/src/main/java/com/ryanair/flightsearch/api/v1/model/FlightSearchRequest.java
import utc from "dayjs/plugin/utc"
import type { Flight } from "~/server/flights"
import dayjs from "dayjs"

dayjs.extend(utc)

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
export const formatDateForApi = (d: Date | string): string => {
  if (typeof d === "string") {
    return d
  }
  return d.toISOString().split("T")[0]!
}

export const formatTimeForApi = (t: Date | string): string => {
  if (typeof t === "string") {
    return t
  }
  return t.toISOString().split("T")[1]!.slice(0, 5)
}

// Function to perform API queries with retry logic
export const retryableQuery = async (
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

const getBookingUrl = (flight: ApiFlight): string => {
  const urlParams = {
    adults: "1",
    teens: "0",
    children: "0",
    infants: "0",
    dateOut: dayjs.utc(flight.departureDate).format("YYYY-MM-DD"),
    dateIn: "",
    isConnectedFlight: "false",
    discount: "0",
    promoCode: "",
    isReturn: "false",
    originIata: flight.departureAirport.iataCode,
    destinationIata: flight.arrivalAirport.iataCode,
  }

  return `https://www.ryanair.com/gb/en/trip/flights/select?${new URLSearchParams(urlParams).toString()}`
}

// Function to parse flight data
export const parseCheapestFlight = (flight: ApiFlight): Flight => {
  return {
    airline: "ryanair",
    origin: flight.departureAirport.iataCode,
    originFull: `${flight.departureAirport.name}, ${flight.departureAirport.countryName}`,
    destination: flight.arrivalAirport.iataCode,
    destinationFull: `${flight.arrivalAirport.name}, ${flight.arrivalAirport.countryName}`,
    departureTime: new Date(flight.departureDate),
    flightNumber: `${flight.flightNumber.slice(0, 2)} ${flight.flightNumber.slice(2)}`,
    price: flight.price.value,
    currency: flight.price.currencyCode,
    bookingUrl: getBookingUrl(flight),
  }
}

// Function to fetch the cheapest flights
export const getCheapestFlights = async (params: {
  airport: string
  dateFrom: Date | string
  dateTo: Date | string
  destinationCountry?: string
  customParams?: Record<string, string>
  departureTimeFrom?: Date | string
  departureTimeTo?: Date | string
  maxPrice?: number
  destinationAirport?: string
  limit?: number
  offset?: number
}): Promise<Flight[]> => {
  const queryUrl = `${BASE_SERVICES_API_URL}oneWayFares`
  const queryParams = {
    ...(params.limit && { limit: params.limit.toString() }),
    ...(params.offset && { offset: params.offset.toString() }),
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
  }

  console.info("ryanair search", JSON.stringify(queryParams))

  const queryParamsObject = new URLSearchParams(queryParams)

  const response = (await retryableQuery(
    queryUrl,
    queryParamsObject,
  )) as ApiResponse
  const asFlights = response.fares.map((fare) =>
    parseCheapestFlight(fare.outbound),
  )
  console.info("got ryanair flights", asFlights.length)
  return asFlights
}
