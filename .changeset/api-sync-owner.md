---
'@myfit/api': patch
---

Reject sync requests when their local database owner differs from the authenticated account. Allow the owner header through CORS so a login change in another tab cannot pull data into the previous account's database.
