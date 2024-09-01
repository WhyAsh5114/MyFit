import { createContext } from '$lib/trpc/context';
import { createCaller } from '$lib/trpc/router';

export const load = async (event) => {
	event.depends('workouts:all');
	const session = await event.locals.auth();

	if (session === null) {
		return { todaysWorkoutData: null };
	}

	const trpc = createCaller(await createContext(event));
	return { todaysWorkoutData: trpc.workouts.getTodaysWorkoutData() };
};
