---
name: Business identity release validation
description: Release checks for business-name and contact-number changes across dynamic and static outputs.
---

Business identity changes must be validated in both the database/API and every generated or manually maintained public artifact, especially llms.txt and shared-hosting PHP fallbacks.

**Why:** The runtime settings can be correct while static AI-discovery files or fallback handlers still expose an obsolete brand or phone number.

**How to apply:** After identity edits, scan generated HTML, sitemap, llms.txt, PHP output, and the final archive for legacy values, then rerun the release SEO gate.