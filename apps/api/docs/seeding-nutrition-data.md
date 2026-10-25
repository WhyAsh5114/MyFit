# Load and refresh nutrition data

Use Bun and a PostgreSQL database with the current schema migrations applied. The database role must be able to create temporary tables, update `NutritionData`, and run `ANALYZE`.

## Deploy a fresh database

The API container applies migrations, then runs the seed when `NutritionData` is empty. It starts the API only after the import succeeds. An import failure stops deployment. Later restarts skip the download and import when food rows already exist.

The full Open Food Facts export is large. Allow enough disk space for the compressed export and enough time for the download and import. Set the deployment startup deadline and health-check grace period to cover the initial import; the image's default 60-second grace period covers ordinary restarts only. To provision separately, run these commands before starting the API:

```sh
pnpm --filter @myfit/schema db:migrate
pnpm --filter @myfit/api seed:off
```

Both commands read `DATABASE_URL`. Set `SEED_NUTRITION_DATA=0` to skip the container's seed step, for example when a separate provisioning job owns this work.

## Refresh the export

Run from the repository root:

```sh
REFRESH_OFF_DATA=1 pnpm --filter @myfit/api seed:off
```

Without `REFRESH_OFF_DATA=1`, the importer reuses a valid cached gzip. Set `OFF_DATA_DIR` to place the cache on a persistent volume; otherwise it lives beside the seed script. Downloads use a temporary file and replace the cache only after the whole gzip validates. Failed downloads preserve the previous cache. A corrupt cache triggers a replacement download on the next attempt.

The importer chooses one row per food code, preferring the highest scan count, then completeness. It updates existing rows in place, preserving their IDs. Rows absent from an export remain available. The migration repairs duplicates from older imports before enforcing unique codes; it retains the most-scanned existing row. Food diary and recipe records store nutrition snapshots and do not reference these rows.

Foods with zero energy, including water and diet drinks, are accepted. Energy, protein, fat, and carbohydrate values must all be present and nonnegative. Missing macros still exclude a record.

For a small development import, set `ROW_LIMIT=1000`. This limits valid input rows before deduplication. Never use a row limit to provision a complete production catalogue. If an earlier limited import populated a database, run an explicit full import; the deploy seed treats any existing row as populated.

The staging load and upsert share one transaction. Failed imports leave the food table unchanged. The importer runs `ANALYZE "NutritionData"` after commit so search requests use current planner statistics. If `ANALYZE` fails, the data remains committed; rerunning the seed is safe.

## Rebuild search indexes

After a large refresh, rebuild indexes during a maintenance window if index size or query plans warrant it. Rebuild them whenever the pinned `public.unaccent` dictionary changes. Run outside a transaction:

```sh
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -c 'REINDEX TABLE CONCURRENTLY public."NutritionData";'
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -c 'ANALYZE public."NutritionData";'
```

`REINDEX ... CONCURRENTLY` keeps normal reads and writes available but needs extra disk space and takes longer than a blocking rebuild. The seed leaves indexes in place so refreshes remain searchable.
