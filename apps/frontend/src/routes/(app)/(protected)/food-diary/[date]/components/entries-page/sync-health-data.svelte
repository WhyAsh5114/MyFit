<script lang="ts">
	import { untrack } from 'svelte';
	import { CalendarDate, getLocalTimeZone, today } from '@internationalized/date';
	import type { Row } from '@myfit/shared/client';
	import { useStepsByDate } from '#lib/features/capacitor-health/queries/get-steps-by-date.js';
	import { calculateActivityCalories } from '#lib/domain/nutrition/activity-calories.js';
	import { useSaveDynamicActivityData } from '#lib/features/food-diary/activity-entry/mutations/save-dynamic-activity-data.js';

	type Props = {
		selectedDay: CalendarDate;
		userId: string;
		activityEntries: Row<'ActivityEntry'>[];
		activityPreferences: Row<'ActivityPreferences'> | null;
		macroMetrics: Row<'MacroMetrics'> | null;
		/** The day's fixed-amount entry, worked out by the page's load and not saved yet. */
		fixedActivity: Row<'ActivityEntry'> | null;
	};
	let {
		selectedDay,
		userId,
		activityEntries,
		activityPreferences,
		macroMetrics,
		fixedActivity
	}: Props = $props();

	const daySteps = useStepsByDate(() => selectedDay);
	const saveDynamicActivityData = useSaveDynamicActivityData();

	// Returns true only when the step-count-based entry needs to be created or updated, and the
	// day's steps have been read. The rows come from the page's load, which hands over a whole
	// day at once, so only the steps can be mid-flight.
	let shouldSyncDynamic = $derived.by(() => {
		if (daySteps.isFetching) return false;
		// A day that hasn't started gets no entry: the preferences may change before it does.
		if (selectedDay.compare(today(getLocalTimeZone())) > 0) return false;

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

	// Only re-runs when shouldSyncDynamic flips true. Everything else is untracked.
	$effect(() => {
		if (!shouldSyncDynamic) return;
		untrack(() => {
			const sample = daySteps.data?.samples.at(0);
			if (!sample || !macroMetrics) return;
			const existing = activityEntries.find((e) => e.systemGenerated);

			saveDynamicActivityData.mutate({
				date: selectedDay,
				// Stored in English; the diary names generated entries by their unit, translated.
				name: 'Daily steps',
				performedAt: existing?.performedAt ?? selectedDay.toDate(getLocalTimeZone()),
				calories: calculateActivityCalories({ ...macroMetrics, stepCount: sample.value }),
				quantity: sample.value,
				quantityUnit: 'steps',
				systemGenerated: true,
				userId
			});
		});
	});

	// The page already shows the fixed amount; this saves it.
	$effect(() => {
		if (!fixedActivity) return;
		// The mutation sets the id itself.
		const { name, performedAt, calories, quantity, quantityUnit } = fixedActivity;
		untrack(() =>
			saveDynamicActivityData.mutate({
				date: selectedDay,
				name,
				performedAt,
				calories,
				quantity,
				quantityUnit,
				systemGenerated: true,
				userId
			})
		);
	});
</script>
