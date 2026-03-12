import { router } from "../trpc/trpc.js";
import { authRouter } from "./auth.router.js";
import { skillRouter } from "./skill.router.js";
import { collocationRouter } from "./collocation.router.js";
import { paraphraseRouter } from "./paraphrase.router.js";
import { bandUpgradeRouter } from "./band-upgrade.router.js";
import { promptRouter } from "./prompt.router.js";
import { writingRouter } from "./writing.router.js";
import { aiRouter } from "./ai.router.js";
import { analyticsRouter } from "./analytics.router.js";

export const appRouter = router({
  auth: authRouter,
  skill: skillRouter,
  collocation: collocationRouter,
  paraphrase: paraphraseRouter,
  bandUpgrade: bandUpgradeRouter,
  prompt: promptRouter,
  writing: writingRouter,
  ai: aiRouter,
  analytics: analyticsRouter,
});

export type AppRouter = typeof appRouter;
