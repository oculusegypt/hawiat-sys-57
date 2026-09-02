#!/usr/bin/env node
/**
 * Normalize the public business identity and contact details in portable
 * SQLite databases. This is intentionally idempotent so it can be rerun
 * before any static/Hostinger build without accumulating changes.
 */

import { createRequire } from "node:module";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { readBusinessIdentity } from "./business-identity.mjs";

const ROOT = join(fileURLToPath(new URL("..", import.meta.url)));
const require = createRequire(join(ROOT, "lib", "db", "package.json"));
const Database = require("better-sqlite3");

const dbPaths = [
  process.env.DB_PATH,
  join(ROOT, "data", "sabaik.db"),
  join(ROOT, "build_php", "data", "sabaik.db"),
].filter((value, index, all) => value && all.indexOf(value) === index && existsSync(value));

function quoteIdentifier(identifier) {
  return `"${String(identifier).replaceAll('"', '""')}"`;
}

function replaceIdentity(value, identity) {
  if (typeof value !== "string") return value;

  return value
    .replaceAll("Taqi Group Establishment", identity.companyNameEnglish)
    .replaceAll("Taqi Group", identity.companyNameEnglish)
    .replaceAll("taqi-group", "sabaik-almasa")
    .replace(/(?<![\p{L}])(?:مؤسسة\s+)?تقي(?:\s+جروب)?(?![\p{L}])/giu, identity.companyName)
    .replaceAll("0536312121", identity.call);
}

function replaceHomepageContactText(value, identity) {
  if (typeof value !== "string") return value;
  try {
    const content = JSON.parse(value);
    const visit = (node, key = "") => {
      if (typeof node === "string") {
        const normalized = node.replaceAll("0536312121", identity.call);
        return key.toLowerCase().includes("whatsapp")
          ? normalized.replaceAll(identity.call, identity.whatsapp)
          : normalized;
      }
      if (Array.isArray(node)) return node.map((item) => visit(item, key));
      if (node && typeof node === "object") {
        return Object.fromEntries(Object.entries(node).map(([childKey, childValue]) => [
          childKey,
          visit(childValue, childKey),
        ]));
      }
      return node;
    };
    return JSON.stringify(visit(content));
  } catch {
    return value;
  }
}

function updateDatabase(dbPath) {
  const db = new Database(dbPath);
  const identity = readBusinessIdentity(db);
  let changed = 0;

  const tables = db.prepare(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'",
  ).all();

  const update = db.transaction(() => {
    for (const { name: tableName } of tables) {
      const table = quoteIdentifier(tableName);
      const columns = db.prepare(`PRAGMA table_info(${table})`).all()
        .filter((column) => /TEXT|CHAR|CLOB/i.test(String(column.type || "")));

      for (const column of columns) {
        const field = quoteIdentifier(column.name);
        const rows = db.prepare(
          `SELECT rowid AS rowId, ${field} AS value FROM ${table} WHERE typeof(${field}) = 'text'`,
        ).all();
        const write = db.prepare(`UPDATE ${table} SET ${field} = ? WHERE rowid = ?`);

        for (const row of rows) {
          let next = replaceIdentity(row.value, identity);
          if (tableName === "site_settings" && column.name === "value") {
            const settingKey = db.prepare(
              `SELECT key FROM ${table} WHERE rowid = ?`,
            ).get(row.rowId)?.key;
            if (settingKey === "homepage_content") next = replaceHomepageContactText(next, identity);
          }
          if (next !== row.value) {
            write.run(next, row.rowId);
            changed += 1;
          }
        }
      }
    }

  });

  update();
  const integrity = db.pragma("integrity_check", { simple: true });
  db.close();
  if (integrity !== "ok") throw new Error(`${dbPath}: SQLite integrity check failed: ${integrity}`);
  console.log(`✅ ${dbPath.replace(`${ROOT}/`, "")}: ${changed} نصاً موحداً`);
}

if (dbPaths.length === 0) throw new Error("لم أعثر على قاعدة SQLite قابلة للتنظيف.");
for (const dbPath of dbPaths) updateDatabase(dbPath);