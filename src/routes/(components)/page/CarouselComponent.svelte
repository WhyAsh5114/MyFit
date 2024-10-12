<script lang="ts">
	import * as Carousel from '$lib/components/ui/carousel/index.js';
	import { mode } from 'mode-watcher';
</script>

<Carousel.Root class="mx-auto my-4 w-3/4">
	<Carousel.Content class="items-center">
		<Carousel.Item>
			<img class="border" src="/screenshots/{$mode}/SplitDayChart.png" alt="SplitDayChart" />
		</Carousel.Item>
		<Carousel.Item>
			<img
				class="border"
				src="/screenshots/{$mode}/MicrocycleVolumeDistributionChart.png"
				alt="MicrocycleVolumeDistributionChart"
			/>
		</Carousel.Item>
		<Carousel.Item>
			<img
				class="border"
				src="/screenshots/{$mode}/MuscleGroupVolumeDistributionChart.png"
				alt="MuscleGroupVolumeDistributionChart"
			/>
		</Carousel.Item>
	</Carousel.Content>
	<Carousel.Previous />
	<Carousel.Next />
</Carousel.Root>
