# Data layer

How the frontend reads and writes data. Why it works this way is in [Local-first data](../explanation/local-first.md).

| Data                                         | Read with                          | Write with                                     |
| -------------------------------------------- | ---------------------------------- | ---------------------------------------------- |
| User data (IndexedDB)                        | a reader, called by a route `load` | `useMutation` (`#lib/data/mutation.svelte.ts`) |
| Remote (nutrition API), device (Health), OTA | a TanStack `createQuery` hook      | not written locally                            |

## Data flow

Every feature follows the same path:

```
Query → [Mapper] → Form Schema → [Mapper] → Mutation → IDB
```

1. A **query** reads the current value: from IndexedDB in a route `load`, or from the API through TanStack.
2. A **mapper** (optional) turns the DB or API shape into the form's initial values.
3. The **form** validates with the Zod schema through superforms while the user edits.
4. A **mapper** (optional) turns the validated form data back into the DB input shape.
5. The **mutation** writes to IndexedDB, and the outbox queues it for sync.

Add a mapper only when the DB shape and form shape differ. A mapper that only spreads an object is noise.

## Readers and loads

A reader is made with `defineReader({ keys, read })` and called as `reader(depends, args)`. It registers its `keys` before it reads, so a `load` can't use one and miss its reruns.

```ts
// features/food-diary/food-entry/queries/get-by-date.ts
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
export const load: PageLoad = async ({ params, depends, parent }) => {
	const { ownerId } = await parent();
	const date = parseSelectedDay(params.date);
	const [meals, foodEntries] = await Promise.all([
		getMeals(depends, ownerId),
		getFoodEntriesByDate(depends, { userId: ownerId, date })
	]);
	return { day: date.toString(), meals, foodEntries };
};
```

- **Use the key factory the mutations use.** A key becomes a `depends` id (`dependencyId` in `#lib/data/dependencies.ts`), and `invalidateKeys(prefix)` reruns every active `load` that registered a key under that prefix. The page data updates in place, so the component keeps its state.
- **A `+page.ts` calls its readers itself**, with `Promise.all` when there are several, and returns them under flat keys. There is no feature-level loader function.
- **Pages under `(app)/(protected)/` get `ownerId: string` from `await parent()`.** A page's data never has a missing-account case (see [Accounts and sessions](../explanation/accounts.md)).
- **Return `null` for a missing row.** A `load` never throws for missing data.
- **Work out what the app would save from rows the `load` already read**, so the page shows it on the first frame; a component still saves it. The Diary's fixed activity calories come from the activity preferences this way (`lib/domain/nutrition/generated-activity.ts`). Step-based calories wait for Health, which a `load` doesn't, so they show the last saved value until the steps arrive. A day that hasn't started gets neither: the preferences may change before it does.
- **Read `params` and `url` before the `load` returns.** Reading them after an `await` is fine; reading them in a callback that runs later is not tracked. A `load` that reads `url.search` reruns on every search-param change.
- **Read page data with `$derived(data.x)`.** Never copy `data` into `$state`: `data` updates without a remount, and the copy goes stale. For a local value you can change that still follows `data`, reassign a `let` derived (see [Frontend → Svelte 5](frontend.md#svelte-5)). A form built from `data` keeps the values it started with, which is what you want mid-edit.
- **Outside a `load`, pass `noDepends`** (`#lib/data/dependencies.ts`), as the chat tools do: `getFoodEntriesByIds(noDepends, { userId, ids })`. Nothing reruns that read, so use it only for a one-off read whose result isn't shown as page data.
- **Components outside a page's data read the user with `getCurrentUser()`** (`user/current-user.svelte.ts`), which reads the `(app)` layout's data.

ESLint enforces two of these: a `queries/*.ts` file exports only `get…` readers made with `defineReader(...)` or `use…` TanStack hooks, and a `+page.ts` or `+layout.ts` may not import the IDB client.

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
- **`onSuccess` returns `invalidateKeys(...)`**, so `mutateAsync` resolves once the pages have the new data.
- **Invalidate `byUser`**, unless a page would flash a stale state. Deleting an entry reloads its day (`byDate`), not `byId`, because the edit page would show "not found" while it navigates away.
- **A day key is the local day** (`localDay`), never `toISOString()`.
- **`onError` always shows `m['unknownErrorOccurred']()`** in a toast and calls `console.error` with context.
- **Call `invalidateKeys` only from** a mutation's `onSuccess`, from sync (`services/sync/sync-invalidation.ts`, which maps each pulled model to its key prefixes), and from the account root's `publishOwner`, which reruns every `load` that read another account.

## TanStack Query (remote and device reads)

Used for the nutrition API, the Health plugin and OTA, which a `load` shouldn't wait on.

```ts
// Args come through a getter, which is what makes the query reactive in Svelte 5.
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

- **Take args through a getter function**, not raw values.
- **Network queries set** `staleTime: 1000 * 60 * 10`, `refetchOnWindowFocus: false` and `refetchOnReconnect: false`. A query whose data never changes (a chat photo) uses `staleTime: Infinity`.
- **Device queries** (Health, the OTA plugin) set a `staleTime` that fits how fast the value changes, and gate `enabled` on the plugin check in their feature (`hasHealth()`, `hasUpdater()`; see [Frontend → Capacitor](frontend.md#capacitor-and-native)).
- **Let `queryFn` throw.** No `try/catch`, toast or log inside it: TanStack retries a failed query, so a toast there repeats. The component reads `isError` and shows an empty state with a retry, or one toast in an `$effect`. A response that is an answer, like a 404 for a missing food, returns `null`.
- **A write that goes only to the network uses TanStack's `createMutation`**, which keeps its retry: login (`routes/login/components/login-form.svelte`), the chat photo upload (`chat-image/mutations/upload.ts`) and the OTA check (`ota/mutations/check-for-updates.ts`). Local writes use `useMutation`.
- **Leave `queryClient` to the account root and logout**, which cancel and clear it when the account changes. Routes and components never call it. A feature hook may seed its own query's cache: the photo upload puts the local image under `chatImageKeys.byId(id)`, so the message shows it without downloading it again.

## Naming

| Kind            | Pattern                       | Example                               |
| --------------- | ----------------------------- | ------------------------------------- |
| Local reader    | `get{Resource}[By{Selector}]` | `getFoodEntriesByDate(depends, args)` |
| Remote query    | `use{Resource}[By{Selector}]` | `useNutritionDataById(getId)`         |
| Mutation        | `use{Verb}{Resource}`         | `useCreateFoodEntry()`                |
| Upsert mutation | `useSave{Resource}`           | `useSaveMeals()`                      |

- No `Query` or `Mutation` suffix on hook names.
- **Name a mutation for what it does.** `useCreate…` is an insert. A versioned row such as activity preferences is a create, and earlier rows stay as history. `useSave…` is only for an upsert.
- Local variables are short: `const nutritionData = useNutritionDataById(() => id)`, `const createFoodEntry = useCreateFoodEntry()`.

## Query keys

```ts
export const foodEntryKeys = {
	all: ['foodEntry'] as const,
	byUser: (userId: string) => [...foodEntryKeys.all, userId] as const,
	byDate: (userId: string, date: string) =>
		[...foodEntryKeys.byUser(userId), 'date', date] as const,
	byId: (userId: string, id: string) => [...foodEntryKeys.byUser(userId), 'id', id] as const
};
```

- **Every user-scoped key has `userId` at the second level.** A key without it keeps one user's data after another signs in. A key for a random id the API scopes to its owner (`chatImageKeys.byId(id)`) needs no user level.
- Factory methods are `byUser`, `by{Selector}` (`byDate`, `byId`, `byCode`) or `search`, with no `Query` or `get` suffix. A domain with several kinds of value puts the kind first: `capacitorHealthKeys.stepsByDate(date)`. A key for one value with no selector is named for it: `otaKeys.currentBundle()`.
- **The segment label goes before its value**: `[...byUser(userId), 'date', date]`, not `[..., date]` or `[..., 'byDate', date]`.
- Device data, such as Health (`capacitorHealthKeys`), has no `userId` level: it belongs to the device, not the account.
