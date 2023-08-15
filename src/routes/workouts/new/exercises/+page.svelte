<script lang="ts">
	import { days } from '$lib/commonDB';
	import { onMount } from 'svelte';
	import {
		workoutDay,
		plannedRIR,
		weekNumber,
		muscleTargetsAndSets,
		workoutExercises,
		muscleWorkloads,
		musclesTargetedPreviously,
		setsPerformedPerExercise
	} from '../newWorkoutStore';
	import { goto } from '$app/navigation';
	import WorkoutExerciseCard from '$lib/components/workout/WorkoutExerciseCard.svelte';
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	export let data;

	onMount(() => {
		if (
			$workoutDay === undefined ||
			$plannedRIR === undefined ||
			$weekNumber === undefined ||
			$workoutExercises.length === 0 ||
			Object.keys($muscleTargetsAndSets).length === 0
		) {
			goto('/workouts/new');
		}
	});

	let todaysDay = days.at(new Date().getDay() - 1);

	let totalSets = 0;
	$: {
		totalSets = 0;
		$workoutExercises.forEach((exercise) => {
			totalSets += exercise.repsLoadRIR.length;
		});
	}
	const totalSetsPerformed = tweened(0, {
		duration: 400,
		easing: cubicOut
	});
	$: if ($setsPerformedPerExercise.length !== 0) {
		$totalSetsPerformed = $setsPerformedPerExercise.reduce(
			(partialSum, setsPerformed) => partialSum + setsPerformed.filter((setPerformed) => setPerformed).length,
			0
		);
	}

	$: {
		$muscleTargetsAndSets = {};
		$workoutExercises.forEach((exercise) => {
			if ($muscleTargetsAndSets[exercise.muscleTarget]) {
				$muscleTargetsAndSets[exercise.muscleTarget] += exercise.repsLoadRIR.length;
			} else {
				$muscleTargetsAndSets[exercise.muscleTarget] = exercise.repsLoadRIR.length;
			}
		});
	}
</script>

<div class="grow w-full bg-primary rounded-md flex flex-col">
	<div class="collapse collapse-arrow rounded-t-md bg-accent rounded-b-none text-black shadow-md shadow-black">
		<input type="checkbox" class="p-0 min-h-0" checked />
		<div class="collapse-title p-1.5 min-h-0 flex justify-between items-center">
			<h2 class="text-xl font-bold">
				{data.parentMesocycle.splitSchedule[$workoutDay]} ({days[$workoutDay]})
			</h2>
		</div>
		<div class="collapse-content backdrop-brightness-90">
			<div class="flex justify-between mt-2">
				<h3 class="font-semibold">Week {$weekNumber}, {todaysDay}</h3>
				<span class="badge font-semibold">{$plannedRIR} RIR</span>
			</div>
			<div class="flex flex-wrap gap-1 mt-1">
				{#each Object.keys($muscleTargetsAndSets) as muscleTarget}
					<span class="badge badge-error text-black">{muscleTarget}</span>
				{/each}
			</div>
		</div>
	</div>
	<div class="h-px grow w-full overflow-y-auto p-2">
		<WorkoutExerciseCard
			bind:workoutExercises={$workoutExercises}
			bind:setsPerformedPerExercise={$setsPerformedPerExercise}
			bind:muscleWorkloads={$muscleWorkloads}
			bind:musclesTargetedPreviously={$musclesTargetedPreviously}
		/>
	</div>
</div>
<div class="join grid grid-cols-2 w-full place-items-center mt-3">
	<button class="join-item btn btn-primary w-full">Add exercise</button>
	<button
		class="join-item btn btn-accent flex flex-col disabled:bg-accent disabled:text-black w-full"
		disabled={$totalSetsPerformed !== totalSets}
		on:click={() => {
			goto('/workouts/new/overview');
		}}
	>
		{#if $totalSetsPerformed === totalSets}
			Finish workout
		{:else}
			{Math.round(($totalSetsPerformed / totalSets) * 100)}%
			<progress class="progress w-full bg-secondary progress-primary" value={$totalSetsPerformed} max={totalSets} />
		{/if}
	</button>
</div>
