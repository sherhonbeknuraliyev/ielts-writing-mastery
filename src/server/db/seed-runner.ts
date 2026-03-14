import "dotenv/config";
import path from "path";
import fs from "fs";
import { fileURLToPath, pathToFileURL } from "url";
import mongoose from "mongoose";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SEEDS_DIR = path.join(__dirname, "seeds");

const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RED = "\x1b[31m";
const CYAN = "\x1b[36m";
const RESET = "\x1b[0m";

interface SeedRecord {
  name: string;
  appliedAt: Date;
}

const seedSchema = new mongoose.Schema<SeedRecord>(
  {
    name: { type: String, required: true, unique: true },
    appliedAt: { type: Date, required: true },
  },
  { collection: "_seeds", versionKey: false }
);

const SeedTracker = mongoose.model<SeedRecord>("_Seed", seedSchema);

async function connect() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/ielts-mastery";
  await mongoose.connect(uri);
}

function getSeedFiles(): string[] {
  if (!fs.existsSync(SEEDS_DIR)) return [];
  return fs
    .readdirSync(SEEDS_DIR)
    .filter((f) => f.endsWith(".ts") || f.endsWith(".js"))
    .sort();
}

async function getApplied(): Promise<Set<string>> {
  const records = await SeedTracker.find({}, { name: 1 }).lean();
  return new Set(records.map((r) => r.name));
}

async function applySeed(file: string) {
  const filePath = pathToFileURL(path.join(SEEDS_DIR, file)).href;
  const mod = await import(filePath);
  await mod.seed(mongoose.connection);
  await SeedTracker.findOneAndUpdate(
    { name: file },
    { name: file, appliedAt: new Date() },
    { upsert: true }
  );
  console.log(`${GREEN}Seeded: ${file}${RESET}`);
}

async function clearCollection(collectionName: string) {
  const db = mongoose.connection.db;
  if (!db) return;
  const collections = await db.listCollections({ name: collectionName }).toArray();
  if (collections.length > 0) {
    await db.collection(collectionName).deleteMany({});
  }
}

async function runFresh() {
  await connect();
  const files = getSeedFiles();

  console.log(`${YELLOW}Clearing all seed collections...${RESET}`);
  for (const file of files) {
    const filePath = pathToFileURL(path.join(SEEDS_DIR, file)).href;
    try {
      const mod = await import(filePath);
      if (mod.collection) {
        await clearCollection(mod.collection);
        console.log(`  Cleared: ${mod.collection}`);
      }
    } catch {
      // skip if file fails to load
    }
  }

  await SeedTracker.deleteMany({});
  console.log(`${YELLOW}Running all seeds...${RESET}`);

  for (const file of files) {
    try {
      await applySeed(file);
    } catch (err) {
      console.error(`${RED}Failed: ${file}${RESET}`, err);
      await mongoose.disconnect();
      process.exit(1);
    }
  }

  console.log(`${GREEN}All seeds applied (fresh).${RESET}`);
  await mongoose.disconnect();
}

async function runAll() {
  await connect();
  const files = getSeedFiles();
  const applied = await getApplied();
  const pending = files.filter((f) => !applied.has(f));

  if (pending.length === 0) {
    console.log(`${CYAN}No pending seeds.${RESET}`);
    await mongoose.disconnect();
    return;
  }

  for (const file of pending) {
    try {
      await applySeed(file);
    } catch (err) {
      console.error(`${RED}Failed: ${file}${RESET}`, err);
      await mongoose.disconnect();
      process.exit(1);
    }
  }

  console.log(`${GREEN}All pending seeds applied.${RESET}`);
  await mongoose.disconnect();
}

async function runOne(name: string) {
  await connect();
  const files = getSeedFiles();
  const match = files.find((f) => f === name || f.startsWith(name));

  if (!match) {
    console.error(`${RED}Seed not found: ${name}${RESET}`);
    await mongoose.disconnect();
    process.exit(1);
  }

  try {
    await applySeed(match);
  } catch (err) {
    console.error(`${RED}Failed: ${match}${RESET}`, err);
    await mongoose.disconnect();
    process.exit(1);
  }

  await mongoose.disconnect();
}

async function runStatus() {
  await connect();
  const files = getSeedFiles();
  const applied = await getApplied();

  if (files.length === 0) {
    console.log(`${CYAN}No seed files found.${RESET}`);
    await mongoose.disconnect();
    return;
  }

  console.log(`\nSeed Status:`);
  for (const file of files) {
    if (applied.has(file)) {
      console.log(`  ${GREEN}[applied]${RESET}  ${file}`);
    } else {
      console.log(`  ${YELLOW}[pending]${RESET}  ${file}`);
    }
  }
  console.log();

  await mongoose.disconnect();
}

async function runReset() {
  await connect();
  await SeedTracker.deleteMany({});
  console.log(`${YELLOW}All seeds marked as unapplied (data not deleted).${RESET}`);
  await mongoose.disconnect();
}

const [, , command, ...args] = process.argv;
const isFresh = args.includes("--fresh");
const seedName = args.find((a) => !a.startsWith("--"));

switch (command) {
  case "run":
    if (isFresh) {
      runFresh().catch((err) => {
        console.error(`${RED}${err}${RESET}`);
        process.exit(1);
      });
    } else if (seedName) {
      runOne(seedName).catch((err) => {
        console.error(`${RED}${err}${RESET}`);
        process.exit(1);
      });
    } else {
      runAll().catch((err) => {
        console.error(`${RED}${err}${RESET}`);
        process.exit(1);
      });
    }
    break;
  case "status":
    runStatus().catch((err) => {
      console.error(`${RED}${err}${RESET}`);
      process.exit(1);
    });
    break;
  case "reset":
    runReset().catch((err) => {
      console.error(`${RED}${err}${RESET}`);
      process.exit(1);
    });
    break;
  default:
    console.log(`Usage: seed-runner <run [--fresh | <name>] | status | reset>`);
    process.exit(1);
}
