import { createContext } from '$lib/trpc/context.js';
import { createCaller } from '$lib/trpc/router.js';

export const load = async (event) => {
	event.depends('workouts:start');
	const trpc = createCaller(await createContext(event));

	const repeatSkipped = event.url.searchParams.get('repeatSkipped');
	if (repeatSkipped) {
		const workoutData = trpc.workouts.getSkippedWorkoutData(Number(repeatSkipped));
		return { workoutData };
	}

	const workoutData = trpc.workouts.getTodaysWorkoutData();
	const skippedWorkouts = trpc.workouts.getSkippedWorkoutsOfCurrentCycle();
	return { workoutData, skippedWorkouts };
};
