# Frontend conventions

Code rules for `apps/frontend`. How the app should look and behave is in [`DESIGN.md`](../../DESIGN.md); data access is in [Data layer](data-layer.md).

## Svelte 5

```ts
// Computed values are derived.
let caloriesRemaining = $derived(targetCalories - caloriesConsumed);
let stats = $derived.by(() => {
	if (!macroMetrics) return null;
	return calculateDailyNutritionStats({ metrics: macroMetrics /* ... */ });
});

// Page data comes from the route's load.
let { data }: PageProps = $props();
const diary = $derived(data.diary);

// A derived declared with `let` can be reassigned (Svelte 5.25+). The new value holds
// until a dependency changes; then it recomputes from the source again.
let { entry }: Props = $props();
let quantityG = $derived(entry.quantityG);
function nudge(by: number) {
	quantityG += by; // a local edit; a new `entry` resets it
}

// Effects are for side effects only.
$effect(() => {
	if (query.isSuccess && query.data) goto(resolve('/somewhere'));
});
```

- **Compute with `$derived` or `$derived.by()`.** Setting state inside an `$effect` to compute a value is a bug waiting to happen.
- **Use `$effect` only for side effects**: navigation, DOM work, syncing with something outside Svelte.
- **Reassign a `$derived` when you need a local value that follows its source.** Since Svelte 5.25, a `$derived` declared with `let` is writable: an assignment overrides it until a dependency changes, then it recomputes. Use it for an optimistic value or an editable copy of a prop or `data`, instead of `$state` plus an `$effect` that syncs it (ESLint's `svelte/prefer-writable-derived` flags that pattern). A `const` derived stays read-only.
- **Use `$state` for local UI state only**, never for a copy of `data`.
- **Model a flow with more than two states as one value**, not several booleans. See [Architecture → State](architecture.md#state).

## Components (shadcn-svelte)

```svelte
<script lang="ts">
	import * as Card from '#lib/components/ui/card/index.js';
</script>

<Button disabled={mutation.isPending}>
	{#if mutation.isPending}<Spinner />{:else}Save <SaveIcon />{/if}
</Button>

<div class={cn('base-class', { 'conditional-class': condition })}>
```

- **Import from `#lib/components/ui/`**, with namespace imports for compound components. Never import `bits-ui` directly (ESLint enforces this).
- **Use `cn()` from `#lib/utils`** for every conditional class.
- **Use `<Spinner />` in a button, `<Skeleton />` for a section** loading remote data. Local data never shows a skeleton (see [Data layer](data-layer.md#readers-and-loads)).
- **Use `<Empty.Root>`, `<Empty.Header>` and `<Empty.Content>`** for empty states.
- **Use `ResponsiveDialog`** (`lib/components/responsive-dialog.svelte`) for a secondary panel, never a bare `Drawer`.

## Forms (superforms and Zod 4)

```ts
// schema.ts: the schema and its type live together.
export const foodEntryFormSchema = z.object({/* ... */});
export type FoodEntryFormSchema = z.infer<typeof foodEntryFormSchema>;

// In the component: an edit form with initial data.
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
		}
	}
);
```

- **Always `SPA: true`.** There are no server actions.
- **`zod4` for initial values, `zod4Client` for browser validation.**
- **Let the parent page inject the submit button** through a `submit` snippet, so the form works on both create and edit pages.

## i18n (Paraglide)

```svelte
<script lang="ts">
	import { m } from '#lib/paraglide/messages';
</script>

<p>{m['foodDiary.noFoodFound']()}</p>
```

- **Every user-visible string has a key in `messages/en.json` and `messages/hi.json`.** That includes `aria-label`, `placeholder`, `alt` and toast text.
- Keys are namespaced `feature.camelCase`, such as `foodDiary.addManually`.
- **Format dates and numbers with `#lib/format.ts`** (`formatDate(date, 'long' | 'short' | 'time')`, `formatNumber`), which use the app's language. Never pass `'en-US'` or call `toLocaleString()` without a locale.
- **Show an enum value through a message**, not by reformatting its name: `Absolute` is `m['foodDiary.targets.absolute']()`.
- An unfinished screen may hardcode strings for now. Convert them when the screen ships.

## Capacitor and native

The app must work as a plain web app. Native features (Health, the back button and so on) only add to it. A new web bundle can run inside an older binary, so code that uses a plugin must cope with the plugin, or a newer method, being absent.

- **Check the platform and the plugin.** `Capacitor.isNativePlatform()` says the app is native, not that this binary has the plugin; `Capacitor.isPluginAvailable('<Plugin>')` is also true on the web for a plugin with a web stub (the updater, App, Health). Check both before using a native-only plugin, as `features/ota/has-updater.ts` does, and `try/catch` methods a newer plugin version might add.
- **A feature whose plugin is missing hides itself or does nothing.** Don't gate bundles by native version.
- **Gate platform-specific code with `Capacitor.getPlatform()`** (`'android'`, `'ios'`, `'web'`).
- **Initialize plugins in the root `+layout.svelte`**, once. Child routes don't re-initialize them.
- **`getDb()` is browser-only and opens lazily.** The first call runs the IndexedDB migrations and later calls share the client, so await it inside each reader and mutation. Never call it during prerender.
- **Pad screen roots with `env(safe-area-inset-*)`.** The app targets Android 16 (API 36), which enforces edge-to-edge: the webview extends under the system bars, and the `windowOptOutEdgeToEdgeEnforcement` opt-out and the StatusBar plugin's `overlaysWebView` and `backgroundColor` no longer work, so the app doesn't use the StatusBar plugin. Capacitor's SystemBars handles older WebViews. The root layout sets the system bar icon style from the in-app theme, which can differ from the device's.
- **Keep `viewport-fit=cover`** in `app.html`.
- The static adapter outputs to `build/`, which is Capacitor's `webDir`.

## Known deviations

- `lib/components/ui/calendar/calendar.svelte` defaults to `'en-US'`. It is generated by shadcn-svelte; pass `locale` where a calendar is used.
- `chart-tooltip.svelte` (generated) formats values with `toLocaleString()` and the browser's locale.
