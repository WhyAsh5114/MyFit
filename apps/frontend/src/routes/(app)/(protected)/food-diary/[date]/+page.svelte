<script lang="ts">
	import { page } from '$app/state';
	import { getLocalTimeZone } from '@internationalized/date';
	import { parseSelectedDay } from '#lib/features/food-diary/_common/selected-day.js';
	import HeaderCard from './components/entries-page/header-card.svelte';
	import FoodEntries from './components/entries-page/food-entries.svelte';
	import ActivityEntries from './components/entries-page/activity-entries.svelte';
	import SyncHealthData from './components/entries-page/sync-health-data.svelte';
	import Button from '#lib/components/ui/button/button.svelte';
	import { BotMessageSquareIcon } from '@lucide/svelte';
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
	macroMetrics={data.macroMetrics}
/>

<HeaderCard
	foodEntries={data.foodEntries}
	activityEntries={data.activityEntries}
	{selectedDay}
	{timezone}
	macroMetrics={data.macroMetrics}
	macroTargets={data.macroTargets}
/>

<div class="relative flex min-h-0 w-full grow basis-0">
	<div class="size-full overflow-y-auto">
		<div class="flex h-full flex-col gap-2">
			<FoodEntries foodEntries={data.foodEntries} meals={data.meals} />
			<ActivityEntries activityEntries={data.activityEntries} />
		</div>
	</div>

	<Button
		class="absolute right-2 bottom-2"
		size="icon-lg"
		href="/chat?screen=food-diary&date={page.params.date}"
	>
		<BotMessageSquareIcon class="size-6" />
	</Button>
</div>
