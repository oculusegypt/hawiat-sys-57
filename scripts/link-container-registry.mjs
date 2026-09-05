import { createRequire } from "node:module";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const require = createRequire(import.meta.url);
const Database = require(join(ROOT, "lib/db/node_modules/better-sqlite3"));
const db = new Database(join(ROOT, "data/sabaik.db"));

const normalize = value => String(value ?? "").trim().toLowerCase();
const parse = value => {
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const categoryFor = payload => {
  const value = normalize(`${payload.category ?? ""} ${payload.categoryName ?? ""} ${payload.name ?? ""} ${payload.typeName ?? ""}`);
  if (value.includes("عقد") || value.includes("contract")) return "contract";
  return value.includes("نفا") || value.includes("waste") || value.includes("مكبس") ? "waste" : "debris";
};

const categoryLabel = category => category === "waste"
  ? "حاويات النفايات والمكابس"
  : "حاويات الأنقاض ومخلفات البناء";

const packageRows = db.prepare("SELECT * FROM packages ORDER BY id").all();
const packageByCategorySize = new Map(
  packageRows.map(row => [`${normalize(row.category)}|${normalize(row.size)}`, row]),
);
const packageById = new Map(packageRows.map(row => [row.id, row]));
const legacyTypes = db.prepare(
  "SELECT * FROM container_system_records WHERE kind = 'container_type'",
).all();
const legacyTypeToPackage = new Map();
const now = new Date().toISOString();

const insertPackage = db.prepare(`
  INSERT INTO packages
    (name, category, size, capacity, description, features, suitable_for, price_text,
     price_note, rental_period, contact_phone1, contact_phone2, price_per_day,
     image_url, images, "order", is_active, seo_enabled, seo_title, seo_description,
     seo_keywords, seo_slug)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

for (const row of legacyTypes) {
  const payload = parse(row.payload);
  const category = categoryFor(payload);
  const size = String(payload.size ?? "").trim();
  let packageRow = packageByCategorySize.get(`${category}|${normalize(size)}`);

  if (!packageRow) {
    const name = String(payload.name ?? payload.typeName ?? `نوع حاوية ${size}`).trim();
    const description = String(payload.description ?? `نوع حاوية مركزي: ${name}`).trim();
    const slug = `container-type-${row.id}`;
    const result = insertPackage.run(
      name,
      category,
      size,
      String(payload.capacity ?? ""),
      description,
      JSON.stringify(Array.isArray(payload.features) ? payload.features : []),
      String(payload.suitableFor ?? ""),
      String(payload.priceText ?? ""),
      String(payload.priceNote ?? ""),
      String(payload.rentalPeriod ?? ""),
      "",
      "",
      Number(payload.pricePerDay ?? payload.dailyRate ?? 0),
      String(payload.imageUrl ?? ""),
      String(payload.images ?? "[]"),
      0,
      1,
      1,
      name,
      description,
      name,
      slug,
    );
    packageRow = db.prepare("SELECT * FROM packages WHERE id = ?").get(Number(result.lastInsertRowid));
    packageRows.push(packageRow);
    packageById.set(packageRow.id, packageRow);
    packageByCategorySize.set(`${category}|${normalize(size)}`, packageRow);
  }

  legacyTypeToPackage.set(row.id, packageRow.id);
}

const packageForPayload = payload => {
  const legacyId = Number(payload.containerTypeRecordId ?? 0);
  if (legacyId > 0 && legacyTypeToPackage.has(legacyId)) {
    return packageById.get(legacyTypeToPackage.get(legacyId))
      ?? db.prepare("SELECT * FROM packages WHERE id = ?").get(legacyTypeToPackage.get(legacyId));
  }
  const category = categoryFor(payload);
  const size = normalize(payload.size);
  return packageByCategorySize.get(`${category}|${size}`)
    ?? packageRows.find(row => normalize(row.name) === normalize(payload.typeName ?? payload.containerType));
};

const updateRecord = db.prepare(
  "UPDATE container_system_records SET payload = ?, updated_at = ? WHERE id = ?",
);
let updatedRecords = 0;
const records = db.prepare(
  "SELECT * FROM container_system_records WHERE kind <> 'container_type'",
).all();

for (const row of records) {
  const payload = parse(row.payload);
  const type = packageForPayload(payload);
  if (!type) continue;

  const next = {
    ...payload,
    containerTypeId: type.id,
    containerType: type.name,
    typeName: type.name,
    category: type.category,
    categoryName: categoryLabel(type.category),
    size: type.size,
    capacity: type.capacity,
    pricePerDay: type.price_per_day,
    dailyRate: type.price_per_day,
    priceText: type.price_text,
  };
  delete next.containerTypeRecordId;
  delete next.categoryRecordId;
  delete next.categorySizeRecordId;
  updateRecord.run(JSON.stringify(next), now, row.id);
  updatedRecords += 1;
}

const deleted = db.prepare("DELETE FROM container_system_records WHERE kind = 'container_type'").run();
db.close();

console.log(JSON.stringify({
  migratedTypes: legacyTypeToPackage.size,
  updatedRecords,
  deletedLegacyTypeRecords: deleted.changes,
}, null, 2));