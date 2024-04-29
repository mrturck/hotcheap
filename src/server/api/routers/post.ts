/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc"
import { env } from "~/env"
import OpenWeatherAPI from "openweather-api-node"
import { z } from "zod"
import { getRankedFlights } from "~/server/rank"

export type FlightDestination = {
  type: "flight-destination"
  origin: string
  destination: string
  departureDate: string
  price: {
    total: string
  }
  links: {
    flightDates: string
    flightOffers: string
  }
  weather: {
    temperature: number
  }
}

export const postRouter = createTRPCRouter({
  getWeather: publicProcedure
    .input(
      z.object({
        lat: z.number(),
        lon: z.number(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const weather = new OpenWeatherAPI({
        key: env.OPENWEATHER_KEY,
        coordinates: input,
        units: "metric",
      })

      return await weather.getCurrent()
    }),

  getHotAndCheap: publicProcedure.query(async ({ ctx }) => {
    // const tomorrow = new Date()
    // tomorrow.setDate(tomorrow.getDate() + 1)

    // const today = new Date()

    try {
      // if (true)
      // return exampleResponse
      // const rankedFlights = await getRankedFlights()
      return []
    } catch (error) {
      console.log(error)
      return []
    }
  }),
})

export type RankedFlight = {
  currency: string
  day_of_max_temp: string
  departureTime: string
  destination: string
  destinationFull: string
  flightNumber: string
  max_temp: number
  origin: string
  originFull: string
  price: number
  score: number
}

export const exampleResponse: RankedFlight[] = [
  {
    currency: "GBP",
    day_of_max_temp: "2024-04-29 12:00:00+00:00",
    departureTime: "2024-04-26T06:40:00",
    destination: "OSI",
    destinationFull: "Osijek, Croatia",
    flightNumber: "FR 5612",
    max_temp: 25.06,
    origin: "STN",
    originFull: "London Stansted, United Kingdom",
    price: 12.99,
    score: 1.9291762894534257,
  },
  {
    currency: "GBP",
    day_of_max_temp: "2024-04-26 12:00:00+00:00",
    departureTime: "2024-04-27T16:50:00",
    destination: "RMU",
    destinationFull: "Murcia International, Spain",
    flightNumber: "FR 8026",
    max_temp: 24.12,
    origin: "STN",
    originFull: "London Stansted, United Kingdom",
    price: 12.99,
    score: 1.8568129330254042,
  },
  {
    currency: "GBP",
    day_of_max_temp: "2024-04-29 12:00:00+00:00",
    departureTime: "2024-04-27T21:20:00",
    destination: "VIE",
    destinationFull: "Vienna, Austria",
    flightNumber: "FR 732",
    max_temp: 22.53,
    origin: "STN",
    originFull: "London Stansted, United Kingdom",
    price: 12.99,
    score: 1.7344110854503465,
  },
  {
    currency: "GBP",
    day_of_max_temp: "2024-04-30 15:00:00+00:00",
    departureTime: "2024-04-27T06:10:00",
    destination: "BRE",
    destinationFull: "Bremen, Germany",
    flightNumber: "FR 3634",
    max_temp: 21.99,
    origin: "STN",
    originFull: "London Stansted, United Kingdom",
    price: 12.99,
    score: 1.69284064665127,
  },
  {
    currency: "GBP",
    day_of_max_temp: "2024-04-28 12:00:00+00:00",
    departureTime: "2024-04-27T11:55:00",
    destination: "HAM",
    destinationFull: "Hamburg, Germany",
    flightNumber: "FR 1520",
    max_temp: 21.06,
    origin: "STN",
    originFull: "London Stansted, United Kingdom",
    price: 12.99,
    score: 1.621247113163972,
  },
  {
    currency: "GBP",
    day_of_max_temp: "2024-04-30 15:00:00+00:00",
    departureTime: "2024-04-27T16:10:00",
    destination: "DBV",
    destinationFull: "Dubrovnik, Croatia",
    flightNumber: "FR 5967",
    max_temp: 19.76,
    origin: "STN",
    originFull: "London Stansted, United Kingdom",
    price: 12.99,
    score: 1.5211701308699,
  },
  {
    currency: "GBP",
    day_of_max_temp: "2024-04-28 12:00:00+00:00",
    departureTime: "2024-04-27T20:15:00",
    destination: "AAL",
    destinationFull: "Aalborg, Denmark",
    flightNumber: "FR 1251",
    max_temp: 17.62,
    origin: "STN",
    originFull: "London Stansted, United Kingdom",
    price: 12.99,
    score: 1.3564280215550424,
  },
  {
    currency: "GBP",
    day_of_max_temp: "2024-04-28 12:00:00+00:00",
    departureTime: "2024-04-26T16:35:00",
    destination: "BLL",
    destinationFull: "Billund, Denmark",
    flightNumber: "FR 5172",
    max_temp: 16.19,
    origin: "STN",
    originFull: "London Stansted, United Kingdom",
    price: 12.99,
    score: 1.2463433410315627,
  },
  {
    currency: "GBP",
    day_of_max_temp: "2024-04-29 18:00:00+00:00",
    departureTime: "2024-04-27T05:55:00",
    destination: "CPH",
    destinationFull: "Copenhagen, Denmark",
    flightNumber: "RK 2618",
    max_temp: 12.61,
    origin: "STN",
    originFull: "London Stansted, United Kingdom",
    price: 12.99,
    score: 0.9707467282525019,
  },
  {
    currency: "GBP",
    day_of_max_temp: "2024-04-29 12:00:00+00:00",
    departureTime: "2024-04-26T07:45:00",
    destination: "ORK",
    destinationFull: "Cork, Ireland",
    flightNumber: "FR 901",
    max_temp: 11.42,
    origin: "STN",
    originFull: "London Stansted, United Kingdom",
    price: 12.99,
    score: 0.8791377983063895,
  },
]
