import type { PageServerLoad } from './$types';
import clientPromise from '$lib/mongodb';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.getSession();
	if (!session) {
		return { notLoggedIn: true };
	}

	const client = await clientPromise;
	const userData = await client.db().collection('users').findOne({ email: session.user?.email });

	return {
		mesocycles: userData?.mesocycles as null | Mesocycle[],
		activeMesocycle: userData?.activeMesocycle as null | ActiveMesocycle
	};
};
