import { WorkoutStatus, type Mesocycle, type MuscleGroup, type Prisma } from '@prisma/client';
import type { MesocycleExerciseTemplateWithoutIdsOrIndex } from './components/mesocycleAndExerciseSplit/commonTypes';

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
		splitDayName: string;
		workoutStatus?: WorkoutStatus;
		dayNumber: number;
		cycleNumber: number;
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
		miniSets: [],
		skipped: false
	};

	const newSets = oldSets ? [...oldSets] : [];
	while (newSets.length < sets) {
		newSets.push({ ...defaultSet });
	}

	return { ...exercise, sets: newSets.slice(0, sets) };
}
