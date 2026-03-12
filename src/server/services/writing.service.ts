import mongoose from "mongoose";
import { WritingModel } from "../models/index.js";
import { TRPCError } from "@trpc/server";

export const writingService = {
  async create(
    userId: string,
    data: {
      promptId?: string;
      type: "task1-academic" | "task1-general" | "task2" | "free-practice";
      promptText?: string;
      content: string;
      wordCount: number;
      timeSpent: number;
    }
  ) {
    const doc = await WritingModel.create({ ...data, userId });
    return doc.toObject();
  },

  async findByUser(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [docs, total] = await Promise.all([
      WritingModel.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      WritingModel.countDocuments({ userId }),
    ]);
    return { items: docs, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async findById(id: string) {
    const doc = await WritingModel.findById(id).lean();
    return doc ?? null;
  },

  async update(
    id: string,
    userId: string,
    data: Partial<{
      content: string;
      wordCount: number;
      timeSpent: number;
      aiFeedback: object;
      selfEvaluation: object;
    }>
  ) {
    const doc = await WritingModel.findOneAndUpdate(
      { _id: id, userId },
      data,
      { new: true }
    ).lean();
    if (!doc) throw new TRPCError({ code: "NOT_FOUND", message: "Writing not found" });
    return doc;
  },

  async delete(id: string, userId: string) {
    const result = await WritingModel.findOneAndDelete({ _id: id, userId }).lean();
    if (!result) throw new TRPCError({ code: "NOT_FOUND", message: "Writing not found" });
    return true;
  },

  async getStats(userId: string) {
    const objectId = new mongoose.Types.ObjectId(userId);
    const [total, byType, avgBands] = await Promise.all([
      WritingModel.countDocuments({ userId }),
      WritingModel.aggregate([
        { $match: { userId: objectId } },
        { $group: { _id: "$type", count: { $sum: 1 } } },
      ]),
      WritingModel.aggregate([
        { $match: { userId: objectId, "aiFeedback.overallBand": { $exists: true } } },
        {
          $group: {
            _id: null,
            avgOverallBand: { $avg: "$aiFeedback.overallBand" },
            avgTaskAchievement: { $avg: "$aiFeedback.taskAchievement" },
            avgCoherenceCohesion: { $avg: "$aiFeedback.coherenceCohesion" },
            avgLexicalResource: { $avg: "$aiFeedback.lexicalResource" },
            avgGrammaticalRange: { $avg: "$aiFeedback.grammaticalRange" },
          },
        },
      ]),
    ]);

    const writingsPerType: Record<string, number> = {};
    for (const entry of byType) {
      writingsPerType[entry._id as string] = entry.count as number;
    }

    const bands = avgBands[0] ?? null;

    return {
      total,
      writingsPerType,
      averageBands: bands
        ? {
            overallBand: Math.round((bands.avgOverallBand as number) * 10) / 10,
            taskAchievement: Math.round((bands.avgTaskAchievement as number) * 10) / 10,
            coherenceCohesion: Math.round((bands.avgCoherenceCohesion as number) * 10) / 10,
            lexicalResource: Math.round((bands.avgLexicalResource as number) * 10) / 10,
            grammaticalRange: Math.round((bands.avgGrammaticalRange as number) * 10) / 10,
          }
        : null,
    };
  },
};
