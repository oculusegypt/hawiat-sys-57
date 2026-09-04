export type RequestCategory = "debris" | "waste" | "contract"

export const DEBRIS_RENTAL_DURATION = "حتى امتلاء الحاوية أو 10 أيام، أيهما أقرب"
export const RECURRING_REQUEST_DURATIONS = ["شهري", "سنوي"] as const

export const REQUEST_CATEGORY_OPTIONS: Array<{
  id: RequestCategory
  label: string
  description: string
}> = [
  {
    id: "debris",
    label: "طلب حاوية أنقاض",
    description: "حاويات مخلفات الهدم والبناء والترميم",
  },
  {
    id: "waste",
    label: "طلب حاوية نفايات",
    description: "حاويات النفايات للمحلات والمنشآت",
  },
  {
    id: "contract",
    label: "طلب عقد نظافة",
    description: "عقود النظافة الشهرية والسنوية",
  },
]

export const REQUEST_CATEGORY_LABELS: Record<RequestCategory, string> = {
  debris: "حاويات الأنقاض",
  waste: "حاويات النفايات",
  contract: "عقود النظافة",
}

export function getRequestCategory(value?: string | null): RequestCategory {
  const text = String(value || "").trim().toLowerCase()
  if (text === "contract" || /عقد|عقود|نظافة|رخص/.test(text)) return "contract"
  if (text === "waste" || /نفايات|مكبس|مطاعم|منشآت|تجاري/.test(text)) return "waste"
  if (text === "debris" || /أنقاض|هدم|بناء|ترميم/.test(text)) return "debris"
  return "debris"
}

export function getRequestDurationOptions(category: RequestCategory): string[] {
  return category === "debris"
    ? [DEBRIS_RENTAL_DURATION]
    : [...RECURRING_REQUEST_DURATIONS]
}

export function getDefaultRequestDuration(category: RequestCategory): string {
  return getRequestDurationOptions(category)[0]
}