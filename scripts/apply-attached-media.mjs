#!/usr/bin/env node
/**
 * Scoped media migration for container packages only.
 *
 * This script must never be used as a site-wide image normalizer. Marketing
 * media, the company logo, partners, hero slides, services, posts, SEO pages,
 * and uploaded files are separate content and must keep their own URLs.
 *
 * The script is dry-run by default. Pass --apply only after reviewing the
 * package-only changes it prints.
 */
import { createRequire } from "node:module";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const require = createRequire(join(ROOT, "lib", "db", "package.json"));
const Database = require("better-sqlite3");
const SOURCE_DB = join(ROOT, "data", "sabaik.db");
const APPLY = process.argv.includes("--apply");

const MEDIA = [
  "/images/container-small.png",
  "/images/container-large.png",
  "/images/waste-small.png",
  "/images/electric-compactor.jpeg",
];

const PACKAGE_MEDIA = new Map([
  ["حاوية صغيرة", MEDIA[0]],
  ["حاوية كبيرة", MEDIA[1]],
  ["حاوية نفايات صغيرة", MEDIA[2]],
  ["مكبس نفايات كهربائي", MEDIA[3]],
]);

const db = new Database(SOURCE_DB);
try {
  const rows = db.prepare(
    "SELECT id, name, category, image_url, images FROM packages ORDER BY id",
  ).all();
  const changes = [];
  const update = db.prepare(
    "UPDATE packages SET image_url = ?, images = ? WHERE id = ?",
  );

  const transaction = db.transaction(() => {
    for (const row of rows) {
      const name = String(row.name || "").trim();
      const exactImage = PACKAGE_MEDIA.get(name);
      const nextImage = exactImage ?? (String(row.category || "") === "contract" ? "" : null);
      if (nextImage === null) continue;

      const nextImages = JSON.stringify(nextImage ? [nextImage] : []);
      if (row.image_url === nextImage && row.images === nextImages) continue;

      changes.push({ id: row.id, name, image: nextImage || "(بدون صورة)" });
      if (APPLY) update.run(nextImage, nextImages, row.id);
    }
  });

  if (APPLY) transaction();
  console.log(`تم العثور على ${changes.length} تغييراً محصوراً في packages.image_url وpackages.images.`);
  for (const change of changes) {
    console.log(`  ${APPLY ? "✅" : "👁️"} ${change.id} ${change.name}: ${change.image}`);
  }
  if (!APPLY) {
    console.log("لم تُعدّل قاعدة البيانات. استخدم --apply بعد مراجعة القائمة.");
  }
} finally {
  db.close();
}