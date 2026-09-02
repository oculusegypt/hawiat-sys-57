#!/usr/bin/env node
/**
 * Fail fast if generated/public data contains a retired business identity.
 * This is intentionally read-only and is safe to run in CI or before a build.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(fileURLToPath(new URL("..", import.meta.url)));
const legacyPatterns = [
  /0536312121/g,
  /مؤسسة\s+تقي/giu,
  /Taqi Group Establishment/giu,
];
const files = [
  join(ROOT, "artifacts", "sabaik-almasa", "public", "llms.txt"),
  join(ROOT, "artifacts", "sabaik-almasa", "public", "sitemap.xml"),
  join(ROOT, "build_php", "llms.txt"),
  join(ROOT, "build_php", "sitemap.xml"),
];

const failures = [];
for (const filePath of files) {
  if (!existsSync(filePath)) continue;
  const content = readFileSync(filePath, "utf8");
  if (legacyPatterns.some((pattern) => pattern.test(content))) failures.push(filePath);
}

if (failures.length) {
  console.error("❌ Legacy business identity found in:");
  for (const filePath of failures) console.error(` - ${filePath.replace(`${ROOT}/`, "")}`);
  process.exit(1);
}

console.log("✅ No retired business identity in checked public outputs.");