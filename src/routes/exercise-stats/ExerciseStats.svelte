<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import DefaultInfiniteLoader from '$lib/components/DefaultInfiniteLoader.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Command from '$lib/components/ui/command/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { RangeCalendar } from '$lib/components/ui/range-calendar/index.js';
	import * as Select from '$lib/components/ui/select';
	import { trpc } from '$lib/trpc/client.js';
	import type { RouterOutputs } from '$lib/trpc/router';
	import { dateToCalendarDate } from '$lib/utils';
	import { cn } from '$lib/utils.js';
	import { DateFormatter, getLocalTimeZone } from '@internationalized/date';
	import type { DateRange, Selected } from 'bits-ui';
	import type { InfiniteEvent } from 'svelte-infinite-loading';
	import { toast } from 'svelte-sonner';
	import CalendarIcon from 'virtual:icons/lucide/calendar';
	import ChevronsUpDown from 'virtual:icons/lucide/chevrons-up-down';
	import FilterIcon from 'virtual:icons/lucide/filter';
	import RenameIcon from 'virtual:icons/lucide/folder-pen';
	import LoaderCircle from 'virtual:icons/lucide/loader-circle';
	import WorkoutExerciseCard from '../workouts/[workoutId]/(components)/WorkoutExerciseCard.svelte';
	import ExerciseStatsChart from './ExerciseStatsChart.svelte';

	type WorkoutExercise = RouterOutputs['workouts']['getExerciseHistory'][number];
	type BasicExerciseData = Pick<WorkoutExercise, 'name' | 'targetMuscleGroup' | 'customMuscleGroup'>;

	const df = new DateFormatter('en-US', {
		dateStyle: 'medium'
	});

	let { data }: { data: { exerciseList: Promise<BasicExerciseData[]> } } = $props();
	let exercisesByMuscleGroup = $state<{ group: string; exercises: BasicExerciseData[] }[]>();

	let renameExerciseOpen = $state(false);
	let newExerciseName = $state<string>();
	let renamingExercise = $state(false);

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

	let dateRange: DateRange = $state({
		start: dateToCalendarDate(new Date()),
		end: dateToCalendarDate(new Date())
	});
	let mesocycleNames = $derived.by(() => {
		if (!exerciseInstances) return [];
		return Array.from(new Set(exerciseInstances.map((ex) => ex.workout.workoutOfMesocycle?.mesocycle.name ?? null)));
	});
	let selectedMesocycleNames: Selected<string | null>[] = $state([]);

	let filteredExerciseInstances = $derived.by(() => {
		if (!exerciseInstances) return [];
		return exerciseInstances.filter((ex) => {
			const date = dateToCalendarDate(ex.workout.startedAt);
			if (dateRange.start && dateRange.start > date) return false;
			if (dateRange.end && dateRange.end < date) return false;
			if (
				selectedMesocycleNames.length > 0 &&
				!selectedMesocycleNames.some((s) => s.value === (ex.workout.workoutOfMesocycle?.mesocycle.name ?? null))
			)
				return false;
			return true;
		});
	});

	$effect(() => {
		selectedExercise = undefined;
		exercisesByMuscleGroup = undefined;
		searchText = '';
		searchOpen = true;
		exerciseInstances = [];
		renameExerciseOpen = false;
		loadExercises();
	});

	async function loadExercises() {
		const exerciseList = await data.exerciseList;
		exercisesByMuscleGroup = Object.entries(
			Object.groupBy(exerciseList, (ex) => ex.customMuscleGroup ?? ex.targetMuscleGroup)
		).map(([group, exercises]) => ({
			group,
			exercises: exercises!.filter((ex) => ex !== undefined)
		}));
	}

	async function selectExercise(name: string) {
		searchText = name;
		searchOpen = false;
		selectedExercise = name;
		exerciseInstances = await trpc().workouts.getExerciseHistory.query({ exerciseName: name });
		dateRange.start = dateToCalendarDate(exerciseInstances[exerciseInstances.length - 1].workout.startedAt);
		dateRange.end = dateToCalendarDate(exerciseInstances[0].workout.startedAt);
	}

	async function loadMore(infiniteEvent: InfiniteEvent) {
		const exerciseName = selectedExercise;
		const lastExerciseFound = exerciseInstances?.at(-1);
		if (exerciseName === undefined) return;

		const newExercisesFound = await trpc().workouts.getExerciseHistory.query({
			cursorId: lastExerciseFound?.id,
			exerciseName
		});
		if (newExercisesFound.length === 0) {
			infiniteEvent.detail.complete();
			return;
		}

		infiniteEvent.detail.loaded();
		if (!exerciseInstances) exerciseInstances = [];
		exerciseInstances?.push(...newExercisesFound);
		dateRange.start = dateToCalendarDate(exerciseInstances[exerciseInstances.length - 1].workout.startedAt);
		dateRange.end = dateToCalendarDate(exerciseInstances[0].workout.startedAt);
		if (newExercisesFound.length < 10) infiniteEvent.detail.complete();
	}

	async function renameExercise(e: SubmitEvent) {
		e.preventDefault();
		renamingExercise = true;
		const { count } = await trpc().users.renameExercises.mutate({
			oldName: selectedExercise!,
			newName: newExerciseName!
		});
		toast.success(`Renamed ${count} exercises`);
		await invalidateAll();
		renamingExercise = false;
	}
</script>

<div class="flex gap-1">
	<Popover.Root bind:open={searchOpen}>
		<Popover.Trigger asChild let:builder>
			<Button builders={[builder]} variant="outline" role="combobox" class="mb-2 grow justify-between truncate">
				<span class="truncate">{selectedExercise ?? 'Search for an exercise'}</span>
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
	<Popover.Root bind:open={renameExerciseOpen}>
		<Popover.Trigger asChild let:builder>
			<Button
				builders={[builder]}
				size="icon"
				variant="secondary"
				aria-label="Rename exercise"
				class="shrink-0"
				disabled={selectedExercise === undefined}
			>
				<RenameIcon />
			</Button>
		</Popover.Trigger>
		<Popover.Content class="w-fit">
			<span class="font-semibold">Bulk rename to</span>
			<form class="my-2 flex w-full max-w-sm flex-col gap-1.5" onsubmit={renameExercise}>
				<Label for="new-name">New name</Label>
				<Input required id="new-name" placeholder="Type here" bind:value={newExerciseName} />
				<Button size="sm" type="submit" disabled={renamingExercise}>
					{#if renamingExercise}
						<LoaderCircle class="animate-spin" />
					{:else}
						Rename
					{/if}
				</Button>
			</form>
		</Popover.Content>
	</Popover.Root>
	<Popover.Root>
		<Popover.Trigger asChild let:builder>
			<Button
				builders={[builder]}
				size="icon"
				aria-label="Filter exercises"
				class="shrink-0"
				disabled={(exerciseInstances?.length ?? 0) === 0}
			>
				<FilterIcon />
			</Button>
		</Popover.Trigger>
		<Popover.Content class="w-fit">
			<span class="font-semibold">Filter by date</span>
			<div class="my-2 flex w-full max-w-sm flex-col gap-1.5">
				<Popover.Root openFocus>
					<Popover.Trigger asChild let:builder>
						<Button
							variant="outline"
							class={cn('w-[300px] justify-start text-left font-normal', !dateRange && 'text-muted-foreground')}
							builders={[builder]}
						>
							<CalendarIcon class="mr-2 h-4 w-4" />
							{#if dateRange && dateRange.start}
								{#if dateRange.end}
									{df.format(dateRange.start.toDate(getLocalTimeZone()))} - {df.format(
										dateRange.end.toDate(getLocalTimeZone())
									)}
								{:else}
									{df.format(dateRange.start.toDate(getLocalTimeZone()))}
								{/if}
							{:else if dateRange.start}
								{df.format(dateRange.start.toDate(getLocalTimeZone()))}
							{:else}
								Pick a date
							{/if}
						</Button>
					</Popover.Trigger>
					<Popover.Content class="w-auto p-0" align="start">
						<RangeCalendar bind:value={dateRange} initialFocus placeholder={dateRange?.start} />
					</Popover.Content>
				</Popover.Root>
				<span class="font-semibold">Filter by mesocycles</span>
				<Select.Root multiple bind:selected={selectedMesocycleNames}>
					<Select.Trigger class="w-[300px]">
						<Select.Value placeholder="All mesocycles" />
					</Select.Trigger>
					<Select.Content>
						{#each mesocycleNames as mesocycleName}
							<Select.Item class={cn({ italic: mesocycleName === null })} value={mesocycleName}>
								{mesocycleName === null ? 'Non-mesocycle' : mesocycleName}
							</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
		</Popover.Content>
	</Popover.Root>
</div>

<div class="flex flex-col gap-2">
	{#if selectedExercise}
		<ExerciseStatsChart {selectedExercise} exercises={filteredExerciseInstances} />
		{#if exerciseInstances}
			{#each filteredExerciseInstances as instance}
				<WorkoutExerciseCard exercise={instance} date={new Date(instance.workout.startedAt)} />
			{/each}
			<DefaultInfiniteLoader {loadMore} identifier={selectedExercise} entityPlural="exercises" />
		{/if}
	{/if}
</div>
