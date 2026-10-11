---
name: SQLite WAL recovery
description: Safe recovery procedure for a corrupted SQLite database with active WAL files.
---

When the SQLite main file fails integrity checks, do not overwrite it with an older backup immediately. Preserve the main file plus its `-wal` and `-shm` files, run SQLite recovery into a separate database, and validate both `PRAGMA integrity_check` and important business counts before switching the runtime database.

**Why:** The WAL can contain newer customer, request, and contract data than the available full-file backups; blindly restoring an older snapshot can make the server start while silently losing recent work.

**How to apply:** Stop the API writer, keep timestamped copies of all database sidecars, and never copy a main file over an existing `-wal`/`-shm` pair. Recover or checkpoint to a temporary file, then replace the runtime database only after startup and representative API reads succeed.

For a portable audit snapshot, use SQLite's online backup API rather than copying the live database files. Normalize the snapshot itself to `journal_mode=DELETE`, close it, then verify integrity and checksum; only remove sidecars that belong to that verified snapshot. Never clean up the live source database's WAL/SHM files as part of backup cleanup.

**Why:** Opening a newly created snapshot for verification can create its own WAL/SHM sidecars. Treating those as pre-existing backups can either block cleanup or lead to unsafe deletion if the source and snapshot are confused.

**How to apply:** Keep source and snapshot paths explicit, checkpoint/normalize only the snapshot, close all snapshot handles before checking its directory, and preserve the source database's active journal files.