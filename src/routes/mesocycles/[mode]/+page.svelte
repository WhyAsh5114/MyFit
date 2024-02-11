<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import {
    didMesocycleStoresChange,
    originalMesocycle,
    setMesocycleStores
  } from "./mesocycleStore.js";

  $: ({ params } = $page);
  $: ({ name: originalName } = $originalMesocycle);

  async function resetMesocycleAndRedirect() {
    setMesocycleStores($originalMesocycle);
    await goto(`/mesocycles/${params.mode}/basics`);
  }
</script>

<h2><span class="capitalize">{params.mode}</span> mesocycle</h2>
{#if params.mode === "edit"}
  <h3>Editing {originalName}</h3>
{:else}
  <h3>Creating a new mesocycle</h3>
{/if}

<div class="divider divider-secondary"></div>

<article class="grow prose max-w-none overflow-y-auto">
  <h1>Mesocycles</h1>
  <p>A mesocycle is ... (TBD)</p>
  <h2>Heading 2</h2>
  <!-- TODO: finish this info page -->
</article>

{#if didMesocycleStoresChange()}
  <div class="join grid grid-cols-2">
    <button class="join-item btn btn-error" on:click={resetMesocycleAndRedirect}>
      Reset changes
    </button>
    <a class="join-item btn btn-primary" href="/mesocycles/{params.mode}/basics">
      <p>Continue {params.mode === "new" ? "creating" : "editing"}</p>
    </a>
  </div>
{:else}
  <a class="btn btn-accent" href="/mesocycles/{params.mode}/basics">
    <p><span class="capitalize">{params.mode}</span> mesocycle</p>
  </a>
{/if}
