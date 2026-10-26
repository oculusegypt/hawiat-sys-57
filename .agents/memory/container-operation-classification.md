---
name: Container operation classification
description: Prevent a pickup or return request from being classified as an emptying operation.
---

For `/api/admin/service-requests/from-contract`, reject descriptions that mix pickup/return with emptying. Persist one explicit `operationType` and use that same value through completion and movement creation; never infer two simultaneous operations from one description. Ambiguous legacy records must not be completed as either operation without confirming their intended type.

**Why:** On 2026-10-26, a test pickup label containing “بعد التفريغ” created an operational-only emptying movement. The work order completed, but the contract remained delivered and the asset remained rented. A single explicit operation avoids repeating that state mismatch.

**How to apply:** For new operations, require a clear single-purpose description and carry the resulting enum through the API. For legacy records, inspect contract/asset links and evidence before acting. Do not edit posted movements; create a correctly typed, evidence-backed pickup only when the physical return is confirmed. See the [dated live test record](../../docs/container-lifecycle-live-test-2026-10-26.md) for the run state and identifiers.
