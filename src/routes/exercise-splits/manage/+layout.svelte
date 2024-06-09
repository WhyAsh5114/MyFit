<script>
	import H2 from '$lib/components/ui/typography/H2.svelte';
	import { exerciseSplitRunes } from './exerciseSplitRunes.svelte';

	const { children } = $props();
</script>

<H2>{exerciseSplitRunes.editingExerciseSplitId ? 'Edit' : 'New'} exercise split</H2>
{@render children()}
