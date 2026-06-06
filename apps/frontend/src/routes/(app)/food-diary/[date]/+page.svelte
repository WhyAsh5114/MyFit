<script lang="ts">
	import { page } from '$app/state';
	import { useFoodEntriesByDate } from '$lib/features/food-diary/food-entry/queries/get-by-date';
	import { getLocalTimeZone, parseDate, today } from '@internationalized/date';
	import HeaderCard from './components/entries-page/header-card.svelte';
	import { useCurrentUser } from '$lib/features/user/queries/get-current-user';
	import { useActivityEntriesByDate } from '$lib/features/food-diary/acitivity-entry/queries/get-by-date';
	import { useMacroMetricsByDate } from '$lib/features/food-diary/macro-metrics/queries/get-by-date';
	import { useMacroTargetsByDate } from '$lib/features/food-diary/macro-targets/queries/get-by-date';
	import FoodEntries from './components/entries-page/food-entries.svelte';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import ActivityEntries from './components/entries-page/activity-entries.svelte';
	import SyncHealthData from './components/entries-page/sync-health-data.svelte';
	import { useMeals } from '$lib/features/food-diary/meals/queries/get';
	import Button from '$lib/components/ui/button/button.svelte';
	import { BotMessageSquareIcon } from '@lucide/svelte';

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

	const meals = useMeals(() => currentUser.data?.id ?? '');

	const foodEntriesByDate = useFoodEntriesByDate(() => ({
		userId: currentUser.data?.id ?? '',
		date: selectedDay
	}));

	const activityEntriesByDate = useActivityEntriesByDate(() => ({
		userId: currentUser.data?.id ?? '',
		date: selectedDay
	}));

	const macroMetrics = useMacroMetricsByDate(() => ({
		userId: currentUser.data?.id ?? '',
		date: selectedDay
	}));

	const macroTargets = useMacroTargetsByDate(() => ({
		userId: currentUser.data?.id ?? '',
		date: selectedDay
	}));
</script>

{#if currentUser.data?.id}
	<SyncHealthData
		{selectedDay}
		userId={currentUser.data?.id}
		{activityEntriesByDate}
		{macroMetrics}
	/>
{/if}

<HeaderCard
	foodEntries={foodEntriesByDate.data}
	activityEntries={activityEntriesByDate.data}
	{selectedDay}
	{timezone}
	{macroMetrics}
	{macroTargets}
/>

<div class="relative flex h-px w-full grow">
	<ScrollArea class="h-full w-full">
		<div class="flex h-full flex-col gap-2">
			<FoodEntries foodEntries={foodEntriesByDate.data} meals={meals.data} />
			<ActivityEntries activityEntries={activityEntriesByDate.data} />
		</div>
	</ScrollArea>

	<Button
		class="absolute right-2 bottom-2"
		size="icon-lg"
		href="/chat?screen=food-diary&date={page.params.date}"
	>
		<BotMessageSquareIcon class="size-6" />
	</Button>
</div>
