<script lang="ts">
	import { afterNavigate, goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Button from '$lib/components/ui/button/button.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import H2 from '$lib/components/ui/typography/H2.svelte';
	import { trpc } from '$lib/trpc/client';
	import type { RouterOutputs } from '$lib/trpc/router.js';
	import type { WorkoutStatus } from '@prisma/client';
	import type { DateRange } from 'bits-ui';
	import { InfiniteLoader, loaderState } from 'svelte-infinite';
	import LoaderCircle from 'virtual:icons/lucide/loader-circle';
	import AddIcon from 'virtual:icons/lucide/plus';
	import FilterComponent from './(components)/FilterComponent.svelte';
	import { workoutRunes } from './manage/workoutRunes.svelte.js';
	import NoWorkoutsFilterComponent from './(components)/NoWorkoutsFilterComponent.svelte';

	let { data } = $props();
	let workouts: RouterOutputs['workouts']['load'] | 'loading' = $state('loading');

	afterNavigate(async () => {
		loaderState.reset();
		workouts = await data.workouts;
		if (workouts.length !== 10) loaderState.complete();
	});

	async function loadMore() {
		const lastWorkout = workouts.at(-1);
		if (typeof lastWorkout === 'string' || lastWorkout === undefined) return;

		const newWorkouts = await trpc().workouts.load.query({
			cursorId: lastWorkout.id
		});
		if (workouts !== 'loading') workouts.push(...newWorkouts);
		if (newWorkouts.length !== 10) loaderState.complete();
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
		goto(newURL);
	}
</script>

<H2>Workouts</H2>

<div class="flex grow flex-col gap-2">
	<div class="flex gap-1">
		{#if workouts !== 'loading'}
			{#await data.filterData}
				TODO: skeleton
			{:then filterData}
				{#if filterData}
					<FilterComponent {filterData} currentFilters={data.currentFilters} {setFilters} />
				{:else}
					<NoWorkoutsFilterComponent />
				{/if}
			{/await}
		{/if}
		<Button aria-label="create-workout" onclick={createNewWorkout}><AddIcon /></Button>
	</div>
	<div class="flex h-px grow flex-col gap-1 overflow-y-auto">
		{#if workouts === 'loading'}
			{#each Array(10) as _}
				<div class="flex h-12 items-center justify-between rounded-md border bg-card p-2">
					<Skeleton class="text-lg-skeleton" />
					<Skeleton class="badge-skeleton" />
				</div>
			{/each}
		{:else}
			<InfiniteLoader triggerLoad={loadMore}>
				{#each workouts as workout}
					{@const { workoutOfMesocycle } = workout}
					<Button
						class="mb-1 flex h-12 items-center justify-between rounded-md border bg-card p-2"
						href="/workouts/{workout.id}"
						variant="outline"
					>
						<span class="text-lg font-semibold">
							{workout.startedAt.toLocaleDateString(undefined, {
								day: '2-digit',
								month: 'long'
							})}
						</span>
						{#if workoutOfMesocycle}
							{@const splitDayName =
								workoutOfMesocycle.mesocycle.mesocycleExerciseSplitDays[workoutOfMesocycle.splitDayIndex].name}
							<span class="truncate text-muted-foreground">
								{splitDayName === '' ? 'Rest' : splitDayName}
								{workoutOfMesocycle.workoutStatus === 'Skipped' ? '(skipped)' : ''}
							</span>
						{/if}
					</Button>
				{:else}
					<div class="muted-text-box">No workouts found</div>
				{/each}
				{#snippet loading()}
					<LoaderCircle class="animate-spin" />
				{/snippet}
				{#snippet error(load)}
					<Button onclick={load} variant="outline">An error occurred. Retry?</Button>
				{/snippet}
				{#snippet noData()}
					{#if workouts.length > 0}
						<div class="flex items-center justify-start gap-2 font-semibold text-muted-foreground">
							<Separator class="h-0.5 w-20" />
							<span class="whitespace-nowrap">That's all!</span>
							<Separator class="h-0.5 w-20" />
						</div>
					{/if}
				{/snippet}
			</InfiniteLoader>
		{/if}
	</div>
</div>
