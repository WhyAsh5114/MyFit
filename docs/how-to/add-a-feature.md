# Add a feature

How to add a new kind of user data, from schema to screen. The folder layout is in [Architecture](../reference/architecture.md); the read and write rules are in [Data layer](../reference/data-layer.md).

1. **Name it.** Use the product's word from [`GLOSSARY.md`](../../GLOSSARY.md). If the term is new or fuzzy, settle it there first.
2. **Add the model** to `packages/shared/src/schema.prisma` and run the schema sync (see [Change the schema](change-the-schema.md)).
   - Give a user-scoped model a relation path to `User`: sync scopes rows with `rootModel: 'User'` (`packages/shared/src/server.ts`).
   - Mark a server-only model with `@@idb.exclude`.
   - A client-visible change breaks older clients' sync. Plan the rollout in [Updates → The sync contract](../explanation/updates.md#the-sync-contract).
3. **Create `lib/features/{domain}/{resource}/keys.ts`** with a key factory that puts `userId` second. Copy the shape from `food-diary/food-entry/keys.ts`.
4. **Add the schema** (`schema.ts`, or `model/schema.ts` with a `model/mapper.ts` if the DB and form shapes differ).
5. **Add readers in `queries/`** with `defineReader`, one per file, named after the operation (`get.ts`, `get-by-date.ts`).
6. **Add mutations in `mutations/`** with `useMutation`, invalidating the user's keys in `onSuccess`.
7. **Add the model to `KEYS_BY_MODEL`** in `services/sync/sync-invalidation.ts`, so a sync pull reruns only the pages that read it. A unit test fails until the model is listed; map it to `[]` while no page reads it.
8. **Add the route** under `routes/(app)/(protected)/`. Its `+page.ts` takes `ownerId` from `await parent()` and calls the readers. Components only that route uses go in `components/` beside it.
9. **Build the UI** following [`DESIGN.md`](../../DESIGN.md) and the steps in `.claude/rules/ui.md`. Add every string to `messages/en.json` and `messages/hi.json`.
10. **Test it** at the layers [Testing](../reference/testing.md) names for each part, and add the screen to the screenshot spec.
11. **Check it**: from the repo root, run `pnpm lint`, `pnpm check` and `pnpm --filter @myfit/frontend test`. Run the API and e2e suites too when the change touches them ([Run the tests](run-tests.md)).

You are done when the screen reads its data in a `load`, a save updates every page that shows the data, a sync pull from another device does the same, and the checks pass.
