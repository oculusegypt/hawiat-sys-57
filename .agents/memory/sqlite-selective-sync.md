---
name: Selective SQLite sync
description: Durable guidance for copying a live SQLite database while preserving project-owned records.
---

For a selective live-database sync, define the exclusions explicitly before writing: preserve the requested project tables, their dependent audit/history tables, and primary-key identity; copy every other table from the live source.

**Why:** A UI feature can span multiple SQLite tables, and replacing only its visible table can leave audit rows or references pointing at records from a different database snapshot.

**How to apply:** Take a consistent SQLite backup first, stop the database writer, copy only the allowlisted non-excluded tables in one transaction, then verify source hashes for imported tables and backup hashes for preserved tables.