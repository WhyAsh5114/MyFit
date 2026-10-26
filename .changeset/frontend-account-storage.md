---
'@myfit/frontend': patch
---

Sync pending edits before explicit logout, then delete the local account database and clear query caches. Offer retry, cancel, or explicit discard when logout cannot finish. Explicit retries send pending edits immediately. Keep offline edits on session expiry in a single database. Require an explicit deletion decision before another account can use that database.

Refresh the auth session before deleting local data so a stale session cannot reopen the logged-out account.
