# Test nutrition search

Use Node 24 or later and a development PostgreSQL database with `pg_trgm` available. The database role must be able to create schemas and install `pg_trgm` if it is absent.

From the repository root, set `NUTRITION_SEARCH_TEST_DATABASE_URL` to the database URL, then execute:

```sh
pnpm --filter @myfit/api test:nutrition-search
```

The tests create a uniquely named schema with a small synthetic food fixture. They query it through the same Postgres runtime and search function as the API. Cleanup drops that schema. The test table shadows any application `NutritionData` table.

The fixture covers the labelled search intents: common foods, final-word prefixes, typos, transpositions, reordered words, brands, French names, and short input. Popular ingredient-based products serve as ranking distractors. The remaining assertions check input normalization, search operators, and pagination across the candidate modes.
