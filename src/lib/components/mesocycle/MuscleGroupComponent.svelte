<script lang="ts">
	import type { commonMuscleGroups } from '$lib/commonDB';
	import { volumeLandmarks } from '$lib/commonDB';
	import VolumeProgress from './VolumeProgress.svelte';

	export let bgColorClass = 'bg-primary';
	export let muscleGroup: (typeof commonMuscleGroups)[number];
	export let volume: number;
	export let freq: number;
	let volumeLandmark = volumeLandmarks[muscleGroup];
</script>

<div class="flex w-full {bgColorClass} font-semibold rounded-md px-2 py-0.5">
	<h4 class="shrink-0 basis-24">{muscleGroup}</h4>
	<VolumeProgress {volumeLandmark} {volume} frequency={freq} />
	{#if freq < volumeLandmark.freqStart || freq > volumeLandmark.freqEnd}
		{#if (freq < 2 && volumeLandmark.MV > 0) || freq === 7}
			<p class="ml-4 text-error">{freq}x</p>
		{:else if volumeLandmark.MEV === 0}
			<p class="ml-4">{freq}x</p>
		{:else}
			<p class="ml-4 text-warning">{freq}x</p>
		{/if}
	{:else}
		<p class="ml-4 text-success">{freq}x</p>
	{/if}
</div>
