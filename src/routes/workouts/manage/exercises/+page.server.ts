import { createContext } from '$lib/trpc/context';
import { createCaller } from '$lib/trpc/router';
import { error } from '@sveltejs/kit';

export const load = async (event) => {
	const useActiveMesocycle = event.url.searchParams.has('useActiveMesocycle');
	if (!useActiveMesocycle) return { workoutExercises: [] };

	const keepCurrent = event.url.searchParams.has('keepCurrent');
	if (keepCurrent) return { workoutExercises: [] };

	const userBodyweight = parseFloat(event.url.searchParams.get('userBodyweight') ?? '');
	if (isNaN(userBodyweight) || userBodyweight <= 0) error(400, 'Invalid bodyweight');

	const splitDayIndex = parseInt(event.url.searchParams.get('splitDayIndex') ?? '');
	if (isNaN(splitDayIndex) || splitDayIndex < 0) error(400, 'Invalid split day index');

	const trpc = createCaller(await createContext(event));
	const workoutExercises = trpc.workouts.getTodaysWorkoutExercises({
		userBodyweight,
		splitDayIndex
	});
	return { workoutExercises };
};
