import { createRequire } from "node:module";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const require = createRequire(join(ROOT, "lib", "db", "package.json"));
const Database = require("better-sqlite3");

const dbs = [
  join(ROOT, "data", "sabaik.db"),
  join(ROOT, "data", "sabaik_7dbd.db")
];

const updates = [
  { key: "site_public_url", value: "https://sabaik.net" },
  { key: "seo_meta_title", value: "تأجير حاويات ونقل مخلفات البناء بالرياض | {{company_name}}" },
  { key: "seo_meta_description", value: "{{company_name}} لتأجير حاويات الأنقاض والنفايات ونقل مخلفات البناء بالرياض، مع توصيل وسحب منسق وحلول مناسبة للمشاريع والمنشآت." },
  { key: "seo_meta_keywords", value: "تأجير حاويات بالرياض, حاويات أنقاض, حاويات نفايات, نقل مخلفات البناء, مكابس نفايات, عقود مواقع, {{company_name}}" },
  { key: "company_city", value: "الرياض" },
  { key: "company_region", value: "منطقة الرياض" },
  { key: "company_country", value: "SA" },
  { key: "company_address", value: "طريق الملك فهد، حي الصحافة، الرياض" },
  { key: "company_postal_code", value: "13321" },
  { key: "company_latitude", value: "24.7937" },
  { key: "company_longitude", value: "46.6371" },
  { key: "company_email", value: "info@sabaik.net" },
  { key: "company_price_range", value: "$$" },
  { key: "company_payment_methods", value: "نقدي، مدى، فيزا، ماستركارد، تحويل بنكي" },
  { key: "company_google_business_profile", value: "https://maps.google.com/maps?ll=24.54038,46.650611&z=16&t=m&hl=ar&gl=EG&mapclient=embed&cid=16777605780937543839" },
  { key: "social_facebook", value: "https://www.facebook.com/Aiservx" },
  { key: "social_x", value: "https://x.com/Aiservx" },
  { key: "social_instagram", value: "https://www.instagram.com/Aiservx/" },
  { key: "social_tiktok", value: "https://www.tiktok.com/@Aiservx" },
  { key: "social_snapchat", value: "https://www.snapchat.com/add/Aiservx" },
  { key: "social_youtube", value: "https://www.youtube.com/@Aiservx" },
  { key: "social_linkedin", value: "https://www.linkedin.com/company/aiservx" },
  { key: "analytics_google_tag_id", value: "G-B6TYSZHY0T" },
  { key: "vapid_subject", value: "mailto:info@sabaik.net" }
];

function normalizeUploadReferences(db) {
  const tables = db
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'")
    .all();
  let changedCells = 0;
  for (const table of tables) {
    const safeTable = String(table.name).replaceAll('"', '""');
    const textColumns = db
      .prepare(`PRAGMA table_info("${safeTable}")`)
      .all()
      .filter((column) => String(column.type || "").toUpperCase().includes("TEXT"));
    for (const column of textColumns) {
      const safeColumn = String(column.name).replaceAll('"', '""');
      const result = db.prepare(
        `UPDATE "${safeTable}" SET "${safeColumn}" = REPLACE("${safeColumn}", ?, ?) WHERE "${safeColumn}" LIKE ?`,
      ).run("/api/uploads/", "/uploads/", "%/api/uploads/%");
      changedCells += result.changes;
    }
  }
  return changedCells;
}

for (const dbPath of dbs) {
  try {
    const db = new Database(dbPath);
    const now = new Date().toISOString();
    const companySetting = db.prepare("SELECT value FROM site_settings WHERE key = 'company_name' LIMIT 1").get();
    const companyName = String(companySetting?.value || "").trim() || "الشركة";
    const resolvedUpdates = updates.map((row) => ({
      ...row,
      value: row.value.replaceAll("{{company_name}}", companyName),
    }));
    const upsert = db.prepare(`
      INSERT INTO site_settings (key, value, updated_at) VALUES (@key, @value, '${now}')
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = '${now}'
    `);
    const tx = db.transaction((rows) => {
      const normalizedCells = normalizeUploadReferences(db);
      for (const row of rows) {
        upsert.run(row);
      }
      if (normalizedCells > 0) {
        console.log(`Normalized ${normalizedCells} legacy upload references in ${dbPath}`);
      }
    });
    tx(resolvedUpdates);
    db.pragma("journal_mode = DELETE");
    db.exec("VACUUM");
    db.close();
    console.log(`Updated settings successfully in ${dbPath}`);
  } catch (err) {
    console.error(`Error updating ${dbPath}:`, err);
  }
}
