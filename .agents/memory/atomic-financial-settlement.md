---
name: Atomic financial settlement
description: Keep operational container payments, invoice allocations, and financial-core postings consistent.
---

A settlement is successful only when the operational payment, invoice/contract/deposit updates, and financial-core posting commit in the same database transaction. Exact retries must return the already-posted result before checking whether its accounting period is now closed.

A posted deposit is not a bank reconciliation. Create its reconciliation row as `unmatched`; mark it matched only after an external bank statement or verified statement reference has been reviewed.

**Why:** Saving the operational payment first can leave an orphaned collection when the ledger rejects the posting; checking the closed period before recognizing an exact retry can turn a successful payment into a false failure; matching a deposit without bank-side evidence makes the books appear reconciled without proof.

**How to apply:** In Node/SQLite, call the in-transaction posting helper from the route's existing transaction rather than opening a nested transaction. In PHP/PDO, keep `hsPostFinancialCore` inside the outer settlement transaction and preserve the source-transaction idempotency check ahead of period validation. Keep Node and PHP reconciliation flows aligned, and require reviewed statement evidence before a matched status.
