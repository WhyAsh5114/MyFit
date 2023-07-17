import type { RequestHandler } from '@sveltejs/kit';
import clientPromise from '$lib/mongodb';

export const POST: RequestHandler = async ({ locals }) => {
	const session = await locals.getSession();
	if (!session) {
		return new Response('Invalid session', {
			status: 403
		});
	}

	const client = await clientPromise;
	try {
		const userData = await client.db().collection('users').findOne({ email: session.user?.email });
		if (userData?.activeMesocycle?.workouts.length > 0) {
			const activeMesocycle: ActiveMesocycle = userData?.activeMesocycle;
			const performedMesocycle: PerformedMesocycle = {
				...activeMesocycle,
				endDate: +new Date()
			};
			await client
				.db()
				.collection('users')
				.updateOne({ email: session.user?.email }, { $push: { performedMesocycles: performedMesocycle } });
		}

		await client
			.db()
			.collection('users')
			.updateOne({ email: session.user?.email }, { $set: { activeMesocycle: null } });

		return new Response('Active mesocycle deleted successfully', {
			status: 200
		});
	} catch (e) {
		return new Response(JSON.stringify(e), {
			status: 500
		});
	}
};
