const LEGACY_CALL = ["053", "631", "2121"].join("");

export function readBusinessIdentity(db) {
  const rows = db.prepare(`
    SELECT key, value
    FROM site_settings
    WHERE key IN ('company_name', 'company_name_en', 'company_phone_call', 'company_phone_whatsapp')
  `).all();
  const settings = Object.fromEntries(rows.map(({ key, value }) => [key, String(value || "").trim()]));
  const identity = {
    companyName: settings.company_name,
    companyNameEnglish: settings.company_name_en,
    call: settings.company_phone_call,
    whatsapp: settings.company_phone_whatsapp,
  };
  const missing = Object.entries(identity).filter(([, value]) => !value).map(([key]) => key);
  if (missing.length) {
    throw new Error(`إعدادات الهوية ناقصة: ${missing.join(", ")}`);
  }
  return Object.freeze(identity);
}

export function normalizeBusinessText(value, identity) {
  if (typeof value !== "string") return value;
  return value
    .replaceAll(LEGACY_CALL, identity.call)
    .replaceAll("Taqi Group Establishment", identity.companyNameEnglish)
    .replaceAll("Taqi Group", identity.companyNameEnglish)
    .replaceAll("مؤسسة تقي", identity.companyName)
    .replaceAll("تقي جروب", identity.companyName)
    .replaceAll("سبائك الماسه", identity.companyName)
    .replaceAll("منصة حاويات", identity.companyName);
}

export function normalizeSeedRecord(record, identity) {
  if (!record || typeof record !== "object") return record;

  const normalized = Object.fromEntries(
    Object.entries(record).map(([key, value]) => [key, normalizeBusinessText(value, identity)]),
  );

  if ("contact_phone1" in normalized) normalized.contact_phone1 = identity.call;
  if ("contact_phone2" in normalized) normalized.contact_phone2 = identity.whatsapp;

  return normalized;
}