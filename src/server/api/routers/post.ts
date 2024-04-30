import { createTRPCRouter, publicProcedure } from "~/server/api/trpc"

export const postRouter = createTRPCRouter({
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
