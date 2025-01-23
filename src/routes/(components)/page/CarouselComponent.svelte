<script lang="ts">
	import * as Carousel from '$lib/components/ui/carousel/index.js';
	import { mode } from 'mode-watcher';
</script>

<Carousel.Root class="mx-auto my-4 w-3/4">
	<Carousel.Content class="items-center">
		<Carousel.Item>
			<img
				class="mx-auto border"
				src="/screenshots/{$mode}/SplitDayChart.webp"
				alt="SplitDayChart"
				width={240}
				height={236.5}
			/>
		</Carousel.Item>
		<Carousel.Item>
			<img
				class="mx-auto border"
				src="/screenshots/{$mode}/MicrocycleVolumeDistributionChart.webp"
				alt="MicrocycleVolumeDistributionChart"
				width={240}
				height={185.5}
			/>
		</Carousel.Item>
		<Carousel.Item>
			<img
				class="mx-auto border"
				src="/screenshots/{$mode}/MuscleGroupVolumeDistributionChart.webp"
				alt="MuscleGroupVolumeDistributionChart"
				width={240}
				height={234}
			/>
		</Carousel.Item>
	</Carousel.Content>
	<Carousel.Previous />
	<Carousel.Next />
</Carousel.Root>
