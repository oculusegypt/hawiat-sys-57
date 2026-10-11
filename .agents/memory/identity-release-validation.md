---
name: Business identity release validation
description: Release checks for business-name and contact-number changes across dynamic and static outputs.
---

The business identity settings are the single source of truth for public name, contact details, logo, metadata, and structured data. Validate runtime UI and generated outputs together; do not bulk-rewrite editor-authored CMS records during an identity update.

The public SEO origin is permanently fixed to `https://sabaik.net`. Never derive it from a preview/runtime host or an editable page setting; canonical, Open Graph, sitemap, prerendered HTML, and Hostinger artifacts must retain this origin.

CleanFlow Platform is a separate product brand and must not be replaced with the services company's company_name setting; its public contact channels may still use configured contact data.

**Why:** The database settings can be correct while client-rendered content, structured data, manifests, AI-discovery files, or shared-hosting fallbacks still expose an old identity. Rewriting stored editorial content can also overwrite intentional admin-authored copy. Database-selected media can still contain names or phone numbers baked into image pixels. The user confirmed that CleanFlow Platform remains an independent product name and explicitly required the public origin to remain fixed.

**How to apply:** Keep `https://sabaik.net` as the production origin regardless of preview/runtime host or page settings. After identity edits, compare visible UI, API settings, schema, contact links, logo references, manifest, sitemap, llms.txt, PHP output, and final archive against the configured values. Keep the separate platform brand intact, inspect public media for text embedded in pixels, and remember render-time normalization cannot update it. Normalize legacy references at render time and preserve source content unless the user explicitly requests a content migration.