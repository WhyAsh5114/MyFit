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
	<div class="collapse collapse-arrow rounded-t-md bg-accent rounded-b-none text-black">
		<input type="checkbox" class="p-0 min-h-0" checked />
		<div class="collapse-title p-1.5 min-h-0 flex justify-between items-center">
			<h2 class="text-xl font-bold">{data.parentMesocycle.splitSchedule[$workoutDay]} ({days[$workoutDay]})</h2>
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
		<WorkoutExerciseCard bind:workoutExercises />
	</ul>
</div>
<button class="btn btn-block btn-accent mt-3"> Finish Workout </button>
