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

const ROOT = join(fileURLToPath(new URL("..", import.meta.url)));
const require = createRequire(join(ROOT, "lib", "db", "package.json"));
const Database = require("better-sqlite3");

const CONTACT = {
  companyName: "مؤسسة سبائك الماسة",
  companyNameEnglish: "Sabaik Almasa",
  call: "0580595555",
  whatsapp: "0555888767",
  phones: JSON.stringify(["0555888767", "0580595555", "0581032000"]),
};

const dbPaths = [
  process.env.DB_PATH,
  join(ROOT, "data", "sabaik.db"),
  join(ROOT, "build_php", "data", "sabaik.db"),
].filter((value, index, all) => value && all.indexOf(value) === index && existsSync(value));

function quoteIdentifier(identifier) {
  return `"${String(identifier).replaceAll('"', '""')}"`;
}

function replaceIdentity(value) {
  if (typeof value !== "string") return value;

  return value
    .replaceAll("Taqi Group Establishment", CONTACT.companyNameEnglish)
    .replaceAll("Taqi Group", CONTACT.companyNameEnglish)
    .replaceAll("taqi-group", "sabaik-almasa")
    .replaceAll("حاويات تأجير حاويات الرياض 0580595555 المتاحة", `حاويات ${CONTACT.companyName} المتاحة`)
    .replaceAll("تأجير حاويات الرياض 0580595555", CONTACT.companyName)
    .replace(/(?<![\p{L}])(?:مؤسسة\s+)?تقي(?:\s+جروب)?(?![\p{L}])/giu, CONTACT.companyName)
    .replaceAll("0536312121", CONTACT.call);
}

function replaceHomepageContactText(value) {
  if (typeof value !== "string") return value;
  try {
    const content = JSON.parse(value);
    const visit = (node, key = "") => {
      if (typeof node === "string") {
        const normalized = node.replaceAll("0536312121", CONTACT.call);
        return key.toLowerCase().includes("whatsapp")
          ? normalized.replaceAll(CONTACT.call, CONTACT.whatsapp)
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
          let next = replaceIdentity(row.value);
          if (tableName === "site_settings" && column.name === "value") {
            const settingKey = db.prepare(
              `SELECT key FROM ${table} WHERE rowid = ?`,
            ).get(row.rowId)?.key;
            if (settingKey === "homepage_content") next = replaceHomepageContactText(next);
          }
          if (next !== row.value) {
            write.run(next, row.rowId);
            changed += 1;
          }
        }
      }
    }

    const settings = new Map([
      ["company_name", CONTACT.companyName],
      ["company_name_en", CONTACT.companyNameEnglish],
      ["company_phone_call", CONTACT.call],
      ["company_phone_whatsapp", CONTACT.whatsapp],
      ["company_phones", CONTACT.phones],
      [
        "site_desc",
        `${CONTACT.companyName} — الرائدون في تأجير حاويات المخلفات ونقل الأنقاض بالرياض. حاويات بمقاسات متعددة وسرعة في الأداء ودقة في المواعيد. اتصل الآن: ${CONTACT.call}`,
      ],
    ]);

    const find = db.prepare("SELECT value FROM site_settings WHERE key = ?");
    const insert = db.prepare("INSERT INTO site_settings (key, value) VALUES (?, ?)");
    const writeSetting = db.prepare(
      "UPDATE site_settings SET value = ?, updated_at = datetime('now') WHERE key = ?",
    );
    for (const [key, value] of settings) {
      if (find.get(key)) writeSetting.run(value, key);
      else insert.run(key, value);
    }

    const homepage = find.get("homepage_content")?.value;
    if (homepage) writeSetting.run(replaceHomepageContactText(replaceIdentity(homepage)), "homepage_content");
  });

  update();
  const integrity = db.pragma("integrity_check", { simple: true });
  db.close();
  if (integrity !== "ok") throw new Error(`${dbPath}: SQLite integrity check failed: ${integrity}`);
  console.log(`✅ ${dbPath.replace(`${ROOT}/`, "")}: ${changed} نصاً موحداً`);
}

if (dbPaths.length === 0) throw new Error("لم أعثر على قاعدة SQLite قابلة للتنظيف.");
for (const dbPath of dbPaths) updateDatabase(dbPath);