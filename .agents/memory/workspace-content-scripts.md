---
name: Workspace content scripts
description: Runtime conventions for standalone scripts that read or seed the shared SQLite database.
---

Standalone content scripts must resolve the SQLite database relative to the workspace root and load workspace-owned dependencies explicitly when the scripts package does not declare them.

**Why:** Running a script directly from the workspace does not guarantee dependency resolution from another package, and an incorrect relative path can silently target a nonexistent sibling database.

**How to apply:** Before treating a content seeder as complete, run it directly from the workspace root and verify both its database path and its final count query.