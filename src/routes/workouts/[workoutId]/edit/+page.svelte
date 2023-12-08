<script lang="ts">
  import { goto, invalidate } from "$app/navigation";
  import { page } from "$app/stores";
  import MyModal from "$lib/components/MyModal.svelte";
  import WorkoutExercisesTable from "$lib/components/workouts/WorkoutExercisesTable.svelte";
  import { dateFormatter } from "$lib/util/CommonFunctions.js";
  export let data;

  let modal: HTMLDialogElement;
  let modalTitle = "";
  let modalText = "";

  let allExercisesSetsCompleted: boolean[][] = [];
  data.workout.exercisesPerformed.forEach(({ sets }) => {
    allExercisesSetsCompleted.push(Array(sets.length).fill(true));
  });

  let sorenessFromPreviousWorkouts = data.previousWorkoutSorenessValues;

  let callingEndpoint = false;
  async function updateWorkout() {
    if (!data.mesocycle?.id) {
      console.error("Performed mesocycle not found, maybe deleted?");
      return;
    }
    const requestBody: APIWorkoutsUpdateWorkout = {
      workout: { ...data.workout },
      workoutId: $page.params.workoutId,
      previousSoreness: sorenessFromPreviousWorkouts,
      performedMesocycleId: data.mesocycle.id
    };
    callingEndpoint = true;
    const response = await fetch("/api/workouts/updateWorkout", {
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

  let redirecting = false;
  async function closeModal() {
    redirecting = true;
    await invalidate("workout:this");
    await goto(`/workouts/${$page.params.workoutId}/view`);
    redirecting = false;
  }
</script>

<h2>Edit workout</h2>
<h3>{dateFormatter(data.workout.startTimestamp)}</h3>

<MyModal bind:dialogElement={modal} bind:title={modalTitle} onClose={closeModal}>
  {modalText}
</MyModal>

<!--TODO: add option for difficulty rating change, and bodyweight-->

<WorkoutExercisesTable
  bind:exercises={data.workout.exercisesPerformed}
  bind:allExercisesSetsCompleted
  bind:muscleGroupWorkloads={data.workout.muscleGroupWorkloads}
  bind:sorenessFromPreviousWorkouts
  bind:workoutsThatPreviouslyTargeted={data.workoutsThatPreviouslyTargeted}
  mode="editing"
/>

<button
  class="btn btn-accent mt-2"
  disabled={callingEndpoint || redirecting}
  on:click={updateWorkout}
>
  {#if callingEndpoint}
    <span class="loading loading-bars"></span>
  {:else if redirecting}
    Redirecting <span class="loading loading-bars"></span>
  {:else}
    Update workout
  {/if}
</button>
