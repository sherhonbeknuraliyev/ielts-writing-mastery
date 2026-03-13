import { Telegraf, Markup } from "telegraf";
import type { SkillExercise } from "@shared/schemas/skill.schema.js";
import { UserModel } from "../models/user.model.js";
import { SkillModel } from "../models/skill.model.js";
import { TelegramStatsModel } from "../models/telegram-stats.model.js";

// ── Types ──────────────────────────────────────────────────────────────────

interface ChallengeSession {
  exercises: SkillExercise[];
  currentIndex: number;
  score: number;
  startTime: Date;
  type: "daily" | "practice";
  awaitingSelfAssess: boolean;
}

// ── In-memory session store (telegramId → session) ────────────────────────

const sessions = new Map<number, ChallengeSession>();

// ── Helpers ───────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
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

function isSubjective(type: SkillExercise["type"]): boolean {
  return SUBJECTIVE_TYPES.includes(type);
}

function typeLabel(type: SkillExercise["type"]): string {
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

function exerciseMessage(ex: SkillExercise, index: number, total: number): string {
  const lines: string[] = [
    `📝 Exercise ${index + 1}/${total} — ${typeLabel(ex.type)}`,
    "",
    ex.question,
  ];
  if (ex.context) {
    lines.splice(2, 0, `\n_Context:_ ${ex.context}`);
  }
  if (isSubjective(ex.type)) {
    lines.push("", "Type your answer, then I'll show you the model answer.");
  } else {
    lines.push("", "Type your answer:");
  }
  return lines.join("\n");
}

async function fetchAllExercises(): Promise<SkillExercise[]> {
  const skills = await SkillModel.find({}).lean();
  return skills.flatMap((s) => s.exercises as SkillExercise[]);
}

async function sendExercise(
  bot: Telegraf,
  chatId: number,
  session: ChallengeSession
): Promise<void> {
  const ex = session.exercises[session.currentIndex];
  await bot.telegram.sendMessage(chatId, exerciseMessage(ex, session.currentIndex, session.exercises.length), {
    parse_mode: "Markdown",
  });
}

async function finishSession(
  bot: Telegraf,
  chatId: number,
  telegramId: number,
  session: ChallengeSession
): Promise<void> {
  const total = session.exercises.length;
  const score = session.score;

  await TelegramStatsModel.create({
    telegramId,
    date: todayStr(),
    score,
    total,
    type: session.type,
  });

  sessions.delete(telegramId);

  await bot.telegram.sendMessage(
    chatId,
    `🎉 *Challenge Complete!*\n\nYou got *${score}/${total}* correct!\n\n${
      score === total
        ? "Perfect score! Excellent work! 🏆"
        : score >= Math.ceil(total / 2)
        ? "Good effort! Keep practising to reach band 7+. 💪"
        : "Keep going — every exercise builds your band score. 📚"
    }`,
    { parse_mode: "Markdown" }
  );
}

async function handleAnswer(
  bot: Telegraf,
  chatId: number,
  telegramId: number,
  session: ChallengeSession,
  userAnswer: string
): Promise<void> {
  const ex = session.exercises[session.currentIndex];

  if (isSubjective(ex.type)) {
    // Show model answer and ask self-assess
    session.awaitingSelfAssess = true;
    await bot.telegram.sendMessage(
      chatId,
      `📖 *Model Answer:*\n\n${ex.correctAnswer}\n\n_${ex.explanation}_\n\nDid you get it right?`,
      {
        parse_mode: "Markdown",
        ...Markup.inlineKeyboard([
          Markup.button.callback("✅ Yes", `correct_yes:${session.currentIndex}`),
          Markup.button.callback("❌ No", `correct_no:${session.currentIndex}`),
        ]),
      }
    );
    return;
  }

  // Auto-graded types
  const normalise = (s: string) => s.trim().toLowerCase();
  const correct = normalise(ex.correctAnswer);
  const alternatives = (ex.alternativeAnswers ?? []).map(normalise);
  const given = normalise(userAnswer);
  const isCorrect = given === correct || alternatives.includes(given);

  if (isCorrect) {
    session.score += 1;
    await bot.telegram.sendMessage(
      chatId,
      `✅ *Correct!*\n\n"${ex.correctAnswer}" is the right answer.\n\n_${ex.explanation}_`,
      { parse_mode: "Markdown" }
    );
  } else {
    await bot.telegram.sendMessage(
      chatId,
      `❌ *Not quite.*\n\nYour answer: "${userAnswer}"\nCorrect answer: "${ex.correctAnswer}"\n\n_${ex.explanation}_`,
      { parse_mode: "Markdown" }
    );
  }

  session.currentIndex += 1;
  session.awaitingSelfAssess = false;

  if (session.currentIndex >= session.exercises.length) {
    await finishSession(bot, chatId, telegramId, session);
  } else {
    await sendExercise(bot, chatId, session);
  }
}

// ── Find or create user by Telegram identity ──────────────────────────────

async function findOrCreateUser(from: {
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

// ── Bot factory ───────────────────────────────────────────────────────────

export function startBot(): void {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.warn("TELEGRAM_BOT_TOKEN not set — Telegram bot not started.");
    return;
  }

  const bot = new Telegraf(token);

  // /start
  bot.command("start", async (ctx) => {
    const from = ctx.from;
    if (!from) return;

    const user = await findOrCreateUser({
      id: from.id,
      first_name: from.first_name,
      last_name: from.last_name,
      username: from.username,
    });

    await ctx.reply(
      `👋 Welcome${user ? `, *${user.firstName}*` : ""}!\n\nI'm your *IELTS Writing Mastery* companion. Use me alongside the web app to practise daily.\n\n• /daily — start your daily challenge\n• /practice — quick single exercise\n• /streak — see your streak\n• /stats — view your stats`,
      { parse_mode: "Markdown" }
    );
  });

  // /daily
  bot.command("daily", async (ctx) => {
    const from = ctx.from;
    if (!from) return;

    await findOrCreateUser({
      id: from.id,
      first_name: from.first_name,
      last_name: from.last_name,
      username: from.username,
    });

    const telegramId = from.id;

    if (sessions.has(telegramId)) {
      await ctx.reply("You already have an active challenge. Keep answering or type /cancel to stop.");
      return;
    }

    try {
      const allExercises = await fetchAllExercises();
      if (allExercises.length === 0) {
        await ctx.reply("No exercises found. Please check back later.");
        return;
      }

      const exercises = shuffle(allExercises).slice(0, 5);
      const session: ChallengeSession = {
        exercises,
        currentIndex: 0,
        score: 0,
        startTime: new Date(),
        type: "daily",
        awaitingSelfAssess: false,
      };
      sessions.set(telegramId, session);

      await ctx.reply("🚀 *Daily Challenge Started!*\n\nYou have 5 exercises. Good luck! 💪", {
        parse_mode: "Markdown",
      });
      await sendExercise(bot, ctx.chat.id, session);
    } catch {
      await ctx.reply("❌ Failed to load exercises. Please try again.");
    }
  });

  // /practice
  bot.command("practice", async (ctx) => {
    const from = ctx.from;
    if (!from) return;

    await findOrCreateUser({
      id: from.id,
      first_name: from.first_name,
      last_name: from.last_name,
      username: from.username,
    });

    const telegramId = from.id;

    if (sessions.has(telegramId)) {
      await ctx.reply("You already have an active challenge. Keep answering or type /cancel to stop.");
      return;
    }

    try {
      const allExercises = await fetchAllExercises();
      if (allExercises.length === 0) {
        await ctx.reply("No exercises found. Please check back later.");
        return;
      }

      const exercises = shuffle(allExercises).slice(0, 1);
      const session: ChallengeSession = {
        exercises,
        currentIndex: 0,
        score: 0,
        startTime: new Date(),
        type: "practice",
        awaitingSelfAssess: false,
      };
      sessions.set(telegramId, session);

      await ctx.reply("🎯 *Quick Practice!*\n\nHere's your exercise:", { parse_mode: "Markdown" });
      await sendExercise(bot, ctx.chat.id, session);
    } catch {
      await ctx.reply("❌ Failed to load an exercise. Please try again.");
    }
  });

  // /cancel
  bot.command("cancel", async (ctx) => {
    const telegramId = ctx.from?.id;
    if (!telegramId) return;

    if (sessions.delete(telegramId)) {
      await ctx.reply("Challenge cancelled. Use /daily or /practice to start a new one.");
    } else {
      await ctx.reply("No active challenge to cancel.");
    }
  });

  // /streak
  bot.command("streak", async (ctx) => {
    const from = ctx.from;
    if (!from) return;

    const telegramId = from.id;

    const stats = await TelegramStatsModel.find({ telegramId, type: "daily" })
      .sort({ date: -1 })
      .lean();

    if (stats.length === 0) {
      await ctx.reply("No daily challenges completed yet. Use /daily to start!");
      return;
    }

    const uniqueDates = [...new Set(stats.map((s) => s.date))].sort((a, b) => (b > a ? 1 : -1));
    let streak = 0;
    const today = todayStr();

    for (let i = 0; i < uniqueDates.length; i++) {
      const expected = new Date();
      expected.setDate(expected.getDate() - i);
      const expectedStr = expected.toISOString().slice(0, 10);

      if (i === 0 && uniqueDates[0] !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (uniqueDates[0] !== yesterday.toISOString().slice(0, 10)) break;
      }

      if (uniqueDates[i] === expectedStr) {
        streak += 1;
      } else {
        break;
      }
    }

    await ctx.reply(
      `🔥 *Your Streak: ${streak} day${streak === 1 ? "" : "s"}*\n\nKeep it up with /daily every day!`,
      { parse_mode: "Markdown" }
    );
  });

  // /stats
  bot.command("stats", async (ctx) => {
    const from = ctx.from;
    if (!from) return;

    const telegramId = from.id;

    const all = await TelegramStatsModel.find({ telegramId }).lean();
    if (all.length === 0) {
      await ctx.reply("No stats yet. Use /daily or /practice to get started!");
      return;
    }

    const totalDone = all.reduce((sum, s) => sum + s.total, 0);
    const totalCorrect = all.reduce((sum, s) => sum + s.score, 0);
    const accuracy = totalDone > 0 ? Math.round((totalCorrect / totalDone) * 100) : 0;
    const dailySessions = all.filter((s) => s.type === "daily").length;

    await ctx.reply(
      `📊 *Your Stats*\n\n• Total exercises: *${totalDone}*\n• Correct answers: *${totalCorrect}*\n• Accuracy: *${accuracy}%*\n• Daily sessions: *${dailySessions}*`,
      { parse_mode: "Markdown" }
    );
  });

  // Inline keyboard callbacks (self-assessment)
  bot.on("callback_query", async (ctx) => {
    const telegramId = ctx.from?.id;
    if (!telegramId) return;

    const data = "data" in ctx.callbackQuery ? ctx.callbackQuery.data : undefined;
    if (!data) return;

    const session = sessions.get(telegramId);
    if (!session) {
      await ctx.answerCbQuery("No active session.");
      return;
    }

    const [action, indexStr] = data.split(":");
    const index = parseInt(indexStr, 10);

    if (index !== session.currentIndex) {
      await ctx.answerCbQuery("This was a previous exercise.");
      return;
    }

    if (!session.awaitingSelfAssess) {
      await ctx.answerCbQuery("Not waiting for self-assessment.");
      return;
    }

    const isCorrect = action === "correct_yes";
    if (isCorrect) session.score += 1;

    await ctx.answerCbQuery(isCorrect ? "Great!" : "Keep practising!");
    await ctx.editMessageReplyMarkup(undefined);

    const ex = session.exercises[session.currentIndex];
    await bot.telegram.sendMessage(
      ctx.chat!.id,
      isCorrect
        ? `✅ *Marked correct!*\n\n_${ex.explanation}_`
        : `❌ *Marked incorrect.*\n\n_${ex.explanation}_`,
      { parse_mode: "Markdown" }
    );

    session.currentIndex += 1;
    session.awaitingSelfAssess = false;

    if (session.currentIndex >= session.exercises.length) {
      await finishSession(bot, ctx.chat!.id, telegramId, session);
    } else {
      await sendExercise(bot, ctx.chat!.id, session);
    }
  });

  // Text message handler — answer to active challenge
  bot.on("text", async (ctx) => {
    const telegramId = ctx.from?.id;
    if (!telegramId) return;

    // Ignore commands
    if (ctx.message.text.startsWith("/")) return;

    const session = sessions.get(telegramId);
    if (!session) {
      await ctx.reply("No active challenge. Use /daily or /practice to start one.");
      return;
    }

    if (session.awaitingSelfAssess) {
      await ctx.reply("Please tap ✅ Yes or ❌ No to rate your answer.");
      return;
    }

    await handleAnswer(bot, ctx.chat.id, telegramId, session, ctx.message.text);
  });

  // Launch
  bot.launch();
  console.log("Telegram bot started");

  process.once("SIGINT", () => bot.stop("SIGINT"));
  process.once("SIGTERM", () => bot.stop("SIGTERM"));
}
