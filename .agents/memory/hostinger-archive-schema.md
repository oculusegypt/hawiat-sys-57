---
name: Hostinger archive schema
description: The compatibility boundary between the Node schema, the archived SQLite database, and the PHP API.
---

Before packaging a Hostinger release, the archived SQLite database must contain every column referenced by the PHP API, including newly added optional content fields.

**Why:** Hostinger runs the PHP API without the Node/Drizzle migration process; copying an older database can make an otherwise valid archive fail when a new field is read or written.

**How to apply:** Make schema compatibility checks or additive migrations part of the archive build before the database is copied, and verify the packaged database separately.