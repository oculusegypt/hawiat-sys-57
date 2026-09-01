export const ATTACHED_MEDIA = {
  smallContainer: "/images/container-small.png",
  largeContainer: "/images/container-large.png",
  smallWaste: "/images/waste-small.png",
  electricCompactor: "/images/electric-compactor.jpeg",
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