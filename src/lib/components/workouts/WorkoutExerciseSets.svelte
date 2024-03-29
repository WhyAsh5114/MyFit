<script lang="ts">
  import DoneIcon from "virtual:icons/material-symbols/done";
  import EditIcon from "virtual:icons/material-symbols/edit-outline";
  import RightArrow from "virtual:icons/mdi/arrow-right-thin";

  import EqualIcon from "virtual:icons/akar-icons/equal";
  import IncreaseIcon from "virtual:icons/icon-park-outline/up-c";
  import DecreaseIcon from "virtual:icons/icon-park-outline/down-c";

  export let exercise: WorkoutExerciseWithoutSetNumbers;
  export let setsCompleted: boolean[];
  export let checkForFeedback: () => void;
  export let mode: "editing" | "performing" | "viewing";
  export let comparing: boolean;
  export let referenceExercise: WorkoutExercise | null;
  export let userBodyweight: number | null;

  function getColor(param: "load" | "reps" | "RIR", setNumber: number) {
    let newValue = null;
    let reference = null;
    newValue = exercise.sets[setNumber][param];
    reference = referenceExercise?.sets[setNumber][param] ?? null;

    if (newValue === null || reference === null) {
      return;
    }
    if (param === "load" && exercise.bodyweight !== undefined) {
      newValue += userBodyweight ?? 0;
      reference += referenceExercise?.bodyweight ?? 0;
    }

    if (reference === newValue) {
      return "";
    }
    if (reference > newValue) {
      return "text-warning";
    }
    if (reference < newValue) {
      return "text-success";
    }
  }

  function compareVolume(setNumber: number) {
    const referenceSet = referenceExercise?.sets[setNumber];
    const currentSet = exercise.sets[setNumber];
    if (!referenceSet || !referenceExercise) {
      return false;
    }
    if (currentSet.reps === null || currentSet.load === null) {
      return false;
    }

    let referenceLoad = referenceSet.load;
    let currentLoad = currentSet.load;
    if (exercise.bodyweight !== undefined) {
      referenceLoad += referenceExercise.bodyweight ?? 0;
      currentLoad += userBodyweight ?? 0;
    }

    const referenceVolume = referenceSet.reps * referenceLoad;
    const currentVolume = currentSet.reps * currentLoad;
    if (currentVolume < referenceVolume) {
      return -1;
    } else if (currentVolume > referenceVolume) {
      return 1;
    }
    return 0;
  }

  function constructBodyweightString(bodyweight: number | null | undefined, load: number | null) {
    if (load === null) {
      return `${bodyweight}`;
    } else if (load < 0) {
      return `${bodyweight}${load}`;
    } else if (load > 0) {
      return `${bodyweight}+${load}`;
    }
    return `${bodyweight}`;
  }
</script>

{#each exercise.sets as { reps, load, RIR }, setNumber}
  <form
    class="contents"
    on:submit|preventDefault={() => {
      setsCompleted[setNumber] = true;
      checkForFeedback();
    }}
  >
    <div class="flex items-center gap-1">
      {#if comparing && referenceExercise?.sets[setNumber]}
        <span class="text-sm">{referenceExercise.sets[setNumber].reps}</span>
        <RightArrow />
        <span class="font-semibold {getColor('reps', setNumber)}">{reps}</span>
      {:else}
        <input
          id="{exercise.name}-set{setNumber}-reps"
          class="input input-sm w-12 text-center !px-1"
          disabled={setsCompleted[setNumber] || comparing}
          min={0}
          placeholder="?"
          required
          type="number"
          bind:value={reps}
        />
      {/if}
    </div>
    <div class="flex items-center gap-1">
      {#if comparing && referenceExercise?.sets[setNumber]}
        {#if exercise.bodyweight === undefined}
          <span class="text-sm">{referenceExercise.sets[setNumber].load}</span>
          <RightArrow />
          <span class="font-semibold {getColor('load', setNumber)}">{load}</span>
        {:else}
          <span class="text-sm"
            >{constructBodyweightString(
              referenceExercise.bodyweight,
              referenceExercise.sets[setNumber].load
            )}</span
          >
          <RightArrow />
          <span class="font-semibold {getColor('load', setNumber)}"
            >{constructBodyweightString(userBodyweight, load)}</span
          >
        {/if}
      {:else}
        <input
          id="{exercise.name}-set{setNumber}-load"
          class="input input-sm w-16"
          disabled={setsCompleted[setNumber] || comparing}
          placeholder={exercise.bodyweight !== undefined ? "0/+/-" : "?"}
          required
          step="0.01"
          type="number"
          bind:value={load}
        />
      {/if}
    </div>
    <div class="flex items-center gap-1">
      {#if comparing && referenceExercise?.sets[setNumber]}
        <span class="text-sm">{referenceExercise.sets[setNumber].RIR}</span>
        <RightArrow />
        <span class="font-semibold {getColor('RIR', setNumber)}">{RIR}</span>
      {:else}
        <input
          id="{exercise.name}-set{setNumber}-RIR"
          class="input input-sm w-12"
          disabled={setsCompleted[setNumber] || comparing}
          max={10}
          min={0}
          placeholder="?"
          required
          type="number"
          bind:value={RIR}
        />
      {/if}
    </div>
    {#if mode !== "viewing" && !comparing}
      {#if !setsCompleted[setNumber]}
        <button class="btn btn-xs btn-accent btn-circle" aria-label="mark-set-complete">
          <DoneIcon />
        </button>
      {:else}
        <button
          class="btn btn-xs btn-circle bg-base-100/25 border-0"
          aria-label="edit-set"
          on:click={() => (setsCompleted[setNumber] = false)}
        >
          <EditIcon />
        </button>
      {/if}
    {:else if comparing && referenceExercise}
      {#if compareVolume(setNumber) === 0}
        <EqualIcon class="text-warning" />
      {:else if compareVolume(setNumber) === 1}
        <IncreaseIcon class="text-success" />
      {:else if compareVolume(setNumber) === -1}
        <DecreaseIcon class="text-error" />
      {/if}
    {:else if mode !== 'viewing'}
      <span></span>
    {/if}
  </form>
{/each}
