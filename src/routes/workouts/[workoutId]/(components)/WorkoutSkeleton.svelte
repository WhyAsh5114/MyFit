<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import * as Tabs from '$lib/components/ui/tabs';
	import MenuIcon from 'virtual:icons/lucide/menu';

	let selectedTabValue = $state('basics');
</script>

<Tabs.Root class="flex w-full grow flex-col" bind:value={selectedTabValue}>
	<Tabs.List class="grid grid-cols-2">
		<Tabs.Trigger value="basics">Basics</Tabs.Trigger>
		<Tabs.Trigger value="exercises">Exercises</Tabs.Trigger>
	</Tabs.List>
	<Tabs.Content value="basics">
		<Card.Root>
			<Card.Header>
				<Card.Title class="flex items-center justify-between">
					<Skeleton class="h-5 w-24" />
					<MenuIcon />
				</Card.Title>
				<Card.Description>
					<Skeleton class="h-5 w-40" />
				</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-3">
				<div class="flex flex-col">
					<span class="text-sm text-muted-foreground">Mesocycle</span>
					<div class="flex items-center justify-between">
						<Skeleton class="text-base-skeleton" />
						<Skeleton class="badge-skeleton" />
					</div>
				</div>
				<div class="flex flex-col">
					<span class="text-sm text-muted-foreground">User bodyweight</span>
					<Skeleton class="text-base-skeleton" />
				</div>
				<div class="flex flex-col gap-1">
					<span class="text-sm text-muted-foreground">Targeted muscle groups</span>
					<div class="flex flex-wrap gap-1">
						{#each Array(4) as _}
							<Skeleton class="badge-skeleton" />
						{/each}
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	</Tabs.Content>
</Tabs.Root>
