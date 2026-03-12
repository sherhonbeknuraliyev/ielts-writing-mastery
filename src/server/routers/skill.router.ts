import { router, publicProcedure } from "../trpc/trpc.js";
import { skillService } from "../services/skill.service.js";
import { z } from "zod";

export const skillRouter = router({
  list: publicProcedure
    .input(z.object({ module: z.string().optional() }).optional())
    .query(({ input }) => {
      return skillService.findAll(input?.module);
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      return skillService.findById(input.id);
    }),
});
