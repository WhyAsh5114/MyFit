<script lang="ts">
  import { page } from "$app/stores";
  import { editingMesocycleId } from "./mesocycleStore.js";
  export let data;

  $: ({ params } = $page);
  $editingMesocycleId = data.editingMesocycleId ?? null;

  if (data.template) {
    // set stores
  } else {
    // clear stores
  }
</script>

<h2><span class="capitalize">{params.mode}</span> mesocycle</h2>

<a class="btn btn-accent mt-auto" href="/mesocycles/{params.mode}/basics">
  <p><span class="capitalize">{params.mode}</span> mesocycle</p>
</a>
