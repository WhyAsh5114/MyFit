# Test nutrition search

Use Node 24 or later and a fresh development PostgreSQL database. Apply the Postgres baseline first to install `pg_trgm`, `unaccent`, and `public.immutable_unaccent(text)`. The migration role must be able to install extensions; the test role must be able to create schemas.

From the repository root, set `NUTRITION_SEARCH_TEST_DATABASE_URL` to the database URL, then execute:

```sh
DATABASE_URL="$NUTRITION_SEARCH_TEST_DATABASE_URL" pnpm --filter @myfit/schema db:migrate
pnpm --filter @myfit/api test:nutrition-search
```

The tests create a uniquely named schema with a small synthetic food fixture. They query it through the same Postgres runtime and search function as the API. Cleanup drops that schema. The test table shadows any application `NutritionData` table. It has no trigram or full-text indexes; these tests verify search behavior, not index use. Verify index use separately with `EXPLAIN (ANALYZE, BUFFERS)` against the migrated application table.

The fixture covers the labelled search intents: common foods, final-word prefixes, typos, transpositions, reordered words, brands, French names, accent-insensitive name and brand matching with both spellings present, and short input. Popular ingredient-based products serve as ranking distractors. The remaining assertions check input normalization, search operators, and pagination across the candidate modes.

`test:nutrition-search` is a manual integration check. It is not wired into CI.
