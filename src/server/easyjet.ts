import { _easyjetAirports, type Airport } from "~/server/airports"
import type { Flight } from "~/server/flights"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"

dayjs.extend(utc)

export type EasyJetSearchOptions = {
  OriginIatas: string // Comma-separated list of airport codes
  PreferredOriginIatas: string // Comma-separated list of airport codes
  StartDate: string // Assuming it's in the format "yyyy-MM-dd"
  AllDestinations?: boolean
  AllOrigins?: boolean
  AssumedPassengersPerBooking?: number
  AssumedSectorsPerBooking?: number
  CreditCardFeePercent?: number
  Currency?: "GBP" | "EUR" | "CHF" // Mapped to CurrencyId
  EndDate?: string // Assuming it's in the format "yyyy-MM-dd"
  MaxResults?: number
  MaxPrice?: number
}

export type EasyJetDeepLinkOptions = {
  dep: string // Origin airport code
  dest: string // Destination airport code
  dd: string // Departure date in the format "yyyy-MM-dd"
  lang?: string
  apax?: number // Number of adults
  cpax?: number // Number of children
  ipax?: number // Infant passengers
  dt?: string // Device type (e.g., "Desktop", "Mobile")
  spnl?: number
  spnlt?: string
}

type EasyJetFlight = {
  Price: number
  OriginIata: string
  DestinationIata: string
  DepartureDate: string
}

interface EasyJetSearchResponse {
  Flights: EasyJetFlight[]
}

export class EasyJet {
  base_url: string
  currency_map: Record<string, number> = {
    EUR: 0,
    CHF: 1,
    GBP: 4,
  }

  availability_defaults: EasyJetSearchOptions = {
    AllDestinations: true,
    AllOrigins: false,
    AssumedPassengersPerBooking: 1,
    AssumedSectorsPerBooking: 1,
    CreditCardFeePercent: 0,
    MaxPrice: 100,
    MaxResults: 1000,
    OriginIatas: "",
    PreferredOriginIatas: "",
    StartDate: "",
  }

  deeplink_defaults: EasyJetDeepLinkOptions = {
    lang: "EN",
    dep: "", // Origin airport code
    dest: "", // Destination airport code
    dd: "", // Departure date in the format "yyyy-MM-dd"
    apax: 1, // Number of adults
    cpax: 0, // Number of children
    ipax: 0, // Infant passengers
    dt: "Desktop", // Device type
    spnl: 0,
  }

  airports: Record<string, Airport> = Object.keys(_easyjetAirports).reduce(
    (acc: Record<string, Airport>, key: string) => {
      const airport = _easyjetAirports[key]
      if (airport) {
        acc[key] = {
          iata: key,
          name: airport.name,
          country: airport.countryCode,
          timeZone: "",
          latitude: airport.latitude,
          longitude: airport.longitude,
        }
      }
      return acc
    },
    {} as Record<string, Airport>,
  )

  constructor() {
    this.base_url = "https://www.easyjet.com"
  }

  _parseFlight(currency: string, flight: EasyJetFlight): Flight | undefined {
    const originInformation = _easyjetAirports[flight.OriginIata]
    const destinationInformation = _easyjetAirports[flight.DestinationIata]

    if (!originInformation || !destinationInformation) {
      return undefined
    }

    return {
      airline: "easyjet",
      origin: flight.OriginIata,
      originFull: `${originInformation.name}, ${originInformation.country}`,
      destination: flight.DestinationIata,
      destinationFull: `${destinationInformation.name}, ${destinationInformation.country}`,
      price: flight.Price,
      departureTime: dayjs.utc(flight.DepartureDate).toDate(),
      currency: currency,
      booking_url: this.getDeeplink({
        dep: flight.OriginIata,
        dest: flight.DestinationIata,
        dd: `${flight.DepartureDate}`,
      }),
    }
  }

  async getAvailability(options: EasyJetSearchOptions): Promise<Flight[]> {
    const { Currency, ...rest } = options
    const processOptions = Object.entries({
      ...this.availability_defaults,
      ...rest,
      CurrencyId: this.currency_map[Currency ?? "GBP"],
    }).map(([key, value]) => [key, String(value)])

    const searchParams = new URLSearchParams(processOptions).toString()
    const url = new URL(
      `${this.base_url}/ejcms/nocache/api/flights/search?${searchParams}`,
    )
    const res = await fetch(url.toString())
    const response = (await res.json()) as EasyJetSearchResponse
    return response.Flights.map((flight) =>
      this._parseFlight(Currency ?? "GBP", flight),
    ).filter((flight) => flight) as Flight[]
  }

  getDeeplink(options: EasyJetDeepLinkOptions) {
    const processOptions = Object.entries({
      ...this.deeplink_defaults,
      ...options,
    }).map(([key, value]) => [key, String(value)])

    const searchParams = new URLSearchParams(processOptions).toString()
    return new URL(`${this.base_url}/deeplink?${searchParams}`).toString()
  }
}
