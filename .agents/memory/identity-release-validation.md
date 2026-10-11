---
name: Business identity release validation
description: Release checks for business-name and contact-number changes across dynamic and static outputs.
---

The business identity settings are the single source of truth for public name, contact details, logo, metadata, and structured data. Validate runtime UI and generated outputs together; do not bulk-rewrite editor-authored CMS records during an identity update.

**Why:** The database settings can be correct while client-rendered content, structured data, manifests, AI-discovery files, or shared-hosting fallbacks still expose an old identity. Rewriting stored editorial content can also overwrite intentional admin-authored copy. Database-selected media can still contain names or phone numbers baked into image pixels.

**How to apply:** After identity edits, compare visible UI, API settings, schema, contact links, logo references, manifest, sitemap, llms.txt, PHP output, and final archive against the configured values. Inspect public media for text embedded in pixels; render-time normalization cannot update it. Normalize legacy references at render time and preserve source content unless the user explicitly requests a content migration.