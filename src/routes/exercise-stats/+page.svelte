<script lang="ts">
	import H2 from '$lib/components/ui/typography/H2.svelte';
	import ExerciseStats from './ExerciseStats.svelte';

	let { data } = $props();
</script>

<H2>Exercise stats</H2>

<ExerciseStats {data} />
