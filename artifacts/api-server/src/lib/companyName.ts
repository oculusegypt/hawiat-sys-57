const legacyName = String.fromCodePoint(
  1587, 1576, 1575, 1574, 1610, 32, 1575, 1604, 1605, 1575, 1587, 1577,
)
const legacyInstitution = `${String.fromCodePoint(1605, 1572, 1587, 1587, 1577)} ${legacyName}`
const legacyCompany = `${String.fromCodePoint(1588, 1585, 1603, 1577)} ${legacyName}`
const currentLegacyName = String.fromCodePoint(
  1575, 1604, 1587, 1607, 1605, 32, 1603, 1604, 1610, 1606,
)
const currentLegacyInstitution = `${String.fromCodePoint(1605, 1572, 1587, 1587, 1577)} ${currentLegacyName}`

function replaceTerm(value: string, term: string, replacement: string, resolvedName: string): string {
  // Do not replace a legacy term when the administrator intentionally kept it
  // as the configured name. Otherwise an already-prefixed name could be
  // duplicated after the bare-name pass.
  return resolvedName === term || resolvedName.includes(term) ? value : value.replaceAll(term, replacement)
}

export function replaceLegacyCompanyName(value: unknown, companyName: string): string {
  if (typeof value !== "string" || !value || !companyName.trim()) {
    return typeof value === "string" ? value : ""
  }

  const resolvedName = companyName.trim()
  let normalized = value
    .replaceAll(`${legacyInstitution} لتأجير الحاويات ونقل الأنقاض`, `${resolvedName} لتأجير الحاويات ونقل الأنقاض`)
    .replaceAll(`${currentLegacyInstitution} لتأجير الحاويات ونقل الأنقاض`, `${resolvedName} لتأجير الحاويات ونقل الأنقاض`)
    .replaceAll("مؤسسة سبائك الماسة لتأجير الحاويات ونقل الأنقاض", `${resolvedName} لتأجير الحاويات ونقل الأنقاض`)
    .replaceAll("مؤسسة سبائك الماسه لتأجير الحاويات ونقل الأنقاض", `${resolvedName} لتأجير الحاويات ونقل الأنقاض`)
    .replaceAll("حاويات تأجير حاويات الرياض 0580595555 المتاحة", `حاويات ${resolvedName} المتاحة`)
    .replaceAll("تأجير حاويات الرياض ( 0580595555 )", resolvedName)
    .replaceAll("تأجير حاويات الرياض (0580595555)", resolvedName)
    .replaceAll("تأجير حاويات الرياض 0580595555", resolvedName)
    .replaceAll("حاويات مؤسسة سبائك الماسة", `حاويات ${resolvedName}`)
    .replaceAll("حاويات مؤسسة سبائك الماسه", `حاويات ${resolvedName}`)

  for (const [term, replacement] of [
    [legacyInstitution, resolvedName],
    [legacyCompany, resolvedName],
    [legacyName, resolvedName],
    ["مؤسسة سبائك الماسة", resolvedName],
    ["مؤسسة سبائك الماسه", resolvedName],
    [currentLegacyInstitution, resolvedName],
    [currentLegacyName, resolvedName],
    ["منصة حاويات", resolvedName],
  ] as const) {
    normalized = replaceTerm(normalized, term, replacement, resolvedName)
  }

  // The current configured name can itself be a legacy phrase. Only replace
  // it when the administrator has chosen a different name.
  return normalized
}