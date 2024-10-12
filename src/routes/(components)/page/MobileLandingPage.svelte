<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import type { HomePageCounts } from '../../+page.server';
	import * as Card from '$lib/components/ui/card';
	import * as Carousel from '$lib/components/ui/carousel/index.js';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import { mode } from 'mode-watcher';

	let counts: HomePageCounts = $props();
</script>

<div class="flex h-px grow flex-col justify-evenly gap-2 px-4">
	<span class="text-center text-3xl font-bold">
		Free <span class="text-primary">science-based</span> workout tracking
	</span>
	<span class="text-md text-center leading-tight text-muted-foreground">
		With automatic progression, detailed statistics, and highly customizable
	</span>
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
	<div class="flex flex-col">
		<div class="grid grid-cols-3 gap-1">
			<Card.Root class="">
				<Card.Header class="flex p-4">
					<Card.Title class="text-center text-sm font-medium">Workouts</Card.Title>
				</Card.Header>
				<Card.Content class="p-4 pt-0">
					{#await counts.workoutCount}
						<Skeleton class="h-8 w-full"></Skeleton>
					{:then workoutCount}
						<div class="text-center text-2xl font-bold">{workoutCount}</div>
					{/await}
				</Card.Content>
			</Card.Root>
			<Card.Root class="">
				<Card.Header class="flex p-4">
					<Card.Title class="text-center text-sm font-medium">Exercises</Card.Title>
				</Card.Header>
				<Card.Content class="p-4 pt-0">
					{#await counts.exerciseCount}
						<Skeleton class="h-8 w-full"></Skeleton>
					{:then exerciseCount}
						<div class="text-center text-2xl font-bold">{exerciseCount}</div>
					{/await}
				</Card.Content>
			</Card.Root>
			<Card.Root class="">
				<Card.Header class="flex p-4">
					<Card.Title class="text-center text-sm font-medium">Sets</Card.Title>
				</Card.Header>
				<Card.Content class="p-4 pt-0">
					{#await counts.setsCount}
						<Skeleton class="h-8 w-full"></Skeleton>
					{:then setsCount}
						<div class="text-center text-2xl font-bold">{setsCount}</div>
					{/await}
				</Card.Content>
			</Card.Root>
		</div>
		<span class="mt-1 text-center italic text-muted-foreground">have been logged already!</span>
	</div>
	<Button class="mx-auto w-fit">Login</Button>
</div>
