---
name: Hostinger FTP TLS validation
description: Safe deployment behavior when a Hostinger FTP alias resolves but its explicit-FTPS certificate names another host.
---

Hostinger uploads must use explicit FTPS with normal certificate verification. A DNS-resolving FTP alias whose certificate names a different host is not safe to deploy through by disabling verification or switching to plaintext FTP.

**Why:** The FTP control endpoint can be reachable while the alias is misconfigured for TLS, and accepting the mismatch would expose the deployment credential during archive transfer.

**How to apply:** Treat the exact Hostinger FTP hostname and certificate identity as a deployment prerequisite; if either the admin connection test or the public site times out, report deployment as blocked and do not claim live verification.