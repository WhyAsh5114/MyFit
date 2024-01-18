<script lang="ts">
  import { page } from "$app/stores";
  $: ({ params } = $page);
</script>

<h2>New mesocycle</h2>
<h3>Exercise starting points</h3>

<!-- TODO: info about creating a new mesocycle -->
<div class="flex m-auto gap-2">
  <p class="font-extrabold text-3xl">In the works</p>
  <span class="loading loading-lg loading-infinity"></span>
</div>

<a class="btn btn-block btn-accent" href="/mesocycles/{params.mode}/specializations">
  Select specializations
</a>
