import { Bot } from "grammy";
import { ASK_SYSTEM_PROMPT, REVIEW_SYSTEM_PROMPT } from "../constants.js";
import { streamAI } from "../helpers.js";
import type { MyContext } from "../types.js";

export const awaitingReview = new Set<number>();

export function registerAiHandlers(bot: Bot<MyContext>): void {
  bot.command("ask", async (ctx) => {
    if (!process.env.DEEPSEEK_API_KEY) {
      await ctx.reply("AI features are not configured yet.");
      return;
    }

    const question = ctx.match?.trim();
    if (!question) {
      await ctx.reply(
        "What would you like to know about IELTS writing? Try: /ask How do I structure a Task 2 essay?"
      );
      return;
    }

    await ctx.replyWithStream(streamAI(ASK_SYSTEM_PROMPT, question), {}, { parse_mode: "HTML" });
  });

  bot.command("review", async (ctx) => {
    if (!process.env.DEEPSEEK_API_KEY) {
      await ctx.reply("AI features are not configured yet.");
      return;
    }

    const telegramId = ctx.from?.id;
    if (!telegramId) return;

    awaitingReview.add(telegramId);
    await ctx.reply(
      "📝 Please paste your essay paragraph below and I'll give you detailed IELTS feedback."
    );
  });
}

export async function handleReview(ctx: MyContext & { message: { text: string } }): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;
  awaitingReview.delete(telegramId);
  await ctx.replyWithStream(streamAI(REVIEW_SYSTEM_PROMPT, ctx.message.text), {}, { parse_mode: "HTML" });
}
