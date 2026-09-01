export type ContainerVisualStatus =
  "available" | "rented" | "maintenance" | "other";

const statusImages: Record<
  ContainerVisualStatus,
  { webp: string; fallback: string }
> = {
  available: {
    webp: "/images/container-status-available.webp",
    fallback: "/images/container-status-available.webp",
  },
  rented: {
    webp: "/images/container-status-rented.webp",
    fallback: "/images/container-status-rented.webp",
  },
  maintenance: {
    webp: "/images/container-status-maintenance.webp",
    fallback: "/images/container-status-maintenance.webp",
  },
  other: {
    webp: "/images/container-status-other.webp",
    fallback: "/images/container-status-other.webp",
  },
};

const statusImageDimensions: Record<
  ContainerVisualStatus,
  { width: number; height: number }
> = {
  available: { width: 1600, height: 800 },
  rented: { width: 1600, height: 795 },
  maintenance: { width: 1536, height: 1024 },
  other: { width: 1600, height: 800 },
};

export function getContainerVisualStatus(
  status: unknown,
): ContainerVisualStatus {
  const value = String(status ?? "").toLowerCase();
  if (["available", "متاحة", "متاح", "ready", "جاهزة"].includes(value))
    return "available";
  if (["maintenance", "صيانة", "inspection", "تحت الفحص"].includes(value))
    return "maintenance";
  if (
    [
      "rented",
      "with_customer",
      "مؤجرة",
      "لدى العميل",
      "reserved",
      "محجوزة",
    ].includes(value)
  )
    return "rented";
  return "other";
}

export function getContainerStatusImage(status: unknown): string {
  return statusImages[getContainerVisualStatus(status)].webp;
}

export function getContainerStatusFallbackImage(status: unknown): string {
  return statusImages[getContainerVisualStatus(status)].fallback;
}

export function getContainerStatusImageDimensions(status: unknown): {
  width: number;
  height: number;
} {
  return statusImageDimensions[getContainerVisualStatus(status)];
}
