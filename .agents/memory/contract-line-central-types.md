---
name: Contract line central types
description: Durable rule for rental-line templates, contracts, and invoice consistency.
---

New rental-line templates must reference an active central container type by ID, while retaining canonical name, category, size, capacity, and pricing snapshots for historical readability.

**Why:** Contract categories are determined by the central package registry, and invoices must not drift from the line selected when a contract is created.

**How to apply:** Keep template records reusable when they have no contract link. When a contract is created, copy the selected line into a contract-linked record inside the contract transaction and derive the first invoice line from that copied record. Preserve legacy name-only payloads through unambiguous enrichment rather than rejecting historical records.