import type {
	ExerciseSplit as ExerciseSplitModel,
	ExerciseSplitDay as ExerciseSplitDayModel,
	ExerciseTemplate as ExerciseTemplateModel
} from '@prisma/client';

export type ExerciseSplit = Omit<ExerciseSplitModel, 'id' | 'userId'>;
export type ExerciseSplitDay = Omit<ExerciseSplitDayModel, 'id' | 'exerciseSplitId'>;
export type ExerciseTemplate = Omit<ExerciseTemplateModel, 'id' | 'exerciseSplitDayId'>;

export function createExerciseSplitRunes() {
	let splitName = $state('');
	let splitDays: ExerciseSplitDay[] = $state(
		Array.from({ length: 7 }).map(() => ({ name: '', isRestDay: false }))
	);
	let splitExercises: ExerciseTemplate[][] = $state([]);

	let selectedSplitDayName: string = $state('');
	let selectedSplitDayIndex: number = $derived(
		splitDays.findIndex((splitDay) => splitDay.name === selectedSplitDayName)
	);
	let editingExercise: ExerciseTemplate | undefined = $state(undefined);
	let copiedExercises: ExerciseTemplate[] | undefined = $state(undefined);

	if (globalThis.localStorage) {
		const savedState = localStorage.getItem('exerciseSplitRunes');
		if (savedState) ({ splitName, splitDays, splitExercises } = JSON.parse(savedState));
	}

	function addSplitDay() {
		splitDays.push({ name: '', isRestDay: false });
	}

	function removeSplitDay() {
		splitDays.pop();
	}

	function toggleSplitDay(idx: number, markAsRest: boolean) {
		if (!markAsRest) splitDays[idx].isRestDay = false;
		else {
			splitDays[idx].isRestDay = true;
			splitDays[idx].name = '';
		}
	}

	function validateSplitStructure() {
		const splitDayNames = splitDays
			.filter((splitDay) => !splitDay.isRestDay)
			.map((splitDay) => splitDay.name);

		return new Set(splitDayNames).size === splitDayNames.length;
	}

	function getDataLossDays() {
		let dataLossDays: number[] = [];
		for (let i = 0; i < splitExercises.length; i++) {
			if (splitDays[i] === undefined && splitExercises[i].length > 0) dataLossDays.push(i);
			if (splitDays[i].isRestDay && splitExercises[i].length > 0) dataLossDays.push(i);
		}
		return dataLossDays;
	}

	function updateSplitExercisesStructure() {
		for (let i = 0; i < splitDays.length; i++) {
			if (splitDays[i].isRestDay || splitExercises[i] === undefined) splitExercises[i] = [];
		}
		selectedSplitDayName = splitDays.find((splitDay) => !splitDay.isRestDay)?.name as string;
		saveStoresToLocalStorage();
	}

	function exerciseNameExists(exerciseName: string, exceptIndex?: number) {
		const splitDayIndex = splitDays.findIndex((splitDay) => splitDay.name === selectedSplitDayName);
		const exercise = splitExercises[splitDayIndex].find(
			(exerciseTemplate, idx) => exerciseTemplate.name === exerciseName && idx !== exceptIndex
		);
		return exercise !== undefined;
	}

	function addExercise(exerciseTemplate: ExerciseTemplate) {
		if (exerciseNameExists(exerciseTemplate.name)) return false;
		splitExercises[selectedSplitDayIndex].push(exerciseTemplate);
		saveStoresToLocalStorage();
		return true;
	}

	function deleteExercise(exerciseIdx: number) {
		splitExercises[selectedSplitDayIndex].splice(exerciseIdx, 1);
		saveStoresToLocalStorage();
	}

	function editExercise(exerciseTemplate: ExerciseTemplate) {
		if (!editingExercise) return false;
		const editingExerciseIndex = splitExercises[selectedSplitDayIndex].indexOf(editingExercise);
		if (exerciseNameExists(exerciseTemplate.name, editingExerciseIndex)) return false;
		splitExercises[selectedSplitDayIndex][editingExerciseIndex] = exerciseTemplate;
		saveStoresToLocalStorage();
		return true;
	}

	function copyExercises() {
		copiedExercises = structuredClone($state.snapshot(splitExercises[selectedSplitDayIndex]));
	}

	function pasteExercises() {
		if (!copiedExercises || splitExercises[selectedSplitDayIndex].length > 0) return;
		splitExercises[selectedSplitDayIndex] = copiedExercises;
	}

	function cutExercises() {
		copyExercises();
		splitExercises[selectedSplitDayIndex] = [];
	}

	function saveStoresToLocalStorage() {
		localStorage.setItem(
			'exerciseSplitRunes',
			JSON.stringify({ splitName, splitDays, splitExercises })
		);
	}

	return {
		get splitName() {
			return splitName;
		},
		set splitName(name: string) {
			splitName = name;
		},
		get splitDays() {
			return splitDays;
		},
		get splitExercises() {
			return splitExercises;
		},
		get editingExercise(): ExerciseTemplate | undefined {
			return editingExercise;
		},
		set editingExercise(exerciseTemplate: ExerciseTemplate | undefined) {
			editingExercise = exerciseTemplate;
		},
		get selectedSplitDayName() {
			return selectedSplitDayName;
		},
		set selectedSplitDayName(splitDayName: string) {
			selectedSplitDayName = splitDayName;
		},
		get selectedSplitDayIndex() {
			return selectedSplitDayIndex;
		},
		addSplitDay,
		removeSplitDay,
		toggleSplitDay,
		validateSplitStructure,
		getDataLossDays,
		updateSplitExercisesStructure,
		addExercise,
		editExercise,
		deleteExercise,
		copyExercises,
		pasteExercises,
		cutExercises,
		saveStoresToLocalStorage
	};
}

export const exerciseSplitRunes = createExerciseSplitRunes();
