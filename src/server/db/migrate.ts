import "dotenv/config";
import path from "path";
import fs from "fs";
import { fileURLToPath, pathToFileURL } from "url";
import mongoose from "mongoose";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.join(__dirname, "migrations");

const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RED = "\x1b[31m";
const CYAN = "\x1b[36m";
const RESET = "\x1b[0m";

interface MigrationRecord {
  name: string;
  appliedAt: Date;
}

const migrationSchema = new mongoose.Schema<MigrationRecord>(
  {
    name: { type: String, required: true, unique: true },
    appliedAt: { type: Date, required: true },
  },
  { collection: "_migrations", versionKey: false }
);

const MigrationModel = mongoose.model<MigrationRecord>("_Migration", migrationSchema);

async function connect() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/ielts-mastery";
  await mongoose.connect(uri);
}

function getMigrationFiles(): string[] {
  if (!fs.existsSync(MIGRATIONS_DIR)) return [];
  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".ts") || f.endsWith(".js"))
    .sort();
}

async function getApplied(): Promise<Set<string>> {
  const records = await MigrationModel.find({}, { name: 1 }).lean();
  return new Set(records.map((r) => r.name));
}

async function runUp() {
  await connect();
  const files = getMigrationFiles();
  const applied = await getApplied();
  const pending = files.filter((f) => !applied.has(f));

  if (pending.length === 0) {
    console.log(`${CYAN}No pending migrations.${RESET}`);
    await mongoose.disconnect();
    return;
  }

  for (const file of pending) {
    const filePath = pathToFileURL(path.join(MIGRATIONS_DIR, file)).href;
    console.log(`${YELLOW}Running migration: ${file}${RESET}`);
    try {
      const mod = await import(filePath);
      await mod.up(mongoose.connection);
      await MigrationModel.create({ name: file, appliedAt: new Date() });
      console.log(`${GREEN}Applied: ${file}${RESET}`);
    } catch (err) {
      console.error(`${RED}Failed: ${file}${RESET}`, err);
      await mongoose.disconnect();
      process.exit(1);
    }
  }

  console.log(`${GREEN}All migrations applied.${RESET}`);
  await mongoose.disconnect();
}

async function runDown() {
  await connect();
  const applied = await MigrationModel.find().sort({ appliedAt: -1 }).limit(1).lean();

  if (applied.length === 0) {
    console.log(`${CYAN}No migrations to roll back.${RESET}`);
    await mongoose.disconnect();
    return;
  }

  const last = applied[0];
  const filePath = pathToFileURL(path.join(MIGRATIONS_DIR, last.name)).href;
  console.log(`${YELLOW}Rolling back: ${last.name}${RESET}`);

  try {
    const mod = await import(filePath);
    await mod.down(mongoose.connection);
    await MigrationModel.deleteOne({ name: last.name });
    console.log(`${GREEN}Rolled back: ${last.name}${RESET}`);
  } catch (err) {
    console.error(`${RED}Failed to roll back: ${last.name}${RESET}`, err);
    await mongoose.disconnect();
    process.exit(1);
  }

  await mongoose.disconnect();
}

async function runStatus() {
  await connect();
  const files = getMigrationFiles();
  const applied = await getApplied();

  if (files.length === 0) {
    console.log(`${CYAN}No migration files found.${RESET}`);
    await mongoose.disconnect();
    return;
  }

  console.log(`\nMigration Status:`);
  for (const file of files) {
    if (applied.has(file)) {
      console.log(`  ${GREEN}[applied]${RESET}  ${file}`);
    } else {
      console.log(`  ${YELLOW}[pending]${RESET}  ${file}`);
    }
  }

  const orphaned = [...applied].filter((name) => !files.includes(name));
  for (const name of orphaned) {
    console.log(`  ${RED}[orphaned]${RESET} ${name}`);
  }

  console.log();
  await mongoose.disconnect();
}

function runCreate(name: string) {
  if (!name) {
    console.error(`${RED}Usage: migrate create <name>${RESET}`);
    process.exit(1);
  }

  if (!fs.existsSync(MIGRATIONS_DIR)) {
    fs.mkdirSync(MIGRATIONS_DIR, { recursive: true });
  }

  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");

  const existing = getMigrationFiles().filter((f) => f.startsWith(date));
  const seq = String(existing.length + 1).padStart(3, "0");
  const safeName = name.replace(/[^a-zA-Z0-9_]/g, "_").toLowerCase();
  const filename = `${date}_${seq}_${safeName}.ts`;
  const filePath = path.join(MIGRATIONS_DIR, filename);

  const template = `import type { Connection } from "mongoose";

export async function up(db: Connection): Promise<void> {
  // forward migration
}

export async function down(db: Connection): Promise<void> {
  // rollback
}
`;

  fs.writeFileSync(filePath, template);
  console.log(`${GREEN}Created: src/server/db/migrations/${filename}${RESET}`);
}

const [, , command, ...args] = process.argv;

switch (command) {
  case "up":
    runUp().catch((err) => {
      console.error(`${RED}${err}${RESET}`);
      process.exit(1);
    });
    break;
  case "down":
    runDown().catch((err) => {
      console.error(`${RED}${err}${RESET}`);
      process.exit(1);
    });
    break;
  case "status":
    runStatus().catch((err) => {
      console.error(`${RED}${err}${RESET}`);
      process.exit(1);
    });
    break;
  case "create":
    runCreate(args[0]);
    break;
  default:
    console.log(`Usage: migrate <up|down|status|create <name>>`);
    process.exit(1);
}
