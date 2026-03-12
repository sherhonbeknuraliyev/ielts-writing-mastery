import { PromptModel } from "../models/index.js";

export const promptService = {
  async findAll(type?: string) {
    const query = type ? { type } : {};
    const docs = await PromptModel.find(query).lean();
    return docs;
  },

  async findById(id: string) {
    const doc = await PromptModel.findOne({ id }).lean();
    return doc ?? null;
  },

  async getRandom(type?: string) {
    const query = type ? { type } : {};
    const count = await PromptModel.countDocuments(query);
    if (count === 0) return null;
    const skip = Math.floor(Math.random() * count);
    const doc = await PromptModel.findOne(query).skip(skip).lean();
    return doc ?? null;
  },
};
