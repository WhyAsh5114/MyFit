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
export type MesocycleCyclicSetChangesWithStartVolume = MesocycleCyclicSetChangesWithoutIDs & {
	startVolume: number;
	inSplit: boolean;
};

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
	let mesocycleExerciseTemplates: MesocycleExerciseTemplateWithoutIDs[][] = $state([]);
	let mesocycleCyclicSetChanges: MesocycleCyclicSetChangesWithStartVolume[] = $state([]);

	let selectedExerciseSplit: FullExerciseSplit | null = $state(null);
	let editingMesocycleId: number | null = $state(null);

	if (globalThis.localStorage) {
		const savedState = localStorage.getItem('mesocycleRunes');
		if (savedState)
			({
				mesocycle,
				editingMesocycleId,
				selectedExerciseSplit,
				mesocycleExerciseTemplates,
				mesocycleCyclicSetChanges
			} = JSON.parse(savedState));
	}

	function generateMesocycleExerciseTemplates() {
		if (!selectedExerciseSplit) return;
		mesocycleExerciseTemplates = selectedExerciseSplit.exerciseSplitDays.map((splitDay) =>
			splitDay.exercises.map((exercise) => {
				const { id, ...rest } = exercise;
				const mesocycleExerciseTemplate: MesocycleExerciseTemplateWithoutIDs = {
					...rest,
					sets: 0
				};
				return mesocycleExerciseTemplate;
			})
		);
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
		allMuscleGroupsFromExercises.forEach((muscleGroup) =>
			addMuscleGroupToCyclicSetChanges(muscleGroup, true)
		);
	}

	function isEnumMuscleGroup(muscleGroup: string): muscleGroup is MuscleGroup {
		return Object.values(MuscleGroup).includes(muscleGroup as MuscleGroup);
	}

	function muscleGroupExistsInSetChanges(muscleGroup: string) {
		return mesocycleCyclicSetChanges.some((setChange) =>
			isEnumMuscleGroup(muscleGroup)
				? setChange.muscleGroup === muscleGroup
				: setChange.customMuscleGroup === muscleGroup
		);
	}

	function addMuscleGroupToCyclicSetChanges(muscleGroup: string, inSplit: boolean) {
		if (muscleGroupExistsInSetChanges(muscleGroup)) return false;

		mesocycleCyclicSetChanges.push({
			muscleGroup: isEnumMuscleGroup(muscleGroup) ? muscleGroup : 'Custom',
			customMuscleGroup: isEnumMuscleGroup(muscleGroup) ? null : muscleGroup,
			regardlessOfProgress: false,
			maxVolume: 30,
			setIncreaseAmount: 1,
			startVolume: 5,
			inSplit
		});

		saveStoresToLocalStorage();
		return true;
	}

	function isExerciseAndSetChangeMuscleSame(
		exercise: MesocycleExerciseTemplateWithoutIDs,
		setChange: MesocycleCyclicSetChangesWithoutIDs
	) {
		return exercise.customMuscleGroup
			? exercise.customMuscleGroup === setChange.customMuscleGroup
			: exercise.targetMuscleGroup === setChange.muscleGroup;
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
		set mesocycleExerciseTemplates(value) {
			mesocycleExerciseTemplates = value;
			saveStoresToLocalStorage();
		},
		get mesocycleCyclicSetChanges() {
			return mesocycleCyclicSetChanges;
		},
		set mesocycleCyclicSetChanges(value) {
			mesocycleCyclicSetChanges = value;
			saveStoresToLocalStorage();
		},
		isExerciseAndSetChangeMuscleSame,
		addMuscleGroupToCyclicSetChanges,
		saveStoresToLocalStorage
	};
}

export const mesocycleRunes = createMesocycleRunes();
