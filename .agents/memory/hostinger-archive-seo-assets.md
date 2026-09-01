---
name: Hostinger archive SEO assets
description: Why the Hostinger release archive includes a converted stable logo asset.
---

The Hostinger archive must include `images/logo.png` as a stable, local SEO asset. The configured site logo may be stored as an uploaded WebP, so the build converts it to PNG rather than relying on a misleading file extension or an external URL.

**Why:** Static-hosting validation and legacy SEO consumers expect the stable PNG path, while Hostinger serves the archive without the Node runtime.

**How to apply:** Preserve the conversion step whenever the logo storage format or upload filename changes, and fail the build if the configured source logo is missing.