#!/usr/bin/env node
/**
 * Merge the customer's legacy SQLite snapshot into the current application DB.
 *
 * The legacy database is a source of customer data, not a replacement schema.
 * This script updates logical matches, inserts missing customer records, keeps
 * modern-only records, rewrites legacy media URLs, and emits an auditable JSON
 * report. It intentionally never deletes application data.
 *
 * Usage:
 *   node scripts/merge-client-database.mjs \
 *     --source attached_assets/sabaik_1788116407593.db \
 *     --target /tmp/sabaik-recovered.db \
 *     --report docs/client-database-merge-report.json
 */

import { createRequire } from "node:module";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, copyFileSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(join(ROOT, "lib", "db", "package.json"));
const Database = require("better-sqlite3");

function argument(name, fallback) {
  const prefix = `--${name}=`;
  const value = process.argv.find((item) => item.startsWith(prefix));
  return value ? value.slice(prefix.length) : fallback;
}

const sourcePath = resolve(ROOT, argument("source", "attached_assets/sabaik_1788116407593.db"));
const targetPath = resolve(ROOT, argument("target", "data/sabaik.db"));
const reportPath = resolve(ROOT, argument("report", "docs/client-database-merge-report.json"));

if (!existsSync(sourcePath)) throw new Error(`Source database not found: ${sourcePath}`);
if (!existsSync(targetPath)) throw new Error(`Target database not found: ${targetPath}`);

const source = new Database(sourcePath, { readonly: true, fileMustExist: true });
const target = new Database(targetPath);
target.pragma("foreign_keys = OFF");

const report = {
  generatedAt: new Date().toISOString(),
  source: relative(ROOT, sourcePath),
  target: relative(ROOT, targetPath),
  backupRequired: true,
  recoveryArtifactRemoved: false,
  tables: {},
  mappings: [],
  images: {
    customerImageFiles: 0,
    runtimeImageFilesBefore: 0,
    runtimeImageFilesAfter: 0,
    sourceReferencesFound: 0,
    sourceReferencesResolved: 0,
    sourceReferencesMissing: [],
    rewrittenReferences: 0,
    copiedFiles: [],
    linkedByEntity: { services: 0, packages: 0, posts: 0, hero_slides: 0, site_settings: 0 },
    brokenReferencesAfterMerge: [],
  },
  validation: {},
};

function quoteIdentifier(value) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

function tableExists(db, table) {
  return Boolean(db.prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?").get(table));
}

function columnsOf(db, table) {
  return db.prepare(`PRAGMA table_info(${quoteIdentifier(table)})`).all().map((column) => column.name);
}

function rowsOf(db, table, { noIndex = false } = {}) {
  const suffix = noIndex ? " NOT INDEXED" : "";
  return db.prepare(`SELECT * FROM ${quoteIdentifier(table)}${suffix}`).all();
}

function countOf(db, table, { noIndex = false } = {}) {
  const suffix = noIndex ? " NOT INDEXED" : "";
  return db.prepare(`SELECT COUNT(*) AS count FROM ${quoteIdentifier(table)}${suffix}`).get().count;
}

function normalize(value) {
  return String(value ?? "")
    .normalize("NFKC")
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function logicalValue(row, field) {
  return normalize(row[field]);
}

function hasAny(value, needles) {
  const text = normalize(value);
  return needles.some((needle) => text.includes(normalize(needle)));
}

function safeJson(value, fallback = {}) {
  try {
    return JSON.parse(String(value ?? ""));
  } catch {
    return fallback;
  }
}

function rowSignature(row, fields) {
  return fields.map((field) => logicalValue(row, field)).join("|");
}

function makeUniqueKey(row, fields) {
  return fields.map((field) => logicalValue(row, field)).filter(Boolean).join("|");
}

function sourceRows(table) {
  return tableExists(source, table) ? rowsOf(source, table) : [];
}

function targetRows(table) {
  return tableExists(target, table) ? rowsOf(target, table) : [];
}

function tableReport(table, sourceCount, beforeCount) {
  report.tables[table] = {
    source: sourceCount,
    before: beforeCount,
    updated: 0,
    inserted: 0,
    kept: beforeCount,
    after: beforeCount,
  };
}

function markMapping(table, sourceId, targetId, action, reason) {
  report.mappings.push({ table, sourceId: sourceId ?? null, targetId: targetId ?? null, action, reason });
}

function matchingRow(sourceRow, currentRows, fields, { allowId = false } = {}) {
  if (allowId && sourceRow.id != null) {
    const byId = currentRows.find((row) => String(row.id) === String(sourceRow.id));
    if (byId) return { row: byId, reason: "same id" };
  }
  for (const fieldGroup of fields) {
    const keys = Array.isArray(fieldGroup) ? fieldGroup : [fieldGroup];
    const sourceKey = makeUniqueKey(sourceRow, keys);
    if (!sourceKey) continue;
    const found = currentRows.find((row) => makeUniqueKey(row, keys) === sourceKey);
    if (found) return { row: found, reason: keys.join("+") };
  }
  return null;
}

function hasUniqueConflict(table, field, value, exceptId) {
  if (!value) return false;
  return Boolean(
    target
      .prepare(`SELECT id FROM ${quoteIdentifier(table)} WHERE ${quoteIdentifier(field)} = ? AND id <> ? LIMIT 1`)
      .get(value, exceptId ?? -1),
  );
}

function usableSourceValue(value) {
  return value !== undefined;
}

function rewrittenRow(sourceRow, table) {
  const row = {};
  for (const [field, value] of Object.entries(sourceRow)) {
    row[field] = typeof value === "string" ? rewriteImageReferences(value, table) : value;
  }
  return row;
}

function buildInsert(table, row, { preserveId = false } = {}) {
  const targetColumns = columnsOf(target, table);
  const values = {};
  for (const column of targetColumns) {
    if (column === "id" && !preserveId) continue;
    if (Object.prototype.hasOwnProperty.call(row, column)) values[column] = row[column];
  }
  const names = Object.keys(values);
  const placeholders = names.map(() => "?");
  const statement = target.prepare(
    `INSERT INTO ${quoteIdentifier(table)} (${names.map(quoteIdentifier).join(", ")}) VALUES (${placeholders.join(", ")})`,
  );
  return { statement, values: names.map((name) => values[name]) };
}

function updateRow(table, id, row) {
  const targetColumns = columnsOf(target, table);
  const fields = targetColumns.filter((column) => column !== "id" && usableSourceValue(row[column]));
  if (!fields.length) return;
  const values = fields.map((field) => row[field]);
  values.push(id);
  target
    .prepare(
      `UPDATE ${quoteIdentifier(table)} SET ${fields.map((field) => `${quoteIdentifier(field)} = ?`).join(", ")} WHERE id = ?`,
    )
    .run(...values);
}

function insertOrUpdate(table, sourceRow, currentRows, fields, options = {}) {
  const row = rewrittenRow(sourceRow, table);
  const match = matchingRow(row, currentRows, fields, options);
  const tableStats = report.tables[table];
  if (match) {
    const targetRow = match.row;
    const safeRow = { ...row };
    for (const uniqueField of options.uniqueFields ?? []) {
      if (hasUniqueConflict(table, uniqueField, safeRow[uniqueField], targetRow.id)) {
        safeRow[uniqueField] = `${safeRow[uniqueField]}-client-${sourceRow.id ?? "import"}`;
        report.mappings.push({
          table,
          sourceId: sourceRow.id ?? null,
          targetId: targetRow.id,
          action: "unique-field-adjusted",
          reason: `${uniqueField} already belonged to another current record`,
        });
      }
    }
    updateRow(table, targetRow.id, safeRow);
    tableStats.updated += 1;
    markMapping(table, sourceRow.id, targetRow.id, "updated", match.reason);
    return targetRow.id;
  }

  const canPreserveId =
    options.preserveFreeId &&
    Number.isInteger(Number(row.id)) &&
    !target.prepare(`SELECT 1 FROM ${quoteIdentifier(table)} WHERE id = ?`).get(Number(row.id));
  const safeRow = { ...row };
  for (const uniqueField of options.uniqueFields ?? []) {
    if (hasUniqueConflict(table, uniqueField, safeRow[uniqueField], -1)) {
      safeRow[uniqueField] = `${safeRow[uniqueField]}-client-${sourceRow.id ?? "import"}`;
    }
  }
  const insert = buildInsert(table, safeRow, { preserveId: canPreserveId });
  const result = insert.statement.run(...insert.values);
  const id = canPreserveId ? Number(row.id) : Number(result.lastInsertRowid);
  tableStats.inserted += 1;
  markMapping(table, sourceRow.id, id, "inserted", canPreserveId ? "source id was free" : "new target id");
  return id;
}

function listFiles(directory) {
  if (!existsSync(directory)) return [];
  const output = [];
  const walk = (current) => {
    for (const entry of readdirSync(current)) {
      const file = join(current, entry);
      if (statSync(file).isDirectory()) walk(file);
      else output.push(file);
    }
  };
  walk(directory);
  return output;
}

const uploadsDir = join(ROOT, "uploads");
const apiUploadsDir = join(ROOT, "artifacts", "api-server", "uploads");
const publicImagesDir = join(ROOT, "artifacts", "sabaik-almasa", "public", "images");
const customerImagesDir = join(publicImagesDir, "صور حسام");

const runtimeFiles = [...new Set([...listFiles(uploadsDir), ...listFiles(apiUploadsDir), ...listFiles(publicImagesDir)])];
const customerFiles = listFiles(customerImagesDir);
report.images.runtimeImageFilesBefore = runtimeFiles.length;
report.images.customerImageFiles = customerFiles.length;

const fileCandidates = new Map();
function addCandidate(file, priority) {
  const key = basename(file).replace(/\.[^.]+$/, "").toLowerCase();
  const list = fileCandidates.get(key) ?? [];
  list.push({ file, priority });
  fileCandidates.set(key, list);
}
for (const file of customerFiles) addCandidate(file, 0);
for (const file of listFiles(uploadsDir)) addCandidate(file, 1);
for (const file of listFiles(apiUploadsDir)) addCandidate(file, 2);
for (const file of listFiles(publicImagesDir)) addCandidate(file, 3);
for (const list of fileCandidates.values()) list.sort((a, b) => a.priority - b.priority || a.file.localeCompare(b.file));

const copiedAssetCache = new Map();
function copyToRuntime(candidate, destination, sourceRef) {
  if (existsSync(destination)) return;
  mkdirSync(dirname(destination), { recursive: true });
  copyFileSync(candidate, destination);
  report.images.copiedFiles.push({
    from: relative(ROOT, candidate),
    to: relative(ROOT, destination),
    sourceReference: sourceRef,
  });
}

function resolveLegacyAsset(ref) {
  const value = String(ref);
  const match = value.match(/^\/(api\/uploads|uploads|images)\/(.+)$/);
  if (!match) return value;
  const namespace = match[1];
  const requestedName = decodeURIComponent(match[2]);
  const requestedPath = join(...requestedName.split("/"));
  const stem = basename(requestedName).replace(/\.[^.]+$/, "").toLowerCase();
  const candidates = fileCandidates.get(stem) ?? [];
  const exactPublic = join(publicImagesDir, requestedPath);
  const exactUpload = join(uploadsDir, basename(requestedName));

  if (namespace === "images" && existsSync(exactPublic)) return value;
  if ((namespace === "api/uploads" || namespace === "uploads") && existsSync(exactUpload)) {
    return `/uploads/${basename(exactUpload)}`;
  }

  let candidate = candidates[0]?.file;
  if (!candidate && namespace === "api/uploads") {
    // One legacy ad points to a deleted upload. Keep the ad usable by using
    // the closest customer-owned container image instead of a broken URL.
    const fallback = fileCandidates.get("تأجير-حاويات-بالرياض")?.[0]?.file;
    if (fallback) candidate = fallback;
  }
  if (!candidate) {
    report.images.sourceReferencesMissing.push(value);
    return value;
  }

  const candidateName = basename(candidate);
  if (namespace === "api/uploads" || namespace === "uploads") {
    const destination = join(uploadsDir, candidateName);
    copyToRuntime(candidate, destination, value);
    return `/uploads/${candidateName}`;
  }

  if (candidate.startsWith(customerImagesDir + "/")) {
    const destination = join(publicImagesDir, candidateName);
    copyToRuntime(candidate, destination, value);
    return `/images/${candidateName}`;
  }
  if (candidate.startsWith(publicImagesDir + "/")) {
    return `/images/${relative(publicImagesDir, candidate).split("\\").join("/")}`;
  }
  const destination = join(publicImagesDir, candidateName);
  copyToRuntime(candidate, destination, value);
  return `/images/${candidateName}`;
}

function rewriteImageReferences(value, entity) {
  if (!value || typeof value !== "string") return value;
  const refs = value.match(/\/(?:api\/uploads|uploads|images)\/[^"'<>\\\s)\]}]+/g) ?? [];
  for (const ref of new Set(refs)) {
    report.images.sourceReferencesFound += 1;
    const resolved = resolveLegacyAsset(ref);
    if (resolved !== ref) {
      report.images.sourceReferencesResolved += 1;
      report.images.rewrittenReferences += 1;
      if (["services", "packages", "posts", "hero_slides", "site_settings"].includes(entity)) {
        report.images.linkedByEntity[entity] += 1;
      }
      value = value.replaceAll(ref, resolved);
    }
  }
  return value;
}

function mergeContent() {
  const sourceAdmins = sourceRows("admins");
  const targetAdmins = targetRows("admins");
  tableReport("admins", sourceAdmins.length, targetAdmins.length);
  for (const row of sourceAdmins) insertOrUpdate("admins", row, targetAdmins, [["username"], ["email"]], {
    uniqueFields: ["username"],
    preserveFreeId: true,
  });

  const sourceServices = sourceRows("services");
  const targetServices = targetRows("services");
  tableReport("services", sourceServices.length, targetServices.length);
  for (const row of sourceServices) insertOrUpdate("services", row, targetServices, [["seo_slug"], ["title"]], {
    uniqueFields: ["seo_slug"],
    preserveFreeId: true,
  });

  const sourcePackages = sourceRows("containers");
  const targetPackages = targetRows("packages");
  tableReport("packages", sourcePackages.length, targetPackages.length);
  for (const row of sourcePackages) insertOrUpdate("packages", row, targetPackages, [["seo_slug"], ["name", "size"]], {
    uniqueFields: ["seo_slug"],
    preserveFreeId: true,
  });

  const sourcePosts = sourceRows("posts");
  const targetPosts = targetRows("posts");
  tableReport("posts", sourcePosts.length, targetPosts.length);
  for (const row of sourcePosts) insertOrUpdate("posts", row, targetPosts, [["slug"], ["seo_slug"], ["title"]], {
    uniqueFields: ["slug"],
    preserveFreeId: true,
  });

  const contentTables = [
    { name: "hero_slides", fields: [["title"], ["image_url"]], uniqueFields: [] },
    { name: "company_values", fields: [["title"]], uniqueFields: [] },
    { name: "partners", fields: [["name"]], uniqueFields: [] },
    { name: "testimonials", fields: [["client_name", "content"], ["client_name"]], uniqueFields: [] },
    { name: "ads", fields: [["title", "content"], ["title"]], uniqueFields: [] },
    { name: "conversations", fields: [["phone", "created_at"], ["phone"]], uniqueFields: [] },
    { name: "messages", fields: [["conversation_id", "created_at", "content"]], uniqueFields: [] },
    { name: "notifications", fields: [["title", "message", "created_at"], ["title", "message"]], uniqueFields: [] },
    { name: "push_subscriptions", fields: [["endpoint"]], uniqueFields: [] },
    { name: "active_visitors", fields: [["session_id"]], uniqueFields: [] },
  ];
  for (const config of contentTables) {
    const sourceRowsForTable = sourceRows(config.name);
    const currentRows = targetRows(config.name);
    tableReport(config.name, sourceRowsForTable.length, currentRows.length);
    for (const row of sourceRowsForTable) {
      insertOrUpdate(config.name, row, currentRows, config.fields, {
        uniqueFields: config.uniqueFields,
        preserveFreeId: ["hero_slides", "company_values", "partners", "testimonials"].includes(config.name),
      });
    }
  }

  const sourceSettings = sourceRows("site_settings");
  const currentSettings = targetRows("site_settings");
  tableReport("site_settings", sourceSettings.length, currentSettings.length);
  for (const row of sourceSettings) {
    insertOrUpdate("site_settings", row, currentSettings, [["key"]], { preserveFreeId: true });
  }

  const sourceRequests = sourceRows("service_requests");
  const currentRequests = targetRows("service_requests");
  tableReport("service_requests", sourceRequests.length, currentRequests.length);
  for (const row of sourceRequests) {
    insertOrUpdate("service_requests", row, currentRequests, [["phone", "created_at", "client_name"], ["id"]], {
      preserveFreeId: true,
      allowId: false,
    });
  }

  const sourcePageViews = sourceRows("page_views");
  const currentPageViews = targetRows("page_views");
  tableReport("page_views", sourcePageViews.length, currentPageViews.length);
  for (const row of sourcePageViews) {
    insertOrUpdate("page_views", row, [], [], { preserveFreeId: false });
  }

  for (const table of [
    "company_values",
    "hero_slides",
    "partners",
    "testimonials",
    "ads",
    "conversations",
    "messages",
    "notifications",
    "push_subscriptions",
    "active_visitors",
    "services",
    "packages",
    "posts",
    "site_settings",
    "service_requests",
    "page_views",
    "admins",
  ]) {
    if (report.tables[table] && tableExists(target, table)) {
      report.tables[table].after = countOf(target, table);
    }
  }
}

function collectImageReferences(db) {
  const references = new Set();
  const tables = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
    .all()
    .map((item) => item.name);
  for (const table of tables) {
    let rows;
    try {
      rows = rowsOf(db, table, table === "page_views");
    } catch {
      continue;
    }
    for (const row of rows) {
      for (const value of Object.values(row)) {
        if (typeof value !== "string") continue;
        const refs = value.match(/\/(?:api\/uploads|uploads|images)\/[^"'<>\\\s)\]}]+/g) ?? [];
        for (const ref of refs) references.add(ref);
      }
    }
  }
  return [...references];
}

function runtimeAssetExists(ref) {
  const match = String(ref).match(/^\/(api\/uploads|uploads|images)\/(.+)$/);
  if (!match) return true;
  const namespace = match[1];
  const name = decodeURIComponent(match[2]);
  if (namespace === "images") return existsSync(join(publicImagesDir, ...name.split("/")));
  return existsSync(join(uploadsDir, basename(name))) || existsSync(join(apiUploadsDir, basename(name)));
}

function validate() {
  report.validation.integrity = target.pragma("integrity_check", { simple: true });
  report.validation.foreignKeys = target.pragma("foreign_key_check");
  report.validation.tableCounts = {};
  for (const table of Object.keys(report.tables)) {
    if (tableExists(target, table)) report.validation.tableCounts[table] = countOf(target, table);
  }

  const refs = collectImageReferences(target);
  report.images.runtimeImageFilesAfter = listFiles(uploadsDir).length + listFiles(apiUploadsDir).length + listFiles(publicImagesDir).length;
  report.images.brokenReferencesAfterMerge = refs.filter((ref) => !runtimeAssetExists(ref));
  report.images.sourceReferencesMissing = [...new Set(report.images.sourceReferencesMissing)];
}

try {
  if (tableExists(target, "lost_and_found")) {
    target.exec(`DROP TABLE ${quoteIdentifier("lost_and_found")}`);
    report.recoveryArtifactRemoved = true;
  }

  const transaction = target.transaction(() => mergeContent());
  transaction();
  validate();
  if (report.validation.integrity !== "ok") {
    throw new Error(`Target integrity check failed after merge: ${report.validation.integrity}`);
  }
  if (report.validation.foreignKeys.length) {
    throw new Error(`Foreign key violations after merge: ${JSON.stringify(report.validation.foreignKeys)}`);
  }
  mkdirSync(dirname(reportPath), { recursive: true });
  writeFileSync(reportPath, JSON.stringify(report, null, 2) + "\n", "utf8");
  console.log(JSON.stringify({
    target: report.target,
    integrity: report.validation.integrity,
    foreignKeyViolations: report.validation.foreignKeys.length,
    tables: report.tables,
    images: {
      customerImageFiles: report.images.customerImageFiles,
      copiedFiles: report.images.copiedFiles.length,
      rewrittenReferences: report.images.rewrittenReferences,
      brokenReferencesAfterMerge: report.images.brokenReferencesAfterMerge.length,
    },
    report: relative(ROOT, reportPath),
  }, null, 2));
} finally {
  target.pragma("foreign_keys = ON");
  target.close();
  source.close();
}