import type { Connection } from "mongoose";

const COLLECTIONS = ["skills", "collocations", "paraphrases", "bandupgrades", "prompts"];

export async function up(db: Connection): Promise<void> {
  const existing = await db.db!.listCollections().toArray();
  const existingNames = new Set(existing.map((c) => c.name));

  for (const name of COLLECTIONS) {
    if (!existingNames.has(name)) {
      await db.db!.createCollection(name);
    }
  }

  // Skills indexes
  const skills = db.collection("skills");
  await skills.createIndex({ id: 1 }, { unique: true });
  await skills.createIndex({ module: 1 });
  await skills.createIndex({ criterion: 1 });

  // Collocations indexes
  const collocations = db.collection("collocations");
  await collocations.createIndex({ topic: 1 }, { unique: true });

  // Paraphrases indexes
  const paraphrases = db.collection("paraphrases");
  await paraphrases.createIndex({ id: 1 }, { unique: true });

  // Band upgrades indexes
  const bandUpgrades = db.collection("bandupgrades");
  await bandUpgrades.createIndex({ id: 1 }, { unique: true });
  await bandUpgrades.createIndex({ category: 1 });

  // Prompts indexes
  const prompts = db.collection("prompts");
  await prompts.createIndex({ id: 1 }, { unique: true });
}

export async function down(db: Connection): Promise<void> {
  for (const name of COLLECTIONS) {
    const existing = await db.db!.listCollections({ name }).toArray();
    if (existing.length > 0) {
      await db.db!.dropCollection(name);
    }
  }
}
