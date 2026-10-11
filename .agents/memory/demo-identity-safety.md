---
name: Production-like demo identity safety
description: Avoid customer sync collisions when creating demo requests in a shared or production-like database.
---

Unverified intake phone numbers must never be used to link or overwrite an existing customer profile. Create a request-specific provisional customer and site, mark identity review as pending, and leave any existing links and customer data unchanged until a person verifies identity.

**Why:** A demo request matched an existing customer after phone normalization; its prior payload and timestamp had to be restored from backup, and the newly created site had to be archived.

**How to apply:** Apply this rule to public forms, AI/chat intake, and backfills in both Node and PHP. Tests must use an isolated database and synthetic contact data; assert that a same-phone existing customer remains byte-for-byte unchanged and that the provisional site belongs only to the new request. Any later identity merge needs explicit verification and an audit trail.
