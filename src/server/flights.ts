// Define interfaces for types used in the module
export type Flight = {
  airline: "ryanair" | "easyjet"
  origin: string
  originFull: string
  destination: string
  destinationFull: string
  departureTime?: Date
  flightNumber?: string
  price: number
  currency: string
  bookingUrl: string
}
