---
name: Demo asset seed legacy keys
description: Safe migration rules for expanding demo assets without touching unrelated records.
---

Demo seeders that support an older key must only use the legacy fallback when that fallback key is non-empty.

**Why:** An empty legacy key matches every record missing a demo key, so a repeated seed can overwrite unrelated operational assets instead of creating the requested demo records.

**How to apply:** Use a current per-asset key for every generated record, gate legacy matching with a truthy key, and verify counts plus representative non-demo records after expanding a seed set.