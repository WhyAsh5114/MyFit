<script lang="ts">
	import { goto } from "$app/navigation";
	import MyModal from "$lib/components/MyModal.svelte";
	import WorkoutExercisesTable from "$lib/components/workouts/WorkoutExercisesTable.svelte";
	import { getCycleNumber, getDayNumber } from "$lib/util/MesocycleTemplate";
	import {
		allExercisesSetsCompleted,
		sorenessData,
		workloadData,
		workoutBeingPerformed
	} from "../newWorkoutStore.js";
	export let data;

	let { activeMesocycle, activeMesocycleTemplate, todaysSplitWorkout } = data;
	const workoutIdx = getDayNumber(activeMesocycle.workouts, activeMesocycleTemplate.exerciseSplit);

	if ($workoutBeingPerformed === null) {
		$workoutBeingPerformed = data.todaysWorkout;
	}

	let totalSets = 0,
		totalSetsCompleted = 0;
	$: {
		(totalSets = 0), (totalSetsCompleted = 0);
		$allExercisesSetsCompleted.forEach((setsCompleted) => {
			setsCompleted.forEach((set) => {
				if (set === true) totalSetsCompleted++;
				totalSets++;
			});
		});
	}

	let sorenessFromPreviousWorkouts: Workout["muscleSorenessToNextWorkout"];
	let muscleGroupWorkloads: Workout["muscleGroupWorkloads"];

	let errorModal: HTMLDialogElement;
	async function saveExercisesAndWorkload() {
		if (!$workoutBeingPerformed) return;
		if ($workoutBeingPerformed.exercisesPerformed.length === 0) {
			errorModal.show();
			return;
		}
		$workloadData = muscleGroupWorkloads;
		$sorenessData = sorenessFromPreviousWorkouts;
		await goto("/workouts/new/finish");
	}
</script>

<MyModal bind:dialogElement={errorModal} title="Error">
	Add at least one exercise to the workout
</MyModal>
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
{#if $workoutBeingPerformed}
	<WorkoutExercisesTable
		bind:exercises={$workoutBeingPerformed.exercisesPerformed}
		bind:allExercisesSetsCompleted={$allExercisesSetsCompleted}
		bind:muscleGroupWorkloads
		bind:sorenessFromPreviousWorkouts
		referenceWorkout={data.referenceWorkout}
	/>
{/if}
<button
	class="btn btn-accent btn-block mt-1"
	disabled={totalSetsCompleted < totalSets}
	on:click={saveExercisesAndWorkload}
>
	Finish workout
</button>
