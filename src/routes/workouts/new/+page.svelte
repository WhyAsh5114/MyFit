<script lang="ts">
  import { goto, invalidate } from "$app/navigation";
  import MyModal from "$lib/components/MyModal.svelte";
  import { dateFormatter, splitExercisesToWorkoutExercise } from "$lib/util/CommonFunctions.js";
  import {
    getCycleNumber,
    getDayNumber,
    getMuscleGroupsAndSets,
    getPlannedRIR,
    getTodaysSplitWorkout,
    getTotalSets
  } from "$lib/util/MesocycleTemplate.js";
  import EditIcon from "virtual:icons/ep/edit";
  import DoneIcon from "virtual:icons/material-symbols/done";
  import CancelIcon from "virtual:icons/ph/x-bold";
  import SkipIcon from "virtual:icons/dashicons/controls-skipforward";
  import {
    allExercisesSetsCompleted,
    exercisesPerformed,
    sorenessData,
    workloadData,
    workoutBeingPerformed
  } from "./newWorkoutStore.js";
  import { applyProgressiveOverload } from "$lib/util/ProgressiveOverload.js";

  let modal: HTMLDialogElement;
  let modalText = "";
  let modalTitle = "";
  let onModalClose = () => {};

  export let data;
  $: ({ activeMesocycle, activeMesocycleTemplate } = data);
  $: workoutIdx = getDayNumber(activeMesocycle.workouts, activeMesocycleTemplate.exerciseSplit);
  $: todaysWorkout = getTodaysSplitWorkout(
    activeMesocycle.workouts,
    activeMesocycleTemplate.exerciseSplit
  );
  let bodyweightExercises = false;
  let muscleGroupsAndSets: { muscleGroup: MuscleGroup; sets: number }[];
  let totalSets = 0;
  $: if (todaysWorkout) {
    let exercises: WorkoutExerciseWithoutSetNumbers[];
    if (data.referenceWorkout) {
      exercises = applyProgressiveOverload(data.referenceWorkout.exercisesPerformed);
    } else {
      exercises = splitExercisesToWorkoutExercise(todaysWorkout.exercises);
    }
    muscleGroupsAndSets = getMuscleGroupsAndSets(exercises);
    totalSets = getTotalSets(exercises);
    for (const exercise of exercises) {
      if (exercise.bodyweight !== undefined) {
        bodyweightExercises = true;
        break;
      }
    }
  }

  let bodyweightInputValue = data.userBodyweight;
  let editingBodyweightValue = bodyweightInputValue === null && bodyweightExercise;
  async function submitForm() {
    if (todaysWorkout) {
      await goto("/workouts/new/exercises");
      return;
    }
    callingEndpoint = true;
    const response = await fetch("/api/workouts/completeRestDay", {
      method: "POST"
    });
    if (response.ok) {
      modalTitle = "Success";
    } else {
      modalTitle = "Error";
    }
    modalText = await response.text();
    await invalidate("mesocycle:active");
    callingEndpoint = false;
    modal.show();
  }

  let callingEndpoint = false;
  async function saveBodyweight() {
    const requestBody: APIUserUpdatePreferences = {
      bodyweight: bodyweightInputValue
    };
    callingEndpoint = true;
    const response = await fetch("/api/user/updatePreferences", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "content-type": "application/json"
      }
    });
    await invalidate("user:preferences");
    callingEndpoint = false;
    if (response.ok) {
      editingBodyweightValue = false;
    } else {
      modalTitle = "Error";
      modalText = await response.text();
      modal.show();
    }
  }

  async function overwriteWorkout(redirect = false) {
    $workoutBeingPerformed = null;
    $allExercisesSetsCompleted = [];
    $exercisesPerformed = null;
    $workloadData = {};
    $sorenessData = {};
    if (redirect) await submitForm();
  }

  let skippingWorkout = false;
  async function skipWorkout() {
    const requestBody: APIWorkoutsSaveWorkout = {
      workout: {
        startTimestamp: Number(new Date()),
        referenceWorkout: data.referenceWorkout?._id.toString() ?? null,
        dayNumber: getDayNumber(activeMesocycle.workouts, activeMesocycleTemplate.exerciseSplit),
        cycleNumber: getCycleNumber(
          activeMesocycleTemplate.exerciseSplit,
          activeMesocycle.workouts
        ),
        plannedRIR: getPlannedRIR(activeMesocycleTemplate, activeMesocycle.workouts),
        deload: false,
        skipped: true,
        muscleGroupWorkloads: {},
        muscleSorenessToNextWorkout: {},
        exercisesPerformed: [],
        difficultyRating: 1
      },
      // TODO: Can ask user here to provide soreness
      previousSoreness: {}
    };
    skippingWorkout = true;
    const response = await fetch("/api/workouts/createWorkout", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });
    if (response.ok) {
      modalTitle = "Success";
      modalText = "Workout has been skipped successfully";
      await overwriteWorkout();
    } else {
      modalTitle = "Error";
      modalText = await response.text();
    }
    skippingWorkout = false;
    modal.show();
    onModalClose = async () => {
      callingEndpoint = true;
      await invalidate("mesocycle:active");
      callingEndpoint = false;
    };
  }
</script>

<MyModal onClose={onModalClose} title={modalTitle} bind:dialogElement={modal}>
  {modalText}
</MyModal>
<form
  id="workoutForm"
  class="stats stats-vertical grid grid-cols-2"
  on:submit|preventDefault={submitForm}
>
  {#if todaysWorkout}
    <div class="stat col-span-2">
      <div class="stat-title">Workout template</div>
      <div class="stat-value flex items-center justify-between">
        {todaysWorkout.name}
        <button class="btn btn-sm" type="button" on:click={skipWorkout}>
          {#if skippingWorkout}
            <span class="loading loading-bars loading-sm"></span>
          {:else}
            Skip <SkipIcon />
          {/if}
        </button>
      </div>
      <div class="stat-desc">
        Day {workoutIdx + 1}, Cycle {getCycleNumber(
          activeMesocycleTemplate.exerciseSplit,
          activeMesocycle.workouts
        )}
      </div>
    </div>
    <div class="stat">
      <div class="stat-title">Total sets</div>
      <div class="stat-value">{totalSets}</div>
    </div>
    <div class="stat">
      <div class="stat-title">Planned RIR</div>
      <div class="stat-value">
        {getPlannedRIR(activeMesocycleTemplate, activeMesocycle.workouts)}
      </div>
    </div>
    <div class="stat col-span-2">
      <div class="stat-title">Muscle groups</div>
      <div class="flex flex-wrap gap-1 mt-2 font-semibold">
        {#each muscleGroupsAndSets as { muscleGroup, sets }}
          {@const specialized = activeMesocycleTemplate.specialization?.includes(muscleGroup)}
          <span class="badge" class:badge-accent={specialized}>{muscleGroup} x {sets}</span>
        {/each}
      </div>
    </div>
    <div class="stat col-span-2">
      <div class="stat-title">Reference workout</div>
      <div class="stat-value">
        {#if data.referenceWorkout}
          {dateFormatter(data.referenceWorkout.startTimestamp)}
        {:else}
          Not found
        {/if}
      </div>
    </div>
    {#if bodyweightExercises}
      <div class="stat col-span-2 w-full">
        <div class="stat-title mb-2">Bodyweight</div>
        <div class="flex justify-between items-center gap-2">
          {#if data.userBodyweight === null || editingBodyweightValue}
            <input
              id="bodyweight"
              class="input w-3/4"
              min={0}
              placeholder="Type here"
              required
              step={0.01}
              type="number"
              bind:value={bodyweightInputValue}
            />
            <button
              class="btn btn-circle btn-sm btn-error shrink-0"
              aria-label="cancel-editing-bodyweight"
              disabled={data.userBodyweight === null}
              type="button"
              on:click={() => (editingBodyweightValue = false)}
            >
              <CancelIcon class="w-5 h-5" />
            </button>
            <button
              class="btn btn-circle btn-sm btn-accent shrink-0"
              aria-label="set-bodyweight"
              disabled={bodyweightInputValue === null}
              type="button"
              on:click={saveBodyweight}
            >
              {#if callingEndpoint}
                <span class="loading loading-spinner" />
              {:else}
                <DoneIcon class="w-6 h-6" />
              {/if}
            </button>
          {:else}
            <div class="stat-value">{data.userBodyweight}</div>
            <button
              class="btn btn-sm btn-ghost"
              type="button"
              on:click={() => {
                bodyweightInputValue = data.userBodyweight;
                editingBodyweightValue = true;
              }}
            >
              <EditIcon class="w-6 h-6" />
            </button>
          {/if}
        </div>
      </div>
    {/if}
  {:else}
    <div class="stat">
      <div class="stat-title">Workout template</div>
      <div class="stat-value">It's a Rest day!</div>
    </div>
  {/if}
</form>

{#if $workoutBeingPerformed === null}
  <button
    class="btn btn-accent mt-auto"
    disabled={editingBodyweightValue || callingEndpoint || skippingWorkout}
    form="workoutForm"
    type="submit"
  >
    {#if todaysWorkout}
      Log workout
    {:else if callingEndpoint || skippingWorkout}
      <span class="loading loading-bars" />
    {:else}
      Mark rest day complete
    {/if}
  </button>
{:else if editingBodyweightValue || callingEndpoint || skippingWorkout}
  <button class="btn btn-block mt-auto">
    <span class="loading loading-bars"></span>
  </button>
{:else}
  <div class="join grid grid-cols-2 mt-auto">
    <button class="join-item btn btn-error" on:click={() => overwriteWorkout(true)}>
      Overwrite workout
    </button>
    <button class="join-item btn btn-primary" form="workoutForm" type="submit">
      Back to workout
    </button>
  </div>
{/if}
