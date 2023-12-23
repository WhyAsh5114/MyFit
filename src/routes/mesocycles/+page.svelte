<script lang="ts">
  export let data;
  import ActiveMesocycleCard from "./ActiveMesocycleCard.svelte";
  import MesocycleTemplateCard from "./MesocycleTemplateCard.svelte";

  const totalMesocycleTemplates = data.mesocycleTemplates.length;
  const { activeMesocycle, activeMesocycleTemplate } = data;

  let { mesocycleTemplates, mesocycleTemplatesCount } = data;

  let loadingMore = false;
  async function loadMore() {
    const pageToLoad = Math.floor(data.mesocycleTemplates.length / 10);
    let params = "?page=" + pageToLoad;

    loadingMore = true;
    const response = await fetch("/api/mesocycles/getAllMesocycleTemplates" + params);
    const { mesocycleTemplates: newTemplates } = await response.json();
    loadingMore = false;

    mesocycleTemplates = [...mesocycleTemplates, ...newTemplates];
  }
</script>

<h2>Mesocycles</h2>

<h3 class="text-xl mb-1">Currently active</h3>
{#if activeMesocycle && activeMesocycleTemplate}
  <ActiveMesocycleCard {activeMesocycle} {activeMesocycleTemplate} />
{:else}
  <div class="flex flex-col bg-primary rounded-md p-2">
    <span class="text-warning">No mesocycle active</span>
    Start one by selecting it from the menu below and hitting start
  </div>
{/if}

<h3 class="text-xl mb-1 mt-3">Mesocycle templates</h3>
<div class="flex flex-col gap-1.5 h-px grow overflow-y-auto">
  {#if totalMesocycleTemplates > 0}
    {#each mesocycleTemplates as mesocycleTemplate}
      <MesocycleTemplateCard {mesocycleTemplate} />
    {/each}
    {#if mesocycleTemplates.length < mesocycleTemplatesCount}
      <button class="btn btn-outline" on:click={loadMore}>
        {#if loadingMore}
          <span class="loading loading-bars"></span>
        {:else}
          Load more
        {/if}
      </button>
    {/if}
  {:else}
    <div class="flex flex-col bg-primary rounded-md p-2">
      <span class="text-warning">No mesocycle created</span>
      Create one by clicking the button below
    </div>
  {/if}
</div>

<a class="btn btn-block btn-accent mt-1" href="/mesocycles/creationPresets">Create new mesocycle</a>
