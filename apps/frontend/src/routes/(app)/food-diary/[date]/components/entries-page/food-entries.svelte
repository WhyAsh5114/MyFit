<script lang="ts">
	import * as Empty from '$lib/components/ui/empty/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import Spinner from '$lib/components/ui/spinner/spinner.svelte';
	import { dateFormatter } from '$lib/my-utils';
	import { CalendarDate } from '@internationalized/date';
	import { AppleIcon, PencilIcon } from '@lucide/svelte';
	import { m } from '$lib/paraglide/messages';
	import type { FoodEntry } from '@myfit/api/prisma/client';
	import Button from '$lib/components/ui/button/button.svelte';
	import { resolve } from '$app/paths';

	type Props = {
		foodEntries?: FoodEntry[];
		selectedDay: CalendarDate;
		timezone: string;
	};
	let { foodEntries, selectedDay, timezone }: Props = $props();
</script>

{#if foodEntries === undefined}
	<Empty.Root>
		<Empty.Header>
			<Empty.Media variant="icon">
				<Spinner />
			</Empty.Media>
			<Empty.Title>{m['foodDiary.loadingEntries']()}</Empty.Title>
			<Empty.Description>
				{m['foodDiary.loadingEntriesDescription']({
					date: dateFormatter.format(selectedDay.toDate(timezone))
				})}
			</Empty.Description>
		</Empty.Header>
	</Empty.Root>
{:else if foodEntries.length === 0}
	<Empty.Root>
		<Empty.Header>
			<Empty.Media variant="icon">
				<AppleIcon />
			</Empty.Media>
			<Empty.Title>{m['foodDiary.noEntries']()}</Empty.Title>
			<Empty.Description>
				{m['foodDiary.noEntriesDescription']({
					date: dateFormatter.format(selectedDay.toDate(timezone))
				})}
			</Empty.Description>
		</Empty.Header>
	</Empty.Root>
{:else}
	{#each foodEntries as foodEntry (foodEntry.id)}
		<Card.Root>
			<Card.Header>
				<Card.Title>{foodEntry.productName}</Card.Title>
				<Card.Description>
					{foodEntry.quantityG}g, {foodEntry.energyKcal} kcal
				</Card.Description>
				<Card.Action>
					<Button
						variant="ghost"
						size="icon"
						href={resolve(`/food-diary/${selectedDay.toString()}/edit/${foodEntry.id}`)}
					>
						<PencilIcon />
					</Button>
				</Card.Action>
			</Card.Header>
		</Card.Root>
	{/each}
{/if}
