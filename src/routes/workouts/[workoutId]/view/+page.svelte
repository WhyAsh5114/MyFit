<script lang="ts">
  import { goto, invalidate } from "$app/navigation";
  import { page } from "$app/stores";
  import MyModal from "$lib/components/MyModal.svelte";
  import WorkoutExercisesTable from "$lib/components/workouts/WorkoutExercisesTable.svelte";
  import { sorenessFeedback, workloadFeedback } from "$lib/types/arrays.js";
  import { dateFormatter } from "$lib/util/CommonFunctions.js";
  import StarIcon from "virtual:icons/material-symbols/star";
  export let data;

  let callingEndpoint = false,
    deleteModal: HTMLDialogElement,
    modal: HTMLDialogElement,
    modalText = "",
    modalTitle = "";
  async function deleteWorkout() {
    if (!data.mesocycle) {
      console.error("No mesocycle found, maybe deleted?");
      return;
    }
    const requestBody: APIWorkoutsDeleteWorkout = {
      workoutId: $page.params.workoutId,
      performedMesocycleId: data.mesocycle?.id
    };
    callingEndpoint = true;
    const response = await fetch("/api/workouts/deleteWorkout", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "content-type": "application/json"
      }
    });
    modalText = await response.text();
    callingEndpoint = false;
    if (response.ok) {
      modalTitle = "Deletion successful";
    } else {
      modalTitle = "Error";
    }
    deleteModal.close();
    modal.show();
  }

  let redirecting = false;
  async function closeModal() {
    redirecting = true;
    await invalidate("workout:all");
    if (data.activeMesocycle?.id === data.mesocycle?.id) {
      await invalidate("mesocycle:active");
    }
    await goto("/workouts");
    redirecting = false;
  }
$: ({ params } = $page);
</script>

<MyModal title="Delete workout" bind:dialogElement={deleteModal}>
  Are you sure you want to delete this workout?
  <div class="join grid grid-cols-2 mt-2">
    <button class="join-item btn">Cancel</button>
    <button
      class="join-item btn btn-error"
      disabled={callingEndpoint}
      type="button"
      on:click={deleteWorkout}
    >
      {#if callingEndpoint}
        <span class="loading loading-bars" />
      {:else}
        Yes, delete
      {/if}
    </button>
  </div>
</MyModal>

<MyModal onClose={closeModal} bind:dialogElement={modal} bind:title={modalTitle}>
  {modalText}
</MyModal>

<div class="collapse collapse-arrow bg-primary rounded-md">
  <input id="view-workout-details" checked type="checkbox" />
  <div class="collapse-title text-xl font-medium">Workout details</div>
  <div class="collapse-content backdrop-brightness-75 px-0 !pb-0">
    <div class="stats-vertical grid grid-cols-2 w-full max-h-56 shadow-inner shadow-black">
      <div class="stat">
        <div class="stat-title">Workout date</div>
        <div class="stat-value">{dateFormatter(data.workout.startTimestamp)}</div>
      </div>
      <div class="stat">
        <div class="stat-title">Difficulty rating</div>
        <div class="stat-value flex items-center gap-1">
          {data.workout.difficultyRating}
          <StarIcon class="text-orange-400" />
        </div>
      </div>

      <div class="stat">
        <div class="stat-title">Workout type</div>
        <div class="stat-value">
          {data.mesocycleTemplate?.exerciseSplit[data.workout.dayNumber]?.name}
        </div>
        <div class="stat-desc">
          Day {data.workout.dayNumber + 1}, Cycle {data.workout.cycleNumber}
        </div>
      </div>
      <div class="stat">
        <div class="stat-title">Reference workout</div>
        <div class="stat-value">
          {#if data.referenceWorkout}
            <a class="truncate link" href="/workouts/{data.referenceWorkout.id}/view">
              {dateFormatter(data.referenceWorkout.startTimestamp)}
            </a>
          {:else}
            Not found
          {/if}
        </div>
        {#if data.referenceWorkout}
          <div class="stat-desc">
            Day {data.referenceWorkout.dayNumber + 1}, Cycle {data.referenceWorkout.cycleNumber}
          </div>
        {:else}
          <div class="stat-desc">Used meso exercises</div>
        {/if}
      </div>

      <div class="stat">
        <div class="stat-title">Mesocycle</div>
        <a class="stat-value link" href="/mesocycles/view/{data.mesocycle?.id}">
          {dateFormatter(data.mesocycle?.startTimestamp)}
        </a>
      </div>
      <div class="stat">
        <div class="stat-title">Mesocycle template</div>
        <div class="stat-value truncate">
          <a class="link" href="/mesocycles/viewTemplate/{data.mesocycleTemplate?.id}">
            {data.mesocycleTemplate?.name}
          </a>
        </div>
      </div>

      {#if Object.keys(data.workout.muscleGroupWorkloads).length > 0}
        <div class="stat col-span-2">
          <div class="stat-title">Muscle group workloads</div>
          <div class="flex flex-wrap mt-2 gap-1">
            {#each Object.entries(data.workout.muscleGroupWorkloads) as [muscleGroup, workloadState]}
              {@const workloadElement = workloadFeedback.find((e) => e.value === workloadState)}
              <div class="join text-sm">
                <span class="join-item bg-base-200 px-2 font-semibold">{muscleGroup}</span>
                {#if workloadState !== null}
                  <span class="join-item px-2 capitalize text-black {workloadElement?.bgColor}">
                    {workloadElement?.name}
                  </span>
                {:else}
                  <span class="join-item px-2 bg-base-200 italic">Not given</span>
                {/if}
              </div>
            {/each}
          </div>
        </div>
      {/if}

      {#if Object.keys(data.workout.muscleSorenessToNextWorkout).length > 0}
        <div class="stat col-span-2">
          <div class="stat-title">Soreness to next workouts</div>
          <div class="flex flex-wrap mt-2 gap-1">
            {#each Object.entries(data.workout.muscleSorenessToNextWorkout) as [muscleGroup, sorenessState]}
              {@const sorenessElement = sorenessFeedback.find((e) => e.value === sorenessState)}
              <div class="join text-sm">
                <span class="join-item bg-base-200 px-2 font-semibold">{muscleGroup}</span>
                {#if sorenessState !== null}
                  <span class="join-item px-2 capitalize text-black {sorenessElement?.bgColor}">
                    {sorenessElement?.name}
                  </span>
                {:else}
                  <span class="join-item px-2 bg-base-200 italic">Not given</span>
                {/if}
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>
<WorkoutExercisesTable exercises={data.workout.exercisesPerformed} mode="viewing" />
<div class="join grid grid-cols-2 mt-2">
  <button
    class="join-item btn btn-error"
    disabled={redirecting}
    on:click={() => {
      deleteModal.show();
    }}
  >
    {#if redirecting}
      <span class="loading loading-bars" />
    {:else}
      Delete
    {/if}
  </button>
  <a class="join-item btn btn-primary" href="/workouts/{params.workoutId}/edit">Edit</a>
</div>
