---
name: Replit preview manifest Shield
description: Replit preview behavior for valid manifest.json requests and misleading browser console warnings.
---

The Replit preview proxy can redirect a same-origin `/manifest.json` request through `replit.com/__replshield`; the Shield response may be `401` and lack CORS headers even when the app serves the manifest directly with `200 application/json`.

**Why:** This is a preview-platform authentication/proxy behavior, not an application endpoint failure. Removing the manifest link would hide the warning but would also disable the site's PWA install metadata.

**How to apply:** Verify the manifest directly on the app preview host and on the production host before changing the app. Treat the Shield `401`/CORS console entries as preview noise unless the direct manifest request fails.