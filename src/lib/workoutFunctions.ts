import {
	WorkoutStatus,
	type Mesocycle,
	type MuscleGroup,
	type Prisma,
	type WorkoutExercise,
	type WorkoutExerciseMiniSet,
	type WorkoutExerciseSet
} from '@prisma/client';
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

export type WorkoutExerciseWithSets = WorkoutExercise & {
	sets: (WorkoutExerciseSet & { miniSets: WorkoutExerciseMiniSet[] })[];
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
	endedAt?: Date | string;
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

	const newSets = oldSets ? [...oldSets] : [];
	while (newSets.length < sets) newSets.push({ ...defaultSet, miniSets: [] });

	if (exercise.setType !== 'Drop' && exercise.setType !== 'MyorepMatch')
		newSets.map((set) => (set.miniSets = []));

	if (!['Drop', 'Down', 'Top'].includes(exercise.setType)) {
		exercise.changeAmount = null;
		exercise.changeType = null;
	}

	return { ...exercise, sets: newSets.slice(0, sets) };
}

function getRIRForWeek(rirArray: number[], cycle: number): number {
	let cumulativeWeeks = 0;
	for (let i = 0; i < rirArray.length; i++) {
		cumulativeWeeks += rirArray[i];
		if (cycle <= cumulativeWeeks) return rirArray.length - i - 1;
	}
	throw new Error('Cycle number is out of range.');
}

export function progressiveOverloadMagic(
	mesocycleWithProgressionData: ActiveMesocycleWithProgressionData,
	cycleNumber: number,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	userBodyweight: number | null
) {
	const {
		mesocycleCyclicSetChanges,
		mesocycleExerciseSplitDays,
		workoutsOfMesocycle,
		...mesocycle
	} = mesocycleWithProgressionData;

	const todaysSplitDay = mesocycleExerciseSplitDays[0];
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

	const previousWorkout = workoutsOfMesocycle
		.filter((wm) => wm.workoutStatus === null)
		.at(-1)?.workout;
	const previousWorkoutData = previousWorkout
		? {
				exercises: previousWorkout.workoutExercises,
				userBodyweight: previousWorkout.userBodyweight
			}
		: null;

	return {
		todaysWorkoutExercises: workoutExercises,
		previousWorkoutData
	};
}
