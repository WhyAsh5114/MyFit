import type { Prisma } from '@prisma/client';

export type FullMesocycleWithExerciseSplit = Prisma.MesocycleGetPayload<{
	include: { mesocycleExerciseSplitDays: { include: { mesocycleSplitDayExercises: true } } };
}>;

type MesocycleExerciseSplitDayWithoutIds = Omit<
	Prisma.MesocycleExerciseSplitDayCreateWithoutMesocycleInput,
	'mesocycleSplitDayExercises'
>;
type MesocycleExerciseTemplateWithoutIds =
	Prisma.MesocycleExerciseTemplateCreateWithoutMesocycleExerciseSplitDayInput;

export function createMesocycleExerciseSplitRunes() {
	let mesocycleId: string | null = $state(null);
	let splitDays: MesocycleExerciseSplitDayWithoutIds[] = $state(
		Array.from({ length: 7 }).map(() => ({ name: '', isRestDay: false }))
	);
	let splitExercises: MesocycleExerciseTemplateWithoutIds[][] = $state([]);

	let selectedSplitDayIndex: number = $state(0);
	let editingExercise: MesocycleExerciseTemplateWithoutIds | undefined = $state(undefined);
	let copiedExercises: MesocycleExerciseTemplateWithoutIds[] | undefined = $state(undefined);

	if (globalThis.localStorage) {
		const savedState = localStorage.getItem('mesocycleExerciseSplitRunes');
		if (savedState) ({ splitDays, splitExercises, mesocycleId } = JSON.parse(savedState));
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

	function addExercise(exerciseTemplate: MesocycleExerciseTemplateWithoutIds) {
		if (exerciseNameExists(exerciseTemplate.name)) return false;
		splitExercises[selectedSplitDayIndex].push(exerciseTemplate);
		saveStoresToLocalStorage();
		return true;
	}

	function deleteExercise(exerciseIdx: number) {
		splitExercises[selectedSplitDayIndex].splice(exerciseIdx, 1);
		saveStoresToLocalStorage();
	}

	function setEditingExercise(exerciseTemplate: MesocycleExerciseTemplateWithoutIds | undefined) {
		editingExercise = exerciseTemplate;
	}

	function editExercise(exerciseTemplate: MesocycleExerciseTemplateWithoutIds) {
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
			'mesocycleExerciseSplitRunes',
			JSON.stringify({ splitDays, splitExercises, mesocycleId })
		);
	}

	function resetStores() {
		mesocycleId = null;
		splitDays = Array.from({ length: 7 }).map(() => ({ name: '', isRestDay: false }));
		splitExercises = [];
		selectedSplitDayIndex = 0;
		editingExercise = undefined;
		copiedExercises = undefined;
		saveStoresToLocalStorage();
	}

	function loadExerciseSplit(mesocycleWithExerciseSplit: FullMesocycleWithExerciseSplit) {
		// Same mesocycle, don't reset and load new data, reuse and continue editing
		if (mesocycleWithExerciseSplit.id === mesocycleId) return;

		resetStores();
		mesocycleId = mesocycleWithExerciseSplit.id;
		splitDays = mesocycleWithExerciseSplit.mesocycleExerciseSplitDays.map((splitDay) => {
			const { id, mesocycleId, ...rest } = splitDay;
			return rest;
		});
		splitExercises = mesocycleWithExerciseSplit.mesocycleExerciseSplitDays.map((splitDay) =>
			splitDay.mesocycleSplitDayExercises.map((exercise) => {
				const { id, mesocycleExerciseSplitDayId, ...rest } = exercise;
				return rest;
			})
		);
		saveStoresToLocalStorage();
	}

	return {
		get mesocycleId() {
			return mesocycleId;
		},
		set mesocycleId(value) {
			mesocycleId = value;
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
		addSplitDay,
		removeSplitDay,
		toggleSplitDay,
		validateSplitStructure,
		getDataLossDays,
		updateSplitExercisesStructure,
		addExercise,
		editExercise,
		deleteExercise,
		setEditingExercise,
		copyExercises,
		pasteExercises,
		cutExercises,
		swapExercises,
		saveStoresToLocalStorage,
		resetStores,
		loadExerciseSplit
	};
}

export const mesocycleExerciseSplitRunes = createMesocycleExerciseSplitRunes();
