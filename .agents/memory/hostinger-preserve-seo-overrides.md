---
name: Archive-only SEO titles
description: Keep archive-only metadata corrections aligned across static pages and packaged SQLite while preserving source data.
---

In a preservation-mode Hostinger build, a deliberately changed SEO title must stay consistent in the prerendered page title, its Open Graph and Twitter titles, and the packaged SQLite row. Do not apply that override to the source database.

**Why:** Static pages are prerendered before the final Hostinger database is assembled; changing only one representation leaves metadata inconsistent or causes the release gate to fail.

**How to apply:** For an approved archive-only SEO adjustment, update the same title in generated HTML and the packaged database, verify the source database and media remain unchanged, then rerun the SEO gate.
