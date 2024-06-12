import {
	MuscleGroup,
	type Mesocycle,
	type MesocycleCyclicSetChanges,
	type MesocycleExerciseTemplate
} from '@prisma/client';
import type { FullExerciseSplit } from '../../exercise-splits/manage/exerciseSplitRunes.svelte';

export type MesocycleRuneType = Omit<Mesocycle, 'id' | 'userId' | 'exerciseSplitId'>;
export type MesocycleExerciseTemplateWithoutIDs = Omit<
	MesocycleExerciseTemplate,
	'mesocycleExerciseSplitDayId' | 'id'
>;
export type MesocycleCyclicSetChangesWithoutIDs = Omit<
	MesocycleCyclicSetChanges,
	'id' | 'mesocycleId'
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
	let mesocycleExerciseTemplates: MesocycleExerciseTemplateWithoutIDs[][] = $state([]);
	let mesocycleCyclicSetChanges: (MesocycleCyclicSetChangesWithoutIDs & { startVolume: number })[] =
		$state([]);
	let editingMesocycleId: number | null = $state(null);

	if (globalThis.localStorage) {
		const savedState = localStorage.getItem('mesocycleRunes');
		if (savedState) {
			({
				mesocycle,
				editingMesocycleId,
				selectedExerciseSplit,
				mesocycleExerciseTemplates,
				mesocycleCyclicSetChanges
			} = JSON.parse(savedState));
		}
	}

	function generateMesocycleExerciseTemplates() {
		if (!selectedExerciseSplit) return;
		mesocycleExerciseTemplates = selectedExerciseSplit.exerciseSplitDays.map((splitDay) => {
			return splitDay.exercises.map((exercise) => {
				const mesocycleExerciseTemplate: MesocycleExerciseTemplateWithoutIDs & { id?: number } = {
					...exercise,
					sets: 0
				};
				delete mesocycleExerciseTemplate.id;
				return mesocycleExerciseTemplate;
			});
		});
		generateMesocycleCyclicSetChanges();
	}

	function generateMesocycleCyclicSetChanges() {
		const allMuscleGroupsFromExercises = new Set(
			mesocycleExerciseTemplates.flatMap((exercises) =>
				exercises.map((exercise) =>
					exercise.targetMuscleGroup === 'Custom'
						? (exercise.customMuscleGroup as string)
						: exercise.targetMuscleGroup
				)
			)
		);
		allMuscleGroupsFromExercises.forEach((muscleGroup) => {
			const enumMuscleGroup = Object.keys(MuscleGroup).includes(muscleGroup);

			const preExistingCyclicSetChange = mesocycleCyclicSetChanges.find((setChange) => {
				if (enumMuscleGroup) return setChange.muscleGroup === muscleGroup;
				return setChange.customMuscleGroup === muscleGroup;
			});
			if (preExistingCyclicSetChange) return;

			mesocycleCyclicSetChanges.push({
				muscleGroup: enumMuscleGroup ? (muscleGroup as MuscleGroup) : 'Custom',
				customMuscleGroup: enumMuscleGroup ? null : muscleGroup,
				regardlessOfProgress: false,
				maxVolume: 30,
				setIncreaseAmount: 1,
				startVolume: 5
			});
		});
	}

	function saveStoresToLocalStorage() {
		localStorage.setItem(
			'mesocycleRunes',
			JSON.stringify({
				mesocycle,
				editingMesocycleId,
				selectedExerciseSplit,
				mesocycleExerciseTemplates,
				mesocycleCyclicSetChanges
			})
		);
	}

	return {
		get editingMesocycleId() {
			return editingMesocycleId;
		},
		set editingMesocycleId(id) {
			editingMesocycleId = id;
		},
		get selectedExerciseSplit() {
			return selectedExerciseSplit;
		},
		set selectedExerciseSplit(exerciseSplit) {
			selectedExerciseSplit = exerciseSplit;
			generateMesocycleExerciseTemplates();
			saveStoresToLocalStorage();
		},
		mesocycle,
		get mesocycleExerciseTemplates() {
			return mesocycleExerciseTemplates;
		},
		get mesocycleCyclicSetChanges() {
			return mesocycleCyclicSetChanges;
		},
		set mesocycleCyclicSetChanges(value) {
			mesocycleCyclicSetChanges = value;
		},
		saveStoresToLocalStorage
	};
}

export const mesocycleRunes = createMesocycleRunes();
