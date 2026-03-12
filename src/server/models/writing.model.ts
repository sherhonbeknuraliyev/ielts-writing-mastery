import mongoose, { Schema, type Document } from "mongoose";

export interface WritingDocument extends Document {
  userId: mongoose.Types.ObjectId;
  promptId?: string;
  type: "task1-academic" | "task1-general" | "task2" | "free-practice";
  promptText?: string;
  content: string;
  wordCount: number;
  timeSpent: number;
  aiFeedback?: {
    taskAchievement: number;
    coherenceCohesion: number;
    lexicalResource: number;
    grammaticalRange: number;
    overallBand: number;
    errors: { original: string; corrected: string; explanation: string }[];
    vocabularySuggestions: { original: string; upgraded: string }[];
    tips: string[];
    summary: string;
  };
  selfEvaluation?: {
    taskAchievement?: number;
    coherenceCohesion?: number;
    lexicalResource?: number;
    grammaticalRange?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const writingSchemaDB = new Schema<WritingDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    promptId: { type: String },
    type: {
      type: String,
      required: true,
      enum: ["task1-academic", "task1-general", "task2", "free-practice"],
    },
    promptText: { type: String },
    content: { type: String, required: true },
    wordCount: { type: Number, required: true },
    timeSpent: { type: Number, default: 0 },
    aiFeedback: { type: Schema.Types.Mixed },
    selfEvaluation: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const WritingModel = mongoose.model<WritingDocument>("Writing", writingSchemaDB);
