<script lang="ts">
	import { page } from '$app/state';
	import { getLocalTimeZone } from '@internationalized/date';
	import { parseSelectedDay } from '#lib/features/food-diary/selected-day.js';
	import HeaderCard from './components/entries-page/header-card.svelte';
	import FoodEntries from './components/entries-page/food-entries.svelte';
	import ActivityEntries from './components/entries-page/activity-entries.svelte';
	import SyncHealthData from './components/entries-page/sync-health-data.svelte';
	import Button from '#lib/components/ui/button/button.svelte';
	import { BotMessageSquareIcon } from '@lucide/svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const timezone = getLocalTimeZone();
	const diary = $derived(data.diary);
	const selectedDay = $derived(parseSelectedDay(diary.day));
</script>

<SyncHealthData
	{selectedDay}
	userId={data.ownerId}
	activityEntries={diary.activityEntries}
	activityPreferences={diary.activityPreferences}
	macroMetrics={diary.macroMetrics}
/>

<HeaderCard
	foodEntries={diary.foodEntries}
	activityEntries={diary.activityEntries}
	{selectedDay}
	{timezone}
	macroMetrics={diary.macroMetrics}
	macroTargets={diary.macroTargets}
/>

<div class="relative flex min-h-0 w-full grow basis-0">
	<div class="size-full overflow-y-auto">
		<div class="flex h-full flex-col gap-2">
			<FoodEntries foodEntries={diary.foodEntries} meals={diary.meals} />
			<ActivityEntries activityEntries={diary.activityEntries} />
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
