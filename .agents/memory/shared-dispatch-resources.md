---
name: Shared dispatch resources
description: Scheduling and assignment constraints spanning service requests and container work orders.
---

Service requests and container work orders draw from the same driver and vehicle pool. Assignment checks must normalize both record types into scheduled windows and reject overlapping active work for the same driver or vehicle; terminal work does not reserve a resource.

**Why:** The records live in separate operational tables, but they represent real assignments on the same calendar. Checking only one table permits double-booking when work is split across the two workflows.

**How to apply:** Keep the Node and Hostinger PHP assignment paths aligned whenever schedule, duration, status, or resource-assignment behavior changes.
