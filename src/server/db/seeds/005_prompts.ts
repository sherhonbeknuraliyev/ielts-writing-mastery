import type { Connection } from "mongoose";
import { task1Prompts } from "../../data/task1-prompts.js";
import { task2Prompts } from "../../data/task2-prompts.js";

export const collection = "prompts";

export async function seed(db: Connection): Promise<void> {
  const allPrompts = [...task1Prompts, ...task2Prompts];
  if (allPrompts.length > 0) {
    await db.collection(collection).insertMany(allPrompts);
  }
  console.log(`  Inserted ${allPrompts.length} writing prompts`);
}
