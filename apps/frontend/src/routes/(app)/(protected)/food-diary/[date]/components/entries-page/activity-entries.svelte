<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import * as Item from '#lib/components/ui/item/index.js';
	import { cn } from '#lib/utils.js';
	import { formatNumber } from '#lib/format.js';
	import { m } from '#lib/paraglide/messages.js';
	import { FlameIcon, PlusIcon } from '@lucide/svelte';
	import type { Row } from '@myfit/shared/client';

	type Props = {
		activityEntries?: Row<'ActivityEntry'>[];
	};
	let { activityEntries }: Props = $props();

	type Entry = Row<'ActivityEntry'>;

	let burned = $derived((activityEntries ?? []).reduce((sum, entry) => sum + entry.calories, 0));

	// An entry the app generates keeps an English name in the database, so it reads the same on
	// every device; the diary names it in the app's language by its unit instead.
	function entryName(entry: Entry) {
		if (!entry.systemGenerated) return entry.name;
		if (entry.quantityUnit === 'steps') return m['foodDiary.activity.dailySteps']();
		if (entry.quantityUnit === 'day') return m['foodDiary.activity.dailyFixed']();
		return entry.name;
	}

	function entryAmount(entry: Entry) {
		const count = formatNumber(entry.quantity);
		if (entry.quantityUnit === 'steps') return m['foodDiary.activity.steps']({ count });
		if (entry.quantityUnit === 'day') return m['foodDiary.activity.days']({ count });
		return `${count} ${entry.quantityUnit}`;
	}
</script>

<div class="flex flex-col rounded-lg border">
	<Item.Root
		class={cn('rounded-none rounded-t-lg bg-card py-3', {
			'rounded-b-lg': activityEntries?.length === 0
		})}
	>
		{#snippet child({ props })}
			<a href={resolve(`food-diary/${page.params.date}/add-activity`)} {...props}>
				<Item.Content>
					<Item.Title class="flex w-full font-semibold">
						{m['foodDiary.activityTitle']()}
						<FlameIcon class="size-4" />
						<PlusIcon class="ml-auto size-4" strokeWidth={2.5} />
					</Item.Title>
					{#if activityEntries?.length}
						<!-- The day's total burned, where a meal shows what it adds up to. -->
						<Item.Description class="flex w-full text-xs text-muted-foreground tabular-nums">
							<p class="ml-auto">{formatNumber(burned)}{m['foodDiary.kcalUnit']()}</p>
						</Item.Description>
					{/if}
				</Item.Content>
			</a>
		{/snippet}
	</Item.Root>
	{#each activityEntries as entry (entry.id)}
		<Item.Root class="rounded-none border-0 border-t border-border py-3">
			<Item.Content>
				<Item.Title class="flex w-full">
					{entryName(entry)}
					<p class="ml-auto font-normal whitespace-nowrap text-muted-foreground tabular-nums">
						<!-- The header's total carries the unit. -->
						{formatNumber(entry.calories)}
					</p>
				</Item.Title>
				<Item.Description class="flex w-full text-xs tabular-nums">
					{entryAmount(entry)}
				</Item.Description>
			</Item.Content>
		</Item.Root>
	{/each}
</div>
