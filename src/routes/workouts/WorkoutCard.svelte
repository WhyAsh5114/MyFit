<script lang="ts">
  import { dateFormatter } from "$lib/util/CommonFunctions";

  export let workoutPromise: Promise<
    (Workout & { id: string } & { performedMesocycleId: string }) | null
  >;
  export let mesocycleTemplate: WithSerializedId<MesocycleTemplate> | null;
</script>

{#await workoutPromise}
  <div class="skeleton w-full h-20 bg-primary brightness-50 rounded-md"></div>
{:then workout}
  {#if workout}
    <a
      class="btn btn-primary rounded-md justify-start px-0 font-normal h-fit"
      href="/workouts/{workout.id}/view"
    >
      <div class="flex flex-col p-2 w-full items-start">
        <div class="flex justify-between items-center w-full">
          <span class="text-lg font-semibold">{dateFormatter(workout.startTimestamp)}</span>
          {#if mesocycleTemplate}
            {mesocycleTemplate.exerciseSplit[workout.dayNumber]?.name}, Cycle {workout.cycleNumber}
          {/if}
        </div>
      </div>
    </a>
  {/if}
{/await}
