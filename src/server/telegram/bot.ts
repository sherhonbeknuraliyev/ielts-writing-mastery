import { Bot } from "grammy";
import { autoRetry } from "@grammyjs/auto-retry";
import { stream } from "@grammyjs/stream";
import type { MyContext } from "./types.js";
import { registerInfoHandlers } from "./handlers/info.js";
import { registerAiHandlers } from "./handlers/ai.js";
import { registerChallengeHandlers } from "./handlers/challenges.js";

export function startBot(): void {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.warn("TELEGRAM_BOT_TOKEN not set — Telegram bot not started.");
    return;
  }

  const bot = new Bot<MyContext>(token);

  bot.api.config.use(autoRetry());
  bot.use(stream());

  registerInfoHandlers(bot);
  registerAiHandlers(bot);
  registerChallengeHandlers(bot); // must be last — has text handler catch-all

  bot.start();
  console.log("Telegram bot started");

  process.once("SIGINT", () => bot.stop());
  process.once("SIGTERM", () => bot.stop());
}
