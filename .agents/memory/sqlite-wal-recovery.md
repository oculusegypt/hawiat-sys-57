---
name: SQLite WAL recovery
description: Safe recovery procedure for a corrupted SQLite database with active WAL files.
---

When the SQLite main file fails integrity checks, do not overwrite it with an older backup immediately. Preserve the main file plus its `-wal` and `-shm` files, run SQLite recovery into a separate database, and validate both `PRAGMA integrity_check` and important business counts before switching the runtime database.

**Why:** The WAL can contain newer customer, request, and contract data than the available full-file backups; blindly restoring an older snapshot can make the server start while silently losing recent work.

**How to apply:** Stop the API writer, keep timestamped copies of all corrupt database files, recover to a temporary file, start the API against that file on a temporary port, then replace the runtime database only after startup and representative API reads succeed.