import type { MesocycleExerciseTemplate, Prisma } from '@prisma/client';

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

export function createWorkoutExerciseInProgressFromMesocycleExerciseTemplate(
	exerciseTemplate: MesocycleExerciseTemplate
): WorkoutExerciseInProgress {
	const { mesocycleExerciseSplitDayId, sets, ...exercise } = exerciseTemplate;
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
