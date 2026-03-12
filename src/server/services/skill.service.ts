import { SkillModel } from "../models/skill.model.js";

export const skillService = {
  async findAll(module?: string) {
    const filter = module ? { module } : {};
    return SkillModel.find(filter).lean();
  },
  async findById(id: string) {
    return SkillModel.findOne({ id }).lean();
  },
};
