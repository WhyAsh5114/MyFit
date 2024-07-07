import { WorkoutStatus, type Mesocycle, type MuscleGroup, type Prisma } from '@prisma/client';
import type { MesocycleExerciseTemplateWithoutIdsOrIndex } from './components/mesocycleAndExerciseSplit/commonTypes';

export type ActiveMesocycleWithProgressionData = Prisma.MesocycleGetPayload<{
	include: {
		mesocycleExerciseSplitDays: { include: { mesocycleSplitDayExercises: true } };
		mesocycleCyclicSetChanges: true;
		workoutsOfMesocycle: {
			include: {
				workout: {
					include: {
						workoutExercises: { include: { sets: { include: { miniSets: true } } } };
					};
				};
			};
		};
	};
}>;

type SetInProgress = {
	reps: number | undefined;
	load: number | undefined;
	RIR: number | undefined;
	completed: boolean;
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

export type TodaysWorkoutData = Omit<
	Prisma.WorkoutCreateWithoutUserInput,
	'userBodyweight' | 'workoutExercises' | 'workoutOfMesocycle' | 'endedAt'
> & {
	userBodyweight: number | null;
	workoutExercises: {
		name: string;
		targetMuscleGroup: MuscleGroup;
		customMuscleGroup: string | null;
	}[];
	workoutOfMesocycle?: {
		mesocycle: Mesocycle;
		workoutStatus?: WorkoutStatus;
		splitDayIndex: number;
		cycleNumber: number;
		splitDayName: string;
	};
};

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

	let newSets = oldSets ? [...oldSets] : [];
	while (newSets.length < sets) newSets.push({ ...defaultSet, miniSets: [] });

	if (exercise.setType !== 'Drop' && exercise.setType !== 'MyorepMatch')
		newSets.map((set) => (set.miniSets = []));

	if (!['Drop', 'Down', 'Top'].includes(exercise.setType)) {
		exercise.changeAmount = null;
		exercise.changeType = null;
	}

	return { ...exercise, sets: newSets.slice(0, sets) };
}

function linearRegression(values: number[]) {
	const n = values.length;
	if (n < 2) throw new Error('At least two values are required to perform linear regression.');

	const x = Array.from({ length: n }, (_, i) => i + 1);
	const sumX = x.reduce((a, b) => a + b, 0);
	const sumY = values.reduce((a, b) => a + b, 0);
	const sumXY = x.reduce((sum, xi, i) => sum + xi * values[i], 0);
	const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

	const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
	const intercept = (sumY - slope * sumX) / n;

	return { slope, intercept };
}

function predictNextValue(values: number[], desiredRate: number, blendFactor = 0.5): number {
	const { slope: actualRate } = linearRegression(values);
	const blendedRate = actualRate * (1 - blendFactor) + desiredRate * blendFactor;
	const lastValue = values[values.length - 1];
	const nextValue = lastValue * (1 + blendedRate);

	return nextValue;
}

function getRIRForWeek(rirArray: number[], cycle: number): number {
	let cumulativeWeeks = 0;
	for (let i = 0; i < rirArray.length; i++) {
		cumulativeWeeks += rirArray[i];
		if (cycle <= cumulativeWeeks) return rirArray.length - i - 1;
	}
	throw new Error('Cycle number is out of range.');
}

function setRIROfExercise(
	exercise: WorkoutExerciseInProgress,
	cycleNumber: number,
	mesocycle: Mesocycle
) {
	const currentCycleRIR = getRIRForWeek(mesocycle.RIRProgression, cycleNumber);
	exercise.sets.forEach((set, idx) => {
		const oldRIR = set.RIR;
		set.RIR = currentCycleRIR;
		if (idx === exercise.sets.length - 1) {
			if (typeof exercise.lastSetToFailure === 'boolean') {
				set.RIR = exercise.lastSetToFailure ? 0 : set.RIR;
			} else if (mesocycle.lastSetToFailure === true) {
				set.RIR = 0;
			}
		}
		if (set.reps !== undefined && oldRIR !== undefined) {
			if (oldRIR < currentCycleRIR) {
			}
		}
	});
}

export function progressiveOverloadMagic(
	mesocycleWithProgressionData: ActiveMesocycleWithProgressionData,
	cycleNumber: number,
	userBodyweight: number | null
): WorkoutExerciseInProgress[] {
	const {
		mesocycleCyclicSetChanges,
		mesocycleExerciseSplitDays,
		workoutsOfMesocycle,
		...mesocycle
	} = mesocycleWithProgressionData;

	const todaysSplitDay =
		mesocycleExerciseSplitDays[workoutsOfMesocycle.length % mesocycleExerciseSplitDays.length];
	const workoutExercises = todaysSplitDay.mesocycleSplitDayExercises.map((fullExercise) => {
		const { mesocycleExerciseSplitDayId, ...exercise } = fullExercise;
		return createWorkoutExerciseInProgressFromMesocycleExerciseTemplate(exercise);
	});

	// Fill in reps, load, RIR from previous workouts
	// Also do progressive overload here
	if (workoutsOfMesocycle.length === 0) {
		const currentCycleRIR = getRIRForWeek(mesocycle.RIRProgression, cycleNumber);
		workoutExercises.forEach((ex) => {
			ex.sets.forEach((set, idx) => {
				set.RIR = currentCycleRIR;
				if (idx === ex.sets.length - 1)
					if (typeof ex.lastSetToFailure === 'boolean') set.RIR = ex.lastSetToFailure ? 0 : set.RIR;
					else if (mesocycle.lastSetToFailure === true) set.RIR = 0;
			});
		});
	} else if (workoutsOfMesocycle.length === 1) {
		// Just fill in repLoadRIR using meso's overload rate
	} else if (workoutsOfMesocycle.length > 1) {
		// Perform regression
	}

	// Add miniSets and stuff if drop / myorep match sets

	// Adjust RIR and reps according to forceRIRMatching and RIRProgression (lastSetToFailure?)

	// Increase sets based on cyclic set changes

	// Consider all progression overrides

	return workoutExercises;
}
