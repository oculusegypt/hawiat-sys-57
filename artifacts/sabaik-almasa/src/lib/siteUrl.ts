/** The canonical origin is fixed for this installation and never follows the browser or settings. */
export const PUBLIC_SITE_URL = "https://sabaik.net"

export function setSitePublicUrl(_value: string | null | undefined): void {
  if (typeof document === "undefined") return
  let meta = document.querySelector("meta[name='site-public-url']") as HTMLMetaElement | null
  if (!meta) {
    meta = document.createElement("meta")
    meta.name = "site-public-url"
    document.head.appendChild(meta)
  }
  meta.content = PUBLIC_SITE_URL
}

export function getSiteUrl(): string {
  return PUBLIC_SITE_URL
}

export function siteUrl(path = "/"): string {
  const normalized = path.startsWith("/") ? path : `/${path}`
  const origin = getSiteUrl()
  return `${origin}${normalized}`
}

/** Keep externally supplied internal URLs on the current public origin. */
export function sitePath(value: string | null | undefined): string {
  if (!value) return "/"
  try {
    const url = new URL(value)
    return `${url.pathname}${url.search}${url.hash}` || "/"
  } catch {
    // Relative values are already suitable for the current origin.
  }
  return value
}