---
name: Hostinger PHP signing secret
description: Constraint for signing authenticated PHP sessions and public tracking tokens in Hostinger archives.
---

Hostinger PHP cannot rely on Replit environment variables; the archive build must replace one signing-secret placeholder with a stable per-archive value, and source-side fallback detection must not compare against the placeholder more than once.

**Why:** The build step replaces every occurrence of the placeholder. Reusing that marker in a comparison rewrites the comparison too, making the embedded secret appear invalid and causing valid login to return 500 at token generation.

**How to apply:** Keep the placeholder in the embedded-secret assignment only, detect a generated value by its fixed format/length, and test a valid login with the PHP process environment empty after each archive build.