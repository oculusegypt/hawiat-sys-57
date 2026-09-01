/**
 * Public uploaded files live at the web root on Hostinger.
 *
 * `/api/uploads` is reserved for upload actions (POST). It is not the public
 * filesystem URL, so API responses must never expose `/api/uploads/<file>`.
 */
export function normalizePublicUploadPath(value: string): string {
  return value.replace(/\/api\/uploads\//g, "/uploads/");
}

export function normalizePublicUploadUrls<T>(value: T): T {
  if (typeof value === "string") {
    return normalizePublicUploadPath(value) as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => normalizePublicUploadUrls(item)) as T;
  }
  if (value && typeof value === "object") {
    const normalized = Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .map(([key, item]) => [key, normalizePublicUploadUrls(item)]),
    );
    return normalized as T;
  }
  return value;
}