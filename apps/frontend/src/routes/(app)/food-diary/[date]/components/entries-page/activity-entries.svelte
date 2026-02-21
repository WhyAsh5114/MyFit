<script lang="ts">
	import * as Item from '$lib/components/ui/item/index.js';
	import { cn } from '$lib/utils';
	import { FlameIcon, PlusIcon } from '@lucide/svelte';
	import type { ActivityEntry } from '@myfit/api/prisma/client';

	type Props = {
		activityEntries?: ActivityEntry[];
	};
	let { activityEntries }: Props = $props();
</script>

<div class="flex flex-col rounded-lg border">
	<Item.Root class={cn('rounded-none rounded-t-lg bg-card py-3')}>
		<Item.Content>
			<Item.Title class="flex w-full font-semibold">
				Activity
				<FlameIcon class="size-4" />
				<PlusIcon class="ml-auto size-4" strokeWidth={2.5} />
			</Item.Title>
		</Item.Content>
	</Item.Root>
	{#each activityEntries as entry (entry.id)}
		<Item.Root class="rounded-none border-0 border-t border-border py-3">
			<Item.Content>
				<Item.Title class="flex w-full">
					{entry.name}
					<p class="ml-auto font-normal whitespace-nowrap text-muted-foreground">
						{entry.calories} kcal
					</p>
				</Item.Title>
				<Item.Description class="flex w-full text-xs">
					{entry.quantity}
					{entry.quantityUnit}
				</Item.Description>
			</Item.Content>
		</Item.Root>
	{/each}
</div>
