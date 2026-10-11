const LEGACY_CALLS = [["053", "631", "2121"].join(""), "0580595555"];
const LEGACY_NAMES = [
  "مؤسسة سبائك الماسة لتأجير الحاويات ونقل الأنقاض",
  "مؤسسة سبائك الماسه لتأجير الحاويات ونقل الأنقاض",
  "مؤسسة سبائك الماسة",
  "مؤسسة سبائك الماسه",
  "شركة سبائك الماسة",
  "شركة سبائك الماسه",
  "سبائك الماسة",
  "سبائك الماسه",
  "منصة حاويات",
  "مؤسسة تقي",
  "تقي جروب",
  "Taqi Group Establishment",
  "Taqi Group",
];

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
  const arabicToken = "\u0000BUSINESS_IDENTITY_AR\u0000";
  const englishToken = "\u0000BUSINESS_IDENTITY_EN\u0000";
  let normalized = value;

  for (const [currentName, token] of [
    [identity.companyName, arabicToken],
    [identity.companyNameEnglish, englishToken],
  ]) {
    if (currentName) normalized = normalized.replaceAll(currentName, token);
  }

  normalized = normalized.replaceAll(
    "حاويات تأجير حاويات الرياض 0580595555 المتاحة",
    `حاويات ${arabicToken} المتاحة`,
  );
  for (const legacyName of LEGACY_NAMES) {
    normalized = normalized.replaceAll(
      legacyName,
      legacyName.startsWith("Taqi Group") ? englishToken : arabicToken,
    );
  }
  for (const legacyCall of LEGACY_CALLS) {
    if (identity.call) normalized = normalized.replaceAll(legacyCall, identity.call);
  }

  return normalized
    .replaceAll(arabicToken, identity.companyName || "")
    .replaceAll(englishToken, identity.companyNameEnglish || identity.companyName || "");
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