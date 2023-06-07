<script lang="ts">
	import type { VolumeLandmark } from '$lib/commonDB';

	export let volumeLandmark: VolumeLandmark;
	export let volume: number;
	export let frequency: number;
</script>

<div class="w-52 relative flex items-center">
	{#if frequency >= 2 && frequency <= 6}
		{#if volume < volumeLandmark.MEV}
			<progress
				class="progress absolute progress-secondary bg-secondary bg-opacity-0"
				value={volumeLandmark.MEV}
				max={volumeLandmark.MRV[frequency]}
			/>
		{/if}
		{#if volume >= volumeLandmark.MV && volume <= volumeLandmark.MRV[frequency]}
			<progress
				class="progress absolute {volume < volumeLandmark.MEV
					? 'progress-warning'
					: 'progress-success'} bg-secondary bg-opacity-50"
				value={volume}
				max={volumeLandmark.MRV[frequency]}
			/>
		{:else}
			<progress
				class="progress absolute progress-error bg-secondary bg-opacity-50"
				value={volume}
				max={volumeLandmark.MRV[frequency]}
			/>
		{/if}
	{/if}
</div>
