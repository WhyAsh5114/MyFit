import type { PageServerLoad } from './$types';
import clientPromise from '$lib/mongodb';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.getSession();
	if (!session) {
		return {
			parentMesocycle: null
		}
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
		parentMesocycle: userData?.mesocycles[activeMesocycle?.mesoID] as Mesocycle | null,
		workouts: userData?.workouts as (Workout | null)[]
	};
};
