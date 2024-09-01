<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { arraySum, convertCamelCaseToNormal } from '$lib/utils';
	import {
		generatePerformanceChangesPerMuscleGroup,
		generatePerformanceChangesPerSplitDay
	} from '$lib/utils/mesocycleUtils';
	import type { FullMesocycle } from '../+layout.server';

	let { mesocycle }: { mesocycle: FullMesocycle } = $props();

	const totalWorkoutsOfMesocycle = $derived(mesocycle.workoutsOfMesocycle.length);
	const totalMesocycleLength = $derived(
		mesocycle.mesocycleExerciseSplitDays.length * arraySum(mesocycle.RIRProgression)
	);
	const totalSkippedWorkouts = $derived(
		mesocycle.workoutsOfMesocycle.filter((wm) => wm.workoutStatus === 'Skipped').length
	);

	const mostSkippedWorkoutDay = $derived.by(() => {
		const frequencyMap: Record<number, number> = {};
		mesocycle.workoutsOfMesocycle
			.filter((wm) => wm.workoutStatus === 'Skipped')
			.forEach((item) => {
				frequencyMap[item.splitDayIndex] = (frequencyMap[item.splitDayIndex] || 0) + 1;
			});
		let mostOccurring: string | undefined;
		let maxCount = 0;
		for (const [key, count] of Object.entries(frequencyMap)) {
			if (count > maxCount) {
				mostOccurring = key;
				maxCount = count;
			}
		}
		if (mostOccurring === undefined) return null;
		return mesocycle.mesocycleExerciseSplitDays[parseInt(mostOccurring)].name;
	});

	const performanceChangesPerMuscleGroups = $derived(
		generatePerformanceChangesPerMuscleGroup(mesocycle.workoutsOfMesocycle)
	);

	const performanceChangesPerSplitDay = $derived(generatePerformanceChangesPerSplitDay(mesocycle));
</script>

{#if mesocycle.workoutsOfMesocycle.length}
	<div class="grid grid-cols-2 gap-1">
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 p-4 pb-1.5">
				<Card.Title class="text-sm font-medium">Completion</Card.Title>
			</Card.Header>
			<Card.Content class="p-4 pt-0">
				<div class="text-2xl font-bold">
					{((totalWorkoutsOfMesocycle / totalMesocycleLength) * 100).toFixed(2)}%
				</div>
				<p class="text-xs text-muted-foreground">
					{totalWorkoutsOfMesocycle}/{totalMesocycleLength} workouts
				</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 p-4 pb-1.5">
				<Card.Title class="text-sm font-medium">Skipped</Card.Title>
			</Card.Header>
			<Card.Content class="p-4 pt-0">
				<p>
					<span class="text-2xl font-bold">{totalSkippedWorkouts}</span>
					<span class="text-sm">/ {totalWorkoutsOfMesocycle}</span>
				</p>
				<p class="text-xs text-muted-foreground">
					Most skipped: <span class="font-semibold">{mostSkippedWorkoutDay}</span>
				</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 p-4 pb-1.5">
				<Card.Title class="text-sm font-medium">Best muscle</Card.Title>
			</Card.Header>
			<Card.Content class="p-4 pt-0">
				<div class="text-2xl font-bold">
					{convertCamelCaseToNormal(
						performanceChangesPerMuscleGroups[performanceChangesPerMuscleGroups.length - 1].muscleGroup
					)}
				</div>
				<p class="text-xs text-muted-foreground">
					{performanceChangesPerMuscleGroups[
						performanceChangesPerMuscleGroups.length - 1
					].averagePercentageChange.toFixed(2)}% cyclic increase
				</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 p-4 pb-1.5">
				<Card.Title class="text-sm font-medium">Worst muscle</Card.Title>
			</Card.Header>
			<Card.Content class="p-4 pt-0">
				<div class="text-2xl font-bold">
					{convertCamelCaseToNormal(performanceChangesPerMuscleGroups[0].muscleGroup)}
				</div>
				<p class="text-xs text-muted-foreground">
					{performanceChangesPerMuscleGroups[0].averagePercentageChange.toFixed(2)}% cyclic increase
				</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 p-4 pb-1.5">
				<Card.Title class="text-sm font-medium">Best day</Card.Title>
			</Card.Header>
			<Card.Content class="p-4 pt-0">
				<div class="text-2xl font-bold">
					{performanceChangesPerSplitDay[performanceChangesPerSplitDay.length - 1].splitDayName}
				</div>
				<p class="text-xs text-muted-foreground">
					{performanceChangesPerSplitDay[performanceChangesPerSplitDay.length - 1].averagePercentageChange.toFixed(2)}%
					cyclic increase
				</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 p-4 pb-1.5">
				<Card.Title class="text-sm font-medium">Worst day</Card.Title>
			</Card.Header>
			<Card.Content class="p-4 pt-0">
				<div class="text-2xl font-bold">
					{performanceChangesPerSplitDay[0].splitDayName}
				</div>
				<p class="text-xs text-muted-foreground">
					{performanceChangesPerSplitDay[0].averagePercentageChange.toFixed(2)}% cyclic increase
				</p>
			</Card.Content>
		</Card.Root>
	</div>
{:else}
	<div class="muted-text-box">No workouts for stat generation</div>
{/if}
