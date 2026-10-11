const legacyName = String.fromCodePoint(
  1587, 1576, 1575, 1574, 1610, 32, 1575, 1604, 1605, 1575, 1587, 1577,
)
const legacyInstitution = `${String.fromCodePoint(1605, 1572, 1587, 1587, 1577)} ${legacyName}`
const legacyCompany = `${String.fromCodePoint(1588, 1585, 1603, 1577)} ${legacyName}`
const currentLegacyName = String.fromCodePoint(
  1575, 1604, 1587, 1607, 1605, 32, 1603, 1604, 1610, 1606,
)
const currentLegacyInstitution = `${String.fromCodePoint(1605, 1572, 1587, 1587, 1577)} ${currentLegacyName}`

export function replaceLegacyCompanyName(value: unknown, companyName: string): string {
  if (typeof value !== "string" || !value || !companyName.trim()) {
    return typeof value === "string" ? value : ""
  }

  const resolvedName = companyName.trim()
  const marker = "\u0000COMPANY_NAME\u0000"
  let normalized = value.replaceAll(resolvedName, marker)

  normalized = normalized
    .replaceAll("حاويات تأجير حاويات الرياض 0580595555 المتاحة", `حاويات ${marker} المتاحة`)
    .replaceAll("تأجير حاويات الرياض ( 0580595555 )", marker)
    .replaceAll("تأجير حاويات الرياض (0580595555)", marker)
    .replaceAll("تأجير حاويات الرياض 0580595555", marker)

  for (const term of [
    legacyInstitution,
    legacyCompany,
    legacyName,
    "مؤسسة سبائك الماسة",
    "مؤسسة سبائك الماسه",
    "سبائك الماسة",
    "سبائك الماسه",
    currentLegacyInstitution,
    currentLegacyName,
    "منصة حاويات",
  ].sort((left, right) => right.length - left.length)) {
    normalized = normalized.replaceAll(term, marker)
  }

  return normalized.replaceAll(marker, resolvedName)
}