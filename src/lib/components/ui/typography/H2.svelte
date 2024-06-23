<script lang="ts">
	import type { Snippet } from 'svelte';
	let { children }: { children: Snippet } = $props();
</script>

<h2
	class="mb-4 flex h-10 scroll-m-20 items-end justify-between border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0"
>
	{@render children()}
</h2>
