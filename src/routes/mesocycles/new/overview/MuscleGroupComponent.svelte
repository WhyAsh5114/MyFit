<script lang="ts">
	import type { VolumeLandmark } from '$lib/commonDB';
	import VolumeProgress from './VolumeProgress.svelte';

	export let volumeLandmark: VolumeLandmark;
	export let muscleGroup: string;
	export let volume: number;
	export let freq: number;
</script>

<div class="flex w-full bg-primary font-semibold rounded-md px-2 py-0.5">
	<h4 class="shrink-0 basis-24">{muscleGroup}</h4>
	<VolumeProgress {volumeLandmark} volume={volume} frequency={freq} />
	{#if freq < volumeLandmark.freqStart || freq > volumeLandmark.freqEnd}
		{#if (freq < 2 && volumeLandmark.MV > 0) || freq === 7}
			<p class="ml-auto text-error">{freq}x</p>
		{:else if volumeLandmark.MEV === 0}
			<p class="ml-auto">{freq}x</p>
		{:else}
			<p class="ml-auto text-warning">{freq}x</p>
		{/if}
	{:else}
		<p class="ml-auto text-success">{freq}x</p>
	{/if}
</div>
