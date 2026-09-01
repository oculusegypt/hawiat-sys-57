/**
 * Resolve the public origin used by generated SEO and deployment files.
 *
 * This installation has one production origin. Keep it independent from
 * editable site settings and preview hosts so generated URLs always point to
 * the Hostinger domain selected for the release.
 */
export const PUBLIC_SITE_ORIGIN = "https://sabaik.net";
const NON_PUBLIC_HOST = /(^|\.)(localhost|127\.0\.0\.1|0\.0\.0\.0)$/i;
const REPLIT_HOST = /(^|\.)replit\.(dev|app)$/i;

export function normalizePublicOrigin(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";

  try {
    const url = new URL(raw);
    if (!["http:", "https:"].includes(url.protocol)) return "";
    if (!url.hostname || NON_PUBLIC_HOST.test(url.hostname) || REPLIT_HOST.test(url.hostname)) return "";
    return url.origin;
  } catch {
    return "";
  }
}

export function resolvePublicOrigin({ settings = {}, env = process.env } = {}) {
  return PUBLIC_SITE_ORIGIN;
}

export function requirePublicOrigin(options = {}) {
  const origin = resolvePublicOrigin(options);
  if (!origin) {
    throw new Error(
      `The fixed public HTTPS origin is invalid: ${PUBLIC_SITE_ORIGIN}`,
    );
  }
  return origin;
}