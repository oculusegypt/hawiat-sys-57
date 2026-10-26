---
name: Container operation classification
description: Prevent a pickup or return request from being classified as an emptying operation.
---

For `/api/admin/service-requests/from-contract`, keep `serviceType` for pickup/return semantically unambiguous. The classifier checks for `تفريغ|empty` before it checks for `استرجاع|سحب|pickup|return`; a string such as “استرجاع بعد التفريغ” becomes an emptying operation. Verify the returned work-order operation and final movement type before treating the asset as returned.

**Why:** On 2026-10-26, a test pickup label containing “بعد التفريغ” created a second operational-only emptying movement. The work order completed, but the contract remained delivered and the asset remained rented.

**How to apply:** Use a service type such as “سحب الحاوية” without any emptying wording. Do not edit the posted movement; create a correctly typed, evidence-backed pickup if the contract and asset still show delivered/rented. See the [dated live test record](../../docs/container-lifecycle-live-test-2026-10-26.md) for the run state and identifiers.
