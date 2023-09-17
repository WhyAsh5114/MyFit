import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import clientPromise from '$lib/mongodb';

const unprotectedRoutes = ['/', '/login'];

export const load: LayoutServerLoad = async (event) => {
	const session = await event.locals.getSession();

	if (!session && !unprotectedRoutes.includes(event.url.pathname)) {
		throw redirect(303, `/login?callbackURL=${event.url.pathname}`);
	}

	let userData = null;
	if (session) {
		const client = await clientPromise;
		userData = client.db().collection('users').findOne({ email: session.user?.email });
	}

	return {
		session,
		userData
	};
};
