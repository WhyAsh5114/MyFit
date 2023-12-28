<script lang="ts">
  import { getTotalSetsOfSplit } from "$lib/utils/exerciseSplits.js";

  export let data;
</script>

<h2>Exercise splits</h2>

<div class="h-px flex flex-col grow overflow-y-auto gap-1">
  {#each data.exerciseSplits as exerciseSplit}
    <a class="btn rounded-md btn-primary h-fit" href="/exerciseSplits/view/{exerciseSplit._id}">
      <div class="flex flex-col gap-1 py-2 w-full">
        <div class="flex justify-between items-center">
          <span class="text-lg font-semibold">{exerciseSplit.name}</span>
          <span class="font-normal">
            {getTotalSetsOfSplit(exerciseSplit.splitDays)} sets
          </span>
        </div>
        <div class="flex flex-wrap w-full gap-1">
          {#each exerciseSplit.splitDays as splitDay}
            {#if splitDay}
              <span class="badge">{splitDay.name}</span>
            {:else}
              <span class="badge badge-accent"></span>
            {/if}
          {/each}
        </div>
      </div>
    </a>
  {/each}
</div>
<a class="btn btn-accent mt-2" href="/exerciseSplits/templates">Create new split</a>
