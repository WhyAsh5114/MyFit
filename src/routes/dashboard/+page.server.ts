import { createContext } from '$lib/trpc/context';
import { createCaller } from '$lib/trpc/router';
import { redirect } from '@sveltejs/kit';

export const load = async (event) => {
	event.depends('workouts:all');
	const session = await event.locals.auth();

	if (session === null) {
		redirect(302, '/');
	}

	const trpc = createCaller(await createContext(event));

	return {
		todaysWorkoutData: trpc.workouts.getTodaysWorkoutData(),
		pastWorkouts: trpc.mesocycles.getWorkouts('nextSplitDay'),
		entityCounts: trpc.users.getEntityCounts()
	};
};
