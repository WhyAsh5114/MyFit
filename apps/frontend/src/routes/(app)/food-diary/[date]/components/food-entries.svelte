<script lang="ts">
	import { page } from '$app/state';
	import * as Empty from '$lib/components/ui/empty/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import Spinner from '$lib/components/ui/spinner/spinner.svelte';
	import { dateFormatter } from '$lib/my-utils';
	import { useGetFoodByDateQuery } from '$lib/queries/food-diary/get-food-by-date';
	import { getLocalTimeZone, parseDate, today } from '@internationalized/date';
	import { AppleIcon } from '@lucide/svelte';

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
			<Empty.Title>Loading food entries</Empty.Title>
			<Empty.Description>
				Did you know that the average person eats around 1,000 pounds of food per year? That's a lot
				of food to keep track of!
			</Empty.Description>
		</Empty.Header>
	</Empty.Root>
{:else if getFoodByDateQuery.data.length === 0}
	<Empty.Root>
		<Empty.Header>
			<Empty.Media variant="icon">
				<AppleIcon />
			</Empty.Media>
			<Empty.Title>No food entries</Empty.Title>
			<Empty.Description>
				No food entries found for {dateFormatter.format(selectedDay.toDate(timeZone))}
			</Empty.Description>
		</Empty.Header>
	</Empty.Root>
{:else}
	{#each getFoodByDateQuery.data as foodEntry (foodEntry.id)}
		<Card.Root>
			<Card.Header>
				<Card.Title>{foodEntry.product_name}</Card.Title>
				<Card.Description>
					{foodEntry.quantity_g}g, {foodEntry.energy_kcal} kcal
				</Card.Description>
			</Card.Header>
		</Card.Root>
	{/each}
{/if}
