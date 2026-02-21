<script lang="ts">
	import { untrack } from 'svelte';
	import { CalendarDate, getLocalTimeZone } from '@internationalized/date';
	import { useActivityEntriesByDate } from '$lib/features/food-diary/acitivity-entry/queries/get-by-date';
	import { useActivityPreferencesByDate } from '$lib/features/food-diary/activity-preferences/queries/get-by-date';
	import { useMacroMetricsByDate } from '$lib/features/food-diary/macro-metrics/queries/get-by-date';
	import { useGetDaySteps } from '$lib/features/capacitor-health/queries/get-day-steps';
	import { calculateActivityCalories } from '$lib/domain/nutrition/activity-calories';
	import { useUpsertDynamicActivityData } from '$lib/features/food-diary/acitivity-entry/mutations/upsert-dynamic-activity-data';

	type Props = {
		selectedDay: CalendarDate;
		userId: string;
	};
	let { selectedDay, userId }: Props = $props();

	const activityPreferences = useActivityPreferencesByDate(() => ({ userId, date: selectedDay }));
	const activityEntriesByDate = useActivityEntriesByDate(() => ({ userId, date: selectedDay }));
	const macroMetrics = useMacroMetricsByDate(() => ({ userId, date: selectedDay }));
	const daySteps = useGetDaySteps(() => selectedDay);
	const upsertDynamicActivityData = useUpsertDynamicActivityData();

	// Returns true only when step-count-based entry needs to be created or updated,
	// AND all relevant queries have settled. Incorporating isFetching here means the
	// effect will re-run when fetching completes (false→true), rather than being
	// blocked mid-flight by a guard that prevents a re-run.
	let shouldSyncDynamic = $derived.by(() => {
		if (activityEntriesByDate.isFetching || activityPreferences.isFetching || macroMetrics.isFetching || daySteps.isFetching) return false;

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

	// Returns true only when fixed-calorie entry needs to be created or updated,
	let shouldSyncStatic = $derived.by(() => {
		if (activityEntriesByDate.isFetching || activityPreferences.isFetching) return false;

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
		untrack(() => {
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
