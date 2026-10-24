---
'@myfit/frontend': patch
---

Handle missing food entries with the exported Prisma error class. Refresh the owner's cached diary queries and show a localized message when deletion fails with P2025; keep other failures on the existing error path.
