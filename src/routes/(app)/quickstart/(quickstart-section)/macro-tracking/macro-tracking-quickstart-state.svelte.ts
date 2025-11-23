import { client } from '$lib/idb-client';
import type { MacroTrackingMetricsSchema } from '$routes/(app)/food-diary/goals/metrics/_components/metrics-form-schema';
import type { ActivityAdjustmentType } from '$lib/generated/prisma/client';

class MacroTrackingQuickstartState {
	macroTrackingMetrics = $state<MacroTrackingMetricsSchema>();
	activityAdjustmentType = $state<ActivityAdjustmentType>();
	staticActivityCalories = $state<number>();
	selectedWeightChange = $state<number>();
	selectedMacroTargetQuantifier = $state<'Percentage' | 'Absolute'>();
	carbs = $state<number | null>(null);
	fats = $state<number | null>(null);
	proteins = $state<number | null>(null);

	async saveDataToIndexedDB() {
		const user = await client.user.findFirst();

		if (!user) throw new Error('User not found, please log in again');
		if (!this.macroTrackingMetrics) throw new Error('Macro tracking metrics not found');
		if (!this.selectedMacroTargetQuantifier) throw new Error('Macro target quantifier not found');
		if (!this.activityAdjustmentType) throw new Error('Activity adjustment type not found');
		if (this.selectedWeightChange === undefined)
			throw new Error('Selected weight change not found');

		await client.macroMetrics.create({ data: { userId: user.id, ...this.macroTrackingMetrics } });
		await client.macroActivityTrackingPreferences.create({
			data: {
				userId: user.id,
				adjustmentType: this.activityAdjustmentType,
				staticActivityCalories: this.staticActivityCalories
			}
		});
		await client.macroTargets.create({
			data: {
				userId: user.id,
				quantifier: this.selectedMacroTargetQuantifier,
				carbs: this.carbs,
				proteins: this.proteins,
				fats: this.fats,
				caloricChange: this.selectedWeightChange * 7700
			}
		});
	}
}

export const macroTrackingQuickstartState = new MacroTrackingQuickstartState();
