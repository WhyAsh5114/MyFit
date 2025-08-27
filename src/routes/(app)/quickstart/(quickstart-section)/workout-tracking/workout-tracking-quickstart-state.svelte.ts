import type { ExerciseSplitTemplate } from '$lib/constants';

function createWorkoutTrackingQuickstartState() {
	let selectedSplitTemplate = $state<ExerciseSplitTemplate>();

	return {
		get selectedSplitTemplate() {
			return selectedSplitTemplate;
		},
		set selectedSplitTemplate(value) {
			selectedSplitTemplate = value;
		}
	};
}

export const workoutTrackingQuickstartState = createWorkoutTrackingQuickstartState();
