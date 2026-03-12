import mongoose, { Schema } from "mongoose";
import type { BandUpgrade } from "@shared/schemas/collocation.schema.js";

const bandUpgradeSchema = new Schema<BandUpgrade>(
  {
    id: { type: String, required: true, unique: true },
    band6: { type: String, required: true },
    band8: { type: String, required: true },
    category: { type: String, required: true },
    explanation: { type: String, required: true },
  },
  { timestamps: false, versionKey: false }
);

bandUpgradeSchema.index({ category: 1 });

export const BandUpgradeModel = mongoose.model<BandUpgrade>("BandUpgrade", bandUpgradeSchema);
