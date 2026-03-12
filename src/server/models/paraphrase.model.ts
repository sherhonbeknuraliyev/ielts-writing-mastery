import mongoose, { Schema } from "mongoose";
import type { ParaphraseDrill } from "@shared/schemas/collocation.schema.js";

const paraphraseSchema = new Schema<ParaphraseDrill>(
  {
    id: { type: String, required: true, unique: true },
    original: { type: String, required: true },
    method: {
      type: String,
      enum: ["synonym", "word-form", "restructure", "active-passive", "clause-change"],
      required: true,
    },
    paraphrases: [String],
    explanation: { type: String, required: true },
  },
  { timestamps: false, versionKey: false }
);

export const ParaphraseModel = mongoose.model<ParaphraseDrill>("Paraphrase", paraphraseSchema);
