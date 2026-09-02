export function seoImageAlt(title: string, companyName = "سبائك الماسه"): string {
  return `${title.replace(/\s*\|.*$/, "").trim()} — ${companyName || "سبائك الماسه"} لتأجير الحاويات بالرياض`
}