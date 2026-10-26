# Run the API tests

Use Node 24 or later and a fresh development PostgreSQL database. Apply the Postgres baseline first to install `pg_trgm`, `unaccent`, and `public.immutable_unaccent(text)`. The migration role must be able to install extensions; the test role must be able to create schemas.

From the repository root, set `TEST_DATABASE_URL` to the database URL, then execute:

```sh
DATABASE_URL="$TEST_DATABASE_URL" pnpm --filter @myfit/schema db:migrate
pnpm --filter @myfit/api test
```

The API workflow runs the same two commands against a PostgreSQL 16 service container. The suites share one database, so Vitest runs them one after the other.

## Nutrition search

The tests create a uniquely named schema with a small synthetic food fixture. They query it through the same Postgres runtime and search function as the API. Cleanup drops that schema. The test table shadows any application `NutritionData` table. It has no trigram or full-text indexes; these tests verify search behavior, not index use. Verify index use separately with `EXPLAIN (ANALYZE, BUFFERS)` against the migrated application table.

The fixture covers the labelled search intents: common foods, final-word prefixes, typos, transpositions, reordered words, brands, French names, accent-insensitive name and brand matching with both spellings present, and short input. Popular ingredient-based products serve as ranking distractors. The remaining assertions check input normalization, search operators, and pagination across the candidate modes. A larger fixture checks the popularity pool and the terminal page for exact, corrected, and fuzzy queries.

## Sync write policy

`src/features/sync/user-write-policy.test.ts` pushes User updates through the real sync handler and contracts. An in-memory stand-in replaces the database, so this suite needs no PostgreSQL. It verifies that identity fields, account creation, and account deletion are rejected with HTTP 403, that profile and preference updates apply, and that a forbidden event rejects the whole batch.

## Nutrition seeding

`prisma/seed/open-food-facts/seed.test.ts` creates an isolated schema and copies the migrated food table definition. It invokes the real importer with tiny cached exports. It verifies duplicate selection, repeated imports, stable IDs, refreshed nutrient values, zero-energy foods, invalid macros, rollback after a COPY failure, row limits, and skipping an already populated database during deployment. A staging test verifies that rows with null quality metrics are skipped before duplicate selection, while zero values remain valid. Cleanup removes the schema and fixture files. The test never downloads the public export or changes application food rows.

`download.test.ts` in the same directory uses a local HTTP server and needs no database. It verifies cache reuse, redirect handling, replacement after corruption, and preservation of the old cache after HTTP errors or truncated gzip responses.

## Sync smoke test

`src/features/sync/routes.test.ts` pushes a meal through the real `/api/sync` routes and pulls it back. It also checks that a client with a stale storage hash gets HTTP 409. The test replaces the sign-in check with a fixed test user, because sign-in is not under test. It creates that user in the migrated `public` schema and deletes it, and its rows, afterwards.

## Benchmark broad searches

Use the same database setup and environment variable, then execute:

```sh
pnpm --filter @myfit/api bench:nutrition-search
```

The benchmark creates an isolated schema and seeds 1,000, 10,000, then 100,000 synthetic foods. It creates the same three search indexes as the application schema and runs `ANALYZE` after each load. Each query matches a broad set through its name or brand. It measures exact (`lentil`), corrected (`lnetil`), and fuzzy (`lentel`) searches at offsets 0 and 480. The table reports the median of three requests after one warmup. Cleanup drops the schema.

Compare results on the same PostgreSQL version and hardware. These timings include database filtering and candidate selection, which still depend on table size. Ranking uses at most 1,000 candidates; fuzzy word checks also run after this bound. The pool uses scan count, then ID, so it stays the same across pages when the underlying data stays the same. Broad queries can omit less popular foods; use more specific input to narrow the match set.

Search exposes at most 500 results. Offset 500 returns an empty page so infinite scrolling stops. Larger offsets fail query validation. The benchmark uses offset 480 to measure the last full page. Timings are diagnostic and have no pass/fail threshold.
