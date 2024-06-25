<script lang="ts">
	import H2 from '$lib/components/ui/typography/H2.svelte';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<H2>New workout</H2>
{@render children()}
