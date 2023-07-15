<script lang="ts">
	import { days } from '$lib/commonDB';
	import { onMount } from 'svelte';
	import {
		workoutDay,
		plannedRIR,
		weekNumber,
		muscleTargetsAndSets,
		referenceWorkout,
		workoutExercises
	} from '../newWorkoutStore';
	import { goto } from '$app/navigation';
	import WorkoutExerciseCard from '$lib/components/workout/WorkoutExerciseCard.svelte';
	export let data;

	onMount(() => {
		if (
			$workoutDay === undefined ||
			$plannedRIR === undefined ||
			$weekNumber === undefined ||
			Object.keys($muscleTargetsAndSets).length === 0
		) {
			goto('/workouts/new');
		}
	});

	let todaysDay = days[new Date().getDay()];

	function splitExerciseToWorkoutExercise(splitEx: SplitExercise) {
		const workoutExercise: WorkoutExercise = {
			name: splitEx.name as string,
			repRangeStart: splitEx.repRangeStart as number,
			repRangeEnd: splitEx.repRangeEnd as number,
			muscleTarget: splitEx.muscleTarget as (typeof commonMuscleGroups)[number],
			setType: splitEx.setType as Exclude<SplitExercise['setType'], ''>,
			jointPainRating: undefined,
			pumpRating: undefined,
			disruptionRating: undefined,
			mindMuscleConnectionRating: undefined,
			repsLoadRIR: []
		};
		for (let i = 0; i < (splitEx.sets as number); i++) {
			workoutExercise.repsLoadRIR.push([undefined, undefined, $plannedRIR]);
		}
		return workoutExercise;
	}

	$workoutExercises = [];
	if ($referenceWorkout === null && data.parentMesocycle.splitExercises[$workoutDay]) {
		data.parentMesocycle.splitExercises[$workoutDay].forEach((exercise) => {
			$workoutExercises.push(splitExerciseToWorkoutExercise(exercise));
		});
	} else {
		// TODO: template from old workout and apply appropriate volume changes
	}

	let totalSets = 0;
	$: {
		totalSets = 0;
		$workoutExercises.forEach((exercise) => {
			totalSets += exercise.repsLoadRIR.length;
		});
	}
	let setsPerformedPerExercise: number[];
	let totalSetsPerformed: number;
	$: try {
		totalSetsPerformed = setsPerformedPerExercise.reduce((partialSum, num) => partialSum + num, 0);
	} catch {
		totalSetsPerformed = 0;
	}
</script>

<div class="grow w-full bg-primary rounded-md flex flex-col">
	<div
		class="collapse collapse-arrow rounded-t-md bg-accent rounded-b-none text-black shadow-md shadow-black"
	>
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
					<span class="badge badge-error text-white">{muscleTarget}</span>
				{/each}
			</div>
		</div>
	</div>
	<ul class="h-px grow w-full overflow-y-auto p-2 gap-3 flex flex-col">
		<WorkoutExerciseCard bind:workoutExercises={$workoutExercises} bind:setsPerformedPerExercise />
	</ul>
</div>
<button
	class="btn btn-block btn-accent mt-3 flex flex-col disabled:bg-accent disabled:text-black"
	disabled={totalSetsPerformed !== totalSets}
	on:click={() => {goto('/workouts/new/overview')}}
>
	{#if totalSetsPerformed === totalSets}
		Finish workout
	{:else}
		{Math.round(totalSetsPerformed / totalSets * 100)}%
		<progress
			class="progress w-full bg-secondary progress-primary"
			value={totalSetsPerformed}
			max={totalSets}
		/>
	{/if}
</button>

<style>
	progress::-webkit-progress-value {
		-webkit-transition: width 0.5s ease;
		-moz-transition: width 0.5s ease;
		-o-transition: width 0.5s ease;
		transition: width 0.5s ease;
	}
</style>
