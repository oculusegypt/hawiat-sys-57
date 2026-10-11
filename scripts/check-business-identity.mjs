#!/usr/bin/env node
/**
 * Fail fast if generated/public data contains a retired business identity.
 * This is intentionally read-only and is safe to run in CI or before a build.
 */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(fileURLToPath(new URL("..", import.meta.url)));
const require = createRequire(join(ROOT, "lib", "db", "package.json"));
const Database = require("better-sqlite3");
const dbPath = join(ROOT, "data", "sabaik.db");
const db = new Database(dbPath, { readonly: true });
const settingsRows = db.prepare(`
  SELECT key, value FROM site_settings
  WHERE key IN ('company_name', 'company_phone_call', 'company_phone_whatsapp', 'company_phones', 'company_logo', 'company_address')
`).all();
const identitySettings = Object.fromEntries(settingsRows.map(({ key, value }) => [key, String(value || "").trim()]));
const configuredCompanyName = identitySettings.company_name || "";
let listedPhones = [];
try {
  const parsed = JSON.parse(identitySettings.company_phones || "[]");
  if (Array.isArray(parsed)) listedPhones = parsed.filter((phone) => typeof phone === "string");
} catch {}
const normalizePhone = (value) => {
  let digits = String(value || "").replace(/\D/g, "");
  if (digits.startsWith("966")) digits = `0${digits.slice(3)}`;
  if (digits.length === 9 && digits.startsWith("5")) digits = `0${digits}`;
  return digits;
};
const normalizeLogo = (value) => String(value || "").trim().replace(/^\/api\/uploads\//, "/uploads/");
const configuredPhones = new Set([
  identitySettings.company_phone_call,
  identitySettings.company_phone_whatsapp,
  ...listedPhones,
].map(normalizePhone).filter(Boolean));
db.close();
const legacyPatterns = [
  /مؤسسة\s+تقي/giu,
  /Taqi Group Establishment/giu,
  /aiservx/giu,
  /facebook\.com\/Aiservx/giu,
  /x\.com\/Aiservx/giu,
];
const textExtensions = /\.(html?|json|xml|txt|php|webmanifest)$/i;
function collectPublicFiles(directory) {
  if (!existsSync(directory)) return [];
  const files = [];
  const visit = (current) => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const filePath = join(current, entry.name);
      if (entry.isDirectory()) visit(filePath);
      else if (textExtensions.test(entry.name)) files.push(filePath);
    }
  };
  visit(directory);
  return files;
}

const files = [
  ...collectPublicFiles(join(ROOT, "artifacts", "sabaik-almasa", "public")),
  ...collectPublicFiles(join(ROOT, "artifacts", "sabaik-almasa", "dist", "public"))
    .filter((filePath) => !filePath.includes("/assets/")),
  ...collectPublicFiles(join(ROOT, "build_php")),
];

const failures = [];
if (!configuredCompanyName) failures.push("إعداد company_name غير موجود في قاعدة البيانات.");
for (const filePath of files) {
  if (!existsSync(filePath)) continue;
  const content = readFileSync(filePath, "utf8");
  if (legacyPatterns.some((pattern) => {
    pattern.lastIndex = 0;
    return pattern.test(content);
  })) failures.push(filePath);
  const phones = content.match(/(?<!\d)(?:\+?966)?0?5\d{8}(?!\d)/g) || [];
  if (phones.some((phone) => !configuredPhones.has(normalizePhone(phone)))) failures.push(filePath);
}

const distPublic = join(ROOT, "artifacts", "sabaik-almasa", "dist", "public");
if (existsSync(distPublic) && configuredCompanyName) {
  const manifestPath = join(distPublic, "manifest.json");
  const llmsPath = join(distPublic, "llms.txt");
  const indexPath = join(distPublic, "index.html");
  try {
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    if (manifest.name !== configuredCompanyName) failures.push(manifestPath);
    const expectedLogo = normalizeLogo(identitySettings.company_logo);
    if (expectedLogo && !manifest.icons?.some((icon) => normalizeLogo(icon.src) === expectedLogo)) failures.push(manifestPath);
  } catch {
    failures.push(manifestPath);
  }
  try {
    if (!readFileSync(llmsPath, "utf8").includes(configuredCompanyName)) failures.push(llmsPath);
  } catch {
    failures.push(llmsPath);
  }
  try {
    const index = readFileSync(indexPath, "utf8");
    if (!index.includes(`<meta property="og:site_name" content="${configuredCompanyName}"`)) failures.push(indexPath);
    const iconTags = [...index.matchAll(/<link\b[^>]*>/gi)]
      .map(([tag]) => tag)
      .filter((tag) => /\brel=["'](?:icon|apple-touch-icon)["']/i.test(tag));
    const iconHrefs = iconTags.map((tag) => tag.match(/\bhref=["']([^"']+)["']/i)?.[1] || "");
    const expectedLogo = normalizeLogo(identitySettings.company_logo);
    if (expectedLogo && !iconHrefs.some((href) => normalizeLogo(href) === expectedLogo)) failures.push(indexPath);

    const structuredNodes = [];
    const visitStructuredData = (node) => {
      if (Array.isArray(node)) return node.forEach(visitStructuredData);
      if (!node || typeof node !== "object") return;
      structuredNodes.push(node);
      Object.values(node).forEach(visitStructuredData);
    };
    for (const [, json] of index.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
      try {
        visitStructuredData(JSON.parse(json));
      } catch {}
    }
    const businessSchemas = structuredNodes.filter((node) => {
      const types = Array.isArray(node["@type"]) ? node["@type"] : [node["@type"]];
      return node.name === configuredCompanyName
        && types.some((type) => ["LocalBusiness", "Organization", "HomeAndConstructionBusiness"].includes(type));
    });
    if (!businessSchemas.length) failures.push(indexPath);
    const schemaPhones = businessSchemas.flatMap((schema) =>
      Array.isArray(schema.telephone) ? schema.telephone : [schema.telephone],
    );
    if (identitySettings.company_phone_call && !schemaPhones.some((phone) => normalizePhone(phone) === normalizePhone(identitySettings.company_phone_call))) {
      failures.push(indexPath);
    }
    if (identitySettings.company_address && !index.includes(identitySettings.company_address)) failures.push(indexPath);
  } catch {
    failures.push(indexPath);
  }
}

if (failures.length) {
  console.error("❌ Legacy business identity found in:");
  for (const filePath of failures) console.error(` - ${filePath.replace(`${ROOT}/`, "")}`);
  process.exit(1);
}

console.log("✅ No retired business identity in checked public outputs.");