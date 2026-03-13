import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { authService } from "../services/auth.service.js";

export async function createContext({ req, res }: CreateExpressContextOptions) {
  const token = req.headers.authorization?.split(" ")[1] ?? null;
  let user: { userId: string } | null = null;

  if (token) {
    try {
      user = authService.verifyToken(token);
    } catch {
      // Invalid token, user remains null
    }
  }

  return { req, res, user };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
