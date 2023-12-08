<script lang="ts">
  import WorkoutExerciseSets from "./WorkoutExerciseSets.svelte";
  import Hamburger from "virtual:icons/material-symbols/menu";
  import EqualIcon from "virtual:icons/akar-icons/equal-fill";
  import IncreaseIcon from "virtual:icons/icon-park-solid/up-c";
  import DecreaseIcon from "virtual:icons/icon-park-solid/down-c";

  export let mode: "viewing" | "performing" | "editing";
  export let exercise: WorkoutExerciseWithoutSetNumbers;
  export let exerciseIndex: number;
  export let setsCompleted: boolean[];
  export let totalExercises: number;
  export let comparing: boolean;
  export let referenceExercise: WorkoutExercise | null;
  export let userBodyweight: number | null;

  export let editExercise: (idx: number) => void;
  export let reorderExercise: (idx: number, direction: "up" | "down") => void;
  export let deleteExercise: (idx: number) => void;
  export let takeFeedback: (idx: number, force?: boolean) => void;

  function addSet() {
    exercise.sets = [...exercise.sets, { reps: null, load: null, RIR: null }];
    setsCompleted = [...setsCompleted, false];
  }
  function removeSet() {
    exercise.sets.pop();
    exercise.sets = exercise.sets;
    setsCompleted.pop();
    setsCompleted = setsCompleted;
  }

  function checkForFeedback() {
    if (!setsCompleted.includes(false)) {
      takeFeedback(exerciseIndex);
    }
  }

  let increasePercentage: number | null = null;
  function compareVolume() {
    let referenceVolume = 0;
    let currentVolume = 0;
    for (let i = 0; i < exercise.sets.length; i++) {
      const currentSet = exercise.sets[i];
      let referenceSet = referenceExercise?.sets[i];

      if (referenceSet) {
        let referenceLoad = referenceSet.load;
        if (referenceExercise?.bodyweight !== undefined) {
          referenceLoad += referenceExercise.bodyweight;
        }
        referenceVolume += referenceSet.reps * referenceLoad;
      }

      if (currentSet.reps !== null && currentSet.load !== null) {
        let currentLoad = currentSet.load;
        if (exercise.bodyweight !== undefined) {
          currentLoad += userBodyweight ?? 0;
        }
        currentVolume += currentSet.reps * currentLoad;
      }
    }

    increasePercentage = currentVolume / referenceVolume;
    if (currentVolume < referenceVolume) {
      return -1;
    } else if (currentVolume > referenceVolume) {
      return 1;
    } else {
      return 0;
    }
  }
  const colorMap = ["text-error", "text-secondary", "text-success"];
</script>

<div class="flex flex-col rounded-md bg-primary p-2">
  <div class="flex gap-2 w-full">
    <span class="font-semibold grow">{exercise.name}</span>
    {#if mode !== "viewing"}
      <div class="dropdown dropdown-end">
        <button class="btn p-0 btn-xs btn-ghost" aria-label="Exercise options"><Hamburger /></button
        >
        <ul
          class="shadow-2xl shadow-black menu menu-sm dropdown-content z-10 bg-neutral gap-1 rounded-md w-fit"
        >
          <li>
            <button
              class="btn btn-sm btn-primary rounded-sm"
              on:click={() => editExercise(exerciseIndex)}
            >
              Edit
            </button>
          </li>
          <li>
            <button
              class="btn btn-sm rounded-sm btn-primary"
              disabled={setsCompleted.includes(false)}
              on:click={() => takeFeedback(exerciseIndex, true)}
            >
              Feedback
            </button>
          </li>
          <li class="join grid grid-cols-2 gap-1">
            <button
              class="btn btn-sm join-item btn-primary rounded-sm"
              disabled={exerciseIndex === 0}
              on:click={() => reorderExercise(exerciseIndex, "up")}
            >
              ↑
            </button>
            <button
              class="btn btn-sm join-item btn-primary rounded-sm"
              disabled={exerciseIndex === totalExercises - 1}
              on:click={() => reorderExercise(exerciseIndex, "down")}
            >
              ↓
            </button>
          </li>
          <li class="join grid grid-cols-2 gap-1">
            <button class="btn btn-sm join-item btn-primary rounded-sm" on:click={addSet}>
              +
            </button>
            <button
              class="btn btn-sm join-item btn-primary rounded-sm"
              disabled={setsCompleted.length === 1}
              on:click={removeSet}
            >
              -
            </button>
          </li>
          <li>
            <button
              class="btn btn-sm btn-error rounded-sm"
              on:click={() => deleteExercise(exerciseIndex)}
            >
              Delete
            </button>
          </li>
        </ul>
      </div>
    {/if}
  </div>
  <div class="flex items-center justify-between text-sm">
    <p>{exercise.repRangeStart} to {exercise.repRangeEnd} reps</p>
    <span class="badge badge-error font-semibold">{exercise.targetMuscleGroup}</span>
  </div>
  {#if exercise.note}
    <p class="bg-info bg-opacity-75 text-black px-1 text-sm rounded-sm mt-1.5">{exercise.note}</p>
  {/if}
  <div class="h-px bg-secondary brightness-75 mt-1.5" />
  <div
    class="grid gap-x-2 gap-y-1 mt-2 place-items-center"
    class:workout-sets-grid-performed={!(mode !== "viewing" || comparing)}
    class:workout-sets-grid-performing={mode !== "viewing" || comparing}
  >
    <span class="text-sm font-semibold">Reps</span>
    <span class="text-sm font-semibold">
      Load
      {#if exercise.bodyweight !== undefined}
        <span class="text-white text-xs">BW</span>
      {/if}
    </span>
    <span class="text-sm font-semibold">RIR</span>
    {#key exercise.sets}
      {#if mode !== "viewing" || comparing}
        <div class="dropdown dropdown-end">
          {#if referenceExercise}
            <button aria-label="exercise-volume-change">
              {#if compareVolume() === 1}
                <IncreaseIcon class="text-success" />
              {:else if compareVolume() === 0}
                <EqualIcon />
              {:else if compareVolume() === -1}
                <DecreaseIcon class="text-error" />
              {/if}
            </button>
          {/if}
          {#if increasePercentage !== null}
            <ul class="dropdown-content z-[1] shadow bg-neutral rounded-md w-48 px-2 py-1">
              <li class="text-center">
                <span
                  class="{colorMap[compareVolume() + 1]} font-semibold text-sm text-center w-full"
                >
                  Volume change: {(increasePercentage * 100 - 100).toFixed(2)}%
                </span>
              </li>
            </ul>
          {/if}
        </div>
      {/if}
    {/key}
    <WorkoutExerciseSets
      {checkForFeedback}
      {referenceExercise}
      {userBodyweight}
      bind:exercise
      bind:setsCompleted
      bind:comparing
      bind:mode
    />
  </div>
</div>

<style lang="postcss">
  .workout-sets-grid-performing {
    grid-template-columns: 1fr 2fr 1fr 1.5rem;
  }

  .workout-sets-grid-performed {
    grid-template-columns: 1fr 2fr 1fr;
  }
</style>
