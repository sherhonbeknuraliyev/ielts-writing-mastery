import { z } from "zod";

export const collocationEntrySchema = z.object({
  phrase: z.string(),
  meaning: z.string(),
  example: z.string(),
  bandLevel: z.string(),
});

export const collocationSetSchema = z.object({
  topic: z.string(),
  description: z.string(),
  collocations: z.array(collocationEntrySchema),
});

export const paraphraseDrillSchema = z.object({
  id: z.string(),
  original: z.string(),
  method: z.enum(["synonym", "word-form", "restructure", "active-passive", "clause-change"]),
  paraphrases: z.array(z.string()),
  explanation: z.string(),
});

export const bandUpgradeSchema = z.object({
  id: z.string(),
  band6: z.string(),
  band8: z.string(),
  category: z.string(),
  explanation: z.string(),
});

export type CollocationEntry = z.infer<typeof collocationEntrySchema>;
export type CollocationSet = z.infer<typeof collocationSetSchema>;
export type ParaphraseDrill = z.infer<typeof paraphraseDrillSchema>;
export type BandUpgrade = z.infer<typeof bandUpgradeSchema>;
