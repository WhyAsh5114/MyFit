import type { PageServerLoad } from './$types';
import clientPromise from '$lib/mongodb';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals, params }) => {
	const session = await locals.getSession();
	if (!session) {
		throw error(403, 'Not logged in');
	}

	const performedMesoIndex = parseInt(params.performedMesoIndex);
	if (performedMesoIndex < 0) {
		throw error(400, 'Invalid mesocycle index');
	}

	const client = await clientPromise;
	const userData = await client
		.db()
		.collection('users')
		.findOne({ email: session.user?.email });

	if (!userData?.performedMesocycles[performedMesoIndex]) {
		throw error(404, 'Performed mesocycle not found');
	}
	const performedMesocycle = userData.performedMesocycles[performedMesoIndex] as PerformedMesocycle;
	const parentMesocycle = userData.mesocycles[performedMesocycle.mesoID] as Mesocycle;

	return {
		performedMesocycle,
		parentMesocycle,
		workouts: userData.workouts as (Workout | null)[]
	};
};
