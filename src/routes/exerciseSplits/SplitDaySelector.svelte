<script lang="ts">
  export let exerciseSplitDays: ExerciseSplit["splitDays"];
  export let selectedSplitDayIndex: number;
</script>

<div class="collapse collapse-arrow rounded-md bg-primary my-2">
  <input id="show-all-days" aria-label="show-all-days" checked type="checkbox" />
  <div class="collapse-title text-xl font-semibold">
    D{selectedSplitDayIndex + 1}
    <span class="text-base font-normal ml-2">{exerciseSplitDays[selectedSplitDayIndex]?.name}</span>
  </div>
  <div class="collapse-content backdrop-brightness-50">
    <div class="flex flex-wrap justify-center items-center gap-2 mt-4">
      {#each exerciseSplitDays as exerciseSplitDay, i}
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
