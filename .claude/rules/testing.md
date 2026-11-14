---
paths:
  - 'apps/*/tests/**'
  - '**/*.test.ts'
  - '**/*.spec.ts'
  - 'apps/frontend/playwright*.ts'
---

<!-- Loads when Claude reads or writes a test. Rule text, not @imports: an @import here loads at session start whatever `paths` says (Claude Code 2.1.325). -->

You are working on tests. Before writing or changing one, read `docs/reference/testing.md`: which layer tests which code, and what makes a test worth keeping. How to run each suite is in `docs/how-to/run-tests.md`.
