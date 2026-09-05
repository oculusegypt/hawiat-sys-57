---
name: Container category registry
description: Durable rules for centralizing container categories and sizes without breaking legacy records.
---

Official container categories and sizes are referenced by record IDs, while legacy payloads may still contain only human-readable names.

**Why:** Existing SQLite data and older seed fixtures were created before the registry links existed, so a hard cutover would hide valid sizes or reject historical records.

**How to apply:** New and edited records should validate active category/size IDs and copy canonical names into their payloads. Backfills and seed data should preserve the old text and add IDs when the match is unambiguous; UI filters should tolerate legacy name-only size records.