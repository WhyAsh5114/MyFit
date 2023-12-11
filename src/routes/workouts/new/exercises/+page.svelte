<script lang="ts">
  import { goto } from "$app/navigation";
  import MyModal from "$lib/components/MyModal.svelte";
  import WorkoutExercisesTable from "$lib/components/workouts/WorkoutExercisesTable.svelte";
  import { getCycleNumber, getDayNumber } from "$lib/util/MesocycleTemplate";
  import {
    allExercisesSetsCompleted,
    sorenessData,
    workloadData,
    exercisesPerformed,
    workoutBeingPerformed
  } from "../newWorkoutStore.js";
  export let data;

  const { activeMesocycle, activeMesocycleTemplate, todaysSplitWorkout, userBodyweight } = data;
  const workoutIdx = getDayNumber(activeMesocycle.workouts, activeMesocycleTemplate.exerciseSplit);

  if ($workoutBeingPerformed === null) {
    $workoutBeingPerformed = data.todaysWorkout;
  }
  if ($exercisesPerformed === null) {
    $exercisesPerformed = data.todaysWorkout.exercisesPerformed;
  }

  let totalSets = 0,
    totalSetsCompleted = 0;
  $: {
    (totalSets = 0), (totalSetsCompleted = 0);
    $allExercisesSetsCompleted.forEach((setsCompleted) => {
      setsCompleted.forEach((set) => {
        if (set) {
          totalSetsCompleted++;
        }
        totalSets++;
      });
    });
  }

  let errorModal: HTMLDialogElement,
    muscleGroupWorkloads: Workout["muscleGroupWorkloads"],
    sorenessFromPreviousWorkouts: Workout["muscleSorenessToNextWorkout"];
  async function saveExercisesAndWorkload() {
    if (!$exercisesPerformed) {
      return;
    }
    if ($exercisesPerformed.length === 0) {
      errorModal.show();
      return;
    }
    $workloadData = muscleGroupWorkloads;
    $sorenessData = sorenessFromPreviousWorkouts;
    await goto("/workouts/new/finish");
  }
</script>

<MyModal title="Error" bind:dialogElement={errorModal}>
  Add at least one exercise to the workout
</MyModal>
<div class="collapse bg-primary collapse-arrow rounded-md">
  <input id="show-workout-details" aria-label="show-workout-details" checked type="checkbox" />
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
      <progress
        class="progress progress-accent w-56 b"
        max={totalSets}
        value={totalSetsCompleted}
      />
      {totalSetsCompleted}/{totalSets}
    </div>
  </div>
</div>
{#if $exercisesPerformed !== null}
  <WorkoutExercisesTable
    mode="performing"
    referenceWorkout={data.referenceWorkout}
    {userBodyweight}
    workoutsThatPreviouslyTargeted={data.workoutsThatPreviouslyTargeted}
    bind:exercises={$exercisesPerformed}
    bind:allExercisesSetsCompleted={$allExercisesSetsCompleted}
    bind:muscleGroupWorkloads
    bind:sorenessFromPreviousWorkouts
  />
{/if}
<button
  class="btn btn-accent btn-block mt-1"
  disabled={totalSetsCompleted < totalSets}
  on:click={saveExercisesAndWorkload}
>
  Finish workout
</button>
