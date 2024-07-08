import { createContext } from '$lib/trpc/context';
import { createCaller } from '$lib/trpc/router';
import type { WorkoutExercise, WorkoutExerciseMiniSet, WorkoutExerciseSet } from '@prisma/client';
import type { WorkoutWithMesoData } from '../+page.server.js';

export const load = async (event) => {
	const trpc = createCaller(await createContext(event));
	const workout = trpc.workouts.findById(event.params.workoutId);
	return { workout };
};

export type FullWorkoutWithMesoData = WorkoutWithMesoData & {
	workoutExercises: (WorkoutExercise & {
		sets: (WorkoutExerciseSet & { miniSets: WorkoutExerciseMiniSet[] })[];
	})[];
};
