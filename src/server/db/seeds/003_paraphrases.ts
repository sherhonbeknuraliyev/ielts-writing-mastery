import type { Connection } from "mongoose";
import { paraphraseDrills } from "../../data/paraphrasing.js";

export const collection = "paraphrases";

export async function seed(db: Connection): Promise<void> {
  if (paraphraseDrills.length > 0) {
    await db.collection(collection).insertMany(paraphraseDrills);
  }
  console.log(`  Inserted ${paraphraseDrills.length} paraphrase drills`);
}
