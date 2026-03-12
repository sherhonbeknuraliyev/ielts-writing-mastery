import mongoose, { Schema } from "mongoose";
import type { Skill } from "@shared/schemas/skill.schema.js";

const skillExerciseSchema = new Schema(
  {
    id: { type: String, required: true },
    type: {
      type: String,
      enum: [
        "transform-upgrade",
        "sentence-combining",
        "error-correction",
        "rewrite",
        "fill-blank",
        "find-errors",
        "paraphrase",
        "formalize",
        "cohesion-repair",
        "idea-development",
      ],
      required: true,
    },
    question: { type: String, required: true },
    context: { type: String },
    correctAnswer: { type: String, required: true },
    alternativeAnswers: [String],
    explanation: { type: String, required: true },
    bandCriterion: {
      type: String,
      enum: ["task-achievement", "coherence-cohesion", "lexical-resource", "grammatical-range"],
      required: true,
    },
  },
  { _id: false }
);

const contentItemSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["heading", "paragraph", "example", "rule", "tip", "warning", "comparison"],
      required: true,
    },
    text: { type: String, required: true },
  },
  { _id: false }
);

const skillSchema = new Schema<Skill>(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    module: {
      type: String,
      enum: ["sentence-sophistication", "error-elimination", "writing-techniques"],
      required: true,
    },
    targetBand: { type: String, required: true },
    criterion: {
      type: String,
      enum: ["task-achievement", "coherence-cohesion", "lexical-resource", "grammatical-range"],
      required: true,
    },
    description: { type: String, required: true },
    content: [contentItemSchema],
    exercises: [skillExerciseSchema],
    keyTakeaways: [String],
  },
  { timestamps: false, versionKey: false }
);

skillSchema.index({ module: 1 });
skillSchema.index({ criterion: 1 });

export const SkillModel = mongoose.model<Skill>("Skill", skillSchema);
