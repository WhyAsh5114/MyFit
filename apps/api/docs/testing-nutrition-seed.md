# Test nutrition seeding

Use Node 24 or later and a development PostgreSQL database. Apply the schema migrations first. The test role must be able to create schemas.

From the repository root, set `NUTRITION_SEED_TEST_DATABASE_URL` to the test database URL, then run:

```sh
DATABASE_URL="$NUTRITION_SEED_TEST_DATABASE_URL" pnpm --filter @myfit/schema db:migrate
pnpm --filter @myfit/api test:nutrition-seed
```

The integration test creates an isolated schema and copies the migrated food table definition. It invokes the real importer with tiny cached exports. It verifies duplicate selection, repeated imports, stable IDs, refreshed nutrient values, zero-energy foods, invalid macros, rollback after a COPY failure, row limits, and skipping an already populated database during deployment. Cleanup removes the schema and fixture files. The test never downloads the public export or changes application food rows.

The download test uses a local HTTP server. It verifies cache reuse, redirect handling, replacement after corruption, and preservation of the old cache after HTTP errors or truncated gzip responses.

To run only the download test without PostgreSQL:

```sh
node --test apps/api/prisma/seed/open-food-facts/download.test.ts
```

The database test is a manual integration check, like the nutrition search tests.
