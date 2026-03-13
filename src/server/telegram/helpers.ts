import OpenAI from "openai";
import type { SkillExercise } from "@shared/schemas/skill.schema.js";
import { UserModel } from "../models/user.model.js";
import { SkillModel } from "../models/skill.model.js";
import { IELTS_TIPS, ACADEMIC_WORDS } from "./constants.js";
import type { AcademicWord } from "./types.js";

// Track last 5 tip indices shown per user to avoid immediate repeats
const recentTips = new Map<number, number[]>();

const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com",
});

export function esc(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function pickRandomTip(telegramId: number): { tip: string; index: number } {
  const recent = recentTips.get(telegramId) ?? [];
  const available = IELTS_TIPS.map((_, i) => i).filter((i) => !recent.includes(i));
  const pool = available.length > 0 ? available : IELTS_TIPS.map((_, i) => i);
  const index = pool[Math.floor(Math.random() * pool.length)];
  const updated = [...recent, index].slice(-5);
  recentTips.set(telegramId, updated);
  return { tip: IELTS_TIPS[index], index };
}

export function pickRandomWord(): AcademicWord {
  return ACADEMIC_WORDS[Math.floor(Math.random() * ACADEMIC_WORDS.length)];
}

const SUBJECTIVE_TYPES: SkillExercise["type"][] = [
  "transform-upgrade",
  "sentence-combining",
  "rewrite",
  "find-errors",
  "paraphrase",
  "formalize",
  "cohesion-repair",
  "idea-development",
];

export function isSubjective(type: SkillExercise["type"]): boolean {
  return SUBJECTIVE_TYPES.includes(type);
}

export function typeLabel(type: SkillExercise["type"]): string {
  const labels: Record<SkillExercise["type"], string> = {
    "transform-upgrade": "Transform & Upgrade",
    "sentence-combining": "Sentence Combining",
    "error-correction": "Error Correction",
    "rewrite": "Rewrite",
    "fill-blank": "Fill in the Blank",
    "find-errors": "Find All Errors",
    "paraphrase": "Paraphrase",
    "formalize": "Formalize",
    "cohesion-repair": "Cohesion Repair",
    "idea-development": "Idea Development",
  };
  return labels[type] ?? type;
}

export function exerciseMessage(ex: SkillExercise, index: number, total: number): string {
  const lines: string[] = [
    `📝 Exercise ${index + 1}/${total} — ${typeLabel(ex.type)}`,
    "",
    esc(ex.question),
  ];
  if (ex.context) {
    lines.splice(2, 0, `\n<i>Context:</i> ${esc(ex.context)}`);
  }
  if (isSubjective(ex.type)) {
    lines.push("", "Type your answer, then I'll show you the model answer.");
  } else {
    lines.push("", "Type your answer:");
  }
  return lines.join("\n");
}

export async function* streamAI(systemPrompt: string, userMessage: string): AsyncGenerator<string> {
  const aiStream = await deepseek.chat.completions.create({
    model: "deepseek-chat",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    stream: true,
  });
  for await (const chunk of aiStream) {
    const delta = chunk.choices[0]?.delta?.content;
    if (delta) yield delta;
  }
}

export async function findOrCreateUser(from: {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
}) {
  let user = await UserModel.findOne({ telegramId: from.id });
  if (!user) {
    user = await UserModel.create({
      telegramId: from.id,
      firstName: from.first_name,
      lastName: from.last_name,
      username: from.username,
    });
  }
  return user;
}

export async function fetchAllExercises(): Promise<SkillExercise[]> {
  const skills = await SkillModel.find({}).lean();
  return skills.flatMap((s) => s.exercises as SkillExercise[]);
}
