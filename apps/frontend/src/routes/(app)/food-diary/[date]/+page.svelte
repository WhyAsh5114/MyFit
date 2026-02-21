<script lang="ts">
	import { page } from '$app/state';
	import { useFoodEntriesByDate } from '$lib/features/food-diary/food-entry/queries/get-by-date';
	import { getLocalTimeZone, parseDate, today } from '@internationalized/date';
	import FoodEntries from './components/entries-page/food-entries.svelte';
	import HeaderCard from './components/entries-page/header-card.svelte';
	import { useCurrentUser } from '$lib/features/user/queries/get-current-user';
	import { useActivityEntriesByDate } from '$lib/features/food-diary/acitivity-entry/queries/get-by-date';
	import { useActivityPreferences } from '$lib/features/food-diary/activity-preferences/queries/get';

	const timezone = getLocalTimeZone();
	const currentUser = useCurrentUser();

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

	const foodEntriesByDate = useFoodEntriesByDate(() => ({
		userId: currentUser.data?.id ?? '',
		date: selectedDay
	}));

	const activityPreferences = useActivityPreferences(() => currentUser.data?.id ?? '');

	const activityEntriesByDate = useActivityEntriesByDate(() => ({
		userId: currentUser.data?.id ?? '',
		date: selectedDay
	}));
</script>

<HeaderCard
	foodEntries={foodEntriesByDate.data}
	activityEntries={activityEntriesByDate.data}
	activityPreferences={activityPreferences.data}
	{selectedDay}
	{timezone}
/>
<FoodEntries
	foodEntries={foodEntriesByDate.data}
	{selectedDay}
	{timezone}
	meals={currentUser.data?.foodDiaryMeals ?? []}
/>
