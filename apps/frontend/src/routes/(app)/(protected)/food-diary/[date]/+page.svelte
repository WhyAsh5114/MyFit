<script lang="ts">
	import { getLocalTimeZone } from '@internationalized/date';
	import { ScrollArea } from '#lib/components/ui/scroll-area/index.js';
	import { parseSelectedDay } from '#lib/features/food-diary/_common/selected-day.js';
	import HeaderCard from './components/entries-page/header-card.svelte';
	import DaySummary from './components/entries-page/day-summary.svelte';
	import FoodEntries from './components/entries-page/food-entries.svelte';
	import ActivityEntries from './components/entries-page/activity-entries.svelte';
	import SyncHealthData from './components/entries-page/sync-health-data.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const timezone = getLocalTimeZone();
	const selectedDay = $derived(parseSelectedDay(data.day));
</script>

<SyncHealthData
	{selectedDay}
	userId={data.ownerId}
	activityEntries={data.activityEntries}
	activityPreferences={data.activityPreferences}
	fixedActivity={data.fixedActivity}
	macroMetrics={data.macroMetrics}
/>

<HeaderCard {selectedDay} {timezone} />

<ScrollArea type="scroll" class="min-h-0 w-full grow basis-0">
	<div class="flex flex-col gap-4">
		<DaySummary
			foodEntries={data.foodEntries}
			activityEntries={data.activityEntries}
			{selectedDay}
			macroMetrics={data.macroMetrics}
			macroTargets={data.macroTargets}
		/>
		<div class="flex flex-col gap-2">
			<FoodEntries foodEntries={data.foodEntries} meals={data.meals} />
			<ActivityEntries activityEntries={data.activityEntries} />
		</div>
	</div>
</ScrollArea>
