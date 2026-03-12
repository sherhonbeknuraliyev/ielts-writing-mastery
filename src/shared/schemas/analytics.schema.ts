import { z } from "zod";

export const criteriaAveragesSchema = z.object({
  taskAchievement: z.number(),
  coherenceCohesion: z.number(),
  lexicalResource: z.number(),
  grammaticalRange: z.number(),
});

export const weakestCriterionSchema = z.object({
  name: z.string(),
  key: z.string(), // the camelCase key like "coherenceCohesion"
  average: z.number(),
  gap: z.number(), // how far below best criterion
});

export const bandTrendEntrySchema = z.object({
  date: z.string(),
  overallBand: z.number(),
  taskAchievement: z.number(),
  coherenceCohesion: z.number(),
  lexicalResource: z.number(),
  grammaticalRange: z.number(),
});

export const errorPatternSchema = z.object({
  category: z.string(),
  count: z.number(),
  examples: z.array(z.object({ original: z.string(), corrected: z.string() })),
});

export const recurringSuggestionSchema = z.object({
  original: z.string(),
  suggestedUpgrades: z.array(z.string()),
  count: z.number(),
});

export const timeManagementSchema = z.object({
  task1Average: z.number().nullable(),
  task2Average: z.number().nullable(),
  task1Target: z.number(), // 1200 seconds (20 min)
  task2Target: z.number(), // 2400 seconds (40 min)
});

export const selfAwarenessSchema = z.object({
  averageGap: z.number(),
  accuracy: z.number(), // percentage of essays where self-eval within 0.5 of AI
  perCriterion: z.array(z.object({
    criterion: z.string(),
    key: z.string(),
    selfAvg: z.number(),
    aiAvg: z.number(),
    gap: z.number(),
  })),
}).nullable();

export const recommendationSchema = z.object({
  type: z.enum(["criterion", "error", "vocabulary", "time", "practice"]),
  title: z.string(),
  description: z.string(),
  link: z.string().optional(),
});

export const analyticsResponseSchema = z.object({
  totalEvaluated: z.number(),
  sufficient: z.boolean(), // >= 3
  criteriaAverages: criteriaAveragesSchema.optional(),
  weakestCriterion: weakestCriterionSchema.optional(),
  bandTrend: z.array(bandTrendEntrySchema).optional(),
  errorPatterns: z.array(errorPatternSchema).optional(),
  recurringSuggestions: z.array(recurringSuggestionSchema).optional(),
  timeManagement: timeManagementSchema.optional(),
  selfAwareness: selfAwarenessSchema.optional(),
  recommendations: z.array(recommendationSchema).optional(),
});

export type AnalyticsResponse = z.infer<typeof analyticsResponseSchema>;
export type CriteriaAverages = z.infer<typeof criteriaAveragesSchema>;
export type ErrorPattern = z.infer<typeof errorPatternSchema>;
export type RecurringSuggestion = z.infer<typeof recurringSuggestionSchema>;
export type Recommendation = z.infer<typeof recommendationSchema>;
