<script lang="ts">
	import { page } from '$app/state';
	import * as Empty from '$lib/components/ui/empty/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import Spinner from '$lib/components/ui/spinner/spinner.svelte';
	import { dateFormatter } from '$lib/my-utils';
	import { useGetFoodByDateQuery } from '$lib/features/food-diary/food-entry/get-food-entries';
	import { getLocalTimeZone, parseDate, today } from '@internationalized/date';
	import { AppleIcon } from '@lucide/svelte';
	import { m } from '$lib/paraglide/messages';

	const timeZone = getLocalTimeZone();

	let selectedDay = $derived.by(() => {
		const dateParam = page.params.date;
		if (dateParam) {
			try {
				return parseDate(dateParam);
			} catch (error) {
				console.warn(`Invalid date parameter: ${dateParam}`, error);
				return today(timeZone);
			}
		}
		return today(timeZone);
	});

	const getFoodByDateQuery = useGetFoodByDateQuery(() => selectedDay);
</script>

{#if getFoodByDateQuery.data === undefined}
	<Empty.Root>
		<Empty.Header>
			<Empty.Media variant="icon">
				<Spinner />
			</Empty.Media>
			<Empty.Title>{m['foodDiary.loadingEntries']()}</Empty.Title>
			<Empty.Description>
				{m['foodDiary.loadingEntriesDescription']({
					date: dateFormatter.format(selectedDay.toDate(timeZone))
				})}
			</Empty.Description>
		</Empty.Header>
	</Empty.Root>
{:else if getFoodByDateQuery.data.length === 0}
	<Empty.Root>
		<Empty.Header>
			<Empty.Media variant="icon">
				<AppleIcon />
			</Empty.Media>
			<Empty.Title>{m['foodDiary.noEntries']()}</Empty.Title>
			<Empty.Description>
				{m['foodDiary.noEntriesDescription']({
					date: dateFormatter.format(selectedDay.toDate(timeZone))
				})}
			</Empty.Description>
		</Empty.Header>
	</Empty.Root>
{:else}
	{#each getFoodByDateQuery.data as foodEntry (foodEntry.id)}
		<Card.Root>
			<Card.Header>
				<Card.Title>{foodEntry.productName}</Card.Title>
				<Card.Description>
					{foodEntry.quantityG}g, {foodEntry.energyKcal} kcal
				</Card.Description>
			</Card.Header>
		</Card.Root>
	{/each}
{/if}
