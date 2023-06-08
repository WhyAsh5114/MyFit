import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import clientPromise from '$lib/mongodb';
import type { Mesocycle } from '../../../../../types/global';

export const load: PageServerLoad = async ({ locals, params }) => {
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

	return {
		meso,
		ind: params.mesoIndex
	};
};
