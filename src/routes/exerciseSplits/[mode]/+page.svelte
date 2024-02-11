<script lang="ts">
  import {
    setExerciseSplitStores,
    didExerciseSplitStoresChange,
    originalExerciseSplit
  } from "./splitStore.js";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";

  $: ({ params, url } = $page);
  $: ({ name: originalName } = $originalExerciseSplit);
  $: templateType = url.searchParams.get("templateType");

  async function resetSplitAndRedirect() {
    setExerciseSplitStores($originalExerciseSplit);
    await goto(`/exerciseSplits/${params.mode}/structure`);
  }
</script>

<h2><span class="capitalize">{params.mode}</span> exercise split</h2>
<h3>
  {#if url.searchParams.get("editId")}
    Editing <span class="italic">{originalName}</span>
  {:else if templateType === "clone"}
    Cloning <span class="italic">{originalName}</span>
  {:else if templateType === "common"}
    Using common split <span class="italic">{originalName}</span>
  {:else}
    Starting from scratch
  {/if}
</h3>

<div class="divider divider-secondary"></div>

<article class="grow prose max-w-none overflow-y-auto">
  <h1>Exercise splits</h1>
  <p>
    An exercise split is the plan for your workouts during a week, which we call a microcycle.
    Usually, it lasts for 7 days, but our app also supports different durations. Here are some tips
    to consider when making your exercise split:
  </p>
  <h2>Frequency</h2>
  <!-- TODO: finish this info page -->
</article>

{#if didExerciseSplitStoresChange()}
  <div class="join grid grid-cols-2">
    <button class="join-item btn btn-error" on:click={resetSplitAndRedirect}>
      Reset changes
    </button>
    <a class="join-item btn btn-primary" href="/exerciseSplits/{params.mode}/structure">
      <p>Continue {params.mode === "new" ? "creating" : "editing"}</p>
    </a>
  </div>
{:else}
  <a class="btn btn-accent" href="/exerciseSplits/{params.mode}/structure">
    <p><span class="capitalize">{params.mode}</span> exercise split</p>
  </a>
{/if}
