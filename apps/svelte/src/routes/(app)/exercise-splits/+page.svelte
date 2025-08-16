<script lang="ts">
	import H1 from '$lib/components/typography/h1.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import ScrollArea from '$lib/components/ui/scroll-area/scroll-area.svelte';
	import { client } from '$lib/idb-client';
	import { createQuery } from '@tanstack/svelte-query';
	import { CalendarIcon, FilterIcon, LoaderCircleIcon, PlusIcon } from '@lucide/svelte';

	const exerciseSplitsQuery = createQuery(() => ({
		queryKey: ['exerciseSplits'],
		queryFn: () => client.exerciseSplit.findMany()
	}));
</script>

<H1>Exercise splits</H1>

<div class="flex w-full items-center gap-2">
	<Input placeholder="Search..." />
	<Button size="icon" variant="secondary" class="shrink-0"><FilterIcon /></Button>
	<Button size="icon" class="shrink-0" href="/exercise-splits/create"><PlusIcon /></Button>
</div>

<ScrollArea class="flex h-px grow flex-col">
	{#if exerciseSplitsQuery.isPending}
		<div class="text-muted-foreground flex h-full flex-col items-center justify-center gap-2">
			<LoaderCircleIcon size={128} strokeWidth={1} class="animate-spin" />
			<span>Loading</span>
		</div>
	{:else if exerciseSplitsQuery.isError}
		<div class="text-muted-foreground flex h-full flex-col items-center justify-center gap-2">
			<CalendarIcon size={128} strokeWidth={1} />
			<span>Error loading exercise splits</span>
		</div>
	{:else if exerciseSplitsQuery.data}
		{#each exerciseSplitsQuery.data as exerciseSplit (exerciseSplit.id)}
			<div>{exerciseSplit.name}</div>
		{:else}
			<div class="h-full flex flex-col justify-center items-center gap-2 text-muted-foreground">
				<CalendarIcon size={128} strokeWidth={1} />
				<span>No exercise splits created</span>
			</div>
		{/each}
	{/if}
</ScrollArea>
