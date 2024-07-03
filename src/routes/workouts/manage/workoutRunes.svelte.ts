import type { TodaysWorkoutData, WorkoutExerciseInProgress } from '$lib/mesoToWorkouts';

function createWorkoutRunes() {
	let workoutData: TodaysWorkoutData | null = $state(null);
	let workoutExercises: WorkoutExerciseInProgress[] | null = $state(null);

	if (globalThis.localStorage) {
		const savedState = localStorage.getItem('workoutRunes');
		if (savedState) ({ workoutData, workoutExercises } = JSON.parse(savedState));
	}

	function saveStoresToLocalStorage() {
		localStorage.setItem('workoutRunes', JSON.stringify({ workoutData, workoutExercises }));
	}

	function resetStores() {
		workoutData = null;
		workoutExercises = null;
		saveStoresToLocalStorage();
	}

	function setEditingExercise(exercise: WorkoutExerciseInProgress) {
		// TODO
	}

	function deleteExercise(idx: number) {
		// TODO
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
		resetStores,
		setEditingExercise,
		deleteExercise
	};
}

export const workoutRunes = createWorkoutRunes();
