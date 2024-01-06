<script lang="ts">
  import { page } from "$app/stores";
  $: ({ params } = $page);
</script>

<h2><span class="capitalize">{params.mode}</span> mesocycle</h2>
<h3>Specializations</h3>
