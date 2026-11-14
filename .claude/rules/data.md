---
paths:
  - 'apps/frontend/src/lib/features/**'
  - 'apps/frontend/src/lib/data/**'
  - 'apps/frontend/src/lib/services/sync/**'
  - 'apps/frontend/src/routes/**/+page.ts'
  - 'apps/frontend/src/routes/**/+layout.ts'
---

<!-- Loads when Claude touches readers, mutations, loads or sync invalidation. Rule text, not @imports: an @import here loads at session start whatever `paths` says (Claude Code 2.1.325). -->

You are working on how local data is read or written. Before changing code here, read `docs/reference/data-layer.md`: readers and loads, mutations and `invalidateKeys`, TanStack for remote reads, naming and query keys.
