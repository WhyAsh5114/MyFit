import type { Mesocycle } from '@prisma/client';

export type MesocycleRuneType = Omit<Mesocycle, 'id' | 'userId' | 'exerciseSplitId'>;

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
	let editingMesocycleId: number | null = $state(null);

	if (globalThis.localStorage) {
		const savedState = localStorage.getItem('mesocycleRunes');
		if (savedState) ({ mesocycle, editingMesocycleId } = JSON.parse(savedState));
	}

	function saveStoresToLocalStorage() {
		localStorage.setItem('mesocycleRunes', JSON.stringify({ mesocycle, editingMesocycleId }));
	}

	return {
		get editingMesocycleId() {
			return editingMesocycleId;
		},
		set editingMesocycleId(id: number | null) {
			editingMesocycleId = id;
		},
		mesocycle,
		saveStoresToLocalStorage
	};
}

export const mesocycleRunes = createMesocycleRunes();
