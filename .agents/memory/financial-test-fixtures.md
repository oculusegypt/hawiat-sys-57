---
name: Financial test fixtures
description: Requirements for isolated Financial Core certification databases and closed-period assertions.
---

Financial Core tests must initialize the complete Drizzle schema before importing the database module, and closed-period reversal assertions must post and close a period matching the reversal date.

**Why:** The database module performs startup work against tables beyond the financial ledger, while reversal dates use the current date rather than the original transaction date.

**How to apply:** Use an isolated schema push for each financial test database and create a current-period fixture when testing rejection after period closure.