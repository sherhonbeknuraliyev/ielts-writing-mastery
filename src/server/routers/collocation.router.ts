import { router, publicProcedure } from "../trpc/trpc.js";
import { collocationService } from "../services/collocation.service.js";
import { z } from "zod";

export const collocationRouter = router({
  list: publicProcedure
    .input(z.object({ topic: z.string().optional() }).optional())
    .query(({ input }) => {
      return collocationService.findAll(input?.topic);
    }),

  topics: publicProcedure.query(() => {
    return collocationService.getTopics();
  }),
});
