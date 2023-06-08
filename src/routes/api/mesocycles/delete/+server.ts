import type { RequestHandler } from '@sveltejs/kit';
import clientPromise from '$lib/mongodb';

export const POST: RequestHandler = async ({ request, locals }) => {
	const session = await locals.getSession();
	if (!session) {
		return new Response('Invalid session', {
			status: 403
		});
	}

	const { ind } = await request.json();
	const client = await clientPromise;
	try {
		await client
			.db()
			.collection('users')
			.updateOne({ email: session.user?.email }, { $set: { [`mesocycles.${ind}`]: null } });

		return new Response('Mesocycle deleted successfully', {
			status: 200
		});
	} catch (e) {
		return new Response(JSON.stringify(e), {
			status: 500
		});
	}
};
