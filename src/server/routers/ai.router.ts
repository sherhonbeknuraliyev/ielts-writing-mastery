import { router, protectedProcedure } from "../trpc/trpc.js";
import { aiService } from "../services/ai.service.js";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { AI_RATE_LIMITS } from "@shared/constants/index.js";

interface RateLimitEntry {
  date: string;
  essayCount: number;
  exerciseCount: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function getRateLimitEntry(userId: string): RateLimitEntry {
  const today = getTodayDate();
  const entry = rateLimitMap.get(userId);
  if (!entry || entry.date !== today) {
    const fresh: RateLimitEntry = { date: today, essayCount: 0, exerciseCount: 0 };
    rateLimitMap.set(userId, fresh);
    return fresh;
  }
  return entry;
}

export const aiRouter = router({
  evaluateEssay: protectedProcedure
    .input(
      z.object({
        taskType: z.string(),
        prompt: z.string(),
        essay: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const entry = getRateLimitEntry(ctx.user.userId);
      if (entry.essayCount >= AI_RATE_LIMITS.ESSAY_EVALUATIONS_PER_DAY) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: `Daily limit of ${AI_RATE_LIMITS.ESSAY_EVALUATIONS_PER_DAY} essay evaluations reached. Try again tomorrow.`,
        });
      }
      const result = await aiService.evaluateEssay(input);
      entry.essayCount += 1;
      return result;
    }),

  validateExercise: protectedProcedure
    .input(
      z.object({
        exerciseType: z.string(),
        question: z.string(),
        modelAnswer: z.string(),
        userAnswer: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const entry = getRateLimitEntry(ctx.user.userId);
      if (entry.exerciseCount >= AI_RATE_LIMITS.EXERCISE_VALIDATIONS_PER_DAY) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: `Daily limit of ${AI_RATE_LIMITS.EXERCISE_VALIDATIONS_PER_DAY} exercise validations reached. Try again tomorrow.`,
        });
      }
      const result = await aiService.validateExercise(input);
      entry.exerciseCount += 1;
      return result;
    }),
});
