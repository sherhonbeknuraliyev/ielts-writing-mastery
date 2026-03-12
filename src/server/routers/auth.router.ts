import { router, publicProcedure, protectedProcedure } from "../trpc/trpc.js";
import { authService } from "../services/auth.service.js";
import { registerSchema, loginSchema } from "@shared/schemas/user.schema.js";

export const authRouter = router({
  register: publicProcedure
    .input(registerSchema)
    .mutation(({ input }) => {
      return authService.register(input.username, input.password);
    }),

  login: publicProcedure
    .input(loginSchema)
    .mutation(({ input }) => {
      return authService.login(input.username, input.password);
    }),

  me: protectedProcedure.query(({ ctx }) => {
    return authService.getUser(ctx.user.userId);
  }),
});
