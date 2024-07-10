import { createContext } from '$lib/trpc/context';
import { createCaller } from '$lib/trpc/router';
import type {
	Mesocycle,
	Workout,
	WorkoutExercise,
	WorkoutExerciseMiniSet,
	WorkoutExerciseSet,
	WorkoutOfMesocycle
} from '@prisma/client';

export const load = async (event) => {
	const trpc = createCaller(await createContext(event));
	const workout = trpc.workouts.findById(event.params.workoutId);
	return { workout };
};

export type FullWorkoutWithMesoData = Workout & {
	workoutOfMesocycle:
		| (WorkoutOfMesocycle & {
				mesocycle: Mesocycle & {
					mesocycleExerciseSplitDays: { name: string }[];
				};
		  })
		| null;
	workoutExercises: (WorkoutExercise & {
		sets: (WorkoutExerciseSet & { miniSets: WorkoutExerciseMiniSet[] })[];
	})[];
};
