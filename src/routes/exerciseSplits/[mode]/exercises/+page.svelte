<script lang="ts">
  import ExerciseSplitTable from "./ExerciseSplitTable.svelte";
  import { exerciseSplit } from "../splitStore";
  import { page } from "$app/stores";
  $: ({ params } = $page);

  let selectedSplitDayIndex = $exerciseSplit.findIndex((splitDay) => splitDay !== null);
  let selectedSplitDay = $exerciseSplit[selectedSplitDayIndex] as ExerciseSplitDay;

  $: updateSelectedSplitDay(selectedSplitDayIndex);
  $: $exerciseSplit[selectedSplitDayIndex] = selectedSplitDay;

  function updateSelectedSplitDay(_selectedSplitDayIndex: number) {
    if ($exerciseSplit[_selectedSplitDayIndex] !== null) {
      selectedSplitDay = $exerciseSplit[_selectedSplitDayIndex] as ExerciseSplitDay;
    }
  }
</script>

<h2><span class="capitalize">{params.mode}</span> exercise split</h2>
<h3>Exercises</h3>

<div class="collapse collapse-arrow rounded-md bg-primary my-2">
  <input id="show-all-days" aria-label="show-all-days" checked type="checkbox" />
  <div class="collapse-title text-xl font-semibold">
    D{selectedSplitDayIndex + 1}
    <span class="text-base font-normal ml-2">{selectedSplitDay?.name}</span>
  </div>
  <div class="collapse-content backdrop-brightness-50">
    <div class="flex flex-wrap justify-center items-center gap-2 mt-4">
      {#each $exerciseSplit as exerciseSplitDay, i}
        <div class="join">
          <span class="join-item btn btn-sm">D{i + 1}</span>
          {#if exerciseSplitDay === null}
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
              aria-label={exerciseSplitDay.name}
              type="radio"
              value={i}
              bind:group={selectedSplitDayIndex}
            />
          {/if}
        </div>
      {/each}
    </div>
  </div>
</div>

{#if selectedSplitDay}
  <ExerciseSplitTable bind:exerciseTemplates={selectedSplitDay.exerciseTemplates} />
{/if}
