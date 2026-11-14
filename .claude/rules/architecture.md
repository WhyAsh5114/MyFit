---
paths:
  - 'apps/frontend/src/lib/**'
  - 'apps/frontend/src/routes/**'
  - 'apps/api/src/**'
---

<!-- Loads when Claude touches app source, so new files land in the right place. Rule text, not @imports: an @import here loads at session start whatever `paths` says (Claude Code 2.1.325). -->

You are working in app source. Before adding a file, moving code or splitting a module, read `docs/reference/architecture.md`: where each kind of code goes, how to split it, and the state and consistency rules. Copy the nearest existing example of what you are adding.
