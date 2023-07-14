<script lang="ts">
	import { days } from '$lib/commonDB';
	import { onMount } from 'svelte';
	import { workoutDay, plannedRIR, weekNumber, muscleTargetsAndSets } from '../newWorkoutStore';
	import { goto } from '$app/navigation';
	export let data;

	onMount(() => {
		if (
			$workoutDay === undefined ||
			$plannedRIR === undefined ||
			$weekNumber === undefined ||
			Object.keys($muscleTargetsAndSets).length === 0
		) {
            goto('/workouts/new')
		}
	});

	let todaysDay = days[new Date().getDay()];
    
    function splitExerciseToWorkoutExercise(splitEx: SplitExercise) {
        const workoutExercise: WorkoutExercise = {
            name: splitEx.name as string,
            repRangeStart: splitEx.repRangeStart as number,
            repRangeEnd: splitEx.repRangeEnd as number,
            muscleTarget: splitEx.muscleTarget as (typeof commonMuscleGroups)[number],
            setType: splitEx.setType as Exclude<SplitExercise["setType"], ''>,
            jointPainRating: undefined,
            pumpRating: undefined,
            disruptionRating: undefined,
            mindMuscleConnectionRating: undefined,
            repsAndRIR: Array(splitEx.sets as number).fill([undefined, $plannedRIR])
        };
        return workoutExercise;
    }
</script>

<div class="grow w-full bg-primary rounded-md">
	<div class="flex flex-col w-full rounded-t-md bg-secondary text-black p-2">
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
	<ul class="h-px w-full overflow-y-auto" />
</div>
<button class="btn btn-block btn-accent mt-3"> Finish Workout </button>
