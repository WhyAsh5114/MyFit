---
'@myfit/frontend': patch
---

Save pending changes before logging out, then clear the single local database only after sign-out is confirmed. If logout fails, offer “Log out anyway” and “Try again”, with cancellation at the top right. Use a responsive dialog on desktop and drawer on mobile, including a non-dismissable reload notice after another tab logs out.

Preserve offline edits on session expiry. An unexpected signed-in account cannot access leftover data and is returned to sign-in without deleting it or offering account-switch choices. Refresh the auth session before clearing local data so a stale session cannot reopen the logged-out account.
