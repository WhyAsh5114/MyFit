---
paths:
  - 'apps/frontend/src/service-worker/**'
  - 'apps/frontend/src/lib/services/service-worker.svelte.ts'
  - 'apps/frontend/src/lib/services/ota.ts'
  - 'apps/frontend/src/lib/features/ota/**'
  - 'apps/frontend/scripts/ota-*'
  - 'apps/frontend/capacitor.config.ts'
  - 'apps/api/src/features/ota/**'
  - 'apps/api/src/features/sync/**'
---

<!-- Loads when Claude touches the service worker, OTA, Capacitor config or sync routes. Rule text, not @imports: an @import here loads at session start whatever `paths` says (Claude Code 2.1.325). -->

You are working on the service worker, OTA, Capacitor config or sync routes. Before changing code here, read `docs/explanation/updates.md` (update paths, OTA channels, the sync contract). Shipping or withdrawing a release is in `docs/how-to/release.md`.
