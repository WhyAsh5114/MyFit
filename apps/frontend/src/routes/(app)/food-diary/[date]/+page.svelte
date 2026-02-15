<script lang="ts">
	import { page } from '$app/state';
	import { useGetFoodByDateQuery } from '$lib/features/food-diary/food-entry/get-food-entries';
	import { getLocalTimeZone, parseDate, today } from '@internationalized/date';
	import FoodEntries from './components/entries-page/food-entries.svelte';
	import HeaderCard from './components/entries-page/header-card.svelte';

	const timezone = getLocalTimeZone();

	let selectedDay = $derived.by(() => {
		const dateParam = page.params.date;
		if (dateParam) {
			try {
				return parseDate(dateParam);
			} catch (error) {
				console.warn(`Invalid date parameter: ${dateParam}`, error);
				return today(timezone);
			}
		}
		return today(timezone);
	});

	const getFoodByDateQuery = useGetFoodByDateQuery(() => selectedDay);
</script>

<HeaderCard foodEntries={getFoodByDateQuery.data} {selectedDay} {timezone} />
<FoodEntries foodEntries={getFoodByDateQuery.data} {selectedDay} {timezone} />
