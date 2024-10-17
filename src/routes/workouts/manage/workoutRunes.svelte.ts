import type { MesocycleExerciseTemplateWithoutIdsOrIndex } from '$lib/components/mesocycleAndExerciseSplit/commonTypes';
import type { Prisma } from '@prisma/client';
import type { FullWorkoutWithMesoData } from '../[workoutId]/+page.server';
import type { RouterOutputs } from '$lib/trpc/router';
import {
	type WorkoutExerciseInProgress,
	createWorkoutExerciseInProgressFromMesocycleExerciseTemplate
} from '$lib/utils/workoutUtils';

export type PreviousWorkoutData =
	RouterOutputs['workouts']['getWorkoutExercisesWithPreviousData']['previousWorkoutData'];

function createWorkoutRunes() {
	let workoutData: RouterOutputs['workouts']['getTodaysWorkoutData'] | null = $state(null);
	let workoutExercises: WorkoutExerciseInProgress[] | null = $state(null);
	let editingWorkoutId: string | null = $state(null);
	let previousWorkoutData: PreviousWorkoutData = $state(null);

	let editingExerciseIndex: number | undefined = $state();
	let editingExercise: MesocycleExerciseTemplateWithoutIdsOrIndex | undefined = $state();

	let exerciseHistorySheetOpen = $state(false);
	let exerciseHistorySheetName: string | undefined = $state();

	if (globalThis.localStorage) {
		const savedState = localStorage.getItem('workoutRunes');
		if (savedState) ({ workoutData, workoutExercises, previousWorkoutData } = JSON.parse(savedState));
	}

	function saveStoresToLocalStorage() {
		localStorage.setItem(
			'workoutRunes',
			JSON.stringify({ workoutData, workoutExercises, editingWorkoutId, previousWorkoutData })
		);
	}

	function resetStores() {
		workoutData = null;
		workoutExercises = null;
		editingWorkoutId = null;
		previousWorkoutData = null;
		saveStoresToLocalStorage();
	}

	function exerciseNameExists(exerciseName: string, exceptIndex?: number) {
		if (!workoutExercises) return;
		const exercise = workoutExercises.find((ex, idx) => ex.name === exerciseName && idx !== exceptIndex);
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
		if (!editingExercise || editingExerciseIndex === undefined || workoutExercises === null) return false;
		if (exerciseNameExists(exercise.name, editingExerciseIndex)) return false;
		workoutExercises[editingExerciseIndex] = createWorkoutExerciseInProgressFromMesocycleExerciseTemplate(
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

	function openExerciseHistorySheet(exerciseName: string) {
		exerciseHistorySheetName = exerciseName;
		exerciseHistorySheetOpen = true;
	}

	function copyExerciseSetNumbersFromHistory(
		exerciseFromHistory: Prisma.WorkoutExerciseGetPayload<{
			include: { sets: { include: { miniSets: true } } };
		}>
	) {
		const exerciseToEdit = workoutExercises?.find((ex) => ex.name === exerciseHistorySheetName);
		if (!exerciseToEdit) return;

		for (let i = 0; i < exerciseToEdit.sets.length; i++) {
			if (!exerciseFromHistory.sets[i]) break;
			const { workoutExerciseId, ...historySet } = exerciseFromHistory.sets[i];
			exerciseToEdit.sets[i] = {
				...historySet,
				completed: false,
				miniSets: historySet.miniSets.map((miniSet) => {
					const { id, workoutExerciseSetId, ...restOfTheMiniSet } = miniSet;
					return { ...restOfTheMiniSet, completed: false };
				})
			};
		}

		exerciseHistorySheetOpen = false;
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
		get previousWorkoutData() {
			return previousWorkoutData;
		},
		set previousWorkoutData(value) {
			previousWorkoutData = value;
			saveStoresToLocalStorage();
		},
		get exerciseHistorySheetName() {
			return exerciseHistorySheetName;
		},
		set exerciseHistorySheetName(value) {
			exerciseHistorySheetName = value;
		},
		get exerciseHistorySheetOpen() {
			return exerciseHistorySheetOpen;
		},
		set exerciseHistorySheetOpen(value) {
			exerciseHistorySheetOpen = value;
		},
		saveStoresToLocalStorage,
		resetStores,
		addExercise,
		setEditingExercise,
		editExercise,
		deleteExercise,
		loadWorkout,
		openExerciseHistorySheet,
		copyExerciseSetNumbersFromHistory
	};
}

export const workoutRunes = createWorkoutRunes();
