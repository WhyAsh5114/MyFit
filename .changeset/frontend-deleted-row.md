---
'@myfit/frontend': patch
---

Use the row returned by `delete()` to invalidate the food diary. Preserve the ownership check in a tracked transaction so rejected deletions leave the row and outbox unchanged. Update the client and sync packages to the compatible patch releases.
