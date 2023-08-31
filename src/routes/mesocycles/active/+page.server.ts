import type { PageServerLoad } from '../performed/[performedMesoIndex]/$types';
import clientPromise from '$lib/mongodb';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.getSession();
	if (!session) {
		throw error(403, 'Not logged in');
	}

	const client = await clientPromise;
	const userData = await client
		.db()
		.collection('users')
		.findOne({ email: session.user?.email });

	if (!userData?.activeMesocycle) {
		throw error(400, 'No active mesocycle');
	}
	const activeMesocycle = userData.activeMesocycle as ActiveMesocycle;
	const parentMesocycle = userData.mesocycles[activeMesocycle.mesoID] as Mesocycle;

	return {
		activeMesocycle,
		parentMesocycle,
		workouts: userData.workouts as (Workout | null)[]
	};
};
