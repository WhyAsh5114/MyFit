<script lang="ts">
  import { commonSplits } from "$lib/commonMesocycles";
  import { getAverageSetsPerDayOfSplit } from "$lib/utils/exerciseSplits";
  import SplitDaysSchedule from "../../SplitDaysSchedule.svelte";
</script>

<div class="flex flex-col gap-2 h-px grow overflow-y-auto">
  {#each commonSplits as commonSplit, commonSplitIdx}
    <a
      class="btn btn-primary h-fit font-normal text-left"
      href="/exerciseSplits/new?commonIdx={commonSplitIdx}"
    >
      <div class="flex flex-col py-2 bg-primary rounded-md gap-1">
        <div class="flex justify-between items-center">
          <span class="text-lg font-semibold">{commonSplit.name}</span>
          <span class="badge badge-error font-semibold">
            {getAverageSetsPerDayOfSplit(commonSplit.splitDays).toFixed(2)} sets/day
          </span>
        </div>
        <p class="text-sm mb-1">{commonSplit.description}</p>
        <SplitDaysSchedule splitDays={commonSplit.splitDays} />
      </div>
    </a>
  {/each}
</div>
