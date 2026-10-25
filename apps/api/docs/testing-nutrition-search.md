# Test nutrition search

Use Node 24 or later and a fresh development PostgreSQL database. Apply the Postgres baseline first to install `pg_trgm`, `unaccent`, and `public.immutable_unaccent(text)`. The migration role must be able to install extensions; the test role must be able to create schemas.

From the repository root, set `NUTRITION_SEARCH_TEST_DATABASE_URL` to the database URL, then execute:

```sh
DATABASE_URL="$NUTRITION_SEARCH_TEST_DATABASE_URL" pnpm --filter @myfit/schema db:migrate
pnpm --filter @myfit/api test:nutrition-search
```

The tests create a uniquely named schema with a small synthetic food fixture. They query it through the same Postgres runtime and search function as the API. Cleanup drops that schema. The test table shadows any application `NutritionData` table. It has no trigram or full-text indexes; these tests verify search behavior, not index use. Verify index use separately with `EXPLAIN (ANALYZE, BUFFERS)` against the migrated application table.

The fixture covers the labelled search intents: common foods, final-word prefixes, typos, transpositions, reordered words, brands, French names, accent-insensitive name and brand matching with both spellings present, and short input. Popular ingredient-based products serve as ranking distractors. The remaining assertions check input normalization, search operators, and pagination across the candidate modes. A larger fixture checks the popularity pool and the terminal page for exact, corrected, and fuzzy queries.

`test:nutrition-search` is a manual integration check. It is not wired into CI.

## Benchmark broad searches

Use the same database setup and environment variable, then execute:

```sh
pnpm --filter @myfit/api bench:nutrition-search
```

The benchmark creates an isolated schema and seeds 1,000, 10,000, then 100,000 synthetic foods. It creates the same three search indexes as the application schema and runs `ANALYZE` after each load. Each query matches a broad set through its name or brand. It measures exact (`lentil`), corrected (`lnetil`), and fuzzy (`lentel`) searches at offsets 0 and 480. The table reports the median of three requests after one warmup. Cleanup drops the schema.

Compare results on the same PostgreSQL version and hardware. These timings include database filtering and candidate selection, which still depend on table size. Ranking uses at most 1,000 candidates; fuzzy word checks also run after this bound. The pool uses scan count, then ID, so it stays the same across pages when the underlying data stays the same. Broad queries can omit less popular foods; use more specific input to narrow the match set.

Search exposes at most 500 results. Offset 500 returns an empty page so infinite scrolling stops. Larger offsets fail query validation. The benchmark uses offset 480 to measure the last full page. Timings are diagnostic and have no pass/fail threshold.
