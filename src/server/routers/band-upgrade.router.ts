import { router, publicProcedure } from "../trpc/trpc.js";
import { bandUpgradeService } from "../services/band-upgrade.service.js";
import { z } from "zod";

export const bandUpgradeRouter = router({
  list: publicProcedure
    .input(z.object({ category: z.string().optional() }).optional())
    .query(({ input }) => {
      return bandUpgradeService.findAll(input?.category);
    }),

  random: publicProcedure
    .input(z.object({ count: z.number().min(1).max(20).default(5) }))
    .query(({ input }) => {
      return bandUpgradeService.getRandom(input.count);
    }),
});
