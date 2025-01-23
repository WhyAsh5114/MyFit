<script lang="ts">
  import { getTotalDuration } from "$lib/util/MesocycleTemplate";
  export let mesocycleTemplatePromise: Promise<WithSerializedId<MesocycleTemplate> | null>;
</script>

{#await mesocycleTemplatePromise}
  <div class="skeleton w-full h-20 bg-primary brightness-50 rounded-md" />
{:then mesocycleTemplate}
  {#if mesocycleTemplate}
    <a
      class="btn btn-primary h-fit p-2 flex-col rounded-md"
      href="/mesocycles/viewTemplate/{mesocycleTemplate.id}"
    >
      <div class="flex flex-col w-full gap-2">
        <div class="flex items-center justify-between">
          <span class="text-lg font-semibold">{mesocycleTemplate.name}</span>
          <span class="font-normal">
            {getTotalDuration(mesocycleTemplate.RIRProgression)} cycles
          </span>
        </div>
        <div class="flex flex-wrap gap-1">
          {#each mesocycleTemplate.exerciseSplit as split}
            {#if split !== null}
              <span class="badge font-semibold">{split.name}</span>
            {:else}
              <span class="badge" />
            {/if}
          {/each}
        </div>
      </div>
    </a>
  {/if}
{/await}
