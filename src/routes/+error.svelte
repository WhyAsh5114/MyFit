<script lang="ts">
  import { page } from "$app/stores";
  $: ({ status, error } = $page);
</script>

<div class="flex flex-col grow justify-center items-center gap-5">
  <span class="font-extrabold text-error text-7xl">{status}</span>
  <span class="text-lg">{error?.message}</span>
</div>
