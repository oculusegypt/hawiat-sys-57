export const GOLDEN_SEO_KEYWORDS: readonly string[] = []

export const GOLDEN_SEO_KEYWORDS_TEXT = ""

function splitKeywords(value?: string | null): string[] {
  return String(value || "")
    .split(/[،,]/)
    .map((keyword) => keyword.trim())
    .filter(Boolean)
}

export function mergeGoldenSeoKeywords(value?: string | null): string {
  const current = splitKeywords(value)
  // Keywords are metadata, not page copy. Appending the same global list to
  // every route created both keyword cannibalization and visible repetition
  // when editors reused the generated values in their content.
  return Array.from(new Set(current)).join("، ")
}

export function pageSpecificSeoKeywords({
  targetKeyword,
  title,
  keywords,
}: {
  targetKeyword?: string | null
  title?: string | null
  keywords?: string | null
}): string {
  const targetKeywords = splitKeywords(targetKeyword)
  const candidates = [...targetKeywords, ...splitKeywords(keywords)].filter(Boolean)
  const fallback = String(title || "").trim()
  return Array.from(new Set(candidates.length ? candidates : fallback ? [fallback] : []))
    .slice(0, 8)
    .join("، ")
}