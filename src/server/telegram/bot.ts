import { Bot, Context, InlineKeyboard } from "grammy";
import { autoRetry } from "@grammyjs/auto-retry";
import { stream, type StreamFlavor } from "@grammyjs/stream";
import OpenAI from "openai";
import type { SkillExercise } from "@shared/schemas/skill.schema.js";
import { UserModel } from "../models/user.model.js";
import { SkillModel } from "../models/skill.model.js";
import { TelegramStatsModel } from "../models/telegram-stats.model.js";

// ── IELTS Writing Tips ────────────────────────────────────────────────────

const IELTS_TIPS: string[] = [
  "Always plan your essay for 2–3 minutes before writing. A clear outline prevents mid-essay panic and improves coherence.",
  "In Task 2, your thesis statement must directly answer the question. Examiners look for a clear position in the introduction.",
  "Aim for exactly 250+ words in Task 2 and 150+ in Task 1. Going under the limit automatically costs band points.",
  "Use a variety of sentence structures: mix simple, compound, and complex sentences to demonstrate grammatical range.",
  "Avoid starting multiple sentences with 'I'. Vary your sentence openings with 'It is...', 'There are...', 'While...', etc.",
  "Topic sentences are essential. Each body paragraph must open with a sentence that states the main idea of that paragraph.",
  "The word 'however' is overused. Rotate with 'nevertheless', 'on the other hand', 'that said', and 'conversely'.",
  "Never use informal contractions (don't, can't, it's) in IELTS Writing. Always write the full form.",
  "Time yourself: Task 1 = 20 minutes, Task 2 = 40 minutes. Practise this split every time you write a full test.",
  "Lexical resource counts for 25% of your score. Aim to use each key concept with at least two different expressions.",
  "Avoid vague words like 'thing', 'stuff', 'good', 'bad'. Replace them with precise academic vocabulary.",
  "In Task 1 (Academic), always open with an overview paragraph that summarises the main trend — do NOT call it a conclusion.",
  "For General Training Task 1 letters, match your tone (formal / semi-formal / informal) strictly to the situation given.",
  "Link ideas with a mix of cohesive devices: discourse markers ('Furthermore'), pronouns, and lexical chains.",
  "Do not memorise and paste pre-written phrases. Examiners are trained to spot them and will discount that language.",
  "Vary your vocabulary for 'increase' and 'decrease': rose sharply, surged, plummeted, dipped, levelled off, fluctuated.",
  "Finish your essay with a genuine conclusion that restates your position using different words — not just a copy of the intro.",
  "Spelling matters. A consistent pattern of misspelling the same word signals low lexical control to the examiner.",
  "Paragraphing is a coherence signal. Leave a blank line between every paragraph so structure is immediately visible.",
  "In opinion essays, every body paragraph needs: topic sentence → explanation → example → mini-conclusion. Never skip steps.",
  "Use passive constructions strategically to add variety: 'It is widely argued that...' rather than always using active voice.",
  "When paraphrasing the question in your introduction, change both the vocabulary AND the grammar — not just swap words.",
  "Aim for 2–3 well-developed body paragraphs rather than 4 thin ones. Depth beats breadth in IELTS Writing.",
  "Check that every idea in your essay links back to the question. Off-topic content cannot earn task achievement marks.",
];

// ── Academic Words / Collocations ────────────────────────────────────────

interface AcademicWord {
  collocation: string;
  band: string;
  definition: string;
  example: string;
}

const ACADEMIC_WORDS: AcademicWord[] = [
  {
    collocation: "exert influence",
    band: "7.5+",
    definition: "to have a strong effect on something or someone",
    example: "Social media platforms exert considerable influence on public opinion.",
  },
  {
    collocation: "mitigate the impact",
    band: "7.0+",
    definition: "to reduce the severity or seriousness of something",
    example: "Governments must act swiftly to mitigate the impact of climate change.",
  },
  {
    collocation: "foster a sense of",
    band: "7.0+",
    definition: "to encourage the development of a feeling or quality",
    example: "Community projects foster a sense of belonging among residents.",
  },
  {
    collocation: "undermine the effectiveness",
    band: "7.0+",
    definition: "to weaken or damage something gradually",
    example: "Corruption can seriously undermine the effectiveness of public institutions.",
  },
  {
    collocation: "pose a significant threat",
    band: "6.5+",
    definition: "to present a serious danger or risk",
    example: "Rising sea levels pose a significant threat to coastal communities.",
  },
  {
    collocation: "draw a distinction",
    band: "7.0+",
    definition: "to identify a clear difference between two things",
    example: "It is important to draw a distinction between correlation and causation.",
  },
  {
    collocation: "yield tangible results",
    band: "7.5+",
    definition: "to produce clear, real, measurable outcomes",
    example: "Years of research finally yielded tangible results in cancer treatment.",
  },
  {
    collocation: "grapple with",
    band: "7.0+",
    definition: "to struggle to deal with or understand something difficult",
    example: "Many developing nations grapple with the dual challenge of poverty and inequality.",
  },
  {
    collocation: "inevitably lead to",
    band: "6.5+",
    definition: "to certainly cause a particular result",
    example: "Unchecked industrial growth will inevitably lead to environmental degradation.",
  },
  {
    collocation: "a pivotal role",
    band: "7.0+",
    definition: "a centrally important function in something",
    example: "Education plays a pivotal role in breaking cycles of poverty.",
  },
  {
    collocation: "strike a balance",
    band: "6.5+",
    definition: "to find a fair middle point between two opposing things",
    example: "Policymakers must strike a balance between economic growth and environmental protection.",
  },
  {
    collocation: "constitute a major obstacle",
    band: "7.0+",
    definition: "to represent a significant barrier or problem",
    example: "Lack of funding constitutes a major obstacle to scientific progress.",
  },
  {
    collocation: "amplify existing inequalities",
    band: "7.5+",
    definition: "to make existing differences or gaps larger",
    example: "Automation risks amplifying existing inequalities in the labour market.",
  },
  {
    collocation: "shed light on",
    band: "6.5+",
    definition: "to clarify or reveal something previously unclear",
    example: "Recent studies shed light on the long-term effects of screen exposure in children.",
  },
  {
    collocation: "be attributed to",
    band: "6.5+",
    definition: "to be considered as caused by something",
    example: "The rise in obesity can largely be attributed to sedentary lifestyles.",
  },
  {
    collocation: "advocate for",
    band: "6.5+",
    definition: "to publicly support or recommend a cause or policy",
    example: "Many health organisations advocate for stricter regulations on fast food advertising.",
  },
  {
    collocation: "have far-reaching consequences",
    band: "7.0+",
    definition: "to produce effects that extend widely over time or area",
    example: "Decisions made today on AI regulation will have far-reaching consequences for future generations.",
  },
  {
    collocation: "exacerbate the problem",
    band: "7.0+",
    definition: "to make an existing problem worse",
    example: "Inadequate public transport only serves to exacerbate the problem of urban congestion.",
  },
  {
    collocation: "a compelling argument",
    band: "6.5+",
    definition: "a convincing and persuasive line of reasoning",
    example: "There is a compelling argument for investing in renewable energy sources.",
  },
  {
    collocation: "precipitate a crisis",
    band: "8.0+",
    definition: "to cause a serious problem to happen suddenly",
    example: "Poor financial regulation can precipitate a crisis that affects the entire economy.",
  },
  {
    collocation: "be intrinsically linked",
    band: "7.5+",
    definition: "to be fundamentally and inseparably connected",
    example: "Mental and physical health are intrinsically linked and cannot be treated in isolation.",
  },
  {
    collocation: "tackle the root causes",
    band: "6.5+",
    definition: "to address the fundamental reasons behind a problem",
    example: "Effective policy must tackle the root causes of homelessness, not just its symptoms.",
  },
  {
    collocation: "merit serious consideration",
    band: "7.0+",
    definition: "to deserve careful and thorough thought",
    example: "The proposal merits serious consideration before any decision is made.",
  },
  {
    collocation: "a nuanced perspective",
    band: "7.5+",
    definition: "a view that acknowledges subtle distinctions and complexity",
    example: "A nuanced perspective on immigration considers both economic benefits and social pressures.",
  },
  {
    collocation: "be contingent on",
    band: "7.5+",
    definition: "to depend on a particular condition being met",
    example: "The success of the policy is contingent on the cooperation of all stakeholders.",
  },
  {
    collocation: "galvanise public support",
    band: "8.0+",
    definition: "to stimulate or energise people into taking action",
    example: "The documentary helped galvanise public support for environmental reform.",
  },
  {
    collocation: "a vicious cycle",
    band: "6.5+",
    definition: "a sequence of events where each problem makes the next one worse",
    example: "Poverty and poor education form a vicious cycle that is difficult to break.",
  },
  {
    collocation: "render something obsolete",
    band: "7.5+",
    definition: "to make something no longer useful or relevant",
    example: "Digital technology has rendered many traditional business models obsolete.",
  },
  {
    collocation: "empirical evidence",
    band: "7.0+",
    definition: "information based on observation or experiment rather than theory",
    example: "There is strong empirical evidence linking air pollution to respiratory disease.",
  },
  {
    collocation: "be deemed necessary",
    band: "6.5+",
    definition: "to be officially considered or judged as required",
    example: "Stricter border controls were deemed necessary by the security committee.",
  },
];

// ── Types ──────────────────────────────────────────────────────────────────

type MyContext = StreamFlavor<Context>;

interface ChallengeSession {
  exercises: SkillExercise[];
  currentIndex: number;
  score: number;
  startTime: Date;
  type: "daily" | "practice";
  awaitingSelfAssess: boolean;
}

// ── In-memory stores ──────────────────────────────────────────────────────

const sessions = new Map<number, ChallengeSession>();
const awaitingReview = new Set<number>();

// Track last 5 tip indices shown per user to avoid immediate repeats
const recentTips = new Map<number, number[]>();

// ── AI client ─────────────────────────────────────────────────────────────

const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com",
});

async function* streamAI(systemPrompt: string, userMessage: string): AsyncGenerator<string> {
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

function pickRandomTip(telegramId: number): { tip: string; index: number } {
  const recent = recentTips.get(telegramId) ?? [];
  const available = IELTS_TIPS.map((_, i) => i).filter((i) => !recent.includes(i));
  const pool = available.length > 0 ? available : IELTS_TIPS.map((_, i) => i);
  const index = pool[Math.floor(Math.random() * pool.length)];
  const updated = [...recent, index].slice(-5);
  recentTips.set(telegramId, updated);
  return { tip: IELTS_TIPS[index], index };
}

function pickRandomWord(): AcademicWord {
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
  bot: Bot<MyContext>,
  chatId: number,
  session: ChallengeSession
): Promise<void> {
  const ex = session.exercises[session.currentIndex];
  await bot.api.sendMessage(chatId, exerciseMessage(ex, session.currentIndex, session.exercises.length), {
    parse_mode: "Markdown",
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
    `🎉 *Challenge Complete!*\n\nYou got *${score}/${total}* correct!\n\n${
      score === total
        ? "Perfect score! Excellent work! 🏆"
        : score >= Math.ceil(total / 2)
        ? "Good effort! Keep practising to reach band 7+. 💪"
        : "Keep going — every exercise builds your band score. 📚"
    }\n\n💡 *Writing Tip:* ${tip}`,
    { parse_mode: "Markdown" }
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
      `📖 *Model Answer:*\n\n${ex.correctAnswer}\n\n_${ex.explanation}_\n\nDid you get it right?`,
      {
        parse_mode: "Markdown",
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
      `✅ *Correct!*\n\n"${ex.correctAnswer}" is the right answer.\n\n_${ex.explanation}_`,
      { parse_mode: "Markdown" }
    );
  } else {
    await bot.api.sendMessage(
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

// ── Shared message text ────────────────────────────────────────────────────

const COMMANDS_LIST =
  "• /daily — start your daily challenge (5 exercises)\n" +
  "• /practice — quick single exercise\n" +
  "• /tip — get a random IELTS writing tip\n" +
  "• /word — get an academic word or collocation\n" +
  "• /ask — ask an IELTS writing question\n" +
  "• /review — get AI feedback on your paragraph\n" +
  "• /streak — see your current streak\n" +
  "• /stats — view your performance stats\n" +
  "• /cancel — stop an active challenge\n" +
  "• /help — show this list";

// ── System prompts ─────────────────────────────────────────────────────────

const ASK_SYSTEM_PROMPT =
  "You are an expert IELTS writing tutor. Help students improve their writing skills for band 7.5+. " +
  "Be concise, practical, and encouraging. Give specific examples when possible. Keep responses under 300 words. " +
  "IMPORTANT: Do NOT use Markdown formatting (no **, no #, no >, no ```, no *). Use plain text only. " +
  "Use line breaks, numbered lists (1. 2. 3.), and quotes with quotation marks for formatting.";

const REVIEW_SYSTEM_PROMPT =
  "You are an IELTS examiner. Review this paragraph and provide: " +
  "1) Estimated band range 2) 2-3 specific strengths 3) 2-3 areas for improvement with corrected examples. " +
  "Be encouraging but honest. Keep it under 200 words. " +
  "IMPORTANT: Do NOT use Markdown formatting (no **, no #, no >, no ```, no *). Use plain text only.";

// ── Bot factory ───────────────────────────────────────────────────────────

export function startBot(): void {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.warn("TELEGRAM_BOT_TOKEN not set — Telegram bot not started.");
    return;
  }

  const bot = new Bot<MyContext>(token);

  bot.api.config.use(autoRetry());
  bot.use(stream());

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
      `👋 Welcome${user ? `, *${user.firstName}*` : ""}!\n\nI'm your *IELTS Writing Mastery* companion. Use me alongside the web app to practise daily.\n\n${COMMANDS_LIST}`,
      { parse_mode: "Markdown" }
    );
  });

  // /help
  bot.command("help", async (ctx) => {
    await ctx.reply(`📋 *Available Commands*\n\n${COMMANDS_LIST}`, { parse_mode: "Markdown" });
  });

  // /tip
  bot.command("tip", async (ctx) => {
    const telegramId = ctx.from?.id;
    if (!telegramId) return;

    const { tip } = pickRandomTip(telegramId);
    await ctx.reply(`💡 *IELTS Writing Tip*\n\n${tip}`, { parse_mode: "Markdown" });
  });

  // /word
  bot.command("word", async (ctx) => {
    const word = pickRandomWord();
    await ctx.reply(
      `📚 *Word of the Day*\n\ncollocation: _"${word.collocation}"_\nBand: ${word.band}\n\n${word.definition}\n\nExample: _"${word.example}"_\n\nTry using this in your next essay! 💡`,
      { parse_mode: "Markdown" }
    );
  });

  // /ask
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

    await ctx.replyWithStream(streamAI(ASK_SYSTEM_PROMPT, question));
  });

  // /review
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

    awaitingReview.delete(telegramId);

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

  // Text message handler — review, or answer to active challenge
  bot.on("message:text", async (ctx) => {
    const telegramId = ctx.from?.id;
    if (!telegramId) return;

    // Ignore commands
    if (ctx.message.text.startsWith("/")) return;

    // AI essay review flow
    if (awaitingReview.has(telegramId)) {
      awaitingReview.delete(telegramId);
      await ctx.replyWithStream(streamAI(REVIEW_SYSTEM_PROMPT, ctx.message.text));
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

  // Launch
  bot.start();
  console.log("Telegram bot started");

  process.once("SIGINT", () => bot.stop());
  process.once("SIGTERM", () => bot.stop());
}
