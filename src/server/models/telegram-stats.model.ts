import mongoose, { Schema, type Document } from "mongoose";

export interface TelegramStatsDocument extends Document {
  telegramId: number;
  date: string;
  score: number;
  total: number;
  type: "daily" | "practice";
  createdAt: Date;
}

const telegramStatsSchema = new Schema<TelegramStatsDocument>(
  {
    telegramId: { type: Number, required: true, index: true },
    date: { type: String, required: true },
    score: { type: Number, required: true },
    total: { type: Number, required: true },
    type: { type: String, enum: ["daily", "practice"], required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const TelegramStatsModel = mongoose.model<TelegramStatsDocument>(
  "TelegramStats",
  telegramStatsSchema
);
