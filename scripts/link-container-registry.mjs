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

const rows = db.prepare("SELECT * FROM container_system_records WHERE status <> 'archived'").all();
const categories = rows.filter(row => row.kind === "category");
const sizes = rows.filter(row => row.kind === "category_size");
const categoryByName = new Map(categories.map(row => [normalize(parse(row.payload).name), row]));
const sizeFor = (category, size) => sizes.find(row => {
  const payload = parse(row.payload);
  return Number(payload.categoryRecordId ?? 0) === Number(category.id) &&
    normalize(payload.size ?? payload.name) === normalize(size);
});

const typeDefinitions = [
  ["TYPE-CENTRAL-DEBRIS-12", "أنقاض", "12 ياردة", "حاوية أنقاض 12 ياردة", "6 طن", 180],
  ["TYPE-CENTRAL-DEBRIS-20", "أنقاض", "20 ياردة", "حاوية أنقاض 20 ياردة", "15 طن", 260],
  ["TYPE-CENTRAL-WASTE-6", "نفايات تجارية", "6 ياردة", "حاوية نفايات تجارية 6 ياردة", "6 طن", 220],
  ["TYPE-CENTRAL-WASTE-2", "نفايات تجارية", "2 ياردة", "حاوية نفايات تجارية 2 ياردة", "2 طن", 140],
];

const insert = db.prepare(`
  INSERT INTO container_system_records (kind, status, reference, payload)
  VALUES ('container_type', 'active', ?, ?)
`);
const update = db.prepare(`
  UPDATE container_system_records SET status = ?, payload = ?, updated_at = ? WHERE id = ?
`);
const now = new Date().toISOString();
const centralTypes = [];

for (const [reference, categoryName, sizeName, name, capacity, dailyRate] of typeDefinitions) {
  const category = categoryByName.get(normalize(categoryName));
  const size = category ? sizeFor(category, sizeName) : undefined;
  if (!category || !size) {
    throw new Error(`Missing central category/size for ${reference}`);
  }
  const payload = {
    categoryRecordId: category.id,
    categoryName,
    categorySizeRecordId: size.id,
    name,
    typeName: name,
    size: sizeName,
    capacity,
    dailyRate,
    taxRate: 15,
    notes: "نوع مركزي مرتبط بالفئة والحجم",
  };
  const existing = rows.find(row => row.kind === "container_type" && row.reference === reference);
  if (existing) {
    update.run("active", JSON.stringify(payload), now, existing.id);
    centralTypes.push({ ...existing, payload: JSON.stringify(payload) });
  } else {
    const created = insert.run(reference, JSON.stringify(payload));
    centralTypes.push({ id: Number(created.lastInsertRowid), kind: "container_type", reference, payload: JSON.stringify(payload) });
  }
}

const typeBySize = new Map(centralTypes.map(row => {
  const payload = parse(row.payload);
  return [`${payload.categoryRecordId}|${normalize(payload.size)}`, row];
}));
const assetUpdate = db.prepare("UPDATE container_system_records SET payload = ?, updated_at = ? WHERE id = ?");
let linkedAssets = 0;

for (const row of rows.filter(item => ["container", "container_asset"].includes(item.kind))) {
  const payload = parse(row.payload);
  const rawSize = normalize(payload.size) || (normalize(payload.typeName).includes("20") ? "20 ياردة" : "12 ياردة");
  // Existing demo assets are legacy debris assets. Preserve their identity while
  // giving them the central references required by the new UI.
  const category = categoryByName.get(normalize(payload.categoryName)) ?? categoryByName.get("أنقاض");
  const size = category && sizeFor(category, rawSize);
  const type = size && typeBySize.get(`${category.id}|${normalize(rawSize)}`);
  if (!category || !size || !type) continue;
  const typePayload = parse(type.payload);
  const next = {
    ...payload,
    categoryRecordId: category.id,
    categoryName: String(parse(category.payload).name ?? category.reference),
    categorySizeRecordId: size.id,
    containerTypeRecordId: type.id,
    size: String(parse(size.payload).size ?? rawSize),
    typeName: String(typePayload.name ?? type.reference),
    capacity: payload.capacity ?? typePayload.capacity,
  };
  assetUpdate.run(JSON.stringify(next), now, row.id);
  linkedAssets += 1;
}

db.close();
console.log(JSON.stringify({ centralTypes: centralTypes.length, linkedAssets }, null, 2));