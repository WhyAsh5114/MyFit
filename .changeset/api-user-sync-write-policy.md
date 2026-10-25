---
'@myfit/api': patch
---

Use the SQL sync adapter’s model write policy to restrict synced User writes to profile and auto-update preferences. Reject authentication field changes and account creation or deletion before applying a push batch.
