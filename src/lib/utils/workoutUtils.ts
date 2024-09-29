import type { MesocycleExerciseTemplateWithoutIdsOrIndex } from '$lib/components/mesocycleAndExerciseSplit/commonTypes';
import type { ActiveMesocycleWithProgressionData } from '$lib/trpc/routes/workouts';
import { arrayAverage, arraySum, groupBy } from '$lib/utils';
import type { Workout, WorkoutExercise } from './types';
import { type Prisma } from '@prisma/client';

export function getSetVolume(
	set: WorkoutExercise['sets'][number],
	userBodyweight: number,
	bodyweightFraction: number | null
) {
	return (set.reps + set.RIR) * set.load + (bodyweightFraction ?? 0) * userBodyweight;
}

export function getExerciseVolume(workoutExercise: WorkoutExercise, userBodyweight: number) {
	return arraySum(
		workoutExercise.sets.map((set) => getSetVolume(set, userBodyweight, workoutExercise.bodyweightFraction))
	);
}

type SetDetails = {
	reps: number;
	load: number;
	RIR: number;
};

type CommonBergerType = {
	bodyweightFraction: number | null;
	oldUserBodyweight?: number;
	newUserBodyweight?: number;
	overloadPercentage?: number;
	oldSet: SetDetails;
};

type BergerNewReps = {
	variableToSolve: 'NewReps';
	knownValues: CommonBergerType & {
		newSet: Omit<SetDetails, 'reps'> & { reps?: number };
	};
};

type BergerOverloadPercentage = {
	variableToSolve: 'OverloadPercentage';
	knownValues: CommonBergerType & {
		newSet: SetDetails;
	};
};

type BergerInput = BergerNewReps | BergerOverloadPercentage;

export function solveBergerFormula(input: BergerInput) {
	const { variableToSolve, knownValues } = input;
	const {
		oldSet,
		newSet,
		bodyweightFraction = null,
		oldUserBodyweight = 0,
		newUserBodyweight = 0,
		overloadPercentage = 0
	} = knownValues;

	const oldLoad = oldSet.load + (bodyweightFraction ?? 0) * oldUserBodyweight;
	const newLoad = newSet.load + (bodyweightFraction ?? 0) * newUserBodyweight;

	const exponentialMultiplier = Math.pow(Math.E, (131 * (oldSet.reps + oldSet.RIR)) / 5000);

	switch (variableToSolve) {
		case 'NewReps': {
			const numerator = (1 + overloadPercentage / 100) * (9745640 * oldLoad - 423641) * exponentialMultiplier;
			const denominator = 9745640 * newLoad - 423641;
			return 38.1679 * Math.log(numerator / denominator) - newSet.RIR;
		}

		case 'OverloadPercentage': {
			const numeratorMultiplier = Math.pow(Math.E, (knownValues.newSet.reps + newSet.RIR) / 38.1679);
			const numerator = numeratorMultiplier * (9745640 * newLoad - 423641);
			const denominator = exponentialMultiplier * (9745640 * oldLoad - 423641);
			return (numerator / denominator - 1) * 100;
		}
	}
}

export function getWorkoutVolume(workout: Workout) {
	return arraySum(workout.workoutExercises.map((exercise) => getExerciseVolume(exercise, workout.userBodyweight)));
}

type SetInProgress = {
	reps: number | undefined;
	load: number | undefined;
	RIR: number | undefined;
	completed: boolean;
};

type PreviousPerformance = {
	exercise: WorkoutExercise;
	oldUserBodyweight: number;
};

export type WorkoutExerciseInProgress = Omit<
	Prisma.WorkoutExerciseCreateWithoutWorkoutInput,
	'sets' | 'exerciseIndex'
> & {
	sets: (Omit<
		Prisma.WorkoutExerciseSetCreateWithoutWorkoutExerciseInput,
		'reps' | 'load' | 'RIR' | 'miniSets' | 'setIndex'
	> &
		SetInProgress & {
			miniSets: (Omit<
				Prisma.WorkoutExerciseMiniSetCreateWithoutParentSetInput,
				'reps' | 'load' | 'RIR' | 'miniSetIndex'
			> &
				SetInProgress)[];
		})[];
};

export type WorkoutExerciseWithSets = Prisma.WorkoutExerciseGetPayload<{
	include: { sets: { include: { miniSets: true } } };
}>;

export function createWorkoutExerciseInProgressFromMesocycleExerciseTemplate(
	exerciseTemplate: MesocycleExerciseTemplateWithoutIdsOrIndex,
	oldSets?: WorkoutExerciseInProgress['sets']
): WorkoutExerciseInProgress {
	const { id, sets, ...exercise } = exerciseTemplate;
	const defaultSet = {
		reps: undefined,
		load: undefined,
		RIR: undefined,
		completed: false,
		skipped: false
	};

	const newSets = oldSets ? [...oldSets] : [];
	while (newSets.length < sets) newSets.push({ ...defaultSet, miniSets: [] });

	if (exercise.setType !== 'Drop' && exercise.setType !== 'MyorepMatch') newSets.map((set) => (set.miniSets = []));

	if (!['Drop', 'Down', 'Top'].includes(exercise.setType)) {
		exercise.changeAmount = null;
		exercise.changeType = null;
	}

	return { ...exercise, sets: newSets.slice(0, sets) };
}

export function getRIRForWeek(rirArray: number[], cycle: number): number {
	let cumulativeWeeks = 0;
	for (let i = 0; i < rirArray.length; i++) {
		cumulativeWeeks += rirArray[i];
		if (cycle <= cumulativeWeeks) return rirArray.length - i - 1;
	}
	throw new Error('Cycle number is out of range.');
}

function generateAverageRepDropOffs(repsPerSetPerPerformance: number[][]) {
	const rateOfChangeSums: number[] = [];

	for (const arr of repsPerSetPerPerformance) {
		for (let i = 0; i < arr.length - 1; i++) {
			const rateOfChange = arr[i] - arr[i + 1];
			rateOfChangeSums[i] = (rateOfChangeSums[i] || 0) + rateOfChange;
		}
	}

	const averageRatesOfChange = rateOfChangeSums.map((sum) => sum / repsPerSetPerPerformance.length);
	return averageRatesOfChange;
}

function getMaxIndexes(arr: number[]) {
	return arr
		.map((value, index) => ({ value, index }))
		.sort((a, b) => b.value - a.value)
		.map((item) => item.index);
}

function addExtraSetProperties(exerciseSet: WorkoutExercise['sets'][number]) {
	const { workoutExerciseId, ...rest } = exerciseSet;
	const exerciseSetWithoutIds = {
		...rest,
		miniSets: rest.miniSets.map(({ workoutExerciseSetId, ...rest }) => rest)
	};
	return {
		...exerciseSetWithoutIds,
		completed: false,
		miniSets: exerciseSetWithoutIds.miniSets.map((miniSet) => ({
			...miniSet,
			completed: false
		}))
	};
}

function getPerformanceChanges(performances: { exercise: WorkoutExercise; oldUserBodyweight: number }[]) {
	const performanceChanges: number[] = [];
	if (performances.length < 2) return performanceChanges;
	for (let i = 0; i < performances.length - 1; i++) {
		const oldPerformance = performances[i];
		const newPerformance = performances[i + 1];

		const setPerformanceChanges: number[] = [];
		for (let j = 0; j <= setPerformanceChanges.length; j++) {
			const oldSet = oldPerformance.exercise.sets[j];
			const newSet = newPerformance.exercise.sets[j];
			if (!oldSet || !newSet) break;
			if (oldSet.skipped || newSet.skipped) break;

			setPerformanceChanges.push(
				solveBergerFormula({
					variableToSolve: 'OverloadPercentage',
					knownValues: {
						oldSet,
						newSet,
						bodyweightFraction: newPerformance.exercise.bodyweightFraction,
						newUserBodyweight: newPerformance.oldUserBodyweight,
						oldUserBodyweight: oldPerformance.oldUserBodyweight
					}
				})
			);
		}
		performanceChanges.push(arrayAverage(setPerformanceChanges));
	}
	return performanceChanges;
}

function adjustIdealPerformance(actualPerformances: number[], idealPerformance: number) {
	if (actualPerformances.length < 2) return idealPerformance;
	const weights = actualPerformances.map((_, index) => index + 1);
	const weightedSum = actualPerformances.reduce((acc, performance, index) => {
		return acc + performance * weights[index];
	}, 0);
	const totalWeight = weights.reduce((acc, weight) => acc + weight, 0);
	const weightedAverage = weightedSum / totalWeight;
	const adjustedIdealPerformance = (idealPerformance + weightedAverage) / 2;
	return adjustedIdealPerformance;
}

function getTotalCyclicSetsPerMuscleGroup(
	mesocycleExerciseSplitDays: ActiveMesocycleWithProgressionData['mesocycleExerciseSplitDays']
) {
	const cyclicSetsPerMuscleGroup: Map<string, number> = new Map();
	mesocycleExerciseSplitDays.forEach((splitDay) => {
		splitDay.mesocycleSplitDayExercises.forEach((exercise) => {
			const muscleGroup = exercise.customMuscleGroup ?? exercise.targetMuscleGroup;
			const previousSets = cyclicSetsPerMuscleGroup.get(muscleGroup) || 0;
			cyclicSetsPerMuscleGroup.set(muscleGroup, previousSets + exercise.sets);
		});
	});
	return cyclicSetsPerMuscleGroup;
}

function increaseLoadOfSets(ex: WorkoutExerciseInProgress, userBodyweight: number) {
	const needLoadIncrease = ex.sets.some((set) => {
		const reps = set.reps as number;
		return reps >= ex.repRangeEnd;
	});
	if (!needLoadIncrease) return ex.sets;

	const newSets = ex.sets.map((set) => {
		if (set.reps === undefined || set.load === undefined || set.RIR === undefined) return set;

		let newLoad = set.load;
		if ((['Straight', 'Myorep'].includes(ex.setType) && needLoadIncrease) || set.reps > ex.repRangeStart) {
			newLoad += ex.minimumWeightChange ?? 5;
		}

		const newReps = solveBergerFormula({
			variableToSolve: 'NewReps',
			knownValues: {
				oldSet: { reps: set.reps, load: set.load, RIR: set.RIR },
				newSet: { load: newLoad, RIR: set.RIR },
				bodyweightFraction: ex.bodyweightFraction ?? null,
				newUserBodyweight: userBodyweight,
				oldUserBodyweight: userBodyweight,
				overloadPercentage: 0
			}
		});
		const newSet = { ...set, reps: Math.round(newReps), load: newLoad };
		return newSet;
	});

	return newSets.map((newSet, setIdx) => {
		if (newSet.reps! < ex.repRangeStart) return ex.sets[setIdx];
		return newSet;
	});
}

export function progressiveOverloadMagic(
	mesocycleWithProgressionData: ActiveMesocycleWithProgressionData,
	cycleNumber: number,
	userBodyweight: number,
	splitDayIndex: number
) {
	const { mesocycleCyclicSetChanges, mesocycleExerciseSplitDays, workoutsOfMesocycle, ...mesocycle } =
		mesocycleWithProgressionData;

	const currentCycleRIR = getRIRForWeek(mesocycle.RIRProgression, cycleNumber);
	const todaysSplitDay = mesocycleExerciseSplitDays[splitDayIndex];
	const workoutExercises = todaysSplitDay.mesocycleSplitDayExercises.map((fullExercise) => {
		const { mesocycleExerciseSplitDayId, ...exercise } = fullExercise;
		return createWorkoutExerciseInProgressFromMesocycleExerciseTemplate(exercise);
	});

	if (workoutsOfMesocycle.length > 0) {
		workoutExercises.forEach((ex) => {
			// Progressive overload here
			const mappedPerformances = workoutsOfMesocycle.map((wm) => ({
				exercise: wm.workout.workoutExercises.find((exercise) => ex.name === exercise.name),
				oldUserBodyweight: wm.workout.userBodyweight
			}));
			const allPreviousPerformances = mappedPerformances.filter(
				(item): item is PreviousPerformance => item.exercise !== undefined
			);

			const lastPerformance = allPreviousPerformances.at(-1);
			if (!lastPerformance?.exercise) return;

			const averageDropOffs = generateAverageRepDropOffs(
				allPreviousPerformances.map(({ exercise }) => exercise.sets.map((s) => s.reps + s.RIR))
			);
			const lastDropOffs = generateAverageRepDropOffs([
				allPreviousPerformances[allPreviousPerformances.length - 1].exercise.sets.map((s) => s.reps + s.RIR)
			]);

			let dropOffDifferences = averageDropOffs.map((averageDropOff, idx) => lastDropOffs[idx] - averageDropOff);
			dropOffDifferences =
				dropOffDifferences[0] < 0
					? [Math.abs(dropOffDifferences[0]), 0, ...dropOffDifferences.slice(1)]
					: [0, ...dropOffDifferences];

			const idealTotalOverloadPercentagePerSet = ex.overloadPercentage ?? mesocycle.startOverloadPercentage;
			const performanceChanges = getPerformanceChanges(allPreviousPerformances);
			const adjustedTotalOverloadPercentagePerSet = adjustIdealPerformance(
				performanceChanges,
				idealTotalOverloadPercentagePerSet
			);
			const setPriorities = (dropOffDifferences = getMaxIndexes(dropOffDifferences));
			let remainingTotalOverload = adjustedTotalOverloadPercentagePerSet * lastPerformance.exercise.sets.length;

			for (const setIndex of setPriorities) {
				const oldSet = lastPerformance.exercise.sets[setIndex];
				if (!oldSet) continue;

				const newSet = { ...oldSet, reps: oldSet.reps + 1 };
				const overloadAchieved = solveBergerFormula({
					variableToSolve: 'OverloadPercentage',
					knownValues: {
						oldSet,
						newSet,
						oldUserBodyweight: lastPerformance.oldUserBodyweight,
						newUserBodyweight: userBodyweight,
						bodyweightFraction: ex.bodyweightFraction ?? null
					}
				});

				const previousRemainingTotalOverload = remainingTotalOverload;
				remainingTotalOverload -= overloadAchieved;

				if (Math.abs(remainingTotalOverload) < previousRemainingTotalOverload) {
					ex.sets[setIndex] = addExtraSetProperties(newSet);
				} else {
					ex.sets[setIndex] = addExtraSetProperties(oldSet);
				}
			}

			ex.sets = increaseLoadOfSets(ex, userBodyweight);
		});
	}

	// Increase sets
	if (workoutsOfMesocycle.length >= 2) {
		const exercisesGroupedByMuscleGroups = Object.entries(
			groupBy(workoutExercises, (exercise) => exercise.customMuscleGroup ?? exercise.targetMuscleGroup)
		).map(([muscleGroup, exercises]) => ({
			muscleGroup,
			exercises: exercises as WorkoutExerciseInProgress[]
		}));

		exercisesGroupedByMuscleGroups.forEach(({ muscleGroup, exercises }) => {
			const averageMuscleGroupPerformanceChanges = exercises
				.map((ex) => {
					const mappedPerformances = workoutsOfMesocycle.map((wm) => ({
						exercise: wm.workout.workoutExercises.find((exercise) => ex.name === exercise.name),
						oldUserBodyweight: wm.workout.userBodyweight
					}));
					const allPreviousPerformances = mappedPerformances.filter(
						(item): item is PreviousPerformance => item.exercise !== undefined
					);
					return arrayAverage(getPerformanceChanges(allPreviousPerformances));
				})
				.filter((n) => !isNaN(n));

			const cyclicSetsPerMuscleGroup = getTotalCyclicSetsPerMuscleGroup(mesocycleExerciseSplitDays);
			const cyclicSetChange = mesocycleCyclicSetChanges.find((setChange) => {
				if (setChange.muscleGroup === 'Custom') {
					return setChange.customMuscleGroup === muscleGroup;
				}
				return setChange.muscleGroup === muscleGroup;
			});
			if (!cyclicSetChange) return;

			const cyclicSetsForMuscleGroup = cyclicSetsPerMuscleGroup.get(muscleGroup) ?? 0;
			if (cyclicSetsForMuscleGroup >= cyclicSetChange.maxVolume) return;

			const adjustedTotalOverloadPercentage = adjustIdealPerformance(
				averageMuscleGroupPerformanceChanges,
				mesocycle.startOverloadPercentage
			);
			let setsToIncrease = 1;
			if (averageMuscleGroupPerformanceChanges.length > 0) {
				setsToIncrease = Math.floor(
					(averageMuscleGroupPerformanceChanges.at(-1)! - 0.8 * adjustedTotalOverloadPercentage) /
						(0.1 * adjustedTotalOverloadPercentage)
				);
				setsToIncrease = Math.min(setsToIncrease, cyclicSetChange.setIncreaseAmount);
			}

			console.log(muscleGroup, averageMuscleGroupPerformanceChanges);

			for (let i = 0; i < setsToIncrease; i++) {
				const exercisesSortedBySets = exercises.sort((a, b) => a.sets.length - b.sets.length);
				exercisesSortedBySets[0].sets.push({
					reps: undefined,
					load: undefined,
					RIR: undefined,
					skipped: false,
					completed: false,
					miniSets: []
				});
			}
		});
	}

	// RIR adjustment
	workoutExercises.forEach((ex) => {
		ex.sets.forEach((set, idx) => {
			const oldRIR = set.RIR ?? currentCycleRIR;
			set.RIR = currentCycleRIR;

			// Last set to failure
			if (idx === ex.sets.length - 1)
				if (typeof ex.lastSetToFailure === 'boolean') set.RIR = ex.lastSetToFailure ? 0 : set.RIR;
				else if (mesocycle.lastSetToFailure === true) set.RIR = 0;

			// Adjust reps when RIR changed
			const RIRDifference = set.RIR - oldRIR;
			if (set.reps === undefined) return;
			if (RIRDifference > 0 && !(ex.forceRIRMatching ?? mesocycle.forceRIRMatching)) return;
			if (set.reps - RIRDifference < ex.repRangeStart) {
				const maxRIR = Math.max(ex.repRangeStart - set.reps, 0);
				set.RIR = maxRIR;
				set.reps -= maxRIR - oldRIR;
				return;
			}
			set.reps -= RIRDifference;
		});
	});

	// Remove miniSet IDs and un-skip all sets
	workoutExercises.forEach((ex) => {
		ex.sets.forEach((set) => {
			set.miniSets = set.miniSets.map((miniSet) => {
				const { id, ...rest } = miniSet;
				return rest;
			});
		});
		ex.sets
			.filter((set) => set.skipped)
			.forEach((set) => {
				set.skipped = false;
				set.reps = undefined;
				set.load = undefined;
				set.RIR = currentCycleRIR;
			});
	});

	return workoutExercises;
}
