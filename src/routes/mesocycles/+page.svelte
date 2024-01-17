<script lang="ts">
  import { caloricStates } from "$lib/types/arrays.js";
  import { dateFormatter } from "$lib/utils/common.js";
  export let data;

  function getExerciseSplitName(id: string) {
    return data.exerciseSplits.find((split) => split._id === id)?.name;
  }
</script>

<div class="flex flex-col gap-1 h-px overflow-y-auto grow">
  {#each data.mesocycles as mesocycle}
    {@const caloricState = caloricStates.find((e) => e.value === mesocycle.caloricBalance)}
    <a class="btn rounded-md btn-primary h-fit" href="/mesocycles/view/{mesocycle._id}">
      <div class="flex flex-col gap-1 py-2 w-full">
        <div class="flex justify-between items-center">
          <span class="text-lg font-semibold">{mesocycle.name}</span>
          <p class:text-accent={mesocycle.endTimestamp === null}>
            {dateFormatter(mesocycle.startTimestamp)}
            {#if mesocycle.endTimestamp}
              {dateFormatter(mesocycle.endTimestamp)}
            {/if}
          </p>
        </div>
        <div class="flex justify-between items-center font-normal">
          <span>{getExerciseSplitName(mesocycle.exerciseSplitId)}</span>
          <span>{caloricState?.name}</span>
        </div>
        {#if mesocycle.specialization}
          <div class="grid grid-cols-2 gap-2">
            <div class="flex flex-wrap gap-1 mt-1">
              {#each mesocycle.specialization as specialization}
                {#if specialization.type === "primary"}
                  <span class="badge badge-accent truncate">
                    {specialization.muscleGroup}
                  </span>
                {/if}
              {/each}
            </div>
            <div class="flex flex-wrap gap-1 mt-1 justify-end">
              {#each mesocycle.specialization as specialization}
                {#if specialization.type === "secondary"}
                  <span class="badge truncate">
                    {specialization.muscleGroup}
                  </span>
                {/if}
              {/each}
            </div>
          </div>
        {/if}
      </div>
    </a>
  {/each}
</div>

<a class="btn btn-accent mt-2" href="/mesocycles/new">Create new mesocycle</a>
