<script lang="ts">
  import { getTotalSetsOfSplit } from "$lib/utils/exerciseSplits.js";
  import SplitDaysSchedule from "../../SplitDaysSchedule.svelte";

  export let data;
  $: ({ exerciseSplits } = data);
</script>

<h2>Clone old splits</h2>
<h3>Use one of your old splits as a template</h3>

<div class="flex flex-col h-px grow overflow-y-auto gap-1">
  {#if exerciseSplits.length > 0}
    {#each exerciseSplits as exerciseSplit}
      <a
        class="btn btn-primary rounded-md h-fit"
        href="/exerciseSplits/new?cloneId={exerciseSplit._id}"
      >
        <div class="flex flex-col gap-1 py-2 w-full">
          <div class="flex justify-between items-center">
            <span class="text-lg font-semibold">{exerciseSplit.name}</span>
            <span class="font-normal">
              {getTotalSetsOfSplit(exerciseSplit.splitDays)} sets
            </span>
          </div>
          <SplitDaysSchedule splitDays={exerciseSplit.splitDays} />
        </div></a
      >
    {/each}
  {:else}
    <div class="flex flex-col bg-primary p-2 mb-auto rounded-md">
      <span class="font-semibold text-warning text-lg">No splits created</span>
      <span>You haven't created a split to clone from</span>
    </div>
  {/if}
</div>
