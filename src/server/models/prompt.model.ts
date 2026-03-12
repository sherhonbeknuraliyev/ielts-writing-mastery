import mongoose, { Schema } from "mongoose";
import type { WritingPrompt } from "@shared/schemas/prompt.schema.js";

const sampleStructureItemSchema = new Schema(
  {
    paragraph: { type: String, required: true },
    purpose: { type: String, required: true },
    sentenceCount: { type: String, required: true },
  },
  { _id: false }
);

const datasetSchema = new Schema(
  {
    label: { type: String, required: true },
    data: [Number],
    color: { type: String, default: "" },
  },
  { _id: false }
);

const chartDataSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["line", "bar", "pie", "table", "process"],
      required: true,
    },
    title: { type: String, required: true },
    labels: [String],
    datasets: [datasetSchema],
    xAxisLabel: { type: String, default: "" },
    yAxisLabel: { type: String, default: "" },
    unit: { type: String, default: "" },
  },
  { _id: false }
);

const annotationSchema = new Schema(
  {
    highlight: { type: String, required: true },
    technique: { type: String, required: true },
    explanation: { type: String, required: true },
  },
  { _id: false }
);

const modelAnswersSchema = new Schema(
  {
    band7: { type: String, required: true },
    band8: { type: String, required: true },
  },
  { _id: false }
);

const promptSchema = new Schema<WritingPrompt>(
  {
    id: { type: String, required: true, unique: true },
    type: {
      type: String,
      enum: ["task1-academic", "task1-general", "task2"],
      required: true,
    },
    category: { type: String, required: true },
    prompt: { type: String, required: true },
    chartData: { type: chartDataSchema, required: false },
    modelAnswers: { type: modelAnswersSchema, required: true },
    annotations: [annotationSchema],
    evaluationChecklist: [String],
    keyVocabulary: [String],
    tips: [String],
    sampleStructure: [sampleStructureItemSchema],
    timeLimit: { type: Number, required: true },
    wordLimit: {
      min: { type: Number, required: true },
      max: { type: Number, required: true },
    },
    difficulty: {
      type: String,
      enum: ["intermediate", "advanced", "expert"],
      required: true,
    },
  },
  { timestamps: false, versionKey: false }
);

export const PromptModel = mongoose.model<WritingPrompt>("Prompt", promptSchema);
