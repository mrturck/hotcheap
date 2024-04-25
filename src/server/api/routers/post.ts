/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { z } from "zod";

// @ts-expect-error no types for this yet
import Amadeus from "amadeus";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { env } from "~/env";

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
  getHotAndCheap: publicProcedure.query(async ({ ctx }) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const today = new Date();

    const amadeus = new Amadeus({
      clientId: env.AMADEUS_CLIENT_ID,
      clientSecret: env.AMADEUS_CLIENT_SECRET,
      hostname: "production",
    });

    try {
      // const result = await amadeus.shopping.flightOffersSearch.post(
      //   JSON.stringify({
      //     originLocationCode: "LHR",
      //     destinationLocationCode: "AMS",
      //     departureDate: tomorrow.toISOString().split("T")[0],
      //     adults: "1",
      //     // nonStop: true,
      //     // currencyCode: "GBP",
      //     // maxPrice: 100,
      //   }),
      // );
      const result = await amadeus.shopping.flightDestinations.get({
        origin: "LON",
        departureDate:
          // today.toISOString().split("T")[0] +
          // "," +
          tomorrow.toISOString().split("T")[0],
        // adults: "1",
        nonStop: true,
        // currencyCode: "GBP",
        maxPrice: 50,
        oneWay: true,
        // max: 100,
      });
      return result.data as FlightDestination[];
    } catch (error) {
      console.log(error);
      return [];
    }
    console.log("fetch amadeus");
  }),
});
