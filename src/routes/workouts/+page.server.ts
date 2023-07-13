import type { PageServerLoad } from './$types';
import clientPromise from '$lib/mongodb';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.getSession();
	if (!session) {
		throw error(403, 'Not logged in');
	}

	const client = await clientPromise;
	const userData = await client.db().collection('users').findOne({ email: session.user?.email });

	return {
		mesocycles: userData?.mesocycles as (Mesocycle | null)[] | null,
		activeMesocycle: userData?.activeMesocycle as ActiveMesocycle | null
	};
};
