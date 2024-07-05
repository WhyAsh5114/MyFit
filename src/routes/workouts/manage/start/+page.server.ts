import { createContext } from '$lib/trpc/context.js';
import { createCaller } from '$lib/trpc/router.js';

export const load = async (event) => {
	event.depends('workouts:start');
	const trpc = createCaller(await createContext(event));
	const workoutData = trpc.workouts.getTodaysWorkoutData();
	return { workoutData };
};
