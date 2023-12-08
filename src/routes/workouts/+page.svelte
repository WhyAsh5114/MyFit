<script lang="ts">
  import { dateFormatter } from "$lib/util/CommonFunctions";
  import WorkoutCard from "./WorkoutCard.svelte";
  export let data;

  let { workoutsStreamArray } = data.streamed;
  $: if (!filterByMesocycle) {
    workoutsStreamArray = data.streamed.workoutsStreamArray;
  }
  $: selectedMesocycleTemplateId, (selectedMesocycleId = null);

  const asyncFind = async <T,>(arr: Array<T>, predicate: (value: T) => Promise<boolean>) => {
    const promises = arr.map(predicate);
    const results = await Promise.all(promises);
    const index = results.findIndex((result) => result);
    return arr[index];
  };

  const asyncFilter = async <T,>(arr: Array<T>, predicate: (value: T) => Promise<boolean>) => {
    const results = await Promise.all(arr.map(predicate));
    return arr.filter((_v, index) => results[index]);
  };

  let filterByMesocycle = false;
  let selectedMesocycleTemplateId: null | string = null;
  let selectedMesocycleTemplate: WithSerializedId<MesocycleTemplate> | null = null;
  let selectedMesocycleId: null | string = null;

  async function filterWorkouts() {
    selectedMesocycleTemplate = await asyncFind(
      data.streamed.mesocycleTemplatesStreamArray,
      async (mesocycleTemplatePromise) => {
        const mesocycleTemplate = await mesocycleTemplatePromise;
        if (mesocycleTemplate === null) return false;
        return mesocycleTemplate.id === selectedMesocycleTemplateId;
      }
    );

    let allMesocyclesIds: (string | undefined)[] = [];
    const allMesocyclesOfTemplate = await asyncFilter(
      data.streamed.mesocyclesStreamArray,
      async (mesocyclePromise) => {
        const mesocycle = await mesocyclePromise;
        return mesocycle?.templateMesoId === selectedMesocycleTemplateId;
      }
    );
    allMesocyclesIds = (await Promise.all(allMesocyclesOfTemplate)).map(
      (mesocycle) => mesocycle?.id
    );

    workoutsStreamArray = await asyncFilter(
      data.streamed.workoutsStreamArray,
      async (workoutPromise) => {
        const workout = await workoutPromise;
        if (selectedMesocycleId !== null) {
          return workout?.performedMesocycleId === selectedMesocycleId;
        } else {
          return allMesocyclesIds.includes(workout?.performedMesocycleId);
        }
      }
    );
  }
</script>

<form class="stats stats-vertical mb-4" on:submit|preventDefault={filterWorkouts}>
  <div class="stat">
    <div class="stat-title flex justify-between items-center">
      <label for="filter-by-mesocycle">Filter by mesocycle</label>
      <input
        type="checkbox"
        id="filter-by-mesocycle"
        class="toggle"
        bind:checked={filterByMesocycle}
      />
    </div>
    {#if filterByMesocycle}
      {#await Promise.all(data.streamed.mesocycleTemplatesStreamArray)}
        <span class="loading loading-bars"></span>
      {:then mesocycleTemplates}
        <select
          id="mesocycle-name"
          class="select mt-2"
          required
          bind:value={selectedMesocycleTemplateId}
        >
          <option value={null} disabled>Select template</option>
          {#each mesocycleTemplates as mesocycleTemplate}
            {#if mesocycleTemplate}
              <option value={mesocycleTemplate.id}>{mesocycleTemplate.name}</option>
            {/if}
          {/each}
        </select>
      {/await}
      {#if selectedMesocycleTemplateId !== null}
        {#await Promise.all(data.streamed.mesocyclesStreamArray) then mesocycles}
          <select
            id="performed-mesocycle-duration"
            class="select mt-1"
            bind:value={selectedMesocycleId}
          >
            <option selected value={null}>All usages</option>
            {#each mesocycles as mesocycle}
              {#if mesocycle && mesocycle.templateMesoId === selectedMesocycleTemplateId}
                <option value={mesocycle.id}>{dateFormatter(mesocycle.startTimestamp)}</option>
              {/if}
            {/each}
          </select>
        {/await}
      {/if}
      <button class="btn btn-accent btn-sm btn-block mt-2">Apply filter</button>
    {/if}
  </div>
</form>

<div class="flex flex-col h-px grow overflow-y-auto gap-1">
  {#if workoutsStreamArray.length > 0}
    {#each workoutsStreamArray as workoutPromise}
      <WorkoutCard {workoutPromise} bind:mesocycleTemplate={selectedMesocycleTemplate} />
    {/each}
  {:else}
    <div class="stats">
      <div class="stat">
        <div class="text-sm text-white font-semibold">No workout found</div>
      </div>
    </div>
  {/if}
</div>
<a href="/workouts/new" class="btn btn-accent btn-block">Log today's workout</a>
