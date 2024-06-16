<script lang="ts">
	import { page } from '$app/stores';
</script>

<div class="flex w-full h-px grow flex-col items-center justify-center gap-2">
	<span class="text-4xl font-bold">Error {$page.status}</span>
	<h3 class="font-light">{$page.error?.message}</h3>
</div>
