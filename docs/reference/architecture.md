# Architecture

Where code goes, how it splits, and the patterns to repeat. The goal is a codebase where a reader can guess a file's path before searching, and where a change lands in one place.

When adding code, **copy the nearest existing example** of the same kind (another reader, another mutation, another route) before inventing a shape. If no example fits, decide the shape, then add it here.

## Where code goes

### Frontend (`apps/frontend/src`)

| You are writing…                                                | Put it in                                                         |
| --------------------------------------------------------------- | ----------------------------------------------------------------- |
| A page, its `load`, and components only that route uses         | `routes/…/+page.svelte`, `+page.ts`, `routes/…/components/`       |
| A component two or more routes use                              | `lib/components/`                                                 |
| A shadcn-svelte primitive                                       | `lib/components/ui/` (generated; see `DESIGN.md` for local edits) |
| A reader, mutation, schema, mapper or key factory for user data | `lib/features/{domain}/{resource}/` (layout below)                |
| Code shared by resources of one domain                          | `lib/features/{domain}/_common/` (e.g. day bounds, selected day)  |
| A pure calculation with no framework imports                    | `lib/domain/{area}/` (e.g. BMR, daily stats, food ranking)        |
| App-wide machinery that isn't a feature                         | `lib/services/` (account, sync, service worker, OTA, native)      |
| The reader/mutation primitives                                  | `lib/data/` (`defineReader`, `invalidateKeys`, `useMutation`)     |
| A client (IDB, auth, API, query)                                | `lib/clients/`                                                    |
| A test for any of the above                                     | `tests/`, mirroring the `src/` path (see [Testing](testing.md))   |

A route-local component moves to `lib/components/` when a second route needs it, not before.

### Features

`lib/features/` holds only domain features with this shape (`food-diary`, `user`, `chat`, `ota`, `capacitor-health`):

```
lib/features/{domain}/{resource}/
  keys.ts                 # query key factory (required)
  schema.ts               # Zod schema + inferred type (simple resources)
  model/                  # when a resource has both a mapper and a non-trivial schema
    schema.ts
    mapper.ts             # DB shape ↔ form shape
    nutrients.ts          # domain constants and config arrays
  queries/
    get.ts                # getResource = defineReader(...)        → (depends, userId)
    get-by-date.ts        # getResourceByDate                       → (depends, { userId, date })
    get-by-id.ts          # getResourceById                         → (depends, { userId, id })
    search.ts             # useSearchResource(getSearch), remote only (TanStack)
  mutations/
    create.ts  update.ts  save.ts (upsert)  delete.ts
```

Name files after the operation. One exported reader or hook per file.

### Domain logic

`lib/domain/` holds pure functions: typed plain objects in, plain values out. They import nothing from `#lib/clients`, `#lib/features`, `#lib/services`, `svelte` or SvelteKit (ESLint enforces this), so they are easy to test exhaustively.

Foods and food entries store nutrients per 100 g. Scale them with `lib/domain/nutrition/portion.ts` (`forQuantity`, `macrosFor`, `totalMacros`) rather than writing the arithmetic again.

A helper that belongs to one resource but isn't a reader or a mutation sits in the resource folder, named for what it does: `meals/save-meals.ts` (the upsert the mutation and account setup share), `assistant/chat/model.ts` (titles and stored parts), `assistant/chat/request-title.ts` (a network call). Code for a domain that isn't one resource gets its own folder beside the resources, like `assistant/tools/` (the handlers for the assistant's in-app tools).

A helper that belongs to one resource but isn't a reader or a mutation sits in the resource folder, named for what it does: `meals/save-meals.ts` (the upsert the mutation and account setup share), `chat/model.ts` (titles and stored parts), `chat/request-title.ts` (a network call). Code for a domain that isn't one resource gets its own folder beside the resources, like `chat/tools/` (the handlers for the chat's in-app tools).

### API (`apps/api/src`)

| You are writing…                    | Put it in                                                                   |
| ----------------------------------- | --------------------------------------------------------------------------- |
| Routes for one area                 | `features/{area}/routes.ts`                                                 |
| Logic those routes call             | `features/{area}/{concern}.ts` beside them                                  |
| Middleware used by several features | `shared/middleware/`                                                        |
| The schema, contracts, sync server  | `packages/shared` (see [Change the schema](../how-to/change-the-schema.md)) |

## Splitting code

The vocabulary is from the `codebase-design` skill: a **module** has an **interface** (everything a caller must know) and an implementation; a **seam** is where the interface lives.

- **Prefer deep modules.** A module should hide more than it exposes. A wrapper whose interface is as large as its body is a pass-through; inline it. Test: if you deleted the module, would its complexity reappear in every caller? If not, it isn't earning its keep.
- **Split by reason to change, not by size.** One file per operation (a reader, a mutation) and one per concept. Two things that always change together stay together.
- **Keep a concept's code together.** Schema, mapper and keys for a resource live in its folder, not in global `schemas/` or `types/` folders.
- **Depend inward.** Routes depend on features; features depend on `data`, `clients` and `domain`; `domain` depends on nothing. Never import a route from `lib/`.
- **Pass dependencies in where a test needs to swap them.** `saveMeals(tx, userId, meals)` takes the transaction, so a test can hand it a fake-indexeddb database. Add a seam only when there are two real uses (production and test count); one adapter is just indirection.
- **Return values instead of mutating arguments.** Side effects sit at the edges: mutations, `$effect`s, services.

SOLID, applied here:

- **Single responsibility**: one reason to change per file, as above.
- **Open/closed**: extend through data, such as a new entry in a config array or a new key prefix in `sync-invalidation.ts`, not by adding `if` branches for each case.
- **Liskov and interface segregation**: a component's props are the smallest set it needs. Pass `entry.id`, not the whole page `data`.
- **Dependency inversion**: domain code takes plain values, not clients, so it doesn't know where data comes from.

## State

A flow with more than two states is a state machine, so write it as one. Several booleans and nullable fields that change together (`loading`, `error`, `pendingEmail`) allow combinations that can't happen and hide the transitions.

```ts
// One value; each state carries only the data valid in that state.
type SyncState =
	| { kind: 'idle' }
	| { kind: 'syncing' }
	| { kind: 'paused'; reason: 'offline' | 'signedOut' }
	| { kind: 'failed'; error: string; attempts: number };

let state = $state<SyncState>({ kind: 'idle' });
```

- **Reuse before you write.** Look for an existing type, helper or function before adding one. Build a type from the data model, for example `Pick<Row<'FoodEntry'>, 'energyKcal_100g' | 'quantityG'>`, instead of retyping its fields, so a schema change reaches every user of it.
- **Let TypeScript infer.** Leave out a return type or annotation the compiler already knows, and avoid casts (`as`, `!`). A cast hides a type that doesn't fit; fix the type, narrow the value, or add a type guard.

- Change it in one place, through named transitions (`start()`, `fail(error)`), not by assigning fields from many handlers.
- Render with `{#if state.kind === …}` so every state has a visible branch.
- `lib/services/service-worker.svelte.ts` (`appUpdate.status`) follows this pattern. The account root (`account-root.svelte`: `ownerId`, `error`, `otherAccountEmail`, `approvedDiscardFor`) is the main place that doesn't yet; convert it when you next change it.

## Consistency

- **Same job, same pattern.** A new reader looks like the existing readers; a new mutation like the existing mutations. A one-off pattern needs a reason in a comment.
- **Names follow [Data layer → Naming](data-layer.md#naming)** and the terms in [`GLOSSARY.md`](../../GLOSSARY.md).
- **No dead code or speculative options.** Build what the current task needs; delete what nothing uses.
