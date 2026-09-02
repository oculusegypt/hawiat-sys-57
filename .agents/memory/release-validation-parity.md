---
name: Release validation parity
description: How to interpret local Hostinger archive gates alongside probes of the currently published site.
---

The generated Hostinger archive is the release candidate; a live-site probe measures whatever version is currently published and may legitimately disagree until deployment completes.

**Why:** A production probe can show older sitemap counts, redirects, or page content even when the current source, archive, and static SEO gates are internally consistent.

**How to apply:** Report local archive readiness and live-site parity as separate verdicts, and do not call the live site updated until the archive is published and the probe is rerun.