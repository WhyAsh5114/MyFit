<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs';
	import * as Card from '$lib/components/ui/card';
	import { Skeleton } from '$lib/components/ui/skeleton';
</script>

<Tabs.Root value="info" class="w-full">
	<Tabs.List class="grid w-full grid-cols-2">
		<Tabs.Trigger value="info">Info</Tabs.Trigger>
		<Tabs.Trigger value="exercises">Exercises</Tabs.Trigger>
	</Tabs.List>
	<Tabs.Content value="info">
		<Card.Root>
			<Card.Header>
				<Card.Title>
					<Skeleton class="text-lg-skeleton w-32 rounded-md" />
				</Card.Title>
				<Card.Description>
					<div class="mt-1 flex flex-wrap gap-1">
						{#each Array(7) as _}
							<Skeleton class="h-[22px] w-16 rounded-full" />
						{/each}
					</div>
				</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-2">
				<Skeleton class="mb-0.5 h-5 w-28" />
				<Skeleton class="h-10 w-full" />
				<Skeleton class="h-40 w-full" />
			</Card.Content>
		</Card.Root>
	</Tabs.Content>
</Tabs.Root>
