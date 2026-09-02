---
name: Production live cache and routing
description: Live Hostinger behavior can differ from Express expectations for auth caching and Arabic route redirects.
---

Token-scoped API responses must be explicitly non-cacheable, and production probes must follow redirects while checking the final body and canonical. The live Hostinger layer has returned cached API responses for different authorization states and corrupts percent-encoded UTF-8 bytes in external Arabic redirect Location headers.

**Why:** A successful origin request is not sufficient evidence when a reverse proxy can reuse a response without varying on Authorization, or when rewrite rules replace an Arabic route with the homepage.

**How to apply:** For every authenticated GET, test both the canonical URL and a cache-busted URL, inspect Cache-Control/Vary, and compare the final HTML—not just the initial status—against the approved SSG output. Generate Arabic external redirects with decoded UTF-8 targets so Hostinger/Apache performs the escaping instead of embedding `%D9%..` bytes directly.