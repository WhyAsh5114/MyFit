<script lang="ts">
  import ExerciseSplitTable from "./ExerciseSplitTable.svelte";
  import { exerciseSplit } from "../splitStore";
  import CutIcon from "virtual:icons/material-symbols/cut";
  import CopyIcon from "virtual:icons/material-symbols/content-copy";
  import PasteIcon from "virtual:icons/material-symbols/content-paste";
  import { page } from "$app/stores";
  $: ({ params } = $page);

  let selectedSplitDayIndex = $exerciseSplit.findIndex((splitDay) => splitDay !== null);
  let selectedSplitDay = $exerciseSplit[selectedSplitDayIndex] as ExerciseSplitDay;
  let copiedExercises: ExerciseTemplate[] = [];

  $: updateSelectedSplitDay(selectedSplitDayIndex);
  $: $exerciseSplit[selectedSplitDayIndex] = selectedSplitDay;

  function updateSelectedSplitDay(_selectedSplitDayIndex: number) {
    if ($exerciseSplit[_selectedSplitDayIndex] !== null) {
      selectedSplitDay = $exerciseSplit[_selectedSplitDayIndex] as ExerciseSplitDay;
    }
  }

  function copyExercises() {
    copiedExercises = JSON.parse(
      JSON.stringify(selectedSplitDay.exerciseTemplates)
    ) as ExerciseTemplate[];
  }

  function pasteExercises() {
    selectedSplitDay.exerciseTemplates = JSON.parse(
      JSON.stringify(copiedExercises)
    ) as ExerciseTemplate[];
  }
  
  function cutExercises() {
    copyExercises();
    selectedSplitDay.exerciseTemplates = [];
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

{#key selectedSplitDayIndex}
  {#if selectedSplitDay}
    <ExerciseSplitTable bind:exerciseTemplates={selectedSplitDay.exerciseTemplates} />
    <div class="join grid grid-cols-3 mt-1 gap-1">
      <button
        class="join-item btn btn-error"
        disabled={selectedSplitDay.exerciseTemplates.length === 0}
        on:click={() => cutExercises()}
      >
        <CutIcon /> Cut
      </button>
      <button
        class="join-item btn btn-primary"
        disabled={selectedSplitDay.exerciseTemplates.length === 0}
        on:click={() => copyExercises()}
      >
        <CopyIcon /> Copy
      </button>
      <button
        class="join-item btn btn-primary"
        disabled={copiedExercises.length === 0 || selectedSplitDay.exerciseTemplates.length !== 0}
        on:click={() => pasteExercises()}
      >
        <PasteIcon /> Paste
      </button>
    </div>
  {/if}
{/key}

<button class="btn btn-accent btn-block mt-2"> Create exercise split </button>
