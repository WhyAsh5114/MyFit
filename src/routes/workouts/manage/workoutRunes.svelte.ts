import type { MesocycleExerciseTemplateWithoutIdsOrIndex } from '$lib/components/mesocycleAndExerciseSplit/commonTypes';
import {
	createWorkoutExerciseInProgressFromMesocycleExerciseTemplate,
	type TodaysWorkoutData,
	type WorkoutExerciseInProgress
} from '$lib/workoutFunctions';
import type { FullWorkoutWithMesoData } from '../[workoutId]/+page.server';

function createWorkoutRunes() {
	let workoutData: TodaysWorkoutData | null = $state(null);
	let workoutExercises: WorkoutExerciseInProgress[] | null = $state(null);
	let editingWorkoutId: string | null = $state(null);

	let editingExerciseIndex: number | undefined = $state();
	let editingExercise: MesocycleExerciseTemplateWithoutIdsOrIndex | undefined = $state();

	if (globalThis.localStorage) {
		const savedState = localStorage.getItem('workoutRunes');
		if (savedState) ({ workoutData, workoutExercises } = JSON.parse(savedState));
	}

	function saveStoresToLocalStorage() {
		localStorage.setItem(
			'workoutRunes',
			JSON.stringify({ workoutData, workoutExercises, editingWorkoutId })
		);
	}

	function resetStores() {
		workoutData = null;
		workoutExercises = null;
		editingWorkoutId = null;
		saveStoresToLocalStorage();
	}

	function exerciseNameExists(exerciseName: string, exceptIndex?: number) {
		if (!workoutExercises) return;
		const exercise = workoutExercises.find(
			(ex, idx) => ex.name === exerciseName && idx !== exceptIndex
		);
		return exercise !== undefined;
	}

	function addExercise(exercise: MesocycleExerciseTemplateWithoutIdsOrIndex) {
		if (workoutExercises === null) return false;
		if (exerciseNameExists(exercise.name)) return false;
		workoutExercises.push(createWorkoutExerciseInProgressFromMesocycleExerciseTemplate(exercise));
		saveStoresToLocalStorage();
		return true;
	}

	function editExercise(exercise: MesocycleExerciseTemplateWithoutIdsOrIndex) {
		if (!editingExercise || editingExerciseIndex === undefined || workoutExercises === null)
			return false;
		if (exerciseNameExists(exercise.name, editingExerciseIndex)) return false;
		workoutExercises[editingExerciseIndex] =
			createWorkoutExerciseInProgressFromMesocycleExerciseTemplate(
				exercise,
				workoutExercises[editingExerciseIndex].sets
			);
		saveStoresToLocalStorage();
		return true;
	}

	function setEditingExercise(exercise: WorkoutExerciseInProgress | undefined) {
		if (exercise === undefined) {
			editingExercise = undefined;
		} else {
			const { sets, ...restOfTheExercise } = exercise;
			editingExerciseIndex = workoutExercises?.findIndex((ex) => ex.name === exercise.name);
			editingExercise = { ...restOfTheExercise, sets: sets.length };
		}
	}

	function deleteExercise(exerciseIdx: number) {
		if (workoutExercises === null) return;
		workoutExercises.splice(exerciseIdx, 1);
		saveStoresToLocalStorage();
	}

	function loadWorkout(workout: FullWorkoutWithMesoData) {
		editingWorkoutId = workout.id;
		workoutData = {
			startedAt: workout.startedAt,
			endedAt: workout.endedAt,
			userBodyweight: workout.userBodyweight,
			workoutExercises: []
		};
		workoutExercises = workout.workoutExercises.map((ex) => {
			const { id, workoutId, ...exercise } = ex;
			return {
				...exercise,
				sets: ex.sets.map((set) => {
					const { id, workoutExerciseId, ...rest } = set;
					return {
						...rest,
						completed: true,
						miniSets: set.miniSets.map((miniSet) => {
							const { id, workoutExerciseSetId, ...rest } = miniSet;
							return { ...rest, completed: true };
						})
					};
				})
			};
		});
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
			saveStoresToLocalStorage();
		},
		get editingExercise() {
			return editingExercise;
		},
		set editingExercise(value) {
			editingExercise = value;
		},
		get editingWorkoutId() {
			return editingWorkoutId;
		},
		set editingWorkoutId(value) {
			editingWorkoutId = value;
		},
		saveStoresToLocalStorage,
		resetStores,
		addExercise,
		setEditingExercise,
		editExercise,
		deleteExercise,
		loadWorkout
	};
}

export const workoutRunes = createWorkoutRunes();
