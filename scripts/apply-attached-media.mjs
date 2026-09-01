#!/usr/bin/env node
/**
 * One-time media migration for the current Sabaik database.
 *
 * The four customer-supplied images are the only photographic assets in the
 * resulting site. Container packages are matched by their exact Arabic name;
 * editorial and operational media receive a stable one-time distribution.
 */
import { createRequire } from "node:module";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const require = createRequire(join(ROOT, "lib", "db", "package.json"));
const Database = require("better-sqlite3");
const SOURCE_DB = join(ROOT, "data", "sabaik.db");

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

function mediaFor(index) {
  const value = Number.isFinite(Number(index)) ? Math.abs(Math.trunc(Number(index))) : 0;
  return MEDIA[value % MEDIA.length];
}

function replaceImageUrls(value, fallbackIndex) {
  if (typeof value !== "string" || !value) return value;
  let nextIndex = Number(fallbackIndex) || 0;
  return value.replace(
    /(?:\/(?:api\/)?uploads\/|\/images\/)(?!container-small\.png|container-large\.png|waste-small\.png|electric-compactor\.jpeg)[^"'\\\s?#<>)]+/giu,
    () => mediaFor(nextIndex++),
  );
}

function tableExists(db, table) {
  return Boolean(db.prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?").get(table));
}

function textColumns(db, table) {
  const safeTable = table.replaceAll('"', '""');
  return db.prepare(`PRAGMA table_info("${safeTable}")`).all()
    .filter((column) => /TEXT/i.test(String(column.type || "")))
    .map((column) => String(column.name));
}

const db = new Database(SOURCE_DB);
try {
  db.pragma("foreign_keys=OFF");
  db.transaction(() => {
    if (tableExists(db, "packages")) {
      const rows = db.prepare("SELECT id, name, category FROM packages NOT INDEXED").all();
      const update = db.prepare("UPDATE packages SET image_url = ?, images = ? WHERE id = ?");
      for (const row of rows) {
        const exactImage = PACKAGE_MEDIA.get(String(row.name || "").trim());
        if (exactImage) update.run(exactImage, JSON.stringify([exactImage]), row.id);
        else if (String(row.category || "") === "contract") update.run("", "[]", row.id);
      }
    }

    if (tableExists(db, "services")) {
      const rows = db.prepare("SELECT id FROM services NOT INDEXED ORDER BY id").all();
      const update = db.prepare("UPDATE services SET image_url = ?, images = ? WHERE id = ?");
      rows.forEach((row, index) => {
        const image = mediaFor(index + 1);
        update.run(image, JSON.stringify([image]), row.id);
      });
    }

    if (tableExists(db, "hero_slides")) {
      const rows = db.prepare("SELECT id FROM hero_slides NOT INDEXED ORDER BY id").all();
      const update = db.prepare("UPDATE hero_slides SET image_url = ? WHERE id = ?");
      rows.forEach((row, index) => update.run(mediaFor(index + 2), row.id));
    }

    for (const [table, offset] of [["posts", 11], ["seo_pages", 29]]) {
      if (!tableExists(db, table)) continue;
      const columns = textColumns(db, table);
      const mediaColumns = ["cover_image", "og_image"].filter((column) => columns.includes(column));
      if (!mediaColumns.length) continue;
      const rows = db.prepare(`SELECT id, ${mediaColumns.map((column) => `"${column}"`).join(", ")} FROM "${table}" NOT INDEXED`).all();
      const update = db.prepare(`UPDATE "${table}" SET ${mediaColumns.map((column) => `"${column}" = ?`).join(", ")} WHERE id = ?`);
      for (const row of rows) {
        const image = mediaFor(Number(row.id) + offset);
        update.run(...mediaColumns.map(() => image), row.id);
      }
    }

    const allTables = db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'").all();
    for (const { name: table } of allTables) {
      const columns = textColumns(db, table);
      for (const column of columns) {
        const safeTable = table.replaceAll('"', '""');
        const safeColumn = column.replaceAll('"', '""');
        const rows = db.prepare(`SELECT rowid AS __rowid, "${safeColumn}" AS value FROM "${safeTable}" NOT INDEXED WHERE "${safeColumn}" LIKE '%/images/%' OR "${safeColumn}" LIKE '%/uploads/%'`).all();
        const update = db.prepare(`UPDATE "${safeTable}" SET "${safeColumn}" = ? WHERE rowid = ?`);
        for (const row of rows) {
          const next = replaceImageUrls(row.value, Number(row.__rowid) + column.length);
          if (next !== row.value) update.run(next, row.__rowid);
        }
      }
    }

  })();
  console.log("تمت مطابقة صور الباقات وتوزيع الصور الجديدة على السجلات الحالية.");
} finally {
  db.close();
}