<script>
	import {
		getCycleNumber,
		getDayNumber
	} from "$lib/util/MesocycleTemplate";
	export let data;

	const { activeMesocycle, activeMesocycleTemplate, todaysWorkout, todaysSplitWorkout } = data;
	const workoutIdx = getDayNumber(activeMesocycle.workouts, activeMesocycleTemplate.exerciseSplit);
</script>

<div class="collapse bg-primary collapse-arrow rounded-md">
	<input type="checkbox" id="show-workout-details" checked />
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
		<div class="flex gap-1 mt-4 font-semibold justify-between items-center">
			<progress class="progress progress-accent w-56 b" value="40" max="100"></progress>
		</div>
	</div>
</div>

<button class="btn btn-accent btn-block mt-auto"> Finish workout </button>
