export type ContainerVisualStatus =
  "available" | "rented" | "maintenance" | "other";

const statusImages: Record<
  ContainerVisualStatus,
  { webp: string; fallback: string }
> = {
  available: {
    webp: "/images/container-small.png",
    fallback: "/images/container-small.png",
  },
  rented: {
    webp: "/images/container-large.png",
    fallback: "/images/container-large.png",
  },
  maintenance: {
    webp: "/images/electric-compactor.jpeg",
    fallback: "/images/electric-compactor.jpeg",
  },
  other: {
    webp: "/images/waste-small.png",
    fallback: "/images/waste-small.png",
  },
};

const statusImageDimensions: Record<
  ContainerVisualStatus,
  { width: number; height: number }
> = {
  available: { width: 1200, height: 600 },
  rented: { width: 1200, height: 596 },
  maintenance: { width: 1200, height: 600 },
  other: { width: 1200, height: 600 },
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
