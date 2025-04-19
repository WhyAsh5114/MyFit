import type { z } from 'zod';
import type { macroTrackingMetricsSchema } from './1-metrics/schema';
import type { QUICKSTART_MACRO_TRACKING_GOAL_OPTIONS } from '$lib/constants';

function createMacroTrackingQuickstartState() {
	let macroTrackingMetrics = $state<z.infer<typeof macroTrackingMetricsSchema>>();
	let selectedGoalOption = $state<(typeof QUICKSTART_MACRO_TRACKING_GOAL_OPTIONS)[number]>();

	return {
		get macroTrackingMetrics() {
			return macroTrackingMetrics;
		},
		set macroTrackingMetrics(value) {
			macroTrackingMetrics = value;
		},
		get selectedGoalOption() {
			return selectedGoalOption;
		},
		set selectedGoalOption(value) {
			selectedGoalOption = value;
		}
	};
}

export const macroTrackingQuickstartState = createMacroTrackingQuickstartState();
