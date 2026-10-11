import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { entityPath } from "./friendly-slug.mjs";
import { normalizeBusinessText } from "./business-identity.mjs";
import { ARABIC_AREA_SLUGS, INDEXABLE_AREA_SLUGS } from "./seo-area-routes.mjs";

export const INDEXABILITY = Object.freeze({
  INDEXABLE: "INDEXABLE",
  NOINDEX_COMPATIBILITY: "NOINDEX_COMPATIBILITY",
  INTERACTIVE: "INTERACTIVE",
  ADMIN: "ADMIN",
  NOT_FOUND: "NOT_FOUND",
  SEPARATE_ARTIFACT: "SEPARATE_ARTIFACT",
});

export const STATIC_SEO_ROUTES = Object.freeze([
  ["/", "homepage"],
  ["/about", "about"],
  ["/pricing", "pricing"],
  ["/containers", "container-list"],
  ["/containers/debris", "container-category"],
  ["/containers/waste", "container-category"],
  ["/containers/contract", "container-category"],
  ["/services", "service-list"],
  ["/contact", "contact"],
  ["/partners", "partners"],
  ["/areas", "area-list"],
  ["/faq", "faq"],
  ["/terms", "legal"],
  ["/privacy", "legal"],
  ["/why-us/leadership", "why-us"],
  ["/why-us/what-we-do", "why-us"],
  ["/why-us/commitment", "why-us"],
  ["/why-us/experience", "why-us"],
  ["/blog", "blog-list"],
  ["/pages", "seo-page-index"],
]);

function tableExists(db, tableName) {
  return Boolean(db.prepare(
    "SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?",
  ).get(tableName));
}

function rows(db, sql) {
  try {
    return db.prepare(sql).all();
  } catch {
    return [];
  }
}

function dynamicEntry({
  path,
  pageType,
  id,
  title,
  artifact = "sabaik-almasa",
  indexability = INDEXABILITY.INDEXABLE,
  sitemapEligible = true,
}) {
  return {
    path,
    canonical: path,
    pageType,
    indexability,
    prerenderRequired: true,
    sitemapEligible,
    artifact,
    ...(id == null ? {} : { id }),
    ...(title ? { title } : {}),
  };
}

export function buildSeoInventory(db) {
  const entries = STATIC_SEO_ROUTES.map(([route, pageType]) => dynamicEntry({
    path: route,
    pageType,
  }));

  for (const [slug, arabic] of Object.entries(ARABIC_AREA_SLUGS)) {
    const indexable = INDEXABLE_AREA_SLUGS.has(slug);
    entries.push(dynamicEntry({
      path: `/areas/${arabic}`,
      pageType: "area",
      title: slug,
      indexability: indexable ? INDEXABILITY.INDEXABLE : INDEXABILITY.NOINDEX_COMPATIBILITY,
      sitemapEligible: indexable,
    }));
  }

  const services = rows(db, `
    SELECT id, title, seo_slug AS slug
    FROM services
    WHERE is_active = 1 AND seo_enabled = 1
    ORDER BY "order" ASC, id ASC
  `);
  for (const service of services) {
    entries.push(dynamicEntry({
      path: `/services/${entityPath({ slug: service.slug, title: service.title, id: service.id, fallback: "service" })}`,
      pageType: "service",
      id: service.id,
      title: service.title,
    }));
  }

  const packageTable = tableExists(db, "packages") ? "packages" : "containers";
  const packages = rows(db, `
    SELECT id, name AS title, seo_slug AS slug
    FROM "${packageTable}"
    WHERE is_active = 1 AND seo_enabled = 1
    ORDER BY "order" ASC, id ASC
  `);
  for (const item of packages) {
    entries.push(dynamicEntry({
      path: `/containers/${entityPath({ slug: item.slug, title: item.title, id: item.id, fallback: "container" })}`,
      pageType: "package",
      id: item.id,
      title: item.title,
    }));
  }

  const posts = rows(db, `
    SELECT id, title, slug, seo_slug AS seoSlug
    FROM posts
    WHERE status = 'published' AND is_active = 1
      AND ((slug IS NOT NULL AND slug != '') OR (seo_slug IS NOT NULL AND seo_slug != ''))
    ORDER BY published_at DESC, id DESC
  `);
  for (const post of posts) {
    entries.push(dynamicEntry({
      path: `/blog/${entityPath({ slug: post.slug || post.seoSlug, title: post.title, id: post.id, fallback: "post" })}`,
      pageType: "article",
      id: post.id,
      title: post.title,
    }));
  }

  const seoPages = rows(db, `
    SELECT id, title, slug
    FROM seo_pages
    WHERE status = 'published' AND is_active = 1 AND slug IS NOT NULL AND slug != ''
    ORDER BY published_at DESC, id DESC
  `);
  for (const page of seoPages) {
    entries.push(dynamicEntry({
      path: `/page/${entityPath({ slug: page.slug, title: page.title, id: page.id, fallback: "page" })}`,
      pageType: "seo-page",
      id: page.id,
      title: page.title,
    }));
  }

  entries.push({
    path: "/cleanflow-platform/",
    canonical: "/cleanflow-platform/",
    pageType: "platform",
    indexability: INDEXABILITY.SEPARATE_ARTIFACT,
    prerenderRequired: false,
    sitemapEligible: false,
    artifact: "cleanflow-platform",
  });

  return entries;
}

export function normalizeInventoryPath(value) {
  try {
    const url = new URL(value, "https://sabaik.net");
    let pathname = decodeURIComponent(url.pathname);
    pathname = pathname.replace(/\/+$/u, "") || "/";
    return `${pathname}${url.search}`;
  } catch {
    return String(value || "").replace(/\/+$/u, "") || "/";
  }
}

export function inventoryJson(entries, siteUrl) {
  const canonical = entries
    .filter((entry) => entry.indexability === INDEXABILITY.INDEXABLE)
    .map((entry) => `${siteUrl}${normalizeInventoryPath(entry.canonical)}`);
  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    siteUrl,
    entries,
    indexableRoutes: [...new Set(canonical)].sort(),
  };
}

export function writeSeoInventory(root, db, siteUrl, mediaPaths = []) {
  const entries = buildSeoInventory(db);
  const settingsRows = db.prepare(`
    SELECT key, value FROM site_settings
    WHERE key IN ('company_name', 'company_name_en', 'company_phone_call', 'company_phone_whatsapp')
  `).all();
  const settings = Object.fromEntries(settingsRows.map(({ key, value }) => [key, String(value || "").trim()]));
  const identity = {
    companyName: settings.company_name || "",
    companyNameEnglish: settings.company_name_en || "",
    call: settings.company_phone_call || "",
    whatsapp: settings.company_phone_whatsapp || "",
  };
  const normalizedEntries = JSON.parse(normalizeBusinessText(JSON.stringify(entries), identity));
  const destination = join(root, "artifacts", "sabaik-almasa", "public", "seo-inventory.json");
  writeFileSync(destination, JSON.stringify(inventoryJson(normalizedEntries, siteUrl), null, 2) + "\n", "utf8");
  const mediaDestination = join(root, "artifacts", "sabaik-almasa", "public", "seo-media-manifest.json");
  const uniqueMediaPaths = [...new Set(mediaPaths
    .filter((value) => typeof value === "string" && value.trim())
    .map((value) => value.trim()))];
  writeFileSync(mediaDestination, JSON.stringify({
    version: 2,
    generatedAt: new Date().toISOString(),
    siteUrl,
    source: "images referenced by the current sitemap",
    assets: uniqueMediaPaths.map((path, index) => ({
      key: `rendered-${index + 1}`,
      path,
      purpose: "Image referenced by current managed content",
      pages: [],
      required: false,
    })),
  }, null, 2) + "\n", "utf8");
  return entries;
}

export function readSeoInventory(file) {
  if (!existsSync(file)) return null;
  try {
    const parsed = JSON.parse(readFileSync(file, "utf8"));
    return parsed && Array.isArray(parsed.entries) ? parsed : null;
  } catch {
    return null;
  }
}