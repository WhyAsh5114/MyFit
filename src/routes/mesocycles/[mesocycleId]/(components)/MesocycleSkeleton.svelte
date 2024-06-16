<script lang="ts">
	import { Skeleton } from '$lib/components/ui/skeleton';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import MenuIcon from 'virtual:icons/lucide/menu';
</script>

<Tabs.Root value="basics" class="flex w-full grow flex-col">
	<Tabs.List class="flex justify-start overflow-x-auto">
		<Tabs.Trigger value="basics" class="shrink-0 basis-1/3">Basics</Tabs.Trigger>
		<Tabs.Trigger value="setChanges" class="shrink-0 basis-1/3">Set changes</Tabs.Trigger>
		<Tabs.Trigger value="overview" class="shrink-0 basis-1/3">Overview</Tabs.Trigger>
		<Tabs.Trigger value="workouts" class="shrink-0 basis-1/3">Workouts</Tabs.Trigger>
	</Tabs.List>
	<Tabs.Content value="basics">
		<Card.Root>
			<Card.Header>
				<Card.Title class="flex justify-between">
					<Skeleton class="h-5 w-32" />
					<MenuIcon />
				</Card.Title>
				<Card.Description>
					<div class="flex justify-between">
						<Skeleton class="text-base-skeleton" />
						<Skeleton class="h-5 w-16 rounded-full" />
					</div>
				</Card.Description>
			</Card.Header>
			<Card.Content class="flex flex-col gap-3">
				<div class="flex flex-col gap-1">
					<div class="flex justify-between">
						<span class="text-sm text-muted-foreground">RIR progression</span>
						<Skeleton class="h-5 w-16 rounded-full" />
					</div>
					<Skeleton class="min-h-10 w-full rounded-lg" />
				</div>
				<div class="flex flex-col">
					<span class="text-sm text-muted-foreground">Exercise split</span>
					<Skeleton class="text-base-skeleton" />
				</div>
				<div class="flex flex-col">
					<span class="text-sm text-muted-foreground">Preferred progression</span>
					<Skeleton class="text-base-skeleton" />
				</div>
				<div class="flex flex-col">
					<span class="text-sm text-muted-foreground">Preferred overload percentage</span>
					<Skeleton class="text-base-skeleton" />
				</div>
				<div class="flex flex-col gap-1">
					<span class="text-sm text-muted-foreground">Last set to failure</span>
					<Skeleton class="h-6 w-12 rounded-full" />
				</div>
        <div class="flex flex-col gap-1">
					<span class="text-sm text-muted-foreground">Force RIR matching</span>
					<Skeleton class="h-6 w-12 rounded-full" />
				</div>
			</Card.Content>
		</Card.Root>
	</Tabs.Content>
</Tabs.Root>
