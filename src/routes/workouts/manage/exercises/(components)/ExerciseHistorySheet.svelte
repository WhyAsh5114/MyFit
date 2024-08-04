<script lang="ts">
	import * as Sheet from '$lib/components/ui/sheet';
	import { InfiniteLoader, loaderState } from 'svelte-infinite';
	import { workoutRunes } from '../../workoutRunes.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import type { RouterOutputs } from '$lib/trpc/router';
	import { trpc } from '$lib/trpc/client';
	import LoaderCircle from 'virtual:icons/lucide/loader-circle';
	import { untrack } from 'svelte';
	import WorkoutExerciseCard from '../../../[workoutId]/(components)/WorkoutExerciseCard.svelte';

	let exercisesFound: RouterOutputs['workouts']['getExerciseHistory'] = $state([]);

	$effect(() => {
		if (untrack(() => exercisesFound.at(-1)?.name) !== workoutRunes.exerciseHistorySheetName) {
			exercisesFound = [];
			loaderState.reset();
		}
	});

	async function loadMore() {
		const exerciseName = workoutRunes.exerciseHistorySheetName;
		const lastExerciseFound = exercisesFound.at(-1);
		if (exerciseName === undefined) return;

		const newExercisesFound = await trpc().workouts.getExerciseHistory.query({
			cursorId: lastExerciseFound?.id,
			exerciseName
		});
		exercisesFound.push(...newExercisesFound);
		if (newExercisesFound.length !== 10) loaderState.complete();
	}

	let containerElement: HTMLDivElement | undefined = $state();
</script>

<Sheet.Root bind:open={workoutRunes.exerciseHistorySheetOpen}>
	<Sheet.Content class="flex w-11/12 flex-col px-2">
		<Sheet.Header>
			<Sheet.Title>History</Sheet.Title>
			<Sheet.Description>
				{workoutRunes.exerciseHistorySheetName}
			</Sheet.Description>
		</Sheet.Header>
		<div bind:this={containerElement} class="flex h-px grow flex-col overflow-y-auto">
			<InfiniteLoader
				intersectionOptions={{ rootMargin: '0px 0px 200px 0px', root: containerElement }}
				triggerLoad={loadMore}
			>
				{#each exercisesFound as exercise}
					<WorkoutExerciseCard {exercise} workoutStartedAt={exercise.workout.startedAt} />
					<div class="mb-1"></div>
				{:else}
					<div class="muted-text-box">No exercise history found</div>
				{/each}
				{#snippet loading()}
					<LoaderCircle class="animate-spin" />
				{/snippet}
				{#snippet error(load)}
					<Button onclick={load} variant="outline">An error occurred. Retry?</Button>
				{/snippet}
				{#snippet noData()}
					{#if exercisesFound.length > 0}
						<div class="flex items-center justify-start gap-2 font-semibold text-muted-foreground">
							<Separator class="h-0.5 w-20" />
							<span class="whitespace-nowrap">That's all!</span>
							<Separator class="h-0.5 w-20" />
						</div>
					{/if}
				{/snippet}
			</InfiniteLoader>
		</div>
	</Sheet.Content>
</Sheet.Root>
