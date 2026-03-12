import { z } from "zod";

export const aiFeedbackSchema = z.object({
  taskAchievement: z.number(),
  coherenceCohesion: z.number(),
  lexicalResource: z.number(),
  grammaticalRange: z.number(),
  overallBand: z.number(),
  errors: z.array(z.object({
    original: z.string(),
    corrected: z.string(),
    explanation: z.string(),
  })),
  vocabularySuggestions: z.array(z.object({
    original: z.string(),
    upgraded: z.string(),
  })),
  tips: z.array(z.string()),
  summary: z.string(),
});

export const writingSessionSchema = z.object({
  _id: z.string().optional(),
  userId: z.string(),
  promptId: z.string().optional(),
  type: z.enum(["task1-academic", "task1-general", "task2", "free-practice"]),
  promptText: z.string().optional(),
  content: z.string(),
  wordCount: z.number(),
  timeSpent: z.number(),
  aiFeedback: aiFeedbackSchema.optional(),
  selfEvaluation: z.object({
    taskAchievement: z.number().min(0).max(9).optional(),
    coherenceCohesion: z.number().min(0).max(9).optional(),
    lexicalResource: z.number().min(0).max(9).optional(),
    grammaticalRange: z.number().min(0).max(9).optional(),
  }).optional(),
  createdAt: z.string().optional(),
});

export const skillProgressSchema = z.object({
  userId: z.string(),
  skillId: z.string(),
  completed: z.boolean(),
  score: z.number().optional(),
  completedAt: z.string().optional(),
});

export type AiFeedback = z.infer<typeof aiFeedbackSchema>;
export type WritingSession = z.infer<typeof writingSessionSchema>;
export type SkillProgress = z.infer<typeof skillProgressSchema>;
