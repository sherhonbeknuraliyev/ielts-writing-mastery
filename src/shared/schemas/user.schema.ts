import { z } from "zod";

export const telegramAuthSchema = z.object({
  id: z.number(),
  first_name: z.string(),
  last_name: z.string().optional(),
  username: z.string().optional(),
  photo_url: z.string().optional(),
  auth_date: z.number(),
  hash: z.string(),
});

export type TelegramAuthData = z.infer<typeof telegramAuthSchema>;

export const userSchema = z.object({
  _id: z.string(),
  telegramId: z.number(),
  firstName: z.string(),
  lastName: z.string().optional(),
  username: z.string().optional(),
  photoUrl: z.string().optional(),
});

export type User = z.infer<typeof userSchema>;
