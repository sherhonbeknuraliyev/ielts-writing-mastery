import { router, publicProcedure, protectedProcedure } from "../trpc/trpc.js";
import { authService } from "../services/auth.service.js";
import { telegramAuthSchema } from "@shared/schemas/user.schema.js";

export const authRouter = router({
  telegramAuth: publicProcedure
    .input(telegramAuthSchema)
    .mutation(async ({ input }) => {
      return authService.authenticateWithTelegram(input);
    }),

  me: protectedProcedure.query(async ({ ctx }) => {
    return authService.getUser(ctx.user.userId);
  }),
});
