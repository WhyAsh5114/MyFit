import type {
	ExerciseSplit as ExerciseSplitModel,
	ExerciseSplitDay as ExerciseSplitDayModel,
	ExerciseTemplate as ExerciseTemplateModel
} from '@prisma/client';

export type ExerciseSplit = Omit<ExerciseSplitModel, 'id' | 'userId'>;
export type ExerciseSplitDay = Omit<ExerciseSplitDayModel, 'id' | 'exerciseSplitId'>;
export type ExerciseTemplate = Omit<ExerciseTemplateModel, 'id' | 'exerciseSplitDayId'>;

export function createExerciseSplit() {
	let splitName = $state('');
	let splitDays: ExerciseSplitDay[] = $state(
		Array.from({ length: 7 }).map(() => ({ name: '', isRestDay: false }))
	);
	let splitExercises: ExerciseTemplate[][] = $state([]);

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
		saveStoresToLocalStorage();
		return true;
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
		addSplitDay,
		removeSplitDay,
		toggleSplitDay,
		validateSplitStructure,
		getDataLossDays,
		updateSplitExercisesStructure,
		saveStoresToLocalStorage
	};
}

export const exerciseSplit = createExerciseSplit();
