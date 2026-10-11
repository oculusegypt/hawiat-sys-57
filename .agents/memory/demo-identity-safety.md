---
name: Production-like demo identity safety
description: Avoid customer sync collisions when creating demo requests in a shared or production-like database.
---

For production-like database tests, do not assume a familiar demo mobile number is reserved. Customer sync normalizes phone formats, so a test value can match a stored customer, overwrite fields from the submitted request, and create a customer-site row under the matched profile.

**Why:** A demo request matched an existing customer after phone normalization; its prior payload and timestamp had to be restored from backup, and the newly created site had to be archived.

**How to apply:** Take a database backup first. Use a non-dialable synthetic contact with no digits, pre-create clearly tagged demo customer/site records, and verify the request links to those exact records before creating contracts or financial entries. Check for unintended customer/site rows immediately after intake.
