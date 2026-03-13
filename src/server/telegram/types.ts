import { Context } from "grammy";
import { type StreamFlavor } from "@grammyjs/stream";
import type { SkillExercise } from "@shared/schemas/skill.schema.js";

export type MyContext = StreamFlavor<Context>;

export interface ChallengeSession {
  exercises: SkillExercise[];
  currentIndex: number;
  score: number;
  startTime: Date;
  type: "daily" | "practice";
  awaitingSelfAssess: boolean;
}

export interface AcademicWord {
  collocation: string;
  band: string;
  definition: string;
  example: string;
}
