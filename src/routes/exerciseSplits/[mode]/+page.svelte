<script lang="ts">
  import { setExerciseSplitStores } from "./splitStore.js";
  export let data;

  if (data.template) setExerciseSplitStores(data.template);
</script>

<div class="grow">
  <!-- TODO: Info about creating an exercise split -->
</div>

<a class="btn btn-accent" href="/exerciseSplits/{data.mode}/structure">
  <p><span class="capitalize">{data.mode}</span> exercise split</p>
</a>
