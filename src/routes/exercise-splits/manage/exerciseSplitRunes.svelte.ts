import type { Prisma } from '@prisma/client';

export type FullExerciseSplit = Prisma.ExerciseSplitGetPayload<{
	include: { exerciseSplitDays: { include: { exercises: true } } };
}>;

export type FullExerciseSplitWithoutIDs = Omit<
	Prisma.ExerciseSplitCreateWithoutUserInput,
	'exerciseSplitDays'
> & {
	exerciseSplitDays: (Omit<Prisma.ExerciseSplitDayCreateWithoutExerciseSplitInput, 'exercises'> & {
		exercises: Prisma.ExerciseTemplateCreateWithoutExerciseSplitDayInput[];
	})[];
};

type ExerciseSplitDayWithoutIDs = Prisma.ExerciseSplitDayCreateWithoutExerciseSplitInput;
type ExerciseTemplateWithoutIDs = Prisma.ExerciseTemplateCreateWithoutExerciseSplitDayInput;

export function createExerciseSplitRunes() {
	let splitName = $state('');
	let splitDays: ExerciseSplitDayWithoutIDs[] = $state(
		Array.from({ length: 7 }).map(() => ({ name: '', isRestDay: false }))
	);
	let splitExercises: ExerciseTemplateWithoutIDs[][] = $state([]);
	let editingExerciseSplitId: string | null = $state(null);

	let selectedSplitDayIndex: number = $state(0);
	let editingExercise: ExerciseTemplateWithoutIDs | undefined = $state(undefined);
	let copiedExercises: ExerciseTemplateWithoutIDs[] | undefined = $state(undefined);

	if (globalThis.localStorage) {
		const savedState = localStorage.getItem('exerciseSplitRunes');
		if (savedState)
			({ splitName, splitDays, splitExercises, editingExerciseSplitId } = JSON.parse(savedState));
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
			if (splitDays[i] === undefined && splitExercises[i].length === 0) continue;
			if (splitDays[i] === undefined && splitExercises[i].length > 0) dataLossDays.push(i);
			else if (splitDays[i].isRestDay && splitExercises[i].length > 0) dataLossDays.push(i);
		}
		return dataLossDays;
	}

	function updateSplitExercisesStructure() {
		for (let i = 0; i < splitDays.length; i++) {
			if (splitDays[i].isRestDay || splitExercises[i] === undefined) splitExercises[i] = [];
		}
		for (let i = splitDays.length; i < splitExercises.length; i++) splitExercises.pop();
		selectedSplitDayIndex = splitDays.findIndex((splitDay) => !splitDay.isRestDay);
		saveStoresToLocalStorage();
	}

	function exerciseNameExists(exerciseName: string, exceptIndex?: number) {
		const exercise = splitExercises[selectedSplitDayIndex].find(
			(exerciseTemplate, idx) => exerciseTemplate.name === exerciseName && idx !== exceptIndex
		);
		return exercise !== undefined;
	}

	function addExercise(exerciseTemplate: ExerciseTemplateWithoutIDs) {
		if (exerciseNameExists(exerciseTemplate.name)) return false;
		splitExercises[selectedSplitDayIndex].push(exerciseTemplate);
		saveStoresToLocalStorage();
		return true;
	}

	function deleteExercise(exerciseIdx: number) {
		splitExercises[selectedSplitDayIndex].splice(exerciseIdx, 1);
		saveStoresToLocalStorage();
	}

	function editExercise(exerciseTemplate: ExerciseTemplateWithoutIDs) {
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
		splitExercises[selectedSplitDayIndex] = structuredClone($state.snapshot(copiedExercises));
		saveStoresToLocalStorage();
	}

	function cutExercises() {
		copyExercises();
		splitExercises[selectedSplitDayIndex] = [];
		saveStoresToLocalStorage();
	}

	function swapExercises(swapFromIndex: number) {
		[splitExercises[selectedSplitDayIndex], splitExercises[swapFromIndex]] = [
			splitExercises[swapFromIndex],
			splitExercises[selectedSplitDayIndex]
		];
		saveStoresToLocalStorage();
	}

	function saveStoresToLocalStorage() {
		localStorage.setItem(
			'exerciseSplitRunes',
			JSON.stringify({ splitName, splitDays, splitExercises, editingExerciseSplitId })
		);
	}

	function resetStores() {
		editingExerciseSplitId = null;
		splitName = '';
		splitDays = Array.from({ length: 7 }).map(() => ({ name: '', isRestDay: false }));
		splitExercises = [];
		selectedSplitDayIndex = 0;
		editingExercise = undefined;
		copiedExercises = undefined;
		saveStoresToLocalStorage();
	}

	function loadExerciseSplit(exerciseSplit: FullExerciseSplitWithoutIDs, editingId?: string) {
		editingExerciseSplitId = editingId ?? null;
		splitName = exerciseSplit.name;
		splitDays = exerciseSplit.exerciseSplitDays.map((splitDay) => ({
			name: splitDay.name,
			isRestDay: splitDay.isRestDay
		}));
		splitExercises = exerciseSplit.exerciseSplitDays.map((splitDay) => splitDay.exercises);
		selectedSplitDayIndex = 0;
		editingExercise = undefined;
		copiedExercises = undefined;
		saveStoresToLocalStorage();
	}

	return {
		get splitName() {
			return splitName;
		},
		set splitName(name) {
			splitName = name;
		},
		get splitDays() {
			return splitDays;
		},
		get splitExercises() {
			return splitExercises;
		},
		get editingExercise() {
			return editingExercise;
		},
		set editingExercise(exerciseTemplate) {
			editingExercise = exerciseTemplate;
		},
		get selectedSplitDayIndex() {
			return selectedSplitDayIndex;
		},
		set selectedSplitDayIndex(idx) {
			selectedSplitDayIndex = idx;
		},
		get copiedExercises() {
			return copiedExercises;
		},
		get editingExerciseSplitId() {
			return editingExerciseSplitId;
		},
		set editingExerciseSplitId(id) {
			editingExerciseSplitId = id;
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
		swapExercises,
		saveStoresToLocalStorage,
		resetStores,
		loadExerciseSplit
	};
}

export const exerciseSplitRunes = createExerciseSplitRunes();
