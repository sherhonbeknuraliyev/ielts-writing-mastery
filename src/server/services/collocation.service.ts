import { CollocationModel } from "../models/collocation.model.js";

export const collocationService = {
  async findAll(topic?: string) {
    const filter = topic ? { topic } : {};
    return CollocationModel.find(filter).lean();
  },

  async getTopics() {
    return CollocationModel.distinct("topic");
  },

  async findByTopic(topic: string) {
    return CollocationModel.findOne({ topic }).lean();
  },
};
