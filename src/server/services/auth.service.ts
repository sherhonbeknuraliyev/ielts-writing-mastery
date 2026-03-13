import crypto from "crypto";
import jwt from "jsonwebtoken";
import { TRPCError } from "@trpc/server";
import { UserModel } from "../models/user.model.js";

const JWT_SECRET = process.env.JWT_SECRET || "ielts-mastery-secret-change-in-production";
const JWT_EXPIRES_IN = "30d";
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";

export const authService = {
  verifyTelegramAuth(data: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    photo_url?: string;
    auth_date: number;
    hash: string;
  }) {
    const { hash, ...rest } = data;
    const checkString = Object.keys(rest)
      .sort()
      .map((key) => `${key}=${rest[key as keyof typeof rest]}`)
      .filter((s) => !s.endsWith("=undefined"))
      .join("\n");

    const secretKey = crypto.createHash("sha256").update(BOT_TOKEN).digest();
    const hmac = crypto.createHmac("sha256", secretKey).update(checkString).digest("hex");

    if (hmac !== hash) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid Telegram authentication" });
    }

    const now = Math.floor(Date.now() / 1000);
    if (now - data.auth_date > 86400) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Telegram authentication expired" });
    }
  },

  async authenticateWithTelegram(data: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    photo_url?: string;
    auth_date: number;
    hash: string;
  }) {
    console.log("[auth] telegramAuth called with:", { id: data.id, first_name: data.first_name, auth_date: data.auth_date });
    try {
      this.verifyTelegramAuth(data);
      console.log("[auth] verification passed");
    } catch (err) {
      console.error("[auth] verification failed:", (err as Error).message);
      throw err;
    }

    let user = await UserModel.findOne({ telegramId: data.id });
    if (!user) {
      user = await UserModel.create({
        telegramId: data.id,
        firstName: data.first_name,
        lastName: data.last_name,
        username: data.username,
        photoUrl: data.photo_url,
      });
      console.log("[auth] created new user:", user._id);
    } else {
      user.firstName = data.first_name;
      user.lastName = data.last_name;
      user.username = data.username;
      user.photoUrl = data.photo_url;
      await user.save();
      console.log("[auth] updated existing user:", user._id);
    }

    const token = jwt.sign({ userId: user._id.toString() }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    console.log("[auth] success, token issued");
    return {
      token,
      user: {
        _id: user._id.toString(),
        telegramId: user.telegramId,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        photoUrl: user.photoUrl,
      },
    };
  },

  verifyToken(token: string) {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
      return { userId: payload.userId };
    } catch {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid or expired token" });
    }
  },

  async getUser(userId: string) {
    const user = await UserModel.findById(userId).select("-__v").lean();
    if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    return {
      _id: user._id.toString(),
      telegramId: user.telegramId,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      photoUrl: user.photoUrl,
    };
  },
};
