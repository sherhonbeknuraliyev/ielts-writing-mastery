import { router, publicProcedure } from "../trpc/trpc.js";
import { paraphraseService } from "../services/paraphrase.service.js";
import { z } from "zod";

export const paraphraseRouter = router({
  list: publicProcedure.query(() => {
    return paraphraseService.findAll();
  }),

  random: publicProcedure
    .input(z.object({ count: z.number().min(1).max(20).default(5) }))
    .query(({ input }) => {
      return paraphraseService.getRandom(input.count);
    }),
});
