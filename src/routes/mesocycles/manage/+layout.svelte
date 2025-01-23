<script lang="ts">
	import H2 from '$lib/components/ui/typography/H2.svelte';
	import { mesocycleRunes } from './mesocycleRunes.svelte';

	const { children } = $props();
</script>

<H2>{mesocycleRunes.editingMesocycleId ? 'Edit' : 'New'} mesocycle</H2>
{@render children()}
