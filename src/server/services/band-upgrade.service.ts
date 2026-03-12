import { BandUpgradeModel } from "../models/band-upgrade.model.js";

export const bandUpgradeService = {
  async findAll(category?: string) {
    const filter = category ? { category } : {};
    return BandUpgradeModel.find(filter).lean();
  },

  async getRandom(count: number) {
    return BandUpgradeModel.aggregate([{ $sample: { size: count } }]);
  },
};
