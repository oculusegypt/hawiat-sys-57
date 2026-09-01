import { createRequire } from "node:module";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const require = createRequire(join(ROOT, "lib", "db", "package.json"));
const Database = require("better-sqlite3");

const dbs = [
  join(ROOT, "data", "sabaik.db"),
  join(ROOT, "data", "sabaik_7dbd.db")
];


for (const dbPath of dbs) {
  try {
    const db = new Database(dbPath);
    const settings = db.prepare("SELECT key, value FROM site_settings ORDER BY key").all();
    db.close();
    console.log(`Read ${settings.length} existing settings from ${dbPath}; no values were changed.`);
  } catch (err) {
    console.error(`Error reading ${dbPath}:`, err);
  }
}
console.log("✅ No changes were made to the database.");
