export function seoImageAlt(title: string, companyName = "الشركة"): string {
  return `${title.replace(/\s*\|.*$/, "").trim()} — ${companyName || "الشركة"} لتأجير الحاويات بالرياض`
}