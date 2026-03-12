import mongoose, { Schema } from "mongoose";
import type { CollocationSet } from "@shared/schemas/collocation.schema.js";

const collocationEntrySchema = new Schema(
  {
    phrase: { type: String, required: true },
    meaning: { type: String, required: true },
    example: { type: String, required: true },
    bandLevel: { type: String, required: true },
  },
  { _id: false }
);

const collocationSetSchema = new Schema<CollocationSet>(
  {
    topic: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    collocations: [collocationEntrySchema],
  },
  { timestamps: false, versionKey: false }
);

export const CollocationModel = mongoose.model<CollocationSet>("Collocation", collocationSetSchema);
