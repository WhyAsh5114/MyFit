import type { MesocycleExerciseTemplateWithoutIdsOrIndex } from '$lib/components/mesocycleAndExerciseSplit/commonTypes';
import type { RouterOutputs } from '$lib/trpc/router';
import type { Prisma } from '@prisma/client';

export type FullMesocycleWithExerciseSplit = Prisma.MesocycleGetPayload<{
	include: { mesocycleExerciseSplitDays: { include: { mesocycleSplitDayExercises: true } } };
}>;

type MesocycleExerciseSplitDayWithoutIds = Omit<
	Prisma.MesocycleExerciseSplitDayCreateWithoutMesocycleInput,
	'mesocycleSplitDayExercises' | 'dayIndex'
>;

export function createMesocycleExerciseSplitRunes() {
	let mesocycle: RouterOutputs['mesocycles']['findById'] = $state(null);
	let splitDays: MesocycleExerciseSplitDayWithoutIds[] = $state(
		Array.from({ length: 7 }).map(() => ({ name: '', isRestDay: false }))
	);
	let splitExercises: MesocycleExerciseTemplateWithoutIdsOrIndex[][] = $state([]);

	let selectedSplitDayIndex: number = $state(0);
	let editingExercise: MesocycleExerciseTemplateWithoutIdsOrIndex | undefined = $state(undefined);
	let copiedExercises: MesocycleExerciseTemplateWithoutIdsOrIndex[] | undefined = $state(undefined);

	if (globalThis.localStorage) {
		const savedState = localStorage.getItem('mesocycleExerciseSplitRunes');
		if (savedState) ({ splitDays, splitExercises, mesocycle } = JSON.parse(savedState));
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
		const splitDayNames = splitDays.filter((splitDay) => !splitDay.isRestDay).map((splitDay) => splitDay.name);

		return new Set(splitDayNames).size === splitDayNames.length;
	}

	function getDataLossDays() {
		const dataLossDays: number[] = [];
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
		splitExercises.length = splitDays.length;
		selectedSplitDayIndex = splitDays.findIndex((splitDay) => !splitDay.isRestDay);
		saveStoresToLocalStorage();
	}

	function exerciseNameExists(exerciseName: string, exceptIndex?: number) {
		const exercise = splitExercises[selectedSplitDayIndex].find(
			(exerciseTemplate, idx) => exerciseTemplate.name === exerciseName && idx !== exceptIndex
		);
		return exercise !== undefined;
	}

	function addExercise(exerciseTemplate: MesocycleExerciseTemplateWithoutIdsOrIndex) {
		if (exerciseNameExists(exerciseTemplate.name)) return false;
		splitExercises[selectedSplitDayIndex].push(exerciseTemplate);
		saveStoresToLocalStorage();
		return true;
	}

	function deleteExercise(exerciseIdx: number) {
		splitExercises[selectedSplitDayIndex].splice(exerciseIdx, 1);
		saveStoresToLocalStorage();
	}

	function setEditingExercise(exerciseTemplate: MesocycleExerciseTemplateWithoutIdsOrIndex | undefined) {
		editingExercise = exerciseTemplate;
	}

	function editExercise(exerciseTemplate: MesocycleExerciseTemplateWithoutIdsOrIndex) {
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
		localStorage.setItem('mesocycleExerciseSplitRunes', JSON.stringify({ splitDays, splitExercises, mesocycle }));
	}

	function resetStores() {
		mesocycle = null;
		splitDays = Array.from({ length: 7 }).map(() => ({ name: '', isRestDay: false }));
		splitExercises = [];
		selectedSplitDayIndex = 0;
		editingExercise = undefined;
		copiedExercises = undefined;
		saveStoresToLocalStorage();
	}

	function loadExerciseSplit(mesocycleWithExerciseSplit: NonNullable<RouterOutputs['mesocycles']['findById']>) {
		// Same mesocycle, don't reset and load new data, reuse and continue editing
		if (mesocycleWithExerciseSplit.id === mesocycle?.id) return;

		resetStores();
		mesocycle = structuredClone($state.snapshot(mesocycleWithExerciseSplit));
		splitDays = mesocycleWithExerciseSplit.mesocycleExerciseSplitDays.map((splitDay) => {
			const { id, mesocycleId, mesocycleSplitDayExercises, ...rest } = splitDay;
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
		get mesocycle() {
			return mesocycle;
		},
		set mesocycle(value) {
			mesocycle = value;
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
