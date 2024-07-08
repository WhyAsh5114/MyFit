import { createContext } from '$lib/trpc/context';
import { createCaller } from '$lib/trpc/router';

export const load = async (event) => {
	const trpc = createCaller(await createContext(event));
	const workout = trpc.workouts.findById(event.params.workoutId);
	return { workout };
};
