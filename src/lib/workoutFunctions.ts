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

export function progressiveOverloadMagic(
	mesocycleWithProgressionData: ActiveMesocycleWithProgressionData,
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

	// Fill in reps, load, RIR from previous workouts (lastSetToFailure?)
	// Add miniSets and stuff if drop / myorep match sets
	// Match RIR according to forceRIRMatching and RIRProgression
	// Perform progressive overload according to mesocycle progression values
	// Increase sets based on cyclic set changes

	return workoutExercises;
}