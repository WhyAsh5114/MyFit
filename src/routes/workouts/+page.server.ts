import { createContext } from '$lib/trpc/context';
import { createCaller } from '$lib/trpc/router';
import type { Workout, WorkoutStatus } from '@prisma/client';

export const load = async (event) => {
	event.depends('workouts:all');
	const trpc = createCaller(await createContext(event));

	const workouts = trpc.workouts.load({});
	return { workouts };
};

export type WorkoutWithMesoData = Workout & {
	workoutOfMesocycle: {
		mesocycle: {
			id: string;
			name: string;
			mesocycleExerciseSplitDays: { name: string }[];
		};
		splitDayIndex: number;
		workoutStatus: WorkoutStatus | null;
	} | null;
};
