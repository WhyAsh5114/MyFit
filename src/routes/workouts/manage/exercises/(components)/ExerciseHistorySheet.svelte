<script lang="ts">
	import DefaultInfiniteLoader from '$lib/components/DefaultInfiniteLoader.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Sheet from '$lib/components/ui/sheet';
	import { trpc } from '$lib/trpc/client';
	import type { RouterOutputs } from '$lib/trpc/router';
	import { untrack } from 'svelte';
	import CopyIcon from 'virtual:icons/lucide/clipboard-copy';
	import WorkoutExerciseCard from '../../../[workoutId]/(components)/WorkoutExerciseCard.svelte';
	import { workoutRunes } from '../../workoutRunes.svelte';
	import type { InfiniteEvent } from 'svelte-infinite-loading';

	let exercisesFound: RouterOutputs['workouts']['getExerciseHistory'] = $state([]);

	$effect(() => {
		if (untrack(() => exercisesFound.at(-1)?.name) !== workoutRunes.exerciseHistorySheetName) {
			exercisesFound = [];
		}
	});

	async function loadMore(infiniteEvent: InfiniteEvent) {
		const exerciseName = workoutRunes.exerciseHistorySheetName;
		const lastExerciseFound = exercisesFound.at(-1);
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
		exercisesFound.push(...newExercisesFound);
		if (newExercisesFound.length < 10) infiniteEvent.detail.complete();
	}
</script>

<Sheet.Root bind:open={workoutRunes.exerciseHistorySheetOpen}>
	<Sheet.Content class="flex w-11/12 flex-col px-2">
		<Sheet.Header>
			<Sheet.Title>History</Sheet.Title>
			<Sheet.Description>
				{workoutRunes.exerciseHistorySheetName}
			</Sheet.Description>
		</Sheet.Header>
		<div class="flex h-px grow flex-col overflow-y-auto">
			{#each exercisesFound as exercise}
				{@const wm = exercise.workout.workoutOfMesocycle}
				<div class="mb-1 mt-4 flex items-start gap-1">
					<Button
						onclick={() => workoutRunes.copyExerciseSetNumbersFromHistory(exercise)}
						size="icon"
						variant="secondary"
					>
						<CopyIcon />
					</Button>
					<div class="mr-auto flex flex-col">
						<span class="font-bold">{wm?.mesocycle.mesocycleExerciseSplitDays[wm.splitDayIndex].name}</span>
						<span class="text-xs font-semibold">{wm?.mesocycle.name}</span>
					</div>
					<span class="font-semibold text-muted-foreground">
						{exercise.workout.startedAt.toLocaleDateString(undefined, {
							day: 'numeric',
							month: 'short'
						})}
					</span>
				</div>
				<WorkoutExerciseCard {exercise} />
			{/each}
			<DefaultInfiniteLoader {loadMore} identifier={workoutRunes.exerciseHistorySheetName} entityPlural="exercises" />
		</div>
	</Sheet.Content>
</Sheet.Root>
