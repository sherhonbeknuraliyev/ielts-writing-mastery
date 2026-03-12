import { ParaphraseModel } from "../models/paraphrase.model.js";

export const paraphraseService = {
  async findAll() {
    return ParaphraseModel.find().lean();
  },

  async getRandom(count: number) {
    return ParaphraseModel.aggregate([{ $sample: { size: count } }]);
  },
};
