<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Command from '$lib/components/ui/command/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import H2 from '$lib/components/ui/typography/H2.svelte';
	import { trpc } from '$lib/trpc/client.js';
	import type { RouterOutputs } from '$lib/trpc/router';
	import { onMount } from 'svelte';
	import ChevronsUpDown from 'virtual:icons/lucide/chevrons-up-down';
	import LoaderCircle from 'virtual:icons/lucide/loader-circle';
	import WorkoutExerciseCard from '../workouts/[workoutId]/(components)/WorkoutExerciseCard.svelte';
	import ExerciseStatsChart from './ExerciseStatsChart.svelte';

	type WorkoutExercise = RouterOutputs['workouts']['getExerciseHistory'][number];
	type BasicExerciseData = Pick<WorkoutExercise, 'name' | 'targetMuscleGroup' | 'customMuscleGroup'>;

	let { data } = $props();
	let exercisesByMuscleGroup = $state<{ group: string; exercises: BasicExerciseData[] }[]>();

	let searchText = $state('');
	let searchOpen = $state(true);
	let selectedExercise = $state<string>();
	let exerciseInstances = $state<WorkoutExercise[]>();

	let filteredExercisesByMuscleGroup = $derived(
		exercisesByMuscleGroup
			?.filter((g) => g.exercises.some((ex) => ex.name.toLowerCase().includes(searchText.toLowerCase())))
			.map(({ group, exercises }) => ({
				group,
				exercises: exercises.filter((ex) => ex.name.toLowerCase().includes(searchText.toLowerCase()))
			})) ?? []
	);

	onMount(async () => {
		const exerciseList = await data.exerciseList;
		exercisesByMuscleGroup = Object.entries(
			Object.groupBy(exerciseList, (ex) => ex.customMuscleGroup ?? ex.targetMuscleGroup)
		).map(([group, exercises]) => ({
			group,
			exercises: exercises!.filter((ex) => ex !== undefined)
		}));
	});

	async function selectExercise(name: string) {
		searchText = name;
		searchOpen = false;
		selectedExercise = name;
		exerciseInstances = await trpc().workouts.getExerciseHistory.query({ exerciseName: name });
	}
</script>

<H2>Exercise stats</H2>

<Popover.Root bind:open={searchOpen}>
	<Popover.Trigger asChild let:builder>
		<Button builders={[builder]} variant="outline" role="combobox" class="mb-2 w-full justify-between">
			{selectedExercise ?? 'Search for an exercise'}
			<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
		</Button>
	</Popover.Trigger>
	<Popover.Content sameWidth>
		<Command.Root class="mb-6 h-fit" shouldFilter={false}>
			<Command.Input placeholder="Type here" bind:value={searchText} />
			<Command.List>
				{#if exercisesByMuscleGroup === undefined}
					<Command.Loading>
						<div
							class="flex h-full w-full flex-row items-center justify-center gap-2 p-4 text-sm text-muted-foreground"
						>
							<LoaderCircle class="animate-spin" />
							<span>Fetching exercises...</span>
						</div>
					</Command.Loading>
				{:else}
					<Command.Empty>No results found.</Command.Empty>
					{#each filteredExercisesByMuscleGroup as { group, exercises }}
						<Command.Group heading={group}>
							{#each exercises as ex}
								<Command.Item onclick={() => selectExercise(ex.name)}>{ex.name}</Command.Item>
							{/each}
						</Command.Group>
					{/each}
				{/if}
			</Command.List>
		</Command.Root>
	</Popover.Content>
</Popover.Root>

<div class="flex flex-col gap-2">
	{#if selectedExercise}
		<ExerciseStatsChart {selectedExercise} exercises={exerciseInstances} />
		{#if exerciseInstances}
			{#each exerciseInstances as instance}
				<WorkoutExerciseCard exercise={instance} date={new Date(instance.workout.startedAt)} />
			{/each}
		{/if}
	{/if}
</div>
