import type { PageServerLoad } from './$types';
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

    const activeMesocycle = userData?.activeMesocycle as ActiveMesocycle | null;
    if (!activeMesocycle) {
        return {
            parentMesocycle: null
        }
    }

	return {
		parentMesocycle: userData?.mesocycles[activeMesocycle?.mesoID] as Mesocycle | null
	};
};
