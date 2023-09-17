import type { PageServerLoad } from './$types';
import clientPromise from '$lib/mongodb';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.getSession();
	if (!session) {
		return { loggedIn: false, mesocycles: null, activeMesocycle: null };
	}

	const client = await clientPromise;
	const userData = await client.db().collection('users').findOne({ email: session.user?.email });

	return {
		loggedIn: true,
		mesocycles: userData?.mesocycles as undefined | Mesocycle[],
		activeMesocycle: userData?.activeMesocycle as undefined | ActiveMesocycle
	};
};
