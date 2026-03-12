import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/user.model.js";
import { TRPCError } from "@trpc/server";

const JWT_SECRET = process.env.JWT_SECRET || "ielts-mastery-secret-change-in-production";
const JWT_EXPIRES_IN = "7d";

export const authService = {
  async register(username: string, password: string) {
    const existing = await UserModel.findOne({ username: username.toLowerCase() });
    if (existing) {
      throw new TRPCError({ code: "CONFLICT", message: "Username already taken" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await UserModel.create({
      username: username.toLowerCase(),
      password: hashedPassword,
    });
    const token = jwt.sign(
      { userId: user._id.toString(), username: user.username },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    return { token, user: { _id: user._id.toString(), username: user.username } };
  },

  async login(username: string, password: string) {
    const user = await UserModel.findOne({ username: username.toLowerCase() });
    if (!user) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid credentials" });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid credentials" });
    }
    const token = jwt.sign(
      { userId: user._id.toString(), username: user.username },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    return { token, user: { _id: user._id.toString(), username: user.username } };
  },

  verifyToken(token: string) {
    try {
      return jwt.verify(token, JWT_SECRET) as { userId: string; username: string };
    } catch {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid or expired token" });
    }
  },

  async getUser(userId: string) {
    const user = await UserModel.findById(userId).select("-password").lean();
    if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    return { _id: user._id.toString(), username: user.username };
  },
};
