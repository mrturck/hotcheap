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
import OpenWeatherAPI from "openweather-api-node";

export const postRouter = createTRPCRouter({
  // hello: publicProcedure
  //   .input(z.object({ text: z.string() }))
  //   .query(({ input }) => {
  //     return {
  //       greeting: `Hello ${input.text}`,
  //     };
  //   }),

  // create: protectedProcedure
  //   .input(z.object({ name: z.string().min(1) }))
  //   .mutation(async ({ ctx, input }) => {
  //     // simulate a slow db call
  //     await new Promise((resolve) => setTimeout(resolve, 1000));

  //     return ctx.db.post.create({
  //       data: {
  //         name: input.name,
  //         createdBy: { connect: { id: ctx.session.user.id } },
  //       },
  //     });
  //   }),

  // getLatest: protectedProcedure.query(({ ctx }) => {
  //   return ctx.db.post.findFirst({
  //     orderBy: { createdAt: "desc" },
  //     where: { createdBy: { id: ctx.session.user.id } },
  //   });
  // }),

  // getSecretMessage: protectedProcedure.query(() => {
  //   return "you can now see this secret message!";
  // }),
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

    const amadeus = new Amadeus({
      clientId: env.AMADEUS_CLIENT_ID,
      clientSecret: env.AMADEUS_CLIENT_SECRET,
      hostname: "production",
    });

    try {
      // const result = await amadeus.shopping.flightOffersSearch.get({
      //   originLocationCode: "LHR",
      //   destinationLocationCode: "DUB",
      //   departureDate: tomorrow.toISOString().split("T")[0],
      //   adults: "1",
      //   nonStop: true,
      //   currencyCode: "GBP",
      //   // maxPrice: 100,
      // });
      const result = await amadeus.shopping.flightDestinations.get({
        origin: "LON",
        departureDate:
          today.toISOString().split("T")[0] +
          "," +
          tomorrow.toISOString().split("T")[0],
        // adults: "1",
        nonStop: true,
        // currencyCode: "GBP",
        maxPrice: 50,
        oneWay: true,
        // max: 100,
      });
      return result as { a: string };
    } catch (error) {
      console.log(error);
      return [];
    }
    // .then(function (response) {
    //   console.log(response.data);
    // })
    // .catch(function (responseError) {
    //   console.log(responseError.code);
    // });
    console.log("fetch amadeus");
  }),
});
