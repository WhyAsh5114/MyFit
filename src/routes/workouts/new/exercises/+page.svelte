<script lang="ts">
	import WorkoutExercisesTable from "$lib/components/workouts/WorkoutExercisesTable.svelte";
	import { getCycleNumber, getDayNumber } from "$lib/util/MesocycleTemplate";
	export let data;

	const { activeMesocycle, activeMesocycleTemplate, todaysWorkout, todaysSplitWorkout } = data;
	const workoutIdx = getDayNumber(activeMesocycle.workouts, activeMesocycleTemplate.exerciseSplit);

	let totalSets = 0,
		totalSetsCompleted = 0;
	let allExercisesSetsCompleted: boolean[][] = [];
	$: {
		(totalSets = 0), (totalSetsCompleted = 0);
		allExercisesSetsCompleted.forEach((setsCompleted) => {
			setsCompleted.forEach((set) => {
				if (set === true) totalSetsCompleted++;
				totalSets++;
			});
		});
	}
</script>

<div class="collapse bg-primary collapse-arrow rounded-md">
	<input type="checkbox" id="show-workout-details" aria-label="show-workout-details" checked />
	<div class="collapse-title text-xl font-medium">
		{todaysSplitWorkout.name}
		<span class="text-sm font-normal">
			Day {workoutIdx + 1}, Cycle {getCycleNumber(
				activeMesocycleTemplate.exerciseSplit,
				activeMesocycle.workouts
			)}
		</span>
	</div>
	<div class="collapse-content backdrop-brightness-50">
		<div class="flex gap-1 mt-4 font-semibold justify-around items-center">
			<progress class="progress progress-accent w-56 b" value={totalSetsCompleted} max={totalSets}
			></progress>
			{totalSetsCompleted}/{totalSets}
		</div>
	</div>
</div>
<WorkoutExercisesTable
	bind:exercises={todaysWorkout.exercisesPerformed}
	bind:allExercisesSetsCompleted
/>
<button class="btn btn-accent btn-block mt-1"> Finish workout </button>
