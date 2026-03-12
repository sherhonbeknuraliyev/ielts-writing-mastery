import { z } from "zod";

export const skillExerciseSchema = z.object({
  id: z.string(),
  type: z.enum([
    "transform-upgrade",   // Take band 6 sentence → rewrite at band 8
    "sentence-combining",  // Merge 3-4 simple sentences into 1-2 sophisticated ones
    "error-correction",    // Find and fix the error
    "rewrite",             // Rewrite following specific instructions
    "fill-blank",          // Type the missing word/phrase
    "find-errors",         // Find and fix ALL errors in a paragraph
    "paraphrase",          // Paraphrase the sentence
    "formalize",           // Convert informal to academic register
    "cohesion-repair",     // Fix a paragraph's cohesion/flow
    "idea-development",    // Develop a topic sentence into a full paragraph
  ]),
  question: z.string(),
  context: z.string().optional(),
  correctAnswer: z.string(),
  alternativeAnswers: z.array(z.string()).optional(),
  explanation: z.string(),
  bandCriterion: z.enum([
    "task-achievement",
    "coherence-cohesion",
    "lexical-resource",
    "grammatical-range",
  ]),
});

export const skillSchema = z.object({
  id: z.string(),
  title: z.string(),
  module: z.enum(["sentence-sophistication", "error-elimination", "writing-techniques"]),
  targetBand: z.string(),
  criterion: z.enum([
    "task-achievement",
    "coherence-cohesion",
    "lexical-resource",
    "grammatical-range",
  ]),
  description: z.string(),
  content: z.array(z.object({
    type: z.enum(["heading", "paragraph", "example", "rule", "tip", "warning", "comparison"]),
    text: z.string(),
  })),
  exercises: z.array(skillExerciseSchema),
  keyTakeaways: z.array(z.string()),
});

export type SkillExercise = z.infer<typeof skillExerciseSchema>;
export type Skill = z.infer<typeof skillSchema>;
