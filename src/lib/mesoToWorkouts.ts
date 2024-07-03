import type { MesocycleExerciseTemplate, MuscleGroup, Prisma, WorkoutStatus } from '@prisma/client';

type SetInProgress = {
	reps: number | undefined;
	load: number | undefined;
	RIR: number | undefined;
	completed: boolean;
};

export type WorkoutExerciseInProgress = Omit<
	Prisma.WorkoutExerciseCreateWithoutWorkoutInput,
	'sets'
> & {
	sets: (Omit<
		Prisma.WorkoutExerciseSetCreateWithoutWorkoutExerciseInput,
		'reps' | 'load' | 'RIR' | 'miniSets'
	> &
		SetInProgress & {
			miniSets: (Omit<
				Prisma.WorkoutExerciseMiniSetsCreateWithoutParentSetInput,
				'reps' | 'load' | 'RIR'
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
		mesocycleName: string;
		splitDayName: string;
		workoutStatus?: WorkoutStatus;
		dayNumber: number;
		cycleNumber: number;
	};
};

export function createWorkoutExerciseInProgressFromMesocycleExerciseTemplate(
	exerciseTemplate: MesocycleExerciseTemplate
): WorkoutExerciseInProgress {
	const { id, mesocycleExerciseSplitDayId, sets, ...exercise } = exerciseTemplate;
	return {
		...exercise,
		sets: Array.from({ length: sets }).map(() => ({
			reps: undefined,
			load: undefined,
			RIR: undefined,
			completed: false,
			miniSets: []
		}))
	};
}
