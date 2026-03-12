import { router, protectedProcedure } from "../trpc/trpc.js";
import { analyticsService } from "../services/analytics.service.js";

export const analyticsRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    return analyticsService.getAnalytics(ctx.user.userId);
  }),
});
