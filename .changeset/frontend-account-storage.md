---
'@myfit/frontend': patch
---

Preserve offline edits and pending sync work on logout. Isolate account databases, bind the existing local database to its cached owner, and resolve the current user and query cache only after account selection.
