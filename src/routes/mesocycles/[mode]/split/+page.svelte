<script lang="ts">
  import SearchIcon from "virtual:icons/material-symbols/search";
  import { page } from "$app/stores";
  import { getTotalSetsOfSplit } from "$lib/utils/exerciseSplits.js";
  import SplitDaysSchedule from "../../../exerciseSplits/SplitDaysSchedule.svelte";
  import { selectedSplitId } from "../mesocycleStore";
  export let data;

  $: ({ params } = $page);
  let exerciseSplits = data.exerciseSplits;
  let filterText = "";

  $: filterSplits(filterText);
  function filterSplits(filterText: string) {
    exerciseSplits = data.exerciseSplits.filter((split) =>
      split.name.toLowerCase().includes(filterText)
    );
  }
</script>

<h2><span class="capitalize">{params.mode}</span> mesocycle</h2>
<h3>Split</h3>

<label class="form-control w-full max-w-sm">
  <div class="label">
    <span class="label-text">Search for an exercise split</span>
  </div>
  <form class="join" on:submit|preventDefault>
    <input
      id="search-exercise-split"
      class="join-item input input-bordered w-full"
      placeholder="Type the name here"
      required
      type="text"
      bind:value={filterText}
    />
    <button class="join-item btn btn-primary" aria-label="search">
      <SearchIcon class="w-5 h-5" />
    </button>
  </form>
</label>

<div class="flex flex-col h-px grow overflow-y-auto gap-1 mt-2">
  {#if exerciseSplits.length > 0}
    {#each exerciseSplits as exerciseSplit}
      {@const selectedSplit = exerciseSplit._id === $selectedSplitId}
      <button
        class="btn btn-primary rounded-md h-fit"
        class:text-accent={selectedSplit}
        on:click={() => ($selectedSplitId = exerciseSplit._id)}
      >
        <div class="flex flex-col gap-1 py-2 w-full">
          <div class="flex justify-between items-center">
            <span class="text-lg font-semibold">{exerciseSplit.name}</span>
            <span class="font-normal">
              {getTotalSetsOfSplit(exerciseSplit.splitDays)} sets
            </span>
          </div>
          <SplitDaysSchedule splitDays={exerciseSplit.splitDays} />
        </div>
      </button>
    {/each}
  {:else if data.exerciseSplits.length > 0}
    <div class="flex flex-col bg-primary p-2 mb-auto rounded-md">
      <span class="font-semibold text-warning text-lg">No splits found</span>
      <span>You haven't created a split with name containing <i>{filterText}</i></span>
    </div>
  {:else}
    <a class="flex flex-col bg-primary p-2 mb-auto rounded-md" href="/exerciseSplits/templates">
      <span class="font-semibold text-warning text-lg">No splits created</span>
      <span>Create one by clicking here</span>
    </a>
  {/if}
</div>

<a
  class="btn btn-accent mt-2"
  class:btn-disabled={$selectedSplitId === null}
  href="/mesocycles/{params.mode}/specializations"
>
  Select specializations
</a>
