import { Bot, InlineKeyboard } from "grammy";
import { TelegramStatsModel } from "../../models/telegram-stats.model.js";
import { esc, exerciseMessage, fetchAllExercises, findOrCreateUser, isSubjective, pickRandomTip, shuffle, todayStr } from "../helpers.js";
import type { ChallengeSession, MyContext } from "../types.js";
import { awaitingReview, handleReview } from "./ai.js";

const sessions = new Map<number, ChallengeSession>();

async function sendExercise(bot: Bot<MyContext>, chatId: number, session: ChallengeSession): Promise<void> {
  const ex = session.exercises[session.currentIndex];
  await bot.api.sendMessage(chatId, exerciseMessage(ex, session.currentIndex, session.exercises.length), {
    parse_mode: "HTML",
  });
}

async function finishSession(
  bot: Bot<MyContext>,
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

  const { tip } = pickRandomTip(telegramId);

  await bot.api.sendMessage(
    chatId,
    `🎉 <b>Challenge Complete!</b>\n\nYou got <b>${score}/${total}</b> correct!\n\n${
      score === total
        ? "Perfect score! Excellent work! 🏆"
        : score >= Math.ceil(total / 2)
        ? "Good effort! Keep practising to reach band 7+. 💪"
        : "Keep going — every exercise builds your band score. 📚"
    }\n\n💡 <b>Writing Tip:</b> ${tip}`,
    { parse_mode: "HTML" }
  );
}

async function handleAnswer(
  bot: Bot<MyContext>,
  chatId: number,
  telegramId: number,
  session: ChallengeSession,
  userAnswer: string
): Promise<void> {
  const ex = session.exercises[session.currentIndex];

  if (isSubjective(ex.type)) {
    session.awaitingSelfAssess = true;
    const keyboard = new InlineKeyboard()
      .text("✅ Yes", `correct_yes:${session.currentIndex}`)
      .text("❌ No", `correct_no:${session.currentIndex}`);

    await bot.api.sendMessage(
      chatId,
      `📖 <b>Model Answer:</b>\n\n${esc(ex.correctAnswer)}\n\n<i>${esc(ex.explanation)}</i>\n\nDid you get it right?`,
      {
        parse_mode: "HTML",
        reply_markup: keyboard,
      }
    );
    return;
  }

  const normalise = (s: string) => s.trim().toLowerCase();
  const correct = normalise(ex.correctAnswer);
  const alternatives = (ex.alternativeAnswers ?? []).map(normalise);
  const given = normalise(userAnswer);
  const isCorrect = given === correct || alternatives.includes(given);

  if (isCorrect) {
    session.score += 1;
    await bot.api.sendMessage(
      chatId,
      `✅ <b>Correct!</b>\n\n"${esc(ex.correctAnswer)}" is the right answer.\n\n<i>${esc(ex.explanation)}</i>`,
      { parse_mode: "HTML" }
    );
  } else {
    await bot.api.sendMessage(
      chatId,
      `❌ <b>Not quite.</b>\n\nYour answer: "${esc(userAnswer)}"\nCorrect answer: "${esc(ex.correctAnswer)}"\n\n<i>${esc(ex.explanation)}</i>`,
      { parse_mode: "HTML" }
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

export function registerChallengeHandlers(bot: Bot<MyContext>): void {
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

      await ctx.reply("🚀 <b>Daily Challenge Started!</b>\n\nYou have 5 exercises. Good luck! 💪", {
        parse_mode: "HTML",
      });
      await sendExercise(bot, ctx.chat.id, session);
    } catch {
      await ctx.reply("❌ Failed to load exercises. Please try again.");
    }
  });

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

      await ctx.reply("🎯 <b>Quick Practice!</b>\n\nHere's your exercise:", { parse_mode: "HTML" });
      await sendExercise(bot, ctx.chat.id, session);
    } catch {
      await ctx.reply("❌ Failed to load an exercise. Please try again.");
    }
  });

  bot.command("cancel", async (ctx) => {
    const telegramId = ctx.from?.id;
    if (!telegramId) return;

    awaitingReview.delete(telegramId);

    if (sessions.delete(telegramId)) {
      await ctx.reply("Challenge cancelled. Use /daily or /practice to start a new one.");
    } else {
      await ctx.reply("No active challenge to cancel.");
    }
  });

  bot.on("callback_query:data", async (ctx) => {
    const telegramId = ctx.from?.id;
    if (!telegramId) return;

    const data = ctx.callbackQuery.data;

    const session = sessions.get(telegramId);
    if (!session) {
      await ctx.answerCallbackQuery("No active session.");
      return;
    }

    const [action, indexStr] = data.split(":");
    const index = parseInt(indexStr, 10);

    if (index !== session.currentIndex) {
      await ctx.answerCallbackQuery("This was a previous exercise.");
      return;
    }

    if (!session.awaitingSelfAssess) {
      await ctx.answerCallbackQuery("Not waiting for self-assessment.");
      return;
    }

    const isCorrect = action === "correct_yes";
    if (isCorrect) session.score += 1;

    await ctx.answerCallbackQuery(isCorrect ? "Great!" : "Keep practising!");
    await ctx.editMessageReplyMarkup({ reply_markup: undefined });

    const ex = session.exercises[session.currentIndex];
    await bot.api.sendMessage(
      ctx.chat!.id,
      isCorrect
        ? `✅ <b>Marked correct!</b>\n\n<i>${esc(ex.explanation)}</i>`
        : `❌ <b>Marked incorrect.</b>\n\n<i>${esc(ex.explanation)}</i>`,
      { parse_mode: "HTML" }
    );

    session.currentIndex += 1;
    session.awaitingSelfAssess = false;

    if (session.currentIndex >= session.exercises.length) {
      await finishSession(bot, ctx.chat!.id, telegramId, session);
    } else {
      await sendExercise(bot, ctx.chat!.id, session);
    }
  });

  // Must be registered last — catch-all for text messages
  bot.on("message:text", async (ctx) => {
    const telegramId = ctx.from?.id;
    if (!telegramId) return;

    if (ctx.message.text.startsWith("/")) return;

    if (awaitingReview.has(telegramId)) {
      await handleReview(ctx as MyContext & { message: { text: string } });
      return;
    }

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
}
