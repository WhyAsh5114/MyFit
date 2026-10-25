---
'@myfit/frontend': patch
---

Sync pending edits before explicit logout, then delete the local account database and clear query caches. Offer retry, cancel, or explicit discard when logout cannot finish. Keep offline edits on session expiry and isolate each account's storage.
