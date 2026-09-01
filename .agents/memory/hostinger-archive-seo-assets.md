---
name: Hostinger archive SEO assets
description: Why the Hostinger release archive includes a converted stable logo asset.
---

The Hostinger archive must include `images/logo.png` as a stable, local SEO asset. The configured site logo may be stored as an uploaded WebP, so the build converts it to PNG rather than relying on a misleading file extension or an external URL.

**Why:** Static-hosting validation and legacy SEO consumers expect the stable PNG path, while Hostinger serves the archive without the Node runtime.

**How to apply:** Preserve the conversion step whenever the logo storage format or upload filename changes, and fail the build if the configured source logo is missing.

The Hostinger PHP bundle must remain parseable on PHP 7.4+, and the marketing
platform is shipped only at `/cleanflow-platform/`; release validation must
check that path rather than reviving the former product path.

**Why:** Shared-hosting deployments can fail with an empty 500 before exception
handling when a PHP 8-only token is parsed, and the old platform directory
caused the release gate to validate an archive that should no longer exist.

**How to apply:** Keep PHP API syntax at the 7.4 compatibility floor, use
polyfills for newer string helpers, and keep the archive builder, SEO inventory,
and SEO gate on the same current platform path.