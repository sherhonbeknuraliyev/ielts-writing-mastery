import { z } from "zod";

export const registerSchema = z.object({
  username: z.string().min(3).max(30),
  password: z.string().min(6),
});

export const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export const userSchema = z.object({
  _id: z.string(),
  username: z.string(),
  createdAt: z.date(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type User = z.infer<typeof userSchema>;
