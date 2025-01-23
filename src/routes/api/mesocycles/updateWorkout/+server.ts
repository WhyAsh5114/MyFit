import type { RequestHandler } from '@sveltejs/kit';
import clientPromise from '$lib/mongodb';

export const POST: RequestHandler = async ({ request, locals }) => {
	const session = await locals.getSession();
	if (!session) {
		return new Response('Invalid session', {
			status: 403
		});
	}

	const body: APIMesocyclesUpdateWorkout = await request.json();
	const client = await clientPromise;
	try {
		await client
			.db()
			.collection('users')
			.updateOne(
				{ email: session.user?.email },
				{
					$set: {
						[`mesocycles.${body.mesoIndex}.splitExercises.${body.workoutIndex}`]: body.splitExercises
					}
				}
			);

		return new Response('Mesocycle updated successfully', {
			status: 200
		});
	} catch (e) {
		return new Response(JSON.stringify(e), {
			status: 500
		});
	}
};
