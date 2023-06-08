import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import clientPromise from '$lib/mongodb';
import type { Mesocycle } from '$lib/global';

export const load: PageServerLoad = async ({ locals, params }) => {
	const workoutIndex = parseInt(params.workoutIndex);

	const session = await locals.getSession();
	if (!session) {
		throw error(403, 'Not logged in');
	}

	const client = await clientPromise;
	const userData = await client.db().collection('users').findOne({ email: session.user?.email });
	const meso = userData?.mesocycles[params.mesoIndex] as Mesocycle | null;

	if (!meso) {
		throw error(404, 'Mesocycle not found');
	}

	if (!meso.splitSchedule[workoutIndex]) {
		throw error(400, 'Invalid workout index, should be between 0 (Mon) and 6 (Sun)');
	}

	return {
		splitSchedule: meso.splitSchedule,
		splitExercises: meso.splitExercises[workoutIndex],
		workoutIndex
	};
};
