import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import clientPromise from '$lib/mongodb';

export const load: PageServerLoad = async ({ locals, params }) => {
	const session = await locals.getSession();
	if (!session) {
		throw error(403, 'Not logged in');
	} else if (parseInt(params.workoutIndex) < 0) {
		throw error(400, 'Invalid workout index');
	}

	const client = await clientPromise;
	const userData = await client.db().collection('users').findOne({ email: session.user?.email });
	const workout = userData?.workouts[parseInt(params.workoutIndex)] as Workout | null;
	
	let referenceWorkout : null | undefined | Workout = undefined;
	if (workout?.referenceWorkout) {
		referenceWorkout = userData?.workouts[workout.referenceWorkout] as Workout | null;
	}

	if (!workout) {
		throw error(404, 'Workout not found');
	}

	return {
		workout,
		workoutIndex: parseInt(params.workoutIndex),
		parentMesocycle: userData?.mesocycles[workout.mesoID] as Mesocycle | null,
		referenceWorkout
	};
};
