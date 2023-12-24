<script lang="ts">
  import { page } from "$app/stores";
  import { exerciseSplits, splitStructure } from "../splitStore";
  $: ({ params } = $page);

  let selectedWorkoutIndex = $splitStructure.findIndex((day) => day !== null);
  $: selectedWorkout = $splitStructure[selectedWorkoutIndex] as string;
</script>

<h2><span class="capitalize">{params.mode}</span> exercise split</h2>
<h3>Exercises</h3>

<div class="collapse collapse-arrow rounded-md bg-primary my-2">
  <input id="show-all-days" aria-label="show-all-days" checked type="checkbox" />
  <div class="collapse-title text-xl font-semibold">
    D{selectedWorkoutIndex + 1}
    <span class="text-base font-normal ml-2">{selectedWorkout}</span>
  </div>
  <div class="collapse-content backdrop-brightness-50">
    <div class="flex flex-wrap justify-center items-center gap-2 mt-4">
      {#each $exerciseSplits as exerciseSplit, i}
        <div class="join">
          <span class="join-item btn btn-sm">D{i + 1}</span>
          {#if exerciseSplit === null}
            <input
              name="options"
              class="join-item btn btn-sm"
              aria-label="Rest"
              disabled
              type="radio"
            />
          {:else}
            <input
              name="options"
              class="join-item btn btn-sm btn-secondary checked:!text-black checked:!bg-accent"
              aria-label={exerciseSplit.name}
              type="radio"
              value={i}
              bind:group={selectedWorkoutIndex}
            />
          {/if}
        </div>
      {/each}
    </div>
  </div>
</div>


