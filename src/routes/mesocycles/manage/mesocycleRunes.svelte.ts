import type { Mesocycle, MesocycleExerciseTemplate } from '@prisma/client';
import type { FullExerciseSplit } from '../../exercise-splits/manage/exerciseSplitRunes.svelte';

export type MesocycleRuneType = Omit<Mesocycle, 'id' | 'userId' | 'exerciseSplitId'>;
export type MesocycleExerciseTemplateWithoutIDs = Omit<
	MesocycleExerciseTemplate,
	'mesocycleExerciseSplitDayId' | 'id'
>;

const defaultMesocycle: MesocycleRuneType = {
	name: '',
	RIRProgression: [1, 3, 3, 3],
	startDate: null,
	endDate: null,
	preferredProgressionVariable: 'Reps',
	startOverloadPercentage: 2.5,
	lastSetToFailure: true,
	forceRIRMatching: true
};

export function createMesocycleRunes() {
	let mesocycle: MesocycleRuneType = $state(structuredClone(defaultMesocycle));
	let selectedExerciseSplit: FullExerciseSplit | null = $state(null);
	let editingMesocycleId: number | null = $state(null);

	if (globalThis.localStorage) {
		const savedState = localStorage.getItem('mesocycleRunes');
		if (savedState)
			({ mesocycle, editingMesocycleId, selectedExerciseSplit } = JSON.parse(savedState));
	}

	function saveStoresToLocalStorage() {
		localStorage.setItem(
			'mesocycleRunes',
			JSON.stringify({ mesocycle, editingMesocycleId, selectedExerciseSplit })
		);
	}

	return {
		get editingMesocycleId() {
			return editingMesocycleId;
		},
		set editingMesocycleId(id: number | null) {
			editingMesocycleId = id;
		},
		get selectedExerciseSplit() {
			return selectedExerciseSplit;
		},
		set selectedExerciseSplit(exerciseSplit: FullExerciseSplit | null) {
			selectedExerciseSplit = exerciseSplit;
		},
		mesocycle,
		saveStoresToLocalStorage
	};
}

export const mesocycleRunes = createMesocycleRunes();
