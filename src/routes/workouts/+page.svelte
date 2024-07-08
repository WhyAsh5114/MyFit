<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import H2 from '$lib/components/ui/typography/H2.svelte';
	import AddIcon from 'virtual:icons/lucide/plus';
	import SearchIcon from 'virtual:icons/lucide/search';
	import LoaderCircle from 'virtual:icons/lucide/loader-circle';
	import { afterNavigate, goto } from '$app/navigation';
	import { trpc } from '$lib/trpc/client';
	import { InfiniteLoader, loaderState } from 'svelte-infinite';
	import { page } from '$app/stores';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import { workoutRunes } from './manage/workoutRunes.svelte.js';
	import type { WorkoutWithMesoData } from './+page.server.js';

	let { data } = $props();
	let workouts: WorkoutWithMesoData[] | 'loading' = $state('loading');
	let searchString = $state($page.url.searchParams.get('search') ?? '');

	afterNavigate(async () => {
		loaderState.reset();
		workouts = await data.workouts;
		if (workouts.length !== 10) loaderState.complete();
	});

	function updateSearchParam(e: Event) {
		e.preventDefault();
		const url = new URL($page.url);
		if (searchString) url.searchParams.set('search', searchString);
		else url.searchParams.delete('search');

		workouts = 'loading';
		goto(url);
	}

	async function loadMore() {
		const lastWorkout = workouts.at(-1);
		if (typeof lastWorkout === 'string' || lastWorkout === undefined) return;

		const newWorkouts = await trpc($page).workouts.load.query({
			cursorId: lastWorkout.id
		});
		if (workouts !== 'loading') workouts.push(...newWorkouts);
		if (newWorkouts.length !== 10) loaderState.complete();
	}

	function createNewWorkout() {
		if (workoutRunes.editingWorkoutId !== null) workoutRunes.resetStores();
		goto('/workouts/manage/start');
	}
</script>

<H2>Workouts</H2>

<div class="flex grow flex-col gap-2">
	<div class="flex gap-1">
		<form class="contents" onsubmit={updateSearchParam}>
			<div class="muted-text-box w-full">TODO: filters</div>
			<Button aria-label="search" type="submit" variant="secondary">
				<SearchIcon />
			</Button>
		</form>
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
							<span class="truncate text-muted-foreground">
								{workoutOfMesocycle.mesocycle.mesocycleExerciseSplitDays[
									workoutOfMesocycle.splitDayIndex
								].name}
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
