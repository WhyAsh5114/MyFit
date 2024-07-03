import { createContext } from '$lib/trpc/context';
import { createCaller } from '$lib/trpc/router';
import { error } from '@sveltejs/kit';

export const load = async (event) => {
	const keepCurrent = event.url.searchParams.has('keepCurrent');
	if (keepCurrent) return { workoutExercises: [] };

	const useActiveMesocycle = event.url.searchParams.has('useActiveMesocycle');
	const userBodyweight = parseFloat(event.url.searchParams.get('userBodyweight') ?? '');
	if (isNaN(userBodyweight) || userBodyweight <= 0) error(400, 'Invalid bodyweight');

	const trpc = createCaller(await createContext(event));
	const workoutExercises = useActiveMesocycle
		? trpc.workouts.getTodaysWorkoutExercises({ userBodyweight })
		: [];
	return { workoutExercises };
};
