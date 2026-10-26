---
name: Early work-order completion
description: User-confirmed scheduling behavior for driver work orders.
---

Allow drivers to complete work orders before `scheduledAt` without an additional time restriction.

**Why:** The user explicitly chose unrestricted early completion on 2026-10-26; future completion is not, by itself, an invalid state.

**How to apply:** Do not add an early-completion gate or mandatory override reason based only on the scheduled time. Keep unrelated proof, assignment, and lifecycle validations intact.
