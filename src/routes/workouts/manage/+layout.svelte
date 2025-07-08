<script lang="ts">
	import H2 from '$lib/components/ui/typography/H2.svelte';
	import type { Snippet } from 'svelte';
	import { workoutRunes } from './workoutRunes.svelte';
	import type { LayoutData } from './$types';

	let { children, data }: { children: Snippet<[LayoutData]>; data: LayoutData } = $props();
	let editing = $derived(workoutRunes.editingWorkoutId !== null);
</script>

<H2>{editing ? 'Edit' : 'New'} workout</H2>
{@render children(data)}
