import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import clientPromise from '$lib/mongodb';

export const load: LayoutServerLoad = async ({ locals }) => {
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
		throw error(400, 'No active mesocycle, start one from the Mesocycles page');
	}
	const parentMesocycleID = userData.activeMesocycle.mesoID;

	return {
		parentMesocycle: userData.mesocycles[parentMesocycleID] as Mesocycle,
		activeMesocycle: userData.activeMesocycle as ActiveMesocycle
	};
};
