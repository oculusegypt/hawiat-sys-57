#!/usr/bin/env node
/**
 * Normalize high-risk public content without deleting pages.
 *
 * The current business identity is Riyadh-focused. This migration removes
 * unsupported city/service-area claims from the public service and package
 * metadata, and fixes malformed SEO terms that were imported into seo_pages.
 * It is idempotent and runs before every Hostinger snapshot.
 */

import { createRequire } from "node:module";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(fileURLToPath(new URL("..", import.meta.url)));
const require = createRequire(join(ROOT, "lib", "db", "package.json"));
const Database = require("better-sqlite3");

const dbPaths = [
  process.env.DB_PATH,
  join(ROOT, "data", "sabaik.db"),
  join(ROOT, "build_php", "data", "sabaik.db"),
].filter((value, index, all) => value && all.indexOf(value) === index && existsSync(value));

const serviceFixes = {
  38: {
    description:
      "تقدم مؤسسة سبائك الماسة خدمة نقل الأنقاض ومخلفات البناء في الرياض وأحيائها باستخدام أسطول مناسب، مع تنسيق آمن للتوصيل والرفع والنقل للمنازل والمشاريع.",
    seo_title: "نقل الأنقاض والمخلفات بالرياض | خدمة سريعة وآمنة",
    seo_description:
      "نقل الأنقاض ومخلفات البناء في الرياض بطريقة منظمة وآمنة، مع تنسيق التوصيل والرفع للمنازل والمشاريع. اطلب عرضاً مناسباً لموقعك.",
    seo_keywords:
      "نقل الأنقاض بالرياض، نقل مخلفات البناء بالرياض، رفع مخلفات الهدم، إزالة الأنقاض، شاحنة نقل مخلفات",
  },
  39: {
    description:
      "نقدم خدمات ردم وتسوية الأراضي في الرياض وأحيائها بدقة مناسبة للمشاريع بعد الهدم أو قبل البناء، مع تنظيم الموقع وتجهيزه لبدء أعمال البناء أو التطوير.",
    seo_title: "ردم وتسوية الأراضي بالرياض | تجهيز الموقع قبل البناء",
    seo_description:
      "خدمات ردم وتسوية الأراضي في الرياض وأحيائها بعد الهدم أو قبل البناء، مع تجهيز منظم للموقع ومراعاة طبيعة الأرض واحتياج المشروع.",
    seo_keywords:
      "ردم وتسوية الأراضي بالرياض، ردم أرض بالرياض، تسوية موقع، تجهيز أرض للبناء، ردم بعد الهدم",
  },
  40: {
    description:
      "نقدم خدمة تنظيف وتطهير المواقع الإنشائية في الرياض وأحيائها بعد البناء أو الهدم، وتشمل إزالة الأنقاض والغبار وبقايا المواد لتسليم موقع منظم وآمن.",
    seo_title: "تنظيف وتطهير المواقع الإنشائية بالرياض | خدمة احترافية",
    seo_description:
      "تنظيف وتطهير المواقع الإنشائية في الرياض بعد البناء أو الهدم، مع إزالة الأنقاض والغبار وبقايا المواد وتجهيز الموقع للتسليم أو التشغيل.",
    seo_keywords:
      "تنظيف مواقع إنشائية بالرياض، تنظيف موقع بناء، إزالة أنقاض بالرياض، تنظيف بعد التشطيب، تطهير موقع",
  },
};

const packageFixes = {
  34: {
    seo_title: "حاوية صغيرة لنقل المخلفات بالرياض | أنقاض ورمل وهدم",
    seo_description:
      "احجز حاوية صغيرة لنقل مخلفات الهدم والرمل والأنقاض في الرياض، مع توصيل واستلام منسق للمنازل والمشاريع الصغيرة والمتوسطة.",
    seo_keywords: "حاوية صغيرة بالرياض، نقل مخلفات بالرياض، حاوية أنقاض، حاوية رمل، حاوية هدم",
  },
  35: {
    seo_title: "حاوية كبيرة لنقل المخلفات بالرياض | توصيل للمشاريع",
    seo_description:
      "حاوية كبيرة لمخلفات الهدم والبناء والرمل في الرياض، مناسبة للمشاريع التي تنتج كميات كبيرة مع تنسيق التوصيل والرفع حسب الموقع.",
    seo_keywords: "حاوية كبيرة بالرياض، حاوية أنقاض، حاوية هدم، حاوية رمل، نقل مخلفات البناء",
  },
  36: {
    seo_title: "حاوية نفايات صغيرة للمنشآت بالرياض | خدمة دورية",
    seo_description:
      "حاوية نفايات صغيرة للمنشآت والمطاعم والمتاجر في الرياض، مع ترتيب تفريغ دوري يساعد على إبقاء منطقة الخدمة نظيفة ومنظمة.",
    seo_keywords: "حاوية نفايات بالرياض، حاوية للمنشآت، حاوية مطاعم، جمع النفايات، تفريغ دوري",
  },
  37: {
    seo_title: "مكبس نفايات كهربائي بالرياض | ضغط نفايات المنشآت",
    seo_description:
      "مكبس نفايات كهربائي للمنشآت التجارية في الرياض يساعد على تقليل حجم المخلفات وتنظيم مساحة التخزين، مع طلب عرض يناسب طبيعة التشغيل.",
    seo_keywords: "مكبس نفايات بالرياض، ضاغط نفايات للمنشآت، ضغط المخلفات، مكبس للمطاعم، إدارة النفايات",
  },
};

const seoTextReplacements = [
  ["خدمات رفتأجير", "خدمات تأجير"],
  ["ياردهع", "ياردة"],
  ["يارده", "ياردة"],
];

function textColumns(db, table) {
  return db
    .prepare(`PRAGMA table_info("${table}")`)
    .all()
    .filter((column) => /TEXT|CHAR|CLOB/i.test(String(column.type || "")))
    .map((column) => column.name);
}

function updateFields(db, table, id, fields) {
  const columns = textColumns(db, table);
  const entries = Object.entries(fields).filter(([key]) => columns.includes(key));
  if (!entries.length) return 0;
  const assignments = entries.map(([key]) => `"${key.replaceAll('"', '""')}" = @${key}`).join(", ");
  const updatedAt = columns.includes("updated_at") ? ", updated_at = datetime('now')" : "";
  return db.prepare(`UPDATE "${table}" SET ${assignments}${updatedAt} WHERE id = @id`).run({
    id,
    ...Object.fromEntries(entries),
  }).changes;
}

function normalizeTableText(db, table) {
  const columns = textColumns(db, table);
  let changed = 0;
  for (const column of columns) {
    const safeColumn = `"${column.replaceAll('"', '""')}"`;
    const rows = db.prepare(`SELECT rowid AS row_id, ${safeColumn} AS value FROM "${table}" WHERE typeof(${safeColumn}) = 'text'`).all();
    const write = db.prepare(`UPDATE "${table}" SET ${safeColumn} = ? WHERE rowid = ?`);
    for (const row of rows) {
      let next = row.value;
      for (const [from, to] of seoTextReplacements) next = next.replaceAll(from, to);
      if (next !== row.value) {
        write.run(next, row.row_id);
        changed += 1;
      }
    }
  }
  return changed;
}

function repairDatabase(dbPath) {
  const db = new Database(dbPath);
  let changed = 0;
  const run = db.transaction(() => {
    for (const [id, fields] of Object.entries(serviceFixes)) {
      changed += updateFields(db, "services", Number(id), fields);
    }
    for (const [id, fields] of Object.entries(packageFixes)) {
      changed += updateFields(db, "packages", Number(id), fields);
    }
    changed += normalizeTableText(db, "seo_pages");
  });
  run();
  const integrity = db.pragma("integrity_check", { simple: true });
  db.close();
  if (integrity !== "ok") throw new Error(`${dbPath}: SQLite integrity check failed: ${integrity}`);
  console.log(`✅ ${dbPath.replace(`${ROOT}/`, "")}: ${changed} محتوى عالي الخطورة تمت مراجعته`);
}

if (dbPaths.length === 0) throw new Error("لم أعثر على قاعدة SQLite قابلة لتحسين المحتوى.");
for (const dbPath of dbPaths) repairDatabase(dbPath);