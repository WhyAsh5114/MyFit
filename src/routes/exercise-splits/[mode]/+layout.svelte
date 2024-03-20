<script>
	import H2 from '$lib/components/ui/typography/H2.svelte';
	import { page } from '$app/stores';

	const mode = $page.params.mode;
</script>

<H2><span class="capitalize">{mode}</span> exercise split</H2>
<slot />
