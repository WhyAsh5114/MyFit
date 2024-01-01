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

<div class="grow">
  <!-- TODO: Info about creating an exercise split -->
</div>

<a class="btn btn-accent" href="/exerciseSplits/{params.mode}/structure">
  <p><span class="capitalize">{params.mode}</span> exercise split</p>
</a>
