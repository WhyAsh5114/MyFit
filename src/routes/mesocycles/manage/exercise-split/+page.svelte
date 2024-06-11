<script lang="ts">
	import H3 from '$lib/components/ui/typography/H3.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Slider } from '$lib/components/ui/slider/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import Label from '$lib/components/ui/label/label.svelte';
	import * as Command from '$lib/components/ui/command/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Select from '$lib/components/ui/select/index.js';

	import { mesocycleRunes } from '../mesocycleRunes.svelte';
	import Check from 'virtual:icons/lucide/check';
	import CaretSort from 'virtual:icons/lucide/chevrons-up-down';
	import LoaderCircle from 'virtual:icons/lucide/loader-circle';
	import { cn, debounce } from '$lib/utils.js';
	import { afterNavigate, goto } from '$app/navigation';
	import { ProgressionVariable, type ExerciseSplit, type ExerciseSplitDay } from '@prisma/client';
	import { InfiniteLoader, loaderState } from 'svelte-infinite';
	import { Separator } from '$lib/components/ui/separator';
	import { deserialize } from '$app/forms';
	import type { ActionResult } from '@sveltejs/kit';
	import { toast } from 'svelte-sonner';
	import { page } from '$app/stores';

	let { data } = $props();

	type ExerciseSplitWithSplitDays = ExerciseSplit & { exerciseSplitDays: ExerciseSplitDay[] };
	let exerciseSplits: ExerciseSplitWithSplitDays[] | 'loading' = $state('loading');
	let searchString = $state('');

	let preferredProgressionVariable = $state({
		value: mesocycleRunes.mesocycle.preferredProgressionVariable,
		label: mesocycleRunes.mesocycle.preferredProgressionVariable
	});
	let startOverloadPercentage = $state(mesocycleRunes.mesocycle.startOverloadPercentage);
	let lastSetToFailure = $state(mesocycleRunes.mesocycle.lastSetToFailure);
	let selectedExerciseSplit: ExerciseSplitWithSplitDays | null = $state(
		mesocycleRunes.selectedExerciseSplit ?? null
	);

	afterNavigate(async () => {
		loaderState.reset();
		exerciseSplits = await data.exerciseSplits;
		if (exerciseSplits.length !== data.exerciseSplitsTake) loaderState.complete();
	});

	function updateSearchParams(searchString: string): void {
		const url = new URL($page.url);
		if (searchString) url.searchParams.set('search', searchString);
		else url.searchParams.delete('search');
		exerciseSplits = 'loading';
		goto(url);
	}
	const debouncedSearch = debounce(updateSearchParams, 500);
	$effect(() => debouncedSearch(searchString));

	function savePreferencesAndExerciseSplit() {
		if (selectedExerciseSplit === null) {
			toast.error('Error', { description: 'Select an exercise split' });
			return;
		}

		mesocycleRunes.mesocycle.preferredProgressionVariable = preferredProgressionVariable.value;
		mesocycleRunes.mesocycle.startOverloadPercentage = startOverloadPercentage;
		mesocycleRunes.mesocycle.lastSetToFailure = lastSetToFailure;
		mesocycleRunes.saveStoresToLocalStorage();
		goto(`./volume?exerciseSplitId=${selectedExerciseSplit.id}`);
	}

	async function loadMore() {
		const lastExerciseSplit = exerciseSplits.at(-1);
		if (typeof lastExerciseSplit === 'string' || lastExerciseSplit === undefined) return;

		const response = await fetch('/exercise-splits?/load_more_exercise_splits', {
			method: 'POST',
			body: JSON.stringify({ cursorId: lastExerciseSplit.id })
		});
		const result: ActionResult = deserialize(await response.text());

		if (result.type === 'failure') {
			toast.error(result.data?.message);
			loaderState.error();
			return;
		} else if (result.type === 'success') {
			const newExerciseSplits = result.data as ExerciseSplitWithSplitDays[];
			if (exerciseSplits === 'loading') exerciseSplits = newExerciseSplits;
			else exerciseSplits.push(...newExerciseSplits);
			if (newExerciseSplits.length !== data.exerciseSplitsTake) loaderState.complete();
		}
	}
</script>

<H3>Exercise split</H3>

<span class="mb-0.5 text-sm font-medium">Exercise split</span>
<Popover.Root>
	<Popover.Trigger asChild let:builder>
		<Button builders={[builder]} variant="outline" role="combobox" class="w-full justify-between">
			{#if exerciseSplits !== 'loading'}
				{selectedExerciseSplit === null ? 'Pick one' : selectedExerciseSplit.name}
			{:else}
				{exerciseSplits === 'loading' ? 'Loading...' : 'An error occurred'}
			{/if}
			<CaretSort class="ml-2 h-4 w-4 shrink-0 opacity-50" />
		</Button>
	</Popover.Trigger>
	<Popover.Content class="mt-0.5 p-0" align="start">
		<Command.Root shouldFilter={false}>
			<Command.Input placeholder="Search" class="h-9" bind:value={searchString} />
			{#if exerciseSplits === 'loading'}
				<Command.Empty class="flex items-center justify-center gap-2">
					Loading <LoaderCircle class="h-5 w-5 animate-spin" />
				</Command.Empty>
			{/if}
			<Command.Group>
				{#if exerciseSplits !== 'loading'}
					<div class="flex h-32 flex-col overflow-y-auto">
						<InfiniteLoader triggerLoad={loadMore}>
							{#each exerciseSplits as exerciseSplit}
								<Command.Item
									value={exerciseSplit.id.toString()}
									onSelect={(currentValue) => {
										if (exerciseSplits === 'loading') return;
										selectedExerciseSplit =
											exerciseSplits.find((split) => split.id === parseInt(currentValue)) ?? null;
									}}
								>
									<Check
										class={cn('mr-2 h-4 w-4', {
											'text-transparent':
												selectedExerciseSplit === null ||
												selectedExerciseSplit.id !== exerciseSplit.id
										})}
									/>
									{exerciseSplit.name}
								</Command.Item>
							{:else}
								<div class="text-sm p-2">No exercise splits found</div>
							{/each}
							{#snippet loading()}
								<LoaderCircle class="animate-spin" />
							{/snippet}
							{#snippet error(load)}
								<Button variant="outline" onclick={load}>An error occurred. Retry?</Button>
							{/snippet}
							{#snippet noData()}
								{#if exerciseSplits.length > 0}
									<div
										class="flex items-center justify-start gap-2 font-semibold text-muted-foreground"
									>
										<Separator class="h-0.5 w-20" />
										<span class="whitespace-nowrap text-sm">That's all!</span>
										<Separator class="h-0.5 w-20" />
									</div>
								{/if}
							{/snippet}
						</InfiniteLoader>
					</div>
				{/if}
			</Command.Group>
		</Command.Root>
	</Popover.Content>
</Popover.Root>

{#if selectedExerciseSplit !== null}
	<Card.Root class="mt-2">
		<Card.Header>
			<Card.Title class="flex items-center justify-between">
				<span>{selectedExerciseSplit.name}</span>
				<Badge>{selectedExerciseSplit.exerciseSplitDays.length}-day cycle</Badge>
			</Card.Title>
		</Card.Header>
		<Card.Content class="flex flex-col gap-5">
			<Select.Root bind:selected={preferredProgressionVariable}>
				<div class="flex flex-col gap-1.5">
					<Select.Label class="mb-0.5 p-0 font-medium">Preferred progression scheme</Select.Label>
					<Select.Trigger id="mesocycle-progression-option">
						<Select.Value placeholder="Select" class="capitalize" />
					</Select.Trigger>
					<Select.Content>
						{#each Object.keys(ProgressionVariable) as progressionOption}
							<Select.Item value={progressionOption} class="capitalize">
								{progressionOption}
							</Select.Item>
						{/each}
					</Select.Content>
				</div>
			</Select.Root>
			<div class="flex flex-col gap-2">
				<div class="flex items-center justify-between text-sm font-medium">
					<span>Start overload percentage</span>
					<span class="text-muted-foreground">{startOverloadPercentage}%</span>
				</div>
				<Slider
					value={[startOverloadPercentage]}
					onValueChange={(value) => (startOverloadPercentage = value[0])}
					min={0}
					max={10}
					step={0.25}
				/>
			</div>
			<div class="mt-2 flex items-center justify-between">
				<Label
					for="mesocycle-last-set-to-failure"
					class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
				>
					Take last set to failure
				</Label>
				<Checkbox id="mesocycle-last-set-to-failure" bind:checked={lastSetToFailure} />
			</div>
		</Card.Content>
	</Card.Root>
{/if}

<div class="mt-auto grid grid-cols-2 gap-1">
	<Button variant="secondary">
		<a href="./basics" class="w-full">Previous</a>
	</Button>
	<Button on:click={savePreferencesAndExerciseSplit}>Next</Button>
</div>
