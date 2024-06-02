<script>
	import H2 from '$lib/components/ui/typography/H2.svelte';

	const { children } = $props();
</script>

<H2>New exercise split</H2>
{@render children()}
