<script lang="ts">
	import { untrack } from 'svelte';
	import { CalendarDate, getLocalTimeZone } from '@internationalized/date';
	import { useActivityEntriesByDate } from '$lib/features/food-diary/acitivity-entry/queries/get-by-date';
	import { useActivityPreferences } from '$lib/features/food-diary/activity-preferences/queries/get';
	import { useMacroMetrics } from '$lib/features/food-diary/macro-metrics/queries/get';
	import { useGetDaySteps } from '$lib/features/capacitor-health/queries/get-day-steps';
	import { calculateActivityCalories } from '$lib/domain/nutrition/activity-calories';
	import { useUpsertDynamicActivityData } from '$lib/features/food-diary/acitivity-entry/mutations/upsert-dynamic-activity-data';

	type Props = {
		selectedDay: CalendarDate;
		userId: string;
	};
	let { selectedDay, userId }: Props = $props();

	const activityPreferences = useActivityPreferences(() => userId);
	const activityEntriesByDate = useActivityEntriesByDate(() => ({ userId, date: selectedDay }));
	const macroMetrics = useMacroMetrics(() => userId);
	const daySteps = useGetDaySteps(() => selectedDay);
	const upsertDynamicActivityData = useUpsertDynamicActivityData();

	// Returns true only when step-count-based entry needs to be created or updated.
	// $derived is memoized: false===false means dependent $effects won't re-run.
	let shouldSyncDynamic = $derived.by(() => {
		const entries = activityEntriesByDate.data;
		const prefs = activityPreferences.data;
		const metrics = macroMetrics.data;
		const steps = daySteps.data;
		if (!entries || !prefs || !metrics || !steps) return false;

		if (prefs.adjustmentType !== 'Dynamic') return false;
		const sample = steps.samples.at(0);
		if (!sample) return false;

		const existing = entries.find((e) => e.systemGenerated && e.quantityUnit === 'steps');
		return existing?.quantity !== sample.value;
	});

	// Returns true only when fixed-calorie entry needs to be created or updated.
	let shouldSyncStatic = $derived.by(() => {
		const entries = activityEntriesByDate.data;
		const prefs = activityPreferences.data;
		if (!entries || !prefs) return false;

		if (prefs.adjustmentType !== 'Static') return false;
		if (!prefs.staticCalories) return false;

		const existing = entries.find((e) => e.systemGenerated && e.quantityUnit === 'day');
		return existing?.calories !== prefs.staticCalories;
	});

	// Only re-runs when shouldSyncDynamic flips true. Everything else is untracked.
	$effect(() => {
		if (!shouldSyncDynamic) return;
		untrack(() => {
			// Guard: don't mutate while any query is still in-flight.
			if (
				activityEntriesByDate.isFetching ||
				activityPreferences.isFetching ||
				macroMetrics.isFetching ||
				daySteps.isFetching
			)
				return;

			const sample = daySteps.data!.samples.at(0)!;
			const existing = activityEntriesByDate.data!.find((e) => e.systemGenerated);

			upsertDynamicActivityData.mutate({
				id: existing?.id,
				name: 'Daily steps',
				performedAt: existing?.performedAt ?? new Date(),
				calories: calculateActivityCalories({ ...macroMetrics.data!, stepCount: sample.value }),
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
		console.log('Syncing static activity data');
		untrack(() => {
			if (activityEntriesByDate.isFetching || activityPreferences.isFetching) return;

			const prefs = activityPreferences.data!;
			const existing = activityEntriesByDate.data!.find((e) => e.systemGenerated);

			upsertDynamicActivityData.mutate({
				id: existing?.id,
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
