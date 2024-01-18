<script lang="ts">
  import {
    clearExerciseSplitStores,
    editingSplitId,
    setExerciseSplitStores
  } from "./splitStore.js";
  import { page } from "$app/stores";
  export let data;

  $: ({ params } = $page);
  $editingSplitId = data.editingSplitId;

  if (data.template) setExerciseSplitStores(data.template);
  else clearExerciseSplitStores();
</script>

<h2><span class="capitalize">{params.mode}</span> exercise split</h2>

<div class="grow">
  <!-- TODO: Info about creating an exercise split, also the current template (if any) -->
</div>

<a class="btn btn-accent" href="/exerciseSplits/{params.mode}/structure">
  <p><span class="capitalize">{params.mode}</span> exercise split</p>
</a>
