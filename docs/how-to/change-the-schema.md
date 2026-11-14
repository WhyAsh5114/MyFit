# Change the database schema

The server (PostgreSQL through Prisma 8) and the browser (IndexedDB through Prisma IDB) read one schema: `packages/shared/src/schema.prisma`. Before a client-visible change, read [Updates → The sync contract](../explanation/updates.md#the-sync-contract): even an additive change stops older clients from syncing until they update.

1. Edit `schema.prisma`.
2. From the repository root, run the sync with a short migration name:

   ```bash
   pnpm --filter @myfit/shared schema:sync add-meal-notes
   ```

   It runs these steps in order, then formats the generated files:
   1. `contract:emit` writes the browser contract.
   2. `migration:plan` plans the IndexedDB migration and bundles the migration chain for the browser. If the bundle is stale, the browser sends the old chain and every sync request fails with a contract mismatch.
   3. `migration:preflight` applies the chain to a fake IndexedDB and checks it matches the new contract.
   4. `contract:emit:postgres` writes the server contract.
   5. `migration:postgres:plan` plans the Postgres migration.

   When the schema did not change, the command changes nothing.

3. Apply the Postgres migrations to your database: `pnpm --filter @myfit/shared db:migrate`. This also creates the `NutritionData` food search table.
4. Commit everything the command changed.

## When a change drops or renames data

The planners refuse and list their questions. Run the steps one at a time and pass the `--rename` or `--delete` flags the planner prints.

## Write a Postgres data migration by hand

Scaffold it from the latest migration's target hash, which is the `storageHash` in `packages/shared/src/generated/postgres-contract.json`. A bare `migration:postgres:new` fails on an unchanged schema, because it needs a starting hash.

```bash
pnpm --filter @myfit/shared migration:postgres:new --from <hash> --name <name>
```
