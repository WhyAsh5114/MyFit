import { MuscleGroup, type Prisma, type Mesocycle } from '@prisma/client';
import type { FullExerciseSplit } from '../../exercise-splits/manage/exerciseSplitRunes.svelte';

type MesocycleWithoutIds = Omit<Mesocycle, 'id' | 'exerciseSplitId' | 'userId'>;
const defaultMesocycle: MesocycleWithoutIds = {
	name: '',
	RIRProgression: [1, 3, 3, 3],
	startDate: null,
	endDate: null,
	preferredProgressionVariable: 'Reps',
	startOverloadPercentage: 2.5,
	lastSetToFailure: true,
	forceRIRMatching: true
};

export type FullMesocycleWithoutIds = MesocycleWithoutIds & {
	mesocycleCyclicSetChanges: Prisma.MesocycleCyclicSetChangeCreateWithoutMesocycleInput[];
	mesocycleExerciseSplitDays: (Prisma.MesocycleExerciseSplitDayCreateWithoutMesocycleInput & {
		mesocycleSplitDayExercises: Prisma.MesocycleExerciseTemplateCreateWithoutMesocycleExerciseSplitDayInput[];
	})[];
};

export type MesocycleCyclicSetChangeWithExtraProps =
	Prisma.MesocycleCyclicSetChangeCreateWithoutMesocycleInput & {
		startVolume: number;
		inSplit: boolean;
	};

export function createMesocycleRunes() {
	let mesocycle: MesocycleWithoutIds = $state(structuredClone(defaultMesocycle));
	let mesocycleExerciseTemplates: Prisma.MesocycleExerciseTemplateCreateWithoutMesocycleExerciseSplitDayInput[][] =
		$state([]);
	let mesocycleCyclicSetChanges: MesocycleCyclicSetChangeWithExtraProps[] = $state([]);

	let selectedExerciseSplit: FullExerciseSplit | null = $state(null);
	let minSets = $state(2);
	let editingMesocycleId: string | null = $state(null);

	if (globalThis.localStorage) {
		const savedState = localStorage.getItem('mesocycleRunes');
		if (savedState)
			({
				mesocycle,
				editingMesocycleId,
				selectedExerciseSplit,
				mesocycleExerciseTemplates,
				mesocycleCyclicSetChanges,
				minSets
			} = JSON.parse(savedState));
	}

	function resetStores() {
		mesocycle = structuredClone(defaultMesocycle);
		mesocycleExerciseTemplates = [];
		mesocycleCyclicSetChanges = [];
		selectedExerciseSplit = null;
		minSets = 2;
		editingMesocycleId = null;
		saveStoresToLocalStorage();
	}

	function generateMesocycleExerciseTemplates() {
		if (!selectedExerciseSplit) return;
		mesocycleExerciseTemplates = selectedExerciseSplit.exerciseSplitDays.map((splitDay) =>
			splitDay.exercises.map((exercise) => {
				const { id, exerciseSplitDayId, ...rest } = exercise;
				const mesocycleExerciseTemplate: Prisma.MesocycleExerciseTemplateCreateWithoutMesocycleExerciseSplitDayInput =
					{
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
			startVolume: 6,
			inSplit
		});

		saveStoresToLocalStorage();
		return true;
	}

	function isExerciseAndSetChangeMuscleSame(
		exercise: Prisma.MesocycleExerciseTemplateCreateWithoutMesocycleExerciseSplitDayInput,
		setChange: MesocycleCyclicSetChangeWithExtraProps
	) {
		return exercise.customMuscleGroup
			? exercise.customMuscleGroup === setChange.customMuscleGroup
			: exercise.targetMuscleGroup === setChange.muscleGroup;
	}

	function distributeStartVolumes() {
		mesocycleRunes.mesocycleCyclicSetChanges.forEach((setChange) => {
			const muscleGroupTargetedOnDays = getMuscleGroupTargetedOnDaysArray(setChange);
			const startVolumeDistributionAcrossDays = distributeEvenly(
				setChange.startVolume,
				muscleGroupTargetedOnDays.length
			);

			muscleGroupTargetedOnDays.forEach((dayIndex, i) => {
				const dayVolume = startVolumeDistributionAcrossDays[i];
				const targetingExercises = mesocycleRunes.mesocycleExerciseTemplates[dayIndex].filter(
					(exercise) => mesocycleRunes.isExerciseAndSetChangeMuscleSame(exercise, setChange)
				);

				const exerciseVolumeDistribution = distributeEvenlyWithMinimum(
					dayVolume,
					targetingExercises.length,
					minSets
				);
				targetingExercises.forEach((exercise, idx) => {
					exercise.sets = exerciseVolumeDistribution[idx];
				});
			});
		});
		mesocycleRunes.saveStoresToLocalStorage();

		function getTrueIndexes(boolArray: boolean[]): number[] {
			return boolArray.reduce((indexes, value, index) => {
				if (value) indexes.push(index);
				return indexes;
			}, [] as number[]);
		}

		function getMuscleGroupTargetedOnDaysArray(
			setChange: MesocycleCyclicSetChangeWithExtraProps
		): number[] {
			return getTrueIndexes(
				mesocycleRunes.mesocycleExerciseTemplates.map((exerciseTemplates) =>
					exerciseTemplates.some((exercise) =>
						mesocycleRunes.isExerciseAndSetChangeMuscleSame(exercise, setChange)
					)
				)
			);
		}

		function distributeEvenly(volume: number, n: number) {
			let distribution = Array(n).fill(0);
			const base = Math.floor(volume / n);
			const remainder = volume % n;

			for (let i = 0; i < n; i++) distribution[i] = base;
			for (let i = 0; i < remainder; i++) distribution[i] += 1;
			return distribution;
		}

		function distributeEvenlyWithMinimum(v: number, n: number, m: number) {
			const f = Math.floor(v / m);
			if (f > n) return distributeEvenly(v, n);
			const a = Array(f).fill(m);
			const r = distributeEvenly(v - m * f, f);
			for (let i = 0; i < f; i++) a[i] += r[i];
			for (let i = 0; i < n - f; i++) a.push(0);
			return a;
		}
	}

	async function loadMesocycle(mesocycleData: FullMesocycleWithoutIds, editingId?: string) {
		editingMesocycleId = editingId ?? null;
		const {
			mesocycleCyclicSetChanges: mesocycleCyclicSetChangesData,
			mesocycleExerciseSplitDays,
			...onlyMesocycleData
		} = mesocycleData;
		mesocycle = onlyMesocycleData;

		mesocycleExerciseTemplates = mesocycleExerciseSplitDays.map(
			(splitDay) => splitDay.mesocycleSplitDayExercises
		);
		mesocycleCyclicSetChanges = mesocycleCyclicSetChangesData.map((setChange) => ({
			...setChange,
			inSplit: true,
			startVolume: 5
		}));
		saveStoresToLocalStorage();
	}

	function saveStoresToLocalStorage() {
		localStorage.setItem(
			'mesocycleRunes',
			JSON.stringify({
				mesocycle,
				editingMesocycleId,
				selectedExerciseSplit,
				mesocycleExerciseTemplates,
				mesocycleCyclicSetChanges,
				minSets
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
		get minSets() {
			return minSets;
		},
		set minSets(value) {
			minSets = value;
		},
		get selectedExerciseSplit() {
			return selectedExerciseSplit;
		},
		set selectedExerciseSplit(exerciseSplit) {
			selectedExerciseSplit = exerciseSplit;
			generateMesocycleExerciseTemplates();
			saveStoresToLocalStorage();
		},
		get mesocycle() {
			return mesocycle;
		},
		set mesocycle(value) {
			mesocycle = value;
		},
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
		distributeStartVolumes,
		loadMesocycle,
		resetStores,
		saveStoresToLocalStorage
	};
}

export const mesocycleRunes = createMesocycleRunes();
