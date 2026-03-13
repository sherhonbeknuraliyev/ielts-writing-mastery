import { Bot } from "grammy";
import { TelegramStatsModel } from "../../models/telegram-stats.model.js";
import { COMMANDS_LIST } from "../constants.js";
import { findOrCreateUser, pickRandomTip, pickRandomWord, todayStr } from "../helpers.js";
import type { MyContext } from "../types.js";

export function registerInfoHandlers(bot: Bot<MyContext>): void {
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
      `👋 Welcome${user ? `, <b>${user.firstName}</b>` : ""}!\n\nI'm your <b>IELTS Writing Mastery</b> companion. Use me alongside the web app to practise daily.\n\n${COMMANDS_LIST}`,
      { parse_mode: "HTML" }
    );
  });

  bot.command("help", async (ctx) => {
    await ctx.reply(`📋 <b>Available Commands</b>\n\n${COMMANDS_LIST}`, { parse_mode: "HTML" });
  });

  bot.command("tip", async (ctx) => {
    const telegramId = ctx.from?.id;
    if (!telegramId) return;

    const { tip } = pickRandomTip(telegramId);
    await ctx.reply(`💡 <b>IELTS Writing Tip</b>\n\n${tip}`, { parse_mode: "HTML" });
  });

  bot.command("word", async (ctx) => {
    const word = pickRandomWord();
    await ctx.reply(
      `📚 <b>Word of the Day</b>\n\ncollocation: <i>"${word.collocation}"</i>\nBand: ${word.band}\n\n${word.definition}\n\nExample: <i>"${word.example}"</i>\n\nTry using this in your next essay! 💡`,
      { parse_mode: "HTML" }
    );
  });

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
      `🔥 <b>Your Streak: ${streak} day${streak === 1 ? "" : "s"}</b>\n\nKeep it up with /daily every day!`,
      { parse_mode: "HTML" }
    );
  });

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
      `📊 <b>Your Stats</b>\n\n• Total exercises: <b>${totalDone}</b>\n• Correct answers: <b>${totalCorrect}</b>\n• Accuracy: <b>${accuracy}%</b>\n• Daily sessions: <b>${dailySessions}</b>`,
      { parse_mode: "HTML" }
    );
  });
}
