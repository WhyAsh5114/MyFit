<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import DefaultInfiniteLoader from '$lib/components/DefaultInfiniteLoader.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import H2 from '$lib/components/ui/typography/H2.svelte';
	import { trpc } from '$lib/trpc/client';
	import type { RouterInputs, RouterOutputs } from '$lib/trpc/router.js';
	import type { WorkoutStatus } from '@prisma/client';
	import type { DateRange } from 'bits-ui';
	import { type InfiniteLoadingEvents } from 'svelte-infinite-loading';
	import AddIcon from 'virtual:icons/lucide/plus';
	import StickyNoteIcon from 'virtual:icons/lucide/sticky-note';
	import FilterComponent from './(components)/FilterComponent.svelte';
	import NoWorkoutsFilterComponent from './(components)/NoWorkoutsFilterComponent.svelte';
	import { workoutRunes } from './manage/workoutRunes.svelte.js';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';

	let { data } = $props();
	let workouts: RouterOutputs['workouts']['load'] = $state([]);
	let currentFilters = $derived(getCurrentFilters());

	function getCurrentFilters() {
		const currentFilters: Exclude<RouterInputs['workouts']['load']['filters'], undefined> = {};
		const startDate = $page.url.searchParams.get('startDate');
		const endDate = $page.url.searchParams.get('endDate');
		const selectedMesocycles = $page.url.searchParams.get('selectedMesocycles');
		const selectedWorkoutStatuses = $page.url.searchParams.get('selectedWorkoutStatuses');

		if (startDate) {
			currentFilters.startDate = new Date(startDate);
		}
		if (endDate) {
			currentFilters.endDate = new Date(endDate);
		}
		if (selectedMesocycles) {
			currentFilters.selectedMesocycles = JSON.parse(selectedMesocycles);
		}
		if (selectedWorkoutStatuses) {
			currentFilters.selectedWorkoutStatuses = JSON.parse(selectedWorkoutStatuses);
		}

		return currentFilters;
	}

	async function loadMore(infiniteEvent: InfiniteLoadingEvents['infinite']) {
		const lastWorkout = workouts.at(-1);

		const newWorkouts = await trpc().workouts.load.query({
			cursorId: lastWorkout?.id,
			filters: getCurrentFilters()
		});

		if (newWorkouts.length === 0) {
			infiniteEvent.detail.complete();
			return;
		}

		infiniteEvent.detail.loaded();
		workouts.push(...newWorkouts);
		if (newWorkouts.length !== 10) infiniteEvent.detail.complete();
	}

	function createNewWorkout() {
		if (workoutRunes.editingWorkoutId !== null) workoutRunes.resetStores();
		goto('/workouts/manage/start');
	}

	function setFilters(
		selectedDateRange: DateRange,
		selectedMesocycles: (string | null)[],
		selectedWorkoutStatus: (WorkoutStatus | null)[]
	) {
		const newURL = new URL($page.url);

		if (selectedDateRange.start) {
			newURL.searchParams.set('startDate', selectedDateRange.start.toString());
		} else {
			newURL.searchParams.delete('startDate');
		}

		if (selectedDateRange.end) {
			newURL.searchParams.set('endDate', selectedDateRange.end.toString());
		} else {
			newURL.searchParams.delete('endDate');
		}

		if (selectedMesocycles.length) {
			newURL.searchParams.set('selectedMesocycles', JSON.stringify(selectedMesocycles));
		} else {
			newURL.searchParams.delete('selectedMesocycles');
		}

		if (selectedWorkoutStatus.length) {
			newURL.searchParams.set('selectedWorkoutStatuses', JSON.stringify(selectedWorkoutStatus));
		} else {
			newURL.searchParams.delete('selectedWorkoutStatuses');
		}

		if (newURL.toString() === $page.url.toString()) return;
		workouts = [];
		goto(newURL);
	}
</script>

<H2>Workouts</H2>

<div class="flex grow flex-col gap-2">
	<div class="flex gap-1">
		{#await data.filterData}
			<Skeleton class="h-10 w-full" />
		{:then filterData}
			{#if filterData}
				<FilterComponent {filterData} {currentFilters} {setFilters} />
			{:else}
				<NoWorkoutsFilterComponent />
			{/if}
		{/await}
		<Button aria-label="create-workout" onclick={createNewWorkout}><AddIcon /></Button>
	</div>
	<div class="flex h-px grow flex-col gap-1 overflow-y-auto">
		{#each workouts as workout}
			{@const { workoutOfMesocycle } = workout}
			<Button
				class="flex h-12 items-center gap-2 rounded-md border bg-card p-2"
				href="/workouts/{workout.id}"
				variant="outline"
			>
				<span class="mr-auto text-lg font-semibold">
					{workout.startedAt.toLocaleDateString(undefined, {
						day: '2-digit',
						month: 'long'
					})}
				</span>
				{#if workout.note}
					<StickyNoteIcon class="text-muted-foreground" />
				{/if}
				{#if workoutOfMesocycle}
					{@const splitDayName =
						workoutOfMesocycle.mesocycle.mesocycleExerciseSplitDays[workoutOfMesocycle.splitDayIndex].name}
					<span class="truncate text-right text-muted-foreground">
						{splitDayName === '' ? 'Rest' : splitDayName}
						{workoutOfMesocycle.workoutStatus === 'Skipped' ? '(skipped)' : ''}
					</span>
				{/if}
			</Button>
		{/each}
		<DefaultInfiniteLoader {loadMore} identifier={currentFilters} entityPlural="workouts" />
	</div>
</div>
