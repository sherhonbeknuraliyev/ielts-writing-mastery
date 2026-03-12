import "dotenv/config";
import mongoose from "mongoose";
import { sentenceSkills } from "../data/sentence-skills.js";
import { errorSkills } from "../data/error-skills.js";
import { writingSkills } from "../data/writing-skills.js";
import { collocationSkills } from "../data/collocation-skills.js";
import { collocationSets } from "../data/collocations.js";
import { paraphraseDrills } from "../data/paraphrasing.js";
import { bandUpgrades } from "../data/band-upgrades.js";
import { task1Prompts } from "../data/task1-prompts.js";
import { task2Prompts } from "../data/task2-prompts.js";
import {
  SkillModel,
  CollocationModel,
  ParaphraseModel,
  BandUpgradeModel,
  PromptModel,
} from "../models/index.js";

async function seed() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/ielts-mastery";
  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  // Clear all collections
  await Promise.all([
    SkillModel.deleteMany({}),
    CollocationModel.deleteMany({}),
    ParaphraseModel.deleteMany({}),
    BandUpgradeModel.deleteMany({}),
    PromptModel.deleteMany({}),
  ]);
  console.log("Cleared all collections");

  // Insert skills
  const allSkills = [...sentenceSkills, ...errorSkills, ...writingSkills, ...collocationSkills];
  if (allSkills.length > 0) {
    await SkillModel.insertMany(allSkills);
  }
  console.log(`Inserted ${allSkills.length} skills`);

  // Insert collocations
  if (collocationSets.length > 0) {
    await CollocationModel.insertMany(collocationSets);
  }
  console.log(`Inserted ${collocationSets.length} collocation sets`);

  // Insert paraphrase drills
  if (paraphraseDrills.length > 0) {
    await ParaphraseModel.insertMany(paraphraseDrills);
  }
  console.log(`Inserted ${paraphraseDrills.length} paraphrase drills`);

  // Insert band upgrades
  if (bandUpgrades.length > 0) {
    await BandUpgradeModel.insertMany(bandUpgrades);
  }
  console.log(`Inserted ${bandUpgrades.length} band upgrades`);

  // Insert prompts
  const allPrompts = [...task1Prompts, ...task2Prompts];
  if (allPrompts.length > 0) {
    await PromptModel.insertMany(allPrompts);
  }
  console.log(`Inserted ${allPrompts.length} writing prompts`);

  await mongoose.disconnect();
  console.log("Seed complete. Disconnected from MongoDB.");
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
