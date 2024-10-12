<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import TrendingUp from 'virtual:icons/lucide/trending-up';
	import ChartColumn from 'virtual:icons/lucide/chart-column';
	import Settings from 'virtual:icons/lucide/settings';
</script>

<div class="col-span-2 grid w-full place-items-center gap-1 lg:grid-cols-3">
	<Card.Root>
		<Card.Header>
			<Card.Title class="flex items-center justify-between">
				Progression
				<TrendingUp />
			</Card.Title>
			<Card.Description class="text-justify lg:text-left">
				Automatically increase reps and load based on your past performances to ensure you're always making progress
			</Card.Description>
		</Card.Header>
	</Card.Root>
	<Card.Root>
		<Card.Header>
			<Card.Title class="flex items-center justify-between">
				Stats
				<ChartColumn />
			</Card.Title>
			<Card.Description class="text-justify lg:text-left">
				All the charts you can think of! Make well-balanced routines and compare past performances
			</Card.Description>
		</Card.Header>
	</Card.Root>
	<Card.Root>
		<Card.Header>
			<Card.Title class="flex items-center justify-between">
				Customizable
				<Settings />
			</Card.Title>
			<Card.Description class="text-justify lg:text-left">
				Edit split during mesocycles, override progression for specific exercises, and much more!
			</Card.Description>
		</Card.Header>
	</Card.Root>
</div>
