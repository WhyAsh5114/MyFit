<script lang="ts">
  // eslint-disable-next-line svelte/valid-compile
  export let data;

  // TODO: Load template into stores
</script>

<div class="grow">
  <!-- TODO: Info about creating an exercise split -->
</div>

<a class="btn btn-accent" href="/exerciseSplits/{data.mode}/structure">
  <p><span class="capitalize">{data.mode}</span> exercise split</p>
</a>
