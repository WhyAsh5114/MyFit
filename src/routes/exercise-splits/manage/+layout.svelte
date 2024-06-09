<script>
	import H2 from '$lib/components/ui/typography/H2.svelte';
	import { page } from '$app/stores';

	const { children } = $props();
</script>

<H2><span class="capitalize">{$page.url.searchParams.get('mode')}</span> exercise split</H2>
{@render children()}
