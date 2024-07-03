import type { TodaysWorkoutData, WorkoutExerciseInProgress } from '$lib/mesoToWorkouts';

const defaultWorkoutData: TodaysWorkoutData = {
	userBodyweight: null,
	workoutExercises: [],
	startedAt: new Date()
} as const;

function createWorkoutRunes() {
	let workoutData: TodaysWorkoutData = $state(structuredClone(defaultWorkoutData));
	let workoutExercises: WorkoutExerciseInProgress[] | null = $state(null);

	if (globalThis.localStorage) {
		const savedState = localStorage.getItem('workoutRunes');
		if (savedState) ({ workoutData, workoutExercises } = JSON.parse(savedState));
	}

	function saveStoresToLocalStorage() {
		localStorage.setItem('workoutRunes', JSON.stringify({ workoutData }));
	}

	function resetStores() {
		workoutData = structuredClone(defaultWorkoutData);
		workoutExercises = null;
		saveStoresToLocalStorage();
	}

	return {
		get workoutData() {
			return workoutData;
		},
		set workoutData(value) {
			workoutData = value;
		},
		get workoutExercises() {
			return workoutExercises;
		},
		set workoutExercises(value) {
			workoutExercises = value;
		},
		saveStoresToLocalStorage,
		resetStores
	};
}

export const workoutRunes = createWorkoutRunes();
