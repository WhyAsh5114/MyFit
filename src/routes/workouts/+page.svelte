<script lang="ts">
  import { dateFormatter } from "$lib/util/CommonFunctions";
  import { onMount } from "svelte";
  import WorkoutCard from "./WorkoutCard.svelte";
  export let data;

  let {
    activeMesocycle,
    activeMesocycleTemplate,
    mesocycleTemplates,
    mesocycles,
    workouts,
    workoutsCount
  } = data;

  let selectedMesocycleTemplate: WithSerializedId<MesocycleTemplate> | undefined = undefined;
  let selectedMesocycleTemplateId = activeMesocycleTemplate?._id;
  let selectedMesocycleId = activeMesocycle?._id;

  let filterByMesocycle = selectedMesocycleId !== undefined;
  let mounted = false;
  onMount(() => (mounted = true));
  $: if (!filterByMesocycle && mounted) {
    // Reuse server loaded data
    workouts = JSON.parse(JSON.stringify(data.workouts));
    workoutsCount = data.workoutsCount;
    selectedMesocycleTemplate = undefined;
  }

  let filtering = false;
  async function filterWorkouts() {
    filtering = true;
    await loadMore(true);
    filtering = false;
    selectedMesocycleTemplate = mesocycleTemplates.find(
      (mesocycleTemplate) => mesocycleTemplate._id === selectedMesocycleTemplateId
    );
  }

  let loadingMore = false;
  async function loadMore(reset = false) {
    const pageToLoad = reset ? 0 : Math.floor(workouts.length / 10);
    let params = "?page=" + pageToLoad;
    if (filterByMesocycle) {
      if (selectedMesocycleId) {
        params += "&mesocycleId=" + selectedMesocycleId;
      } else if (selectedMesocycleTemplateId) {
        params += "&mesocycleTemplateId=" + selectedMesocycleTemplateId;
      }
    }

    loadingMore = true;
    const response = await fetch("/api/workouts/getAllWorkouts" + params);
    const { workouts: newWorkouts, workoutsCount: newCount } = await response.json();
    loadingMore = false;

    workoutsCount = newCount;
    if (!reset) workouts = [...workouts, ...newWorkouts];
    else workouts = [...newWorkouts];
  }
</script>

<form
  class="stats stats-vertical mb-2 drop-shadow-2xl shadow-black"
  on:submit|preventDefault={filterWorkouts}
>
  <div class="stat">
    <div class="stat-title flex justify-between items-center">
      <label for="filter-by-mesocycle">Filter by mesocycle</label>
      <input
        id="filter-by-mesocycle"
        class="toggle"
        type="checkbox"
        bind:checked={filterByMesocycle}
      />
    </div>
    {#if filterByMesocycle}
      <div class="flex flex-col gap-1 mt-2">
        <select
          id="filter-by-mesocycle-template-name"
          class="select"
          bind:value={selectedMesocycleTemplateId}
        >
          {#each mesocycleTemplates as mesocycleTemplate}
            <option value={mesocycleTemplate._id}>
              {mesocycleTemplate.name}
            </option>
          {/each}
        </select>
        <select id="filter-by-mesocycle-start" class="select" bind:value={selectedMesocycleId}>
          <option selected value={null}>All usages</option>
          {#each mesocycles as mesocycle}
            {#if mesocycle.templateMesoId === selectedMesocycleTemplateId}
              <option value={mesocycle._id}>
                {dateFormatter(mesocycle.startTimestamp)}
              </option>
            {/if}
          {/each}
        </select>
        <button class="btn btn-accent btn-sm btn-block mt-1">
          {#if filtering}
            <span class="loading loading-bars"></span>
          {:else}
            Apply filter
          {/if}
        </button>
      </div>
    {/if}
  </div>
</form>

<div class="flex flex-col h-px grow overflow-y-auto gap-1 drop-shadow-2xl shadow-black">
  {#if workouts.length > 0}
    {#each workouts as workout}
      <WorkoutCard mesocycleTemplate={selectedMesocycleTemplate} {workout} />
    {/each}
    {#if workouts.length < workoutsCount}
      <button class="btn btn-outline" on:click={() => loadMore()}>
        {#if loadingMore && !filtering}
          <span class="loading loading-bars"></span>
        {:else}
          Load more
        {/if}
      </button>
    {/if}
  {:else}
    <div class="stats">
      <div class="stat">
        <div class="text-sm text-white font-semibold">No workout found</div>
      </div>
    </div>
  {/if}
</div>
<a class="btn btn-accent btn-block mt-1" href="/workouts/new">Log today's workout</a>
