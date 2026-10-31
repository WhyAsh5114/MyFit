<script lang="ts">
	import { untrack } from 'svelte';
	import { CalendarDate, getLocalTimeZone } from '@internationalized/date';
	import type { Row } from '@myfit/shared/client';
	import { useGetDaySteps } from '#lib/features/capacitor-health/queries/get-day-steps.js';
	import { calculateActivityCalories } from '#lib/domain/nutrition/activity-calories.js';
	import { useUpsertDynamicActivityData } from '#lib/features/food-diary/acitivity-entry/mutations/upsert-dynamic-activity-data.js';

	type Props = {
		selectedDay: CalendarDate;
		userId: string;
		activityEntries: Row<'ActivityEntry'>[];
		activityPreferences: Row<'ActivityPreferences'> | null;
		macroMetrics: Row<'MacroMetrics'> | null;
	};
	let { selectedDay, userId, activityEntries, activityPreferences, macroMetrics }: Props = $props();

	const daySteps = useGetDaySteps(() => selectedDay);
	const upsertDynamicActivityData = useUpsertDynamicActivityData();

	// Returns true only when the step-count-based entry needs to be created or updated, and the
	// day's steps have been read. The rows come from the page's load, which hands over a whole
	// day at once, so only the steps can be mid-flight.
	let shouldSyncDynamic = $derived.by(() => {
		if (daySteps.isFetching) return false;

		const prefs = activityPreferences;
		const metrics = macroMetrics;
		const steps = daySteps.data;
		if (!prefs || !metrics || !steps) return false;

		if (prefs.adjustmentType !== 'Dynamic') return false;
		const sample = steps.samples.at(0);
		if (!sample) return false;

		const existing = activityEntries.find((e) => e.systemGenerated && e.quantityUnit === 'steps');
		return existing?.quantity !== sample.value;
	});

	// Returns true only when the fixed-calorie entry needs to be created or updated.
	let shouldSyncStatic = $derived.by(() => {
		const prefs = activityPreferences;
		if (!prefs) return false;

		if (prefs.adjustmentType !== 'Static') return false;
		if (!prefs.staticCalories) return false;

		const existing = activityEntries.find((e) => e.systemGenerated && e.quantityUnit === 'day');
		return existing?.calories !== prefs.staticCalories;
	});

	// Only re-runs when shouldSyncDynamic flips true. Everything else is untracked.
	$effect(() => {
		if (!shouldSyncDynamic) return;
		untrack(() => {
			const sample = daySteps.data!.samples.at(0)!;
			const existing = activityEntries.find((e) => e.systemGenerated);

			upsertDynamicActivityData.mutate({
				date: selectedDay,
				name: 'Daily steps',
				performedAt: existing?.performedAt ?? selectedDay.toDate(getLocalTimeZone()),
				calories: calculateActivityCalories({ ...macroMetrics!, stepCount: sample.value }),
				quantity: sample.value,
				quantityUnit: 'steps',
				systemGenerated: true,
				userId
			});
		});
	});

	// Only re-runs when shouldSyncStatic flips true. Everything else is untracked.
	$effect(() => {
		if (!shouldSyncStatic) return;
		untrack(() => {
			const prefs = activityPreferences!;
			const existing = activityEntries.find((e) => e.systemGenerated);

			upsertDynamicActivityData.mutate({
				date: selectedDay,
				name: 'Daily fixed activity',
				performedAt: existing?.performedAt ?? selectedDay.toDate(getLocalTimeZone()),
				calories: prefs.staticCalories!,
				quantity: 1,
				quantityUnit: 'day',
				systemGenerated: true,
				userId
			});
		});
	});
</script>
