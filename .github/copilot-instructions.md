# MyFit — Copilot Instructions

## Architecture

MyFit is a **local-first, mobile-first fitness SPA** built with SvelteKit + Capacitor.

- **No SSR.** Root layout sets `prerender = true`; `(app)` group sets `ssr = false`. All data fetching is client-side.
- **Local-first data.** All user data (food entries, metrics, targets, preferences) is stored in IndexedDB via `PrismaIDBClient` — a Prisma-compatible client auto-generated from the schema. Writes go to IDB first; an outbox pattern queues changes for background sync to the remote PostgreSQL database.
- **Remote data is read-only from the client.** Nutrition food data is fetched from the Hono API via `apiClient` and cached in TanStack Query — it is never written locally.
- **Two clients, two purposes:**
  - `getClient()` → `PrismaIDBClient` (IndexedDB) — all user data reads/writes
  - `apiClient` → Hono RPC client — nutrition data search/lookup only

---

## Tech Stack

| Concern | Library |
|---|---|
| Framework | SvelteKit 2, Svelte 5 (runes) |
| Styling | Tailwind CSS v4 |
| Components | shadcn-svelte (via bits-ui) |
| Charts | layerchart |
| Server state | TanStack Svelte Query v6 |
| Forms | sveltekit-superforms + zod v4 |
| Local DB | PrismaIDBClient (IndexedDB) |
| Remote API | Hono RPC (`hc<AppType>`) |
| Auth | better-auth (email OTP + anonymous) |
| i18n | Paraglide JS (compile-time) |
| Mobile | Capacitor 8 (iOS + Android) |
| Date math | `@internationalized/date` |

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
        get.ts                # useResource(getUserId)
        get-by-date.ts        # useResourceByDate(getArgs)
        get-by-id.ts          # useResourceById(getArgs)
        search.ts             # useSearchResource(getSearch)
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

1. **Query** fetches the current value from IDB (or API for remote data)
2. **Mapper** (optional) converts the raw DB/API shape into the form's initial values
3. **Form** validates with the Zod schema via superforms; user edits data
4. **Mapper** (optional) converts validated form data back to the DB input shape
5. **Mutation** writes to IDB; the outbox queues it for remote sync

Only add mappers when the DB shape and form shape genuinely differ. Do not create mappers that just spread an object.

---

## Naming Conventions

### Hooks

| Type | Pattern | Example |
|---|---|---|
| Query | `use{Resource}` | `useCurrentUser()` |
| Query by selector | `use{Resource}By{Selector}` | `useFoodEntriesByDate(getArgs)` |
| Mutation | `use{Verb}{Resource}` | `useCreateFoodEntry()` |
| Upsert mutation | `useSave{Resource}` | `useSaveActivityPreferences()` |

No `Get` prefix, no `Query`/`Mutation` suffix on hook names.

### Local variables (in components/routes)

```ts
// ✅ Concise and readable
const currentUser = useCurrentUser();
const foodEntries = useFoodEntriesByDate(() => ({ userId, date }));
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
  byId: (userId: string, id: string) => [...foodEntryKeys.list(userId), 'id', id] as const,
};
```

- All user-scoped keys must include `userId` at the second level.
- Avoid flat `all`-only keys for user-scoped data — stale data persists across users.
- Key segment names: `byUser`, `byDate`, `byId`, `search` — no `Query`/`get` suffixes.

---

## TanStack Query Conventions

### Queries

```ts
// Reactive getter function pattern — required for Svelte 5 reactivity
export const useFoodEntriesByDate = (
  getArgs: () => { userId: string; date: CalendarDate }
) =>
  createQuery(() => {
    const { userId, date } = getArgs();
    return {
      queryKey: foodEntryKeys.byDate(userId, date.toString()),
      queryFn: async () => { /* ... */ },
      enabled: !!userId && !!date,
    };
  });
```

- Always accept args via a getter function, not raw values. This is what makes queries reactive.
- `enabled: !!userId` guards against running before auth is ready.
- **IDB queries:** no `staleTime` needed — local data is always current.
- **Remote/API queries:** set `staleTime: 1000 * 60 * 10`, `refetchOnWindowFocus: false`, `refetchOnReconnect: false`.
- Never `try/catch` inside `queryFn`. Let errors propagate to TanStack's error state.

### Mutations

```ts
export const useCreateFoodEntry = () =>
  createMutation(() => ({
    mutationFn: async ({ data, userId }: { data: FoodEntryFormSchema; userId: string }) => {
      const foodEntry = foodEntryFormSchemaToFoodEntry(data, userId);
      return await getClient().foodEntry.create({ data: foodEntry });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: foodEntryKeys.byDate(data.userId, data.eatenAt.toISOString().split('T')[0]),
      });
    },
    onError: (error) => {
      toast.error(m['unknownErrorOccurred']());
      console.error('Failed to create food entry:', error);
    },
  }));
```

- `onSuccess` invalidates by the tightest applicable key scope (prefer `byDate`/`byId` over `list`/`all`).
- `setQueryData` for optimistic-style updates on `update` mutations when you already have the full updated object.
- `onError` always shows `m['unknownErrorOccurred']()` toast + `console.error` with context.
- Never call `queryClient` inside a route/component — only inside mutation `onSuccess`/`onError`.

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
  if (!metrics.data) return null;
  return calculateDailyNutritionStats({ metrics: metrics.data, ... });
});

// ✅ Reactive query args
const foodEntries = useFoodEntriesByDate(() => ({
  userId: currentUser.data?.id ?? '',
  date: selectedDay,
}));

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
import * as Card from '$lib/components/ui/card/index.js';
import * as Form from '$lib/components/ui/form/index.js';

<!-- ✅ Loading state in button -->
<Button disabled={mutation.isPending}>
  {#if mutation.isPending}<Spinner />{:else}Save <SaveIcon />{/if}
</Button>

<!-- ✅ Conditional classes -->
<div class={cn('base-class', { 'conditional-class': condition })}>
```

- Always import from `$lib/components/ui/` — not directly from `bits-ui`.
- Use `cn()` from `$lib/utils` for all conditional class logic.
- Use `<Spinner />` for in-button loading states; use `<Skeleton />` for full-section loading states.
- Use `<Empty.Root>` + `<Empty.Header>` + `<Empty.Content>` for empty states.

---

## i18n (Paraglide)

```svelte
<script lang="ts">
  import { m } from '$lib/paraglide/messages';
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

- IDB client (`getClient()`) is **browser-only**. The root `+layout.ts` calls `initializeClient()` on first load. Never call `getClient()` in SSR context or before the root layout has resolved.
- Capacitor plugins are initialized at layout level (`+layout.svelte`). Don't re-initialize plugins in child routes.
- Use `Capacitor.getPlatform()` to gate platform-specific code (`'android'`, `'ios'`, `'web'`).
- `viewport-fit=cover` is set in `app.html` for safe-area insets — don't override it.
- The static adapter outputs to `build/` which Capacitor's `webDir` points at.

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

- Domain functions are **pure** — no imports from `$lib/clients/`, `$lib/features/`, or SvelteKit.
- Accept typed plain objects, return plain values.
- When computing consumed calories from `FoodEntry`, always scale by quantity: `entry.energyKcal_100g * (entry.quantityG / 100)`.

---

## Auth & Session Flow

1. `+layout.svelte` (root) wraps the tree in `<QueryClientProvider>`.
2. `(app)/+layout.ts` disables SSR/prerender for all authenticated routes.
3. `<SessionCacher>` in `(app)/+layout.svelte` runs on every navigation and syncs the better-auth session with the local IDB user record.
4. The `user` feature (`useCurrentUser`) reads the local IDB record — not the auth session directly.
5. `resetDatabaseState()` in `db.ts` clears IDB + localStorage on logout.

---

## Adding a New Feature

1. Create `src/lib/features/{domain}/{resource}/keys.ts` with a hierarchical key factory.
2. Add `queries/` and `mutations/` sub-folders. Name files after the operation (`get.ts`, `get-by-date.ts`, `create.ts`, `update.ts`).
3. If the DB shape ≠ form shape, add `model/mapper.ts`. If the schema is complex, add `model/schema.ts`.
4. Define the Prisma model in `apps/api/prisma/schema/` and run `pnpm generate` from `apps/api/`.
5. For user-scoped IDB models: ensure the `rootModel = "User"` cascade in the `prismaIDB` generator handles your model (check `exclude` list).
6. Use `useCurrentUser()` in route components to get the `userId` — never hardcode or pass it via props through multiple layers.

---

## Anti-Patterns

```ts
// ❌ Query inside queryFn
queryFn: async () => {
  try { return await getClient().foodEntry.findMany(...) }
  catch (e) { toast.error('...'); throw e; }  // ← don't catch; let TanStack handle it
}

// ❌ Non-userId-scoped keys for user data
queryKey: macroMetricsKeys.all  // ← stale data persists across user switches

// ❌ Raw createMutation/createQuery in route files
// Use the feature hook instead

// ❌ Hardcoded strings
toast.error('Failed to save');  // ← use m['unknownErrorOccurred']()

// ❌ Verbose hook names
const useGetFoodEntriesQuery = ...   // ← useFoodEntries
const useCreateFoodEntryMutation = ... // ← useCreateFoodEntry

// ❌ Flat query args (not reactive)
export const useFoodEntries = (userId: string) => createQuery(...)
// ✅ Use getter functions
export const useFoodEntries = (getUserId: () => string) => createQuery(() => ...)
```
