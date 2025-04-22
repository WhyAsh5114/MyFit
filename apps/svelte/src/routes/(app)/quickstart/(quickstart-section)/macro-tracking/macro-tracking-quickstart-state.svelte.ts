import { client } from '$lib/idb-client';
import type { ActivityAdjustmentType } from '@prisma/client';
import type { z } from 'zod';
import type { macroTrackingMetricsSchema } from './1-metrics/schema';

function createMacroTrackingQuickstartState() {
	let macroTrackingMetrics = $state<z.infer<typeof macroTrackingMetricsSchema>>();

	let activityAdjustmentType = $state<ActivityAdjustmentType>();
	let staticActivityCalories = $state<number>();

	let selectedWeightChange = $state<number>();
	let selectedMacroTargetQuantifier = $state<'Percentage' | 'Absolute'>();
	let macroDistribution = $state<{ macro: string; value: number | undefined }[]>();

	async function saveDataToIndexedDB() {
		const user = await client.user.findFirst();

		if (!user) throw new Error('User not found, please log in again');
		if (!macroTrackingMetrics) throw new Error('Macro tracking metrics not found');
		if (!selectedMacroTargetQuantifier) throw new Error('Macro target quantifier not found');
		if (!activityAdjustmentType) throw new Error('Activity adjustment type not found');

		await client.macroMetrics.create({ data: { userId: user.id, ...macroTrackingMetrics } });
		await client.macroActivityTrackingPreferences.create({
			data: {
				userId: user.id,
				adjustmentType: activityAdjustmentType,
				staticActivityCalories: staticActivityCalories
			}
		});
		await client.macroTargets.create({
			data: {
				userId: user.id,
				quantifier: selectedMacroTargetQuantifier,
				carbs: macroDistribution?.find((v) => v.macro === 'carbs')?.value,
				proteins: macroDistribution?.find((v) => v.macro === 'protein')?.value,
				fats: macroDistribution?.find((v) => v.macro === 'fats')?.value
			}
		});
	}

	return {
		get macroTrackingMetrics() {
			return macroTrackingMetrics;
		},
		set macroTrackingMetrics(value) {
			macroTrackingMetrics = value;
		},
		get activityAdjustmentType() {
			return activityAdjustmentType;
		},
		set activityAdjustmentType(value) {
			activityAdjustmentType = value;
		},
		get staticActivityCalories() {
			return staticActivityCalories;
		},
		set staticActivityCalories(value) {
			staticActivityCalories = value;
		},
		get selectedWeightChange() {
			return selectedWeightChange;
		},
		set selectedWeightChange(value) {
			selectedWeightChange = value;
		},
		get selectedMacroTargetQuantifier() {
			return selectedMacroTargetQuantifier;
		},
		set selectedMacroTargetQuantifier(value) {
			selectedMacroTargetQuantifier = value;
		},
		get macroDistribution() {
			return macroDistribution;
		},
		set macroDistribution(value) {
			macroDistribution = value;
		},
		saveDataToIndexedDB
	};
}

export const macroTrackingQuickstartState = createMacroTrackingQuickstartState();
