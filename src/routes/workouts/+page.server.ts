import { createContext } from '$lib/trpc/context';
import { createCaller } from '$lib/trpc/router';
import type { Workout, WorkoutOfMesocycle } from '@prisma/client';

export const load = async (event) => {
	event.depends('workouts:all');
	const trpc = createCaller(await createContext(event));

	const workouts = trpc.workouts.load({});
	return { workouts };
};

export type WorkoutWithMesoData = Workout & {
	workoutOfMesocycle:
		| (WorkoutOfMesocycle & {
				mesocycle: {
					id: string;
					name: string;
					mesocycleExerciseSplitDays: { name: string }[];
				};
		  })
		| null;
};
