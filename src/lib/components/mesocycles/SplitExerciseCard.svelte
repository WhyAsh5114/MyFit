<script lang="ts">
  import Hamburger from "virtual:icons/material-symbols/menu";

  export let exercise: SplitExercise;
  export let idx: number;
  export let totalExercises: number;

  export let deleteExercise: (idx: number) => void;
  export let editExercise: (idx: number) => void;
  export let reorderExercise: (idx: number, s: "up" | "down") => void;
</script>

<li class="flex flex-col bg-primary w-full h-fit rounded-md p-2">
  <div class="flex gap-2">
    <p class="font-semibold grow">{exercise.name}</p>
    <div class="dropdown dropdown-end">
      <button class="btn p-0 btn-xs btn-ghost" aria-label="exercise-menu"><Hamburger /></button>
      <ul
        class="shadow-2xl shadow-black menu menu-sm dropdown-content z-10 bg-neutral gap-1 rounded-md w-fit"
      >
        <li>
          <button class="btn btn-primary btn-sm rounded-sm" on:click={() => editExercise(idx)}>
            Edit
          </button>
        </li>
        <li class="join grid grid-cols-2 gap-1">
          <button
            class="join-item text-lg btn btn-primary btn-sm p-0 rounded-sm"
            disabled={idx === 0}
            on:click={() => reorderExercise(idx, "up")}
          >
            ↑
          </button>
          <button
            class="join-item text-lg btn btn-primary btn-sm p-0 rounded-sm"
            disabled={idx === totalExercises - 1}
            on:click={() => reorderExercise(idx, "down")}
          >
            ↓
          </button>
        </li>
        <li>
          <button class="btn btn-sm btn-error rounded-sm" on:click={() => deleteExercise(idx)}>
            Delete
          </button>
        </li>
      </ul>
    </div>
  </div>
  <div class="flex items-end justify-between text-sm">
    <p>{exercise.sets} sets of {exercise.repRangeStart} to {exercise.repRangeEnd} reps</p>
    <span class="badge badge-error text-black font-semibold">{exercise.targetMuscleGroup}</span>
  </div>
  {#if exercise.note}
    <p class="bg-info bg-opacity-75 text-black px-1 text-sm rounded-sm mt-1.5">{exercise.note}</p>
  {/if}
</li>
