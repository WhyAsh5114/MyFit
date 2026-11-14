---
paths:
  - 'packages/shared/src/schema.prisma'
  - 'packages/shared/migrations/**'
  - 'packages/shared/migrations-postgres/**'
---

<!-- Loads when Claude touches the schema or migrations. A client-visible change breaks older clients' sync. Rule text, not @imports: an @import here loads at session start whatever `paths` says (Claude Code 2.1.325). -->

You are working on the database schema. Before changing it, read `docs/how-to/change-the-schema.md` for the steps, and `docs/explanation/updates.md` → "The sync contract": any client-visible change, even an additive one, stops older clients from syncing until they update.
