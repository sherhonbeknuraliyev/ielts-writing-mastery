import { router, protectedProcedure } from "../trpc/trpc.js";
import { writingService } from "../services/writing.service.js";
import { z } from "zod";

const writingTypeSchema = z.enum(["task1-academic", "task1-general", "task2", "free-practice"]);

export const writingRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).optional().default(1),
        limit: z.number().min(1).max(100).optional().default(20),
      }).optional()
    )
    .query(({ input, ctx }) => {
      return writingService.findByUser(ctx.user.userId, input?.page, input?.limit);
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const doc = await writingService.findById(input.id);
      if (!doc || doc.userId.toString() !== ctx.user.userId) {
        return null;
      }
      return doc;
    }),

  create: protectedProcedure
    .input(
      z.object({
        promptId: z.string().optional(),
        type: writingTypeSchema,
        promptText: z.string().optional(),
        content: z.string(),
        wordCount: z.number(),
        timeSpent: z.number(),
      })
    )
    .mutation(({ input, ctx }) => {
      return writingService.create(ctx.user.userId, input);
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        content: z.string().optional(),
        wordCount: z.number().optional(),
        timeSpent: z.number().optional(),
        selfEvaluation: z
          .object({
            taskAchievement: z.number().min(0).max(9).optional(),
            coherenceCohesion: z.number().min(0).max(9).optional(),
            lexicalResource: z.number().min(0).max(9).optional(),
            grammaticalRange: z.number().min(0).max(9).optional(),
          })
          .optional(),
      })
    )
    .mutation(({ input, ctx }) => {
      const { id, ...data } = input;
      return writingService.update(id, ctx.user.userId, data);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input, ctx }) => {
      return writingService.delete(input.id, ctx.user.userId);
    }),

  stats: protectedProcedure.query(({ ctx }) => {
    return writingService.getStats(ctx.user.userId);
  }),
});
