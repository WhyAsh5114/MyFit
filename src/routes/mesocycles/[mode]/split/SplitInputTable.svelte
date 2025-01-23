<script lang="ts">
  import SplitInput from "./SplitInput.svelte";
  import { exerciseSplit } from "../newMesocycleStore";

  function addDay() {
    $exerciseSplit.push({ name: "", exercises: [] });
    $exerciseSplit = $exerciseSplit;
  }
  function removeDay() {
    $exerciseSplit.pop();
    $exerciseSplit = $exerciseSplit;
  }
</script>

<div class="flex flex-col gap-2 w-full max-w-xs m-auto">
  <div class="flex w-full justify-end">
    <span>Rest</span>
  </div>
  <div class="flex flex-col gap-2 overflow-y-auto max-h-80">
    {#each $exerciseSplit as splitDay, i}
      <SplitInput dayText={`Day ${i + 1}`} bind:splitDay />
    {/each}
  </div>
  <div class="join grid grid-cols-2 gap-1 mt-5">
    <button
      class="btn join-item btn-primary text-xl font-bold btn-sm"
      type="button"
      on:click={removeDay}
    >
      −
    </button>
    <button
      class="btn join-item btn-primary text-xl font-bold btn-sm"
      type="button"
      on:click={addDay}
    >
      +
    </button>
  </div>
</div>
