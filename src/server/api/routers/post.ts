/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { env } from "~/env";
import OpenWeatherAPI from "openweather-api-node";

export type FlightDestination = {
  type: "flight-destination";
  origin: string;
  destination: string;
  departureDate: string;
  price: {
    total: string;
  };
  links: {
    flightDates: string;
    flightOffers: string;
  };
  weather: {
    temperature: number;
  };
};

export const postRouter = createTRPCRouter({
  getWeather: publicProcedure.input(
      z.object({
        lat: z.number(),
        lon: z.number(),
      })
  ).query(async ({ input, ctx }) => {
    const weather = new OpenWeatherAPI({
      key: env.OPENWEATHER_KEY,
      coordinates: input,
      units: "metric"
    })

    return await weather.getCurrent()
  }),

  getHotAndCheap: publicProcedure.query(async ({ ctx }) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const today = new Date();

    try {
      return [] as FlightDestination[];
    } catch (error) {
      console.log(error);
      return [];
    }
  }),
});
