---
name: Atomic financial settlement
description: Keep operational container payments, invoice allocations, and financial-core postings consistent.
---

A settlement is successful only when the operational payment, invoice/contract/deposit updates, and financial-core posting commit in the same database transaction. Exact retries must return the already-posted result before checking whether its accounting period is now closed.

**Why:** Saving the operational payment first can leave an orphaned collection when the ledger rejects the posting; checking the closed period before recognizing an exact retry can also turn a successful earlier payment into a false failure.

**How to apply:** In Node/SQLite, call the in-transaction posting helper from the route's existing transaction rather than opening a nested transaction. In PHP/PDO, keep `hsPostFinancialCore` inside the outer settlement transaction and preserve the source-transaction idempotency check ahead of period validation.
