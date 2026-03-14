import type { Connection } from "mongoose";
import { collocationSets } from "../../data/collocations.js";

export const collection = "collocations";

export async function seed(db: Connection): Promise<void> {
  if (collocationSets.length > 0) {
    await db.collection(collection).insertMany(collocationSets);
  }
  console.log(`  Inserted ${collocationSets.length} collocation sets`);
}
