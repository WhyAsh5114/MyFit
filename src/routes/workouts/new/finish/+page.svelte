<script lang="ts">
  import { goto, invalidate } from "$app/navigation";
  import MyModal from "$lib/components/MyModal.svelte";
  import { getTotalSets } from "$lib/util/MesocycleTemplate";
  import {
    allExercisesSetsCompleted,
    sorenessData,
    workloadData,
    workoutBeingPerformed
  } from "../newWorkoutStore";

  let difficultyRating: 1 | 2 | 3 | 4 | 5 = 3;

  let temp: WorkoutExerciseWithoutSetNumbers[] = [];
  if ($workoutBeingPerformed) {
    ({ exercisesPerformed: temp } = $workoutBeingPerformed);
  }
  let exercisesPerformed = temp as WorkoutExercise[];

  let callingEndpoint = false;
  async function saveWorkout() {
    if (!$workoutBeingPerformed) return;
    const { exercisesPerformed: temp, ...otherProps } = $workoutBeingPerformed;
    let exercisesPerformed = temp as WorkoutExercise[];

    const requestBody: APIWorkoutsSaveWorkout = {
      workout: {
        ...otherProps,
        exercisesPerformed,
        muscleGroupWorkloads: $workloadData,
        muscleSorenessToNextWorkout: {},
        difficultyRating
      },
      previousSoreness: $sorenessData
    };
    callingEndpoint = true;
    const response = await fetch("/api/workouts/saveWorkout", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "content-type": "application/json"
      }
    });
    modalText = await response.text();
    callingEndpoint = false;
    if (response.ok) {
      modalTitle = "Success";
    } else {
      modalTitle = "Error";
    }
    modal.show();
  }

  let modalTitle = "";
  let modalText = "";
  let modal: HTMLDialogElement;
  let redirecting = false;
  async function closeModal() {
    redirecting = true;
    $workoutBeingPerformed = null;
    $allExercisesSetsCompleted = [];
    $workloadData = {};
    $sorenessData = {};
    await invalidate("workouts:all");
    await invalidate("mesocycle:active");
    await goto("/workouts");
  }

  let avgRIR = 0;
  exercisesPerformed.forEach(({ sets }) => {
    sets.forEach(({ RIR }) => {
      avgRIR += RIR;
    });
  });
  avgRIR /= getTotalSets(exercisesPerformed);
</script>

<MyModal onClose={closeModal} bind:title={modalTitle} bind:dialogElement={modal}>
  {modalText}
</MyModal>

<div class="stats stats-vertical">
  <div class="stat">
    <div class="stat-title mb-2">Difficulty rating</div>
    <div class="rating stat-value">
      {#each Array(5) as n, i}
        <input
          name="difficulty-rating"
          class="mask mask-star-2 bg-warning"
          type="radio"
          value={i + 1}
          bind:group={difficultyRating}
        />
      {/each}
    </div>
  </div>
  <div class="stat">
    <div class="stat-title">Average RIR</div>
    <div class="stat-value">{avgRIR.toFixed(2)} RIR</div>
  </div>
</div>

<button
  class="btn btn-block btn-accent mt-auto"
  disabled={callingEndpoint || redirecting}
  on:click={saveWorkout}
>
  {#if callingEndpoint}
    <span class="loading loading-bars" />
  {:else if redirecting}
    Redirecting
    <span class="loading loading-bars" />
  {:else}
    Save workout
  {/if}
</button>
