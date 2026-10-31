# MyFit — Agent Instructions

## Architecture

MyFit is a **local-first, mobile-first fitness SPA** built with SvelteKit + Capacitor.

- **No SSR.** Root layout sets `prerender = true`; `(app)` group sets `ssr = false`. All data fetching is client-side.
- **Local-first data.** All user data (food entries, metrics, targets, preferences) is stored in IndexedDB through the Prisma IDB client (`@prisma-idb/client-idb`), typed by the shared schema in `packages/shared`. Writes go to IDB first; the sync extension records each `orm.*` write in an outbox, and the sync worker pushes it to the remote PostgreSQL database in the background.
- **Remote data is read-only from the client.** Nutrition food data is fetched from the Hono API via `apiClient` and cached in TanStack Query — it is never written locally.
- **Local data is loaded by routes.** Each page's `load` reads IndexedDB and returns the data, so a page renders whole instead of through skeletons. Mutations and sync pulls rerun the affected `load`s with `invalidateKeys`. TanStack Query is only for remote and device reads; writes go through `useMutation` (`#lib/features/mutation.svelte.ts`).
- **Two clients, two purposes:**
  - `getDb()` (`#lib/clients/idb-client`) → `DbClient` (IndexedDB) — all user data reads/writes through `const { orm } = await getDb()`
  - `apiClient` → Hono RPC client — nutrition data search/lookup only

---

## Design

Read [`DESIGN.md`](DESIGN.md) before building or changing any UI. It sets the priorities, surfaces (page, drawer, dialog), 44px touch targets, color and status rules, feedback, motion and copy voice. This file covers code structure only.

---

## Tech Stack

| Concern      | Library                                                          |
| ------------ | ---------------------------------------------------------------- |
| Framework    | SvelteKit 3, Svelte 5 (runes)                                    |
| Styling      | Tailwind CSS v4                                                  |
| Components   | shadcn-svelte (via bits-ui)                                      |
| Charts       | layerchart                                                       |
| Server state | SvelteKit `load` (local data), TanStack Svelte Query v6 (remote) |
| Forms        | sveltekit-superforms + zod v4                                    |
| Local DB     | Prisma IDB client (IndexedDB, schema in `packages/shared`)       |
| Remote API   | Hono RPC (`hc<AppType>`)                                         |
| Auth         | better-auth (email OTP + anonymous)                              |
| i18n         | Paraglide JS (compile-time)                                      |
| Mobile       | Capacitor 8 (iOS + Android)                                      |
| Date math    | `@internationalized/date`                                        |

---

## Feature Structure

Features live under `src/lib/features/` grouped by domain, then resource:

```
src/lib/features/
  {domain}/                   # e.g. food-diary, user
    {resource}/
      keys.ts                 # Query key factory — required
      schema.ts               # Zod schema + inferred type (simple features)
      model/                  # Complex features only
        schema.ts             # Zod schema + inferred type
        mapper.ts             # DB shape ↔ form shape transforms
        nutrients.ts          # Domain constants, config arrays
      queries/
        get.ts                # getResource = defineReader(...) → (depends, userId)
        get-by-date.ts        # getResourceByDate → (depends, { userId, date })
        get-by-id.ts          # getResourceById → (depends, { userId, id })
        search.ts             # useSearchResource(getSearch)  ← remote only, TanStack
      mutations/
        create.ts             # useCreateResource()
        update.ts             # useUpdateResource()
        save.ts               # useSaveResource()  ← upsert
        delete.ts             # useDeleteResource()
```

Use the `model/` subfolder when a feature has both a mapper and a non-trivial schema (e.g., food-entry). For simple schemas without mappers, `schema.ts` at the feature root is fine.

---

## Data Flow

The explicit contract for every feature:

```
Query → [Mapper] → Form Schema → [Mapper] → Mutation → IDB
```

1. **Query** reads the current value from IDB in a route `load` (or from the API through TanStack for remote data)
2. **Mapper** (optional) converts the raw DB/API shape into the form's initial values
3. **Form** validates with the Zod schema via superforms; user edits data
4. **Mapper** (optional) converts validated form data back to the DB input shape
5. **Mutation** writes to IDB; the outbox queues it for remote sync

Only add mappers when the DB shape and form shape genuinely differ. Do not create mappers that just spread an object.

---

## Naming Conventions

### Hooks

| Type            | Pattern                       | Example                               |
| --------------- | ----------------------------- | ------------------------------------- |
| Local reader    | `get{Resource}[By{Selector}]` | `getFoodEntriesByDate(depends, args)` |
| Remote query    | `use{Resource}[By{Selector}]` | `useNutritionDataById(getId)`         |
| Mutation        | `use{Verb}{Resource}`         | `useCreateFoodEntry()`                |
| Upsert mutation | `useSave{Resource}`           | `useSaveActivityPreferences()`        |

No `Query`/`Mutation` suffix on hook names.

### Local variables (in components/routes)

```ts
// ✅ Concise and readable
const currentUser = $derived(getCurrentUser());
const nutritionData = useNutritionDataById(() => id);
const createFoodEntry = useCreateFoodEntry();

// ❌ Verbose, legacy-style
const getCurrentUserQuery = useGetCurrentUserQuery();
const createFoodEntryMutation = useCreateFoodEntryMutation();
```

### Key factories

```ts
export const foodEntryKeys = {
	all: ['foodEntry'] as const,
	list: (userId: string) => [...foodEntryKeys.all, userId] as const,
	byDate: (userId: string, date: string) => [...foodEntryKeys.list(userId), 'date', date] as const,
	byId: (userId: string, id: string) => [...foodEntryKeys.list(userId), 'id', id] as const
};
```

- All user-scoped keys must include `userId` at the second level.
- Avoid flat `all`-only keys for user-scoped data — stale data persists across users.
- Key segment names: `byUser`, `byDate`, `byId`, `search` — no `Query`/`get` suffixes.

---

## Loading Local Data

Local data is read by the route's `load`, not by hooks in the page. A page then renders whole and has no loading state of its own. SvelteKit keeps the current page until `load` settles, so a day change or a navigation never shows a skeleton.

```ts
// features/food-diary/food-entry/queries/get-by-date.ts — a reader names the keys it reads
export const getFoodEntriesByDate = defineReader({
	keys: ({ userId, date }: { userId: string; date: CalendarDate }) => [
		foodEntryKeys.byDate(userId, date.toString())
	],
	read: async ({ userId, date }) => {
		const { orm } = await getDb();
		return await orm.foodEntry.where({ userId } /* ... */).all();
	}
});

// routes/(app)/food-diary/[date]/+page.ts
export const load: PageLoad = async ({ params, depends }) => {
	const userId = loadOwner(depends);
	return {
		diary: userId ? await loadDiaryDay(depends, userId, parseSelectedDay(params.date)) : null
	};
};
```

- A reader is made with `defineReader({ keys, read })` and called as `reader(depends, args)`. It registers `keys` before it reads, so a `load` can't use one and miss its reruns, and `keys` is required by its type. ESLint enforces it: a local `queries/*.ts` file can only export `defineReader(...)` calls, and a `+page.ts`/`+layout.ts` can't import the IDB client. Use the key factory the mutations use. A key is turned into a `depends` id (`dependencyId` in `#lib/features/dependencies.ts`), and `invalidateKeys(prefix)` reruns every active `load` that registered a key under that prefix, the way `invalidateQueries` matched prefixes. This works for universal loads (`+page.ts`), and the component keeps its state, because the page data updates in place.
- A route that reads several resources of one feature gets a feature-level loader (`food-diary/load-day.ts`); `+page.ts` only calls it.
- `loadOwner(depends)` returns the account the local database belongs to, and reruns the `load` when it changes. It is `undefined` or `null` until the session cacher has settled on an account: return `null` data then, and render it as nothing. The cacher shows the page only after the loads have rerun for the settled account.
- Load functions return data and never throw for missing rows: a reader returns `null` for one that doesn't exist.
- Read `params` and `url` in the body of `load`: they are only tracked until `load` returns. A `load` that reads `url.search` reruns on every search-param change.
- Components never copy `data` into `$state`; use `$derived(data.x)`, because `data` updates without a remount. Forms built from `data` keep the values they started with, which is what you want mid-edit.
- Pages that need the user read `getCurrentUser()` (`user/current-user.svelte.ts`), which reads the `(app)` layout's data.
- Remote reads are the exception: a `load` that waited on the network would hold the navigation, so they stay in TanStack (below) with a real loading state.

## Mutations

```ts
export const useCreateFoodEntry = () =>
	useMutation({
		mutationFn: async ({ data, userId }: { data: FoodEntryFormSchema; userId: string }) => {
			const { orm } = await getDb();
			return await orm.foodEntry.create(foodEntryFormSchemaToFoodEntry(data, userId));
		},
		// Waits for the pages to reload, so the caller returns to a diary that already has the entry.
		onSuccess: (data) => invalidateKeys(foodEntryKeys.byUser(data.userId)),
		onError: (error) => {
			toast.error(m['unknownErrorOccurred']());
			console.error('Failed to create food entry:', error);
		}
	});
```

- `useMutation` gives `isPending`, `mutate` and `mutateAsync`. `mutateAsync` rejects after `onError` has run; `mutate` doesn't.
- `onSuccess` returns `invalidateKeys(...)` so `mutateAsync` resolves once the pages have the new data.
- Invalidate `byUser` unless a page would flash a stale state: deleting an entry reloads its day (`byDate`), not `byId`, because the edit page would show "not found" while it navigates away. A day key is the local day (`localDay`), never `toISOString()`.
- `onError` always shows `m['unknownErrorOccurred']()` toast + `console.error` with context.
- Call `invalidateKeys` only from a mutation's `onSuccess` and from sync (`sync-invalidation.ts`, which maps each pulled model to its key prefixes). The one other caller is the session cacher, which reruns every `load` that reads the account (`invalidateOwner`).

## TanStack Query Conventions (remote and device reads)

Used for the nutrition API, the Health plugin and OTA, which a `load` shouldn't wait on.

```ts
// Reactive getter function pattern — required for Svelte 5 reactivity
export const useNutritionDataById = (getId: () => string) =>
	createQuery(() => {
		const id = getId();
		return {
			queryKey: nutritionDataKeys.byId(id),
			queryFn: async () => {
				/* ... */
			},
			staleTime: 1000 * 60 * 10,
			refetchOnWindowFocus: false,
			refetchOnReconnect: false,
			enabled: !!id
		};
	});
```

- Always accept args via a getter function, not raw values. This is what makes queries reactive.
- Remote/API queries: set `staleTime: 1000 * 60 * 10`, `refetchOnWindowFocus: false`, `refetchOnReconnect: false`.
- Never `try/catch` inside `queryFn`. Let errors propagate to TanStack's error state.
- Never call `queryClient` inside a route/component. The session cacher and logout only cancel and clear it when the account changes.

---

## Forms (superforms + zod4)

```ts
// Schema
export const foodEntryFormSchema = z.object({ ... });
export type FoodEntryFormSchema = z.infer<typeof foodEntryFormSchema>;

// In component — edit form with initial data
const form = superForm(
  defaults(
    initialData ? foodEntryFormSchema.parse(initialData) : undefined,
    zod4(foodEntryFormSchema)
  ),
  {
    SPA: true,
    validators: zod4Client(foodEntryFormSchema),
    onUpdate: async ({ form }) => {
      if (!form.valid) return toast.error(m['errors.formInvalid']());
      await onSubmit(form.data);
    },
  }
);
```

- Always `SPA: true` — no server actions.
- Use `zod4` for server-side (SSR-safe) schema init, `zod4Client` for browser validation.
- Schema and its inferred type live together in the same file.
- Use the `submit` snippet pattern for injecting the submit button from the parent page.

---

## Svelte 5 Patterns

```ts
// ✅ Derived state
let caloriesRemaining = $derived(targetCalories - caloriesConsumed);
let stats = $derived.by(() => {
  if (!macroMetrics) return null;
  return calculateDailyNutritionStats({ metrics: macroMetrics, ... });
});

// ✅ Page data from the route's load
let { data }: PageProps = $props();
const diary = $derived(data.diary);

// ✅ Reactive query args (remote reads)
const nutritionData = useNutritionDataById(() => page.params.id ?? '');

// ✅ Props
let { initialData, onSubmit, meals }: Props = $props();

// ✅ Side effects only
$effect(() => {
  if (query.isSuccess && query.data) goto(resolve('/somewhere'));
});

// ❌ Deriving state inside $effect
$effect(() => { computedValue = someData.value * 2; });
```

- Prefer `$derived`/`$derived.by()` over `$effect` for computed values.
- Use `$effect` only for true side effects (navigation, DOM interaction, external sync).
- Use `$state` for mutable local UI state only.

---

## shadcn-svelte (bits-ui) Components

```svelte
<!-- ✅ Namespace imports -->
import * as Card from '#lib/components/ui/card/index.js';
import * as Form from '#lib/components/ui/form/index.js';

<!-- ✅ Loading state in button -->
<Button disabled={mutation.isPending}>
  {#if mutation.isPending}<Spinner />{:else}Save <SaveIcon />{/if}
</Button>

<!-- ✅ Conditional classes -->
<div class={cn('base-class', { 'conditional-class': condition })}>
```

- Always import from `#lib/components/ui/` — not directly from `bits-ui`.
- Use `cn()` from `#lib/utils` for all conditional class logic.
- Use `<Spinner />` for in-button loading states; use `<Skeleton />` for full-section loading states.
- Use `<Empty.Root>` + `<Empty.Header>` + `<Empty.Content>` for empty states.

---

## i18n (Paraglide)

```svelte
<script lang="ts">
	import { m } from '#lib/paraglide/messages';
</script>

<!-- ✅ All user-visible strings go through Paraglide -->
<p>{m['foodDiary.noFoodFound']()}</p>
<Button>{m['foodDiary.scanBarcode']()}</Button>
toast.error(m['unknownErrorOccurred']());

<!-- ❌ Never hardcode English strings in production UI -->
<p>No food found</p>
```

- Every user-visible string must have a key in `messages/en.json` and `messages/es.json`.
- Message keys use `feature.camelCase` namespacing (e.g., `foodDiary.addManually`).
- Only exception: in-progress/beta-only UI can use hardcoded strings temporarily.

---

## Capacitor

- The IDB client (`getDb()`) is **browser-only** and opens lazily: the first call runs the IndexedDB migrations and every later call shares the same client, so await it inside each query and mutation. Never call it during SSR or prerender.
- Capacitor plugins are initialized at layout level (`+layout.svelte`). Don't re-initialize plugins in child routes.
- Use `Capacitor.getPlatform()` to gate platform-specific code (`'android'`, `'ios'`, `'web'`).
- `viewport-fit=cover` is set in `app.html` for safe-area insets — don't override it.
- The app targets Android 16 (API 36), which enforces edge-to-edge: the `windowOptOutEdgeToEdgeEnforcement` opt-out and the StatusBar plugin's `overlaysWebView` / `backgroundColor` no longer work, so the app doesn't use the StatusBar plugin. The webview extends under the system bars, so screen roots pad themselves with `env(safe-area-inset-*)` (Capacitor's built-in SystemBars handles older WebViews). The root layout sets the system bar icon style from the in-app theme, since it can differ from the device's.
- The static adapter outputs to `build/` which Capacitor's `webDir` points at.

### Native is an enhancement

The app must work as a plain web app. Native features (Health, back button, and so on) only add to it, so code that uses a plugin must cope with the plugin or a newer method being absent, because a new web bundle can run inside an older binary.

- Check the plugin, not just the platform: `Capacitor.getPlatform() !== 'web'` says the app is native, not that this binary contains the plugin. Use `Capacitor.isPluginAvailable('<Plugin>')` before using one, and `try/catch` calls to methods a newer plugin version might add.
- A feature whose plugin is missing hides itself or does nothing. Do not gate bundles by native version to avoid this.

### Updates and version drift

Three things can be out of step with each other: the web app, the installed native binary, and the server. Each has its own mechanism.

| Surface         | How it updates                                          | Notes                                                                                                                                                                                                                                                       |
| --------------- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Web             | Service worker (`src/service-worker/index.ts`, Serwist) | Takes over on deploy (`skipWaiting`, `clientsClaim`), checks hourly and on tab focus, and shows a "reload" toast. Registered in `hooks.client.ts` through `lib/features/service-worker.ts`. Web only: WKWebView does not run it for the app's local origin. |
| iOS and Android | Store release, or OTA for web-only changes              | Store releases are only for native changes (plugins, native config, Capacitor upgrades). Everything else ships as an OTA bundle.                                                                                                                            |

**OTA channels.** A bundle ships its own Capacitor JS, which must match the native bridge in the installed app. Bundles are therefore published to a channel named for the Capacitor core major (`cap8`), computed in `apps/frontend/scripts/ota-channel.js` and embedded at build time as `__OTA_CHANNEL__`. The app asks `GET /api/ota/latest?channel=…` and the API serves each channel only its newest upload. Upgrading Capacitor starts a new channel by itself. For another change that old apps cannot run, change `otaChannel()` to return a new name such as `cap8-2`. There is no native version comparison and no `minNativeVersion`. `pnpm ota:channel` prints the current channel, and CI and `scripts/ota-upload.sh` send it on upload.

**No OTA rollback endpoint.** To withdraw a bad release, rebuild the last good commit and upload it as a new version in the same channel. Capgo still rolls back by itself when a bundle never calls `notifyAppReady`, which the app does only after it has read the local database. A rollback does not undo local IndexedDB migrations a newer bundle already ran, so do not rely on one across a schema change.

**Sync contract.** The sync worker sends a hash of the client contract (`storageHash`) with every push and pull, and the server accepts exactly one. A mismatch returns 409: the worker stops, keeps the outbox and cursor, and emits `contractmismatch`. Treat any client-visible schema change as a breaking change for older clients, even an additive one.

- Web recovers when the new service worker takes over and the user reloads. Native recovers when the next OTA bundle applies, or when the store update lands for a native-incompatible change.
- Server-only changes (indexes, `@@idb.exclude` models) should not alter the contract hash.
- The server cannot serve two contracts at once, so a client-visible schema change always leaves a window in which clients on the other contract cannot sync (their edits stay queued). Keep it short: batch such changes, publish the new client (OTA, or the store when it needs a new binary) and deploy the matching server change right after.

---

## Domain Logic

Pure functions with no framework dependencies live in `src/lib/domain/`:

```
domain/
  nutrition/
    bmr.ts             # Harris-Benedict BMR calculation
    activity-calories.ts  # ACSM walking equation (step count → kcal)
    stats.ts           # Daily nutrition stats (BMR + targets + consumed)
    constants.ts       # CALORIES_PER_KILOGRAM = 7700
```

- Domain functions are **pure** — no imports from `#lib/clients/`, `#lib/features/`, or SvelteKit.
- Accept typed plain objects, return plain values.
- When computing consumed calories from `FoodEntry`, always scale by quantity: `entry.energyKcal_100g * (entry.quantityG / 100)`.

---

## Auth & Session Flow

1. `+layout.svelte` (root) wraps the tree in `<QueryClientProvider>`.
2. `(app)/+layout.ts` disables SSR/prerender for all authenticated routes.
3. The root layout claims the single-tab lock (`claimTab` in `#lib/features/account-session.svelte.ts`); other tabs show a notice and reload when the active tab closes.
4. `<SessionCacher>` in `(app)/+layout.svelte` keeps one local account: it checks the local database against the better-auth session, asks before replacing another account's unsynced data, and starts the sync worker for a signed-in account. An expired session keeps the stored account working offline.
5. `(app)/+layout.ts` loads the local user and the account (`ownerId`) for every page; `getCurrentUser()` reads it. The cacher publishes the settled account in `accountSession.ownerId` and reruns the loads with `invalidateOwner()`. Page loads read it with `loadOwner(depends)`.
6. `logout()` in `#lib/features/logout.ts` saves queued edits, signs out, then deletes the local database. If a step fails it keeps the account and offers retry, cancel or discard.

---

## Adding a New Feature

1. Create `src/lib/features/{domain}/{resource}/keys.ts` with a hierarchical key factory.
2. Add `queries/` and `mutations/` sub-folders. Name files after the operation (`get.ts`, `get-by-date.ts`, `create.ts`, `update.ts`). A query is a reader that takes `depends`; the route's `+page.ts` calls it.
3. If the DB shape ≠ form shape, add `model/mapper.ts`. If the schema is complex, add `model/schema.ts`.
4. Define the model in `packages/shared/src/schema.prisma`, then run `pnpm --filter @myfit/shared schema:sync <migration-name>` (see the root README).
5. For user-scoped models: sync uses `rootModel: 'User'` (`packages/shared/src/server.ts`), so give the model a relation path to `User`. Mark server-only models with `@@idb.exclude`.
6. Get the `userId` from `loadOwner(depends)` in the route's `load` and return it with the data. Components outside a page's data read `getCurrentUser()` — never hardcode it or pass it through multiple layers.

---

## Anti-Patterns

```ts
// ❌ A reader that doesn't register what it read (lint rejects it)
export async function getMeals(userId) {
  return (await getDb()).orm.meal.where({ userId }).all()  // ← never reruns after a mutation or sync
}
// ✅ defineReader({ keys: (userId) => [mealKeys.byUser(userId)], read: ... })

// ❌ Non-userId-scoped keys for user data
keys: () => [macroMetricsKeys.all]  // ← not scoped to the user; use byUser(userId)

// ❌ Local data read in a component
const meals = createQuery(...)  // ← read it in the route's load; it appears whole instead of through a skeleton

// ❌ Raw useMutation/createQuery in route files
// Use the feature hook instead

// ❌ Hardcoded strings
toast.error('Failed to save');  // ← use m['unknownErrorOccurred']()

// ❌ Verbose hook names
const useCreateFoodEntryMutation = ... // ← useCreateFoodEntry

// ❌ Copying load data into state
let meals = $state(data.meals)  // ← stale after a rerun; use $derived(data.meals)

// ❌ Reading params or url after an await in a load
const meal = await getMeals(depends, userId);
const day = params.date;  // ← not tracked; read it before the first await
```
