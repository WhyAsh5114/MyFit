<script lang="ts">
	import { days } from '$lib/commonDB';
	import { onMount } from 'svelte';
	import {
		workoutDay,
		plannedRIR,
		weekNumber,
		muscleTargetsAndSets,
		referenceWorkout
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
			repsLoadRIR: Array(splitEx.sets as number).fill([undefined, undefined, $plannedRIR])
		};
		return workoutExercise;
	}

	let workoutExercises: WorkoutExercise[] = [];
	if ($referenceWorkout === null && data.parentMesocycle.splitExercises[$workoutDay]) {
		data.parentMesocycle.splitExercises[$workoutDay].forEach((exercise) => {
			workoutExercises.push(splitExerciseToWorkoutExercise(exercise));
		});
	} else {
        // TODO: template from old workout and apply appropriate volume changes
    }
</script>

<div class="grow w-full bg-primary rounded-md flex flex-col">
	<div class="flex flex-col w-full rounded-t-md bg-accent text-black p-2">
		<div class="flex justify-between items-center">
			<h2 class="text-xl font-bold">{data.parentMesocycle.splitSchedule[$workoutDay]}</h2>
			<span class="badge font-semibold">{$plannedRIR} RIR</span>
		</div>
		<h3>Week {$weekNumber}, {todaysDay}</h3>
		<div class="flex flex-wrap gap-1 mt-2">
			{#each Object.keys($muscleTargetsAndSets) as muscleTarget}
				<span class="badge badge-error text-white">{muscleTarget}</span>
			{/each}
		</div>
	</div>
	<ul class="h-px grow w-full overflow-y-auto mt-2 px-1 gap-2 flex flex-col">
		<WorkoutExerciseCard bind:workoutExercises />
	</ul>
</div>
<button class="btn btn-block btn-accent mt-3"> Finish Workout </button>
