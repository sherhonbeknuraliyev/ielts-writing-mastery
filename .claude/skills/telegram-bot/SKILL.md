---
name: telegram-bot
description: Telegram Bot API patterns and reference. Use when building Telegram bots, handling updates, sending messages, working with inline keyboards, webhooks, or any Telegram Bot API integration.
---

# Telegram Bot API

## Base URL & Authentication
```
https://api.telegram.org/bot<TOKEN>/METHOD_NAME
```
Token format: `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11` (from @BotFather)

Requests: GET/POST, JSON body or `multipart/form-data` (file uploads). Response: `{ ok, result, description? }`

## Getting Updates

### Webhook (production — use this)
```ts
// Set webhook (call once)
await fetch(`${BOT_URL}/setWebhook`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    url: "https://yourdomain.com/api/telegram/webhook",
    secret_token: process.env.TELEGRAM_WEBHOOK_SECRET,
  }),
});

// Express handler
app.post("/api/telegram/webhook", (req, res) => {
  const secret = req.headers["x-telegram-bot-api-secret-token"];
  if (secret !== process.env.TELEGRAM_WEBHOOK_SECRET) return res.sendStatus(403);
  handleUpdate(req.body);
  res.sendStatus(200); // respond fast, process async
});
```
Supported ports: 443, 80, 88, 8443. Must be HTTPS.

## Core Methods

### Sending Messages
```ts
// Text message
await bot("sendMessage", {
  chat_id: chatId,
  text: "Hello!",
  parse_mode: "HTML", // or "MarkdownV2"
});

// With inline keyboard
await bot("sendMessage", {
  chat_id: chatId,
  text: "Choose an option:",
  reply_markup: {
    inline_keyboard: [
      [{ text: "Option A", callback_data: "opt_a" }, { text: "Option B", callback_data: "opt_b" }],
      [{ text: "Visit Site", url: "https://example.com" }],
    ],
  },
});

// Photo
await bot("sendPhoto", {
  chat_id: chatId,
  photo: "https://example.com/image.jpg", // URL or file_id
  caption: "Check this out!",
});

// Other media: sendDocument, sendVideo, sendAudio, sendLocation — same pattern
```

### Editing Messages
```ts
await bot("editMessageText", {
  chat_id: chatId,
  message_id: msgId,
  text: "Updated text",
  reply_markup: { inline_keyboard: [[]] }, // update buttons too
});

await bot("deleteMessage", { chat_id: chatId, message_id: msgId });
```

### Answering Callbacks
```ts
// MUST answer every callback_query to remove loading state
await bot("answerCallbackQuery", {
  callback_query_id: query.id,
  text: "Done!", // optional toast notification
  show_alert: false, // true = modal alert
});
```

## Key Types
```ts
interface Update {
  update_id: number;
  message?: Message;           // new message
  callback_query?: CallbackQuery; // button click
  inline_query?: InlineQuery;  // @bot query
  edited_message?: Message;
  channel_post?: Message;
}

interface Message {
  message_id: number; from?: User; chat: Chat; date: number;
  text?: string; entities?: MessageEntity[];
  photo?: PhotoSize[]; document?: Document;
  reply_to_message?: Message; reply_markup?: InlineKeyboardMarkup;
}

interface Chat { id: number; type: "private"|"group"|"supergroup"|"channel"; title?: string; username?: string; }
interface CallbackQuery { id: string; from: User; message?: Message; data?: string; }
```

## Helper Pattern for This Project

```ts
// src/server/services/telegram.service.ts
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const BOT_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

export async function bot(method: string, params: Record<string, unknown> = {}) {
  const res = await fetch(`${BOT_URL}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(`Telegram API error: ${data.description}`);
  return data.result;
}
```

## Update Handler Pattern
```ts
// src/server/services/telegram.handler.ts
export async function handleUpdate(update: Update) {
  if (update.message?.text) {
    return handleMessage(update.message);
  }
  if (update.callback_query) {
    return handleCallback(update.callback_query);
  }
}

async function handleMessage(msg: Message) {
  const text = msg.text || "";
  const chatId = msg.chat.id;

  // Command routing
  if (text.startsWith("/start")) return bot("sendMessage", { chat_id: chatId, text: "Welcome!" });
  if (text.startsWith("/help")) return bot("sendMessage", { chat_id: chatId, text: "Commands: /start, /help" });

  // Default echo or AI response
  return bot("sendMessage", { chat_id: chatId, text: `You said: ${text}` });
}

async function handleCallback(query: CallbackQuery) {
  const chatId = query.message?.chat.id;
  const data = query.data;

  await bot("answerCallbackQuery", { callback_query_id: query.id });

  if (data === "opt_a") {
    await bot("editMessageText", {
      chat_id: chatId,
      message_id: query.message?.message_id,
      text: "You chose Option A!",
    });
  }
}
```

## Bot Commands Registration
```ts
await bot("setMyCommands", { commands: [
  { command: "start", description: "Start the bot" },
  { command: "help", description: "Show help" },
]});
```

## Inline Mode
```ts
// User types @yourbot query — respond with results
await bot("answerInlineQuery", {
  inline_query_id: query.id,
  results: [{ type: "article", id: "1", title: "Result", input_message_content: { message_text: "Text" } }],
  cache_time: 300,
});
```

## Streaming / Message Drafts (AI Bots)

`sendMessageDraft` streams partial messages to users while being generated — ideal for AI chatbots.

```ts
// Stream an AI response token-by-token to the user
async function streamAIResponse(chatId: number, userPrompt: string) {
  let accumulated = "";

  // Start streaming — sends a draft message that shows as "typing"
  // The first call creates the draft and returns the message
  const draft = await bot("sendMessageDraft", {
    chat_id: chatId,
    text: "", // initial empty or partial text
    parse_mode: "HTML",
  });

  const messageId = draft.message_id;

  // Stream tokens from your AI provider
  for await (const chunk of getAIStream(userPrompt)) {
    accumulated += chunk;

    // Update the draft with accumulated text
    await bot("sendMessageDraft", {
      chat_id: chatId,
      text: accumulated,
      message_id: messageId, // update existing draft
      parse_mode: "HTML",
    });
  }

  // Finalize — send the complete message (replaces the draft)
  await bot("sendMessage", {
    chat_id: chatId,
    text: accumulated,
    parse_mode: "HTML",
  });
}
```

### Key Points
- Bot API 9.3 (Dec 2025), all bots in API 9.5 (Mar 2026)
- Real-time text streaming like ChatGPT/Claude web UIs
- Finalize with `sendMessage` or `editMessageText` when done

### Integration with Claude API
```ts
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

async function handleAIMessage(chatId: number, userText: string) {
  let accumulated = "";
  let messageId: number | undefined;

  const stream = anthropic.messages.stream({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [{ role: "user", content: userText }],
  });

  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      accumulated += event.delta.text;

      // Send or update draft every ~20 chars to avoid rate limits
      if (accumulated.length % 20 < event.delta.text.length || !messageId) {
        const draft = await bot("sendMessageDraft", {
          chat_id: chatId,
          text: accumulated,
          ...(messageId && { message_id: messageId }),
        });
        messageId = messageId || draft.message_id;
      }
    }
  }

  // Finalize the message
  if (messageId) {
    await bot("editMessageText", {
      chat_id: chatId,
      message_id: messageId,
      text: accumulated,
    });
  }
}
```

## Payments (Telegram Stars)
```ts
await bot("sendInvoice", {
  chat_id: chatId, title: "Premium Plan", description: "Monthly sub",
  payload: "premium_monthly", currency: "XTR", prices: [{ label: "Premium", amount: 100 }],
});
// Handle pre_checkout_query update:
await bot("answerPreCheckoutQuery", { pre_checkout_query_id: query.id, ok: true });
```

## Parse Modes
- `HTML`: `<b>`, `<i>`, `<u>`, `<s>`, `<a href="">`, `<code>`, `<pre>`, `<tg-spoiler>`, `<blockquote>`
- `MarkdownV2`: `*bold*`, `_italic_`, `__underline__`, `~strike~`, `` `code` ``, `||spoiler||`, `> quote`
  - Escape: `_*[]()~>#+\-=|{}.!`

## Important Constraints
- Webhook: must be HTTPS, ports 443/80/88/8443
- File download: up to 20MB via getFile
- File upload: up to 50MB via multipart
- Message text: max 4096 characters
- Caption: max 1024 characters
- Inline results: max 50 per query
- Callback data: max 64 bytes
- Always answer callback queries (even with empty response)
- Update retention: 24 hours max

## Environment Variables
```env
TELEGRAM_BOT_TOKEN=123456:ABC-DEF...
TELEGRAM_WEBHOOK_SECRET=your-random-secret
TELEGRAM_WEBHOOK_URL=https://yourdomain.com/api/telegram/webhook
```
