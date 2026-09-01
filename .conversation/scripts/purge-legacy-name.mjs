#!/usr/bin/env node
/**
 * Replace the retired public company name in editable SQLite content.
 * The configured company_name remains the source of truth for the replacement.
 */

import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(path.join(ROOT, "lib", "db", "package.json"));
const Database = require("better-sqlite3");
const DB_PATHS = [
  path.join(ROOT, "data", "sabaik.db"),
  path.join(ROOT, "build_php", "data", "sabaik.db"),
].filter((filePath) => fs.existsSync(filePath));

const LEGACY_NAME_PATTERN = /(?:مؤسسة|شركة)?\s*تقي\s+جروب/g;

function quoteIdentifier(identifier) {
  return `"${String(identifier).replaceAll('"', '""')}"`;
}

function replaceLegacyName(value, companyName) {
  return typeof value === "string"
    ? value.replace(LEGACY_NAME_PATTERN, companyName)
    : value;
}

function cleanDatabase(dbPath) {
  const db = new Database(dbPath);
  const configured = db.prepare(
    "SELECT value FROM site_settings WHERE key = 'company_name' LIMIT 1",
  ).get()?.value;
  const companyName = typeof configured === "string" && configured.trim() && !LEGACY_NAME_PATTERN.test(configured)
    ? configured.trim()
    : "الشركة";
  LEGACY_NAME_PATTERN.lastIndex = 0;

  let changed = 0;
  const tables = db.prepare(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'",
  ).all();

  const update = db.transaction(() => {
    for (const { name: tableName } of tables) {
      const table = quoteIdentifier(tableName);
      const columns = db.prepare(`PRAGMA table_info(${table})`).all();
      for (const column of columns) {
        if (column.pk || !/TEXT|CHAR|CLOB/i.test(String(column.type || ""))) continue;
        const field = quoteIdentifier(column.name);
        const rows = db.prepare(
          `SELECT rowid AS rowId, ${field} AS value FROM ${table} WHERE typeof(${field}) = 'text'`,
        ).all();
        const write = db.prepare(`UPDATE ${table} SET ${field} = ? WHERE rowid = ?`);
        for (const row of rows) {
          const next = replaceLegacyName(row.value, companyName);
          if (next !== row.value) {
            write.run(next, row.rowId);
            changed += 1;
          }
        }
      }
    }
  });

  update();
  db.close();
  console.log(`✅ ${path.relative(ROOT, dbPath)}: ${changed} نصاً محدثاً إلى «${companyName}»`);
}

if (DB_PATHS.length === 0) {
  throw new Error("لم يتم العثور على قاعدة SQLite قابلة للتنظيف.");
}

for (const dbPath of DB_PATHS) cleanDatabase(dbPath);