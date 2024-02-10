<script lang="ts">
  import {
    clearExerciseSplitStores,
    editingSplitId,
    setExerciseSplitStores
  } from "./splitStore.js";
  import { page } from "$app/stores";
  export let data;

  $: ({ params, url } = $page);
  $editingSplitId = data.editingSplitId ?? null;

  if (data.template) setExerciseSplitStores(data.template);
  else clearExerciseSplitStores();
</script>

<h2><span class="capitalize">{params.mode}</span> exercise split</h2>
<h3>
  {#if url.searchParams.get("editId")}
    Editing <span class="italic">{data.template?.name}</span>
  {:else if url.searchParams.get("cloneId")}
    Cloning <span class="italic">{data.template?.name}</span>
  {:else if url.searchParams.get("commonIdx")}
    Using common split <span class="italic">{data.template?.name}</span>
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
</article>

<a class="btn btn-accent" href="/exerciseSplits/{params.mode}/structure">
  <p><span class="capitalize">{params.mode}</span> exercise split</p>
</a>
