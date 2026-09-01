import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const ROOT = "e:/Hawiat";
const dbFiles = [
  path.join(ROOT, "data/sabaik.db"),
  path.join(ROOT, "data/sabaik_7dbd.db"),
  path.join(ROOT, "build_php/data/sabaik.db")
];

for (const dbPath of dbFiles) {
  if (!fs.existsSync(dbPath)) continue;
  console.log(`\n📦 معالجة قاعدة البيانات: ${dbPath}`);
  const db = new Database(dbPath);

  // Check if containers table exists
  const hasContainers = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='containers'").get();
  const hasPackages = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='packages'").get();

  if (hasContainers) {
    // Get column names of containers
    const cols = db.prepare("PRAGMA table_info(containers)").all();
    const colDefs = cols.map(c => {
      let def = `"${c.name}" ${c.type}`;
      if (c.pk) def += " PRIMARY KEY";
      if (c.notnull && !c.pk) def += " NOT NULL";
      if (c.dflt_value !== null) def += ` DEFAULT ${c.dflt_value}`;
      return def;
    }).join(", ");

    // Create packages table if not exists
    db.prepare(`CREATE TABLE IF NOT EXISTS packages (${colDefs})`).run();
    
    // Copy data from containers to packages
    const countContainers = db.prepare("SELECT count(*) as cnt FROM containers").get().cnt;
    const countPackages = db.prepare("SELECT count(*) as cnt FROM packages").get().cnt;
    
    if (countPackages === 0 && countContainers > 0) {
      const colNames = cols.map(c => `"${c.name}"`).join(", ");
      db.prepare(`INSERT INTO packages (${colNames}) SELECT ${colNames} FROM containers`).run();
      console.log(`  ✅ تم نقل ${countContainers} باقة من جدول containers إلى جدول packages`);
    } else {
      console.log(`  ℹ️ جدول packages يحتوي على ${countPackages} باقة`);
    }
  }

  db.close();
}

console.log("\n🎉 تمت هجرة جدول الباقات بنجاح مع الحفاظ على جميع البيانات!");
