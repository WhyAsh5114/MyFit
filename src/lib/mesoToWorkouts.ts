import type { Mesocycle, MuscleGroup, Prisma, WorkoutStatus } from '@prisma/client';
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
		'reps' | 'load' | 'RIR' | 'miniSets'
	> &
		SetInProgress & {
			miniSets: (Omit<
				Prisma.WorkoutExerciseMiniSetCreateWithoutParentSetInput,
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
		mesocycle: Mesocycle;
		splitDayName: string;
		workoutStatus?: WorkoutStatus;
		dayNumber: number;
		cycleNumber: number;
	};
};

export function createWorkoutExerciseInProgressFromMesocycleExerciseTemplate(
	exerciseTemplate: MesocycleExerciseTemplateWithoutIdsOrIndex
): WorkoutExerciseInProgress {
	const { id, sets, ...exercise } = exerciseTemplate;
	return {
		...exercise,
		sets: Array.from({ length: sets }).map((_, idx) => ({
			reps: undefined,
			load: undefined,
			RIR: undefined,
			completed: false,
			miniSets: [],
			setIndex: idx
		}))
	};
}
