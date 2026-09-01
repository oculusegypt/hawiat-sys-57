import type { Container } from "@workspace/api-client-react"

export function getActiveContainers(containers: Container[] | undefined): Container[] {
  return (containers ?? [])
    .filter((container) => container.isActive)
    .sort((a, b) => a.order - b.order)
}

export function getContainerValue(container: Container): string {
  return `${container.name}${container.size ? ` (${container.size})` : ""}`
}

export function getContainersForService(
  containers: Container[] | undefined,
  serviceType: string,
): Container[] {
  const active = getActiveContainers(containers)
  const st = typeof serviceType === "string"
    ? serviceType
    : (serviceType && typeof serviceType === "object" ? (serviceType as any).name || (serviceType as any).title || "" : String(serviceType || ""))

  if (st.includes("أنقاض") || st.includes("هدم") || st.includes("ردم") || st.includes("تكسير")) {
    return active.filter((container) => container.category === "debris")
  }
  if (st.includes("نفايات") || st.includes("مكبس") || st.includes("مطاعم") || st.includes("منشآت")) {
    return active.filter((container) => container.category === "waste")
  }
  if (st.includes("عقد") || st.includes("عقود")) {
    return active.filter((container) => container.category === "contract")
  }
  return active
}