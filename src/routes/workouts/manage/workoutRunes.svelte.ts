import type { WorkoutInProgress } from '$lib/mesoToWorkouts';

function createWorkoutRunes() {
	let workoutData: WorkoutInProgress = $state({ userBodyweight: null, workoutExercises: [] });

	if (globalThis.localStorage) {
		const savedState = localStorage.getItem('workoutRunes');
		if (savedState) ({ workoutData } = JSON.parse(savedState));
	}

	function saveStoresToLocalStorage() {
		localStorage.setItem('workoutRunes', JSON.stringify({ workoutData }));
	}

	function resetStores() {
		workoutData = { userBodyweight: null, workoutExercises: [] };
		saveStoresToLocalStorage();
	}

	return {
		get workoutData() {
			return workoutData;
		},
		set workoutData(value) {
			workoutData = value;
		},
		saveStoresToLocalStorage,
		resetStores
	};
}

export const workoutRunes = createWorkoutRunes();
