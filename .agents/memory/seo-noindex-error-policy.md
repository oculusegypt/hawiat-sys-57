---
name: SEO noindex error policy
description: How dynamic SEO pages should handle API failures without accidentally blocking search indexing.
---

Dynamic public pages must emit `noindex` only after a confirmed 404 or an explicitly non-indexable route; transient network failures, 5xx responses, and malformed temporary responses must not change an indexable page to `noindex`.

**Why:** Search crawlers can encounter short-lived API or rendering failures. Treating every fetch failure as “page missing” can permanently suppress otherwise valid URLs that are present in the sitemap.

**How to apply:** Keep the prerendered indexable metadata intact during temporary failures, and reserve `noindex, follow` for confirmed missing resources and deliberate compatibility/alias routes.