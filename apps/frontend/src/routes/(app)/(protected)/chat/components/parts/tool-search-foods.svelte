<script lang="ts">
	import { DatabaseIcon, TriangleAlertIcon } from '@lucide/svelte';
	import type { MyUIMessage } from '@myfit/api';
	import Spinner from '#lib/components/ui/spinner/spinner.svelte';
	import { m } from '#lib/paraglide/messages.js';

	type SearchFoodsPart = Extract<MyUIMessage['parts'][number], { type: 'tool-searchFoods' }>;
	const { part }: { part: SearchFoodsPart } = $props();

	const query = $derived(part.input?.query ?? '');
</script>

<p role="status" class="flex max-w-full min-w-0 items-center gap-2 text-sm text-muted-foreground">
	{#if part.state === 'output-available'}
		<DatabaseIcon class="size-4 shrink-0" />
		<span class="min-w-0 truncate">
			{m['chat.searchedFoods']({ query, count: part.output.foods.length })}
		</span>
	{:else if part.state === 'output-error'}
		<TriangleAlertIcon class="size-4 shrink-0" />
		{m['chat.searchFoodsFailed']()}
	{:else}
		<Spinner />
		<span class="min-w-0 truncate">{m['chat.searchingFoods']({ query })}</span>
	{/if}
</p>
