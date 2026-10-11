---
name: Production-like database testing
description: Keep synthetic lifecycle, driver, and financial tests out of the project's production-like SQLite database.
---

Treat `data/sabaik.db` as production data. Run synthetic requests, work orders, evidence, invoices, payments, and lifecycle tests only against an isolated SQLite backup; never use the source database as the test fixture.

**Why:** The user said this database will be used in production and asked that it be treated as production during testing.

**How to apply:** Use a consistent SQLite backup and point the test API at the copy. Verify key counts and preserved records before and after the test, clearly label all synthetic data, and remove the temporary copy after verification.
