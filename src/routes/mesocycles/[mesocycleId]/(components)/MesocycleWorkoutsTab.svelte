<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { arraySum, convertCamelCaseToNormal } from '$lib/utils';
	import type { FullMesocycle } from '../+layout.server';

	let { mesocycle }: { mesocycle: FullMesocycle } = $props();

	function averagePercentageIncrease(arr: number[]): number {
		if (arr.length < 2) return 0;

		const totalPercentageIncrease = arr.slice(1).reduce((sum, current, index) => {
			const previous = arr[index];
			const percentageIncrease = ((current - previous) / previous) * 100;
			return sum + percentageIncrease;
		}, 0);
		const numberOfIncrements = arr.length - 1;
		return totalPercentageIncrease / numberOfIncrements;
	}

	function getAverage(arr: number[]): number {
		if (arr.length === 0) return 0;

		const sum = arr.reduce((acc, curr) => acc + curr, 0);
		return sum / arr.length;
	}

	const totalMesocycleLength = $derived(
		mesocycle.mesocycleExerciseSplitDays.length * arraySum(mesocycle.RIRProgression)
	);
	const totalWorkoutsOfMesocycle = $derived(mesocycle.workoutsOfMesocycle.length);

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

	const allExercises = $derived(
		mesocycle.workoutsOfMesocycle.flatMap((wm) => wm.workout.workoutExercises)
	);
	const groupedExercises = $derived.by(() => {
		const groupedExercisesByMuscleGroup = Object.entries(
			Object.groupBy(
				allExercises,
				({ targetMuscleGroup, customMuscleGroup }) => customMuscleGroup ?? targetMuscleGroup
			)
		).map(([muscleGroup, exercises]) => ({
			muscleGroup,
			exercises
		}));

		const fullyGroupedExercises = groupedExercisesByMuscleGroup.map(
			({ muscleGroup, exercises }) => ({
				muscleGroup,
				exercises: Object.entries(Object.groupBy(exercises ?? [], ({ name }) => name)).map(
					([exerciseName, performances]) => ({ exerciseName, performances })
				)
			})
		);
		return fullyGroupedExercises;
	});

	const sortedByPerformanceChangeMuscleGroups = $derived(
		groupedExercises
			.map(({ exercises, muscleGroup }) => ({
				muscleGroup,
				averageIncrease: getAverage(
					exercises.map(({ performances }) =>
						averagePercentageIncrease(
							performances?.map((p) =>
								arraySum(
									p?.sets.map(
										(set) =>
											(set.reps + set.RIR) * set.load +
											(p.bodyweightFraction ?? 0) *
												(mesocycle.workoutsOfMesocycle.find((wm) => wm.workoutId === p.workoutId)
													?.workout.userBodyweight ?? 0)
									)
								)
							) ?? []
						)
					)
				)
			}))
			.sort((a, b) => a.averageIncrease - b.averageIncrease)
	);
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
						sortedByPerformanceChangeMuscleGroups[sortedByPerformanceChangeMuscleGroups.length - 1]
							.muscleGroup
					)}
				</div>
				<p class="text-xs text-muted-foreground">
					{sortedByPerformanceChangeMuscleGroups[
						sortedByPerformanceChangeMuscleGroups.length - 1
					].averageIncrease.toFixed(2)}% cyclic increase
				</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 p-4 pb-1.5">
				<Card.Title class="text-sm font-medium">Worst muscle</Card.Title>
			</Card.Header>
			<Card.Content class="p-4 pt-0">
				<div class="text-2xl font-bold">
					{convertCamelCaseToNormal(sortedByPerformanceChangeMuscleGroups[0].muscleGroup)}
				</div>
				<p class="text-xs text-muted-foreground">
					{sortedByPerformanceChangeMuscleGroups[0].averageIncrease.toFixed(2)}% cyclic increase
				</p>
			</Card.Content>
		</Card.Root>
	</div>
{:else}
	<div class="muted-text-box">No workouts created</div>
{/if}

<br />
TODO: Maybe put these stats in basics tab chart mode, makes more sense that way
<br /><br />
TODO: Workouts list
