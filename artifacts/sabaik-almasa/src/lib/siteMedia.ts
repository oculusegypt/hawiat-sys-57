export const ATTACHED_MEDIA = {
  smallContainer: "/images/container-small.webp",
  largeContainer: "/images/container-large.webp",
  smallWaste: "/images/waste-small.webp",
  electricCompactor: "/images/electric-compactor.webp",
} as const

export const ATTACHED_MEDIA_LIST = [
  ATTACHED_MEDIA.smallContainer,
  ATTACHED_MEDIA.largeContainer,
  ATTACHED_MEDIA.smallWaste,
  ATTACHED_MEDIA.electricCompactor,
] as const

export function mediaForIndex(index: number): string {
  const safeIndex = Number.isFinite(index) ? Math.abs(Math.trunc(index)) : 0
  return ATTACHED_MEDIA_LIST[safeIndex % ATTACHED_MEDIA_LIST.length]
}

export function mediaForContainerName(name: string): string {
  const normalized = String(name || "").trim()
  if (normalized === "حاوية صغيرة") return ATTACHED_MEDIA.smallContainer
  if (normalized === "حاوية كبيرة") return ATTACHED_MEDIA.largeContainer
  if (normalized === "حاوية نفايات صغيرة") return ATTACHED_MEDIA.smallWaste
  if (normalized === "مكبس نفايات كهربائي") return ATTACHED_MEDIA.electricCompactor
  return ""
}

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