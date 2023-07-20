import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params, parent }) => {
	const session = await locals.getSession();
	const { workouts, mesocycles } = await parent();

	if (!session) {
		throw error(403, 'Not logged in');
	} else if (parseInt(params.workoutIndex) < 0) {
		throw error(400, 'Invalid workout index');
	} else if (!workouts) {
		throw error(400, 'No workouts created');
	} else if (!mesocycles) {
		throw error(400, 'No mesocycles created');
	}

	const workout = workouts[parseInt(params.workoutIndex)] as Workout | null;
	let referenceWorkout: null | undefined | Workout = undefined;
	if (workout?.referenceWorkout) {
		referenceWorkout = workouts[workout.referenceWorkout] as Workout | null;
	}

	if (!workout) {
		throw error(404, 'Workout not found');
	}

	return {
		workout,
		workoutIndex: parseInt(params.workoutIndex),
		parentMesocycle: mesocycles[workout.mesoID] as Mesocycle | null,
		referenceWorkout
	};
};
