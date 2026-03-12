import { z } from "zod";

export const chartDataSchema = z.object({
  type: z.enum(["line", "bar", "pie", "table", "process"]),
  title: z.string(),
  labels: z.array(z.string()),
  datasets: z.array(z.object({
    label: z.string(),
    data: z.array(z.number()),
    color: z.string(),
  })),
  xAxisLabel: z.string(),
  yAxisLabel: z.string(),
  unit: z.string(),
});

export const annotationSchema = z.object({
  highlight: z.string(),
  technique: z.string(),
  explanation: z.string(),
});

export const writingPromptSchema = z.object({
  id: z.string(),
  type: z.enum(["task1-academic", "task1-general", "task2"]),
  category: z.string(),
  prompt: z.string(),
  chartData: chartDataSchema.optional(),
  modelAnswers: z.object({
    band7: z.string(),
    band8: z.string(),
  }),
  annotations: z.array(annotationSchema),
  evaluationChecklist: z.array(z.string()),
  keyVocabulary: z.array(z.string()),
  tips: z.array(z.string()),
  sampleStructure: z.array(z.object({
    paragraph: z.string(),
    purpose: z.string(),
    sentenceCount: z.string(),
  })),
  timeLimit: z.number(),
  wordLimit: z.object({ min: z.number(), max: z.number() }),
  difficulty: z.enum(["intermediate", "advanced", "expert"]),
});

export type ChartData = z.infer<typeof chartDataSchema>;
export type Annotation = z.infer<typeof annotationSchema>;
export type WritingPrompt = z.infer<typeof writingPromptSchema>;
