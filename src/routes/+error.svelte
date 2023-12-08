<script lang="ts">
  import { page } from "$app/stores";
</script>

<div class="flex flex-col grow justify-center items-center gap-5">
  <span class="font-extrabold text-error text-7xl">{$page.status}</span>
  <span class="text-lg">{$page.error?.message}</span>
</div>
