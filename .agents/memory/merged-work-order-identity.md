---
name: Merged work-order identity
description: Keep legacy service requests distinct from operational work orders in shared admin and driver queues.
---

Treat the identity of a merged work item as `(recordType, id)`, not as a numeric ID alone. Legacy `service_request` rows and operational `work_order` records allocate IDs independently, so the same number can refer to different work.

**Why:** An ID-only assignment or driver status update can mutate the wrong record when the two sources collide. This also affects cached/offline actions and combined lists.

**How to apply:** Include `recordType` in merged API responses and every assignment/status mutation. Key UI actions and offline queue entries by type plus ID; reject an untyped mutation with a conflict when both records exist.
