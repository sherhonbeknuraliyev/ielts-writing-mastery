import type { Connection } from "mongoose";
import { bandUpgrades } from "../../data/band-upgrades.js";

export const collection = "bandupgrades";

export async function seed(db: Connection): Promise<void> {
  if (bandUpgrades.length > 0) {
    await db.collection(collection).insertMany(bandUpgrades);
  }
  console.log(`  Inserted ${bandUpgrades.length} band upgrades`);
}
