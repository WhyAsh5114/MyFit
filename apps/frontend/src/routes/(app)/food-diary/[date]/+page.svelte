<script lang="ts">
	import { page } from '$app/state';
	import { useFoodEntriesByDate } from '$lib/features/food-diary/food-entry/queries/get-by-date';
	import { getLocalTimeZone, parseDate, today } from '@internationalized/date';
	import HeaderCard from './components/entries-page/header-card.svelte';
	import { useCurrentUser } from '$lib/features/user/queries/get-current-user';
	import { useActivityEntriesByDate } from '$lib/features/food-diary/acitivity-entry/queries/get-by-date';
	import FoodEntries from './components/entries-page/food-entries.svelte';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import ActivityEntries from './components/entries-page/activity-entries.svelte';
	import SyncHealthData from './components/entries-page/sync-health-data.svelte';

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

	const activityEntriesByDate = useActivityEntriesByDate(() => ({
		userId: currentUser.data?.id ?? '',
		date: selectedDay
	}));
</script>

{#if currentUser.data?.id}
	<SyncHealthData {selectedDay} userId={currentUser.data?.id} />
{/if}

<HeaderCard
	foodEntries={foodEntriesByDate.data}
	activityEntries={activityEntriesByDate.data}
	{selectedDay}
	{timezone}
/>
<ScrollArea class="flex h-px grow">
	<div class="flex h-full flex-col gap-2">
		<FoodEntries
			foodEntries={foodEntriesByDate.data}
			meals={currentUser.data?.foodDiaryMeals ?? []}
		/>
		<ActivityEntries activityEntries={activityEntriesByDate.data} />
	</div>
</ScrollArea>
