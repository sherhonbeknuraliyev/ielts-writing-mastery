import { router, publicProcedure } from "../trpc/trpc.js";
import { promptService } from "../services/prompt.service.js";
import { z } from "zod";

export const promptRouter = router({
  list: publicProcedure
    .input(z.object({ type: z.string().optional() }).optional())
    .query(({ input }) => {
      return promptService.findAll(input?.type);
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      return promptService.findById(input.id);
    }),

  random: publicProcedure
    .input(z.object({ type: z.string().optional() }).optional())
    .query(({ input }) => {
      return promptService.getRandom(input?.type);
    }),
});
