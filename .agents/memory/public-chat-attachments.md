---
name: Public chat attachments
description: Security boundary for visitor-uploaded chat images.
---

Visitor chat attachments are public-facing functionality, so they use the shared image signature/type validation and compression pipeline with a strict per-IP rate limit. Admin uploads remain permission-protected, and driver evidence remains private and signed.

**Why:** Visitors need to send photos before authentication, but an unrestricted upload endpoint would create a storage-abuse risk and would blur the separation between public chat media and private operational evidence.

**How to apply:** Keep public uploads limited to images, enforce size and rate limits, and never reuse the public endpoint for driver proofs or other sensitive files.