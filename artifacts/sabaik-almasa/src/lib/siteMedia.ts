/**
 * Return the first image explicitly managed for an entity.
 * The primary image always wins over the JSON images collection.
 */
export function firstManagedImage(primary: unknown, images: unknown): string {
  if (typeof primary === "string" && primary.trim()) return primary.trim()

  if (Array.isArray(images)) {
    const first = images.find((image): image is string => typeof image === "string" && image.trim().length > 0)
    return first?.trim() || ""
  }

  if (typeof images !== "string" || !images.trim()) return ""

  try {
    const parsed: unknown = JSON.parse(images)
    if (Array.isArray(parsed)) {
      const first = parsed.find((image): image is string => typeof image === "string" && image.trim().length > 0)
      return first?.trim() || ""
    }
    if (typeof parsed === "string" && parsed.trim()) return parsed.trim()
  } catch {
    // Keep support for legacy rows containing one plain image URL.
    return images.trim()
  }

  return ""
}