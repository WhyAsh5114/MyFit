<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import type { HomePageCounts } from '../../+page.server';

	let counts: HomePageCounts = $props();
</script>

<div class="flex flex-col">
	<div class="grid grid-cols-3 gap-1">
		<Card.Root class="bg-background">
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
		<Card.Root class="bg-background">
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
		<Card.Root class="bg-background">
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
