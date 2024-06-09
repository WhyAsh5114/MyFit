<script>
	import H2 from '$lib/components/ui/typography/H2.svelte';
	import { page } from '$app/stores';

	const { children } = $props();
	const editId = $page.url.searchParams.get('editId');
</script>

<H2>{editId ? 'Edit' : 'New'} exercise split</H2>
{@render children()}
