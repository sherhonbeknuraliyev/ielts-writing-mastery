import type { Connection } from "mongoose";
import { sentenceSkills } from "../../data/sentence-skills.js";
import { errorSkills } from "../../data/error-skills.js";
import { writingSkills } from "../../data/writing-skills.js";
import { collocationSkills } from "../../data/collocation-skills.js";

export const collection = "skills";

export async function seed(db: Connection): Promise<void> {
  const allSkills = [...sentenceSkills, ...errorSkills, ...writingSkills, ...collocationSkills];
  if (allSkills.length > 0) {
    await db.collection(collection).insertMany(allSkills);
  }
  console.log(`  Inserted ${allSkills.length} skills`);
}
