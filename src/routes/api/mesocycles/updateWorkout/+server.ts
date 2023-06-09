import type { RequestHandler } from '@sveltejs/kit';
import Ajv from 'ajv';
import updateWorkoutSchema from './updateWorkoutSchema.json';
import clientPromise from '$lib/mongodb';

const ajv = new Ajv({ removeAdditional: true });
const validate = ajv.compile(updateWorkoutSchema);

export const POST: RequestHandler = async ({ request, locals }) => {
	const session = await locals.getSession();
	if (!session) {
		return new Response('Invalid session', {
			status: 403
		});
	}

	const body: APIMesocyclesUpdateWorkout = await request.json();
	const valid = validate(body);
	if (!valid) {
		return new Response('Invalid JSON format updating workout', {
			status: 400
		});
	}

	const client = await clientPromise;
	try {
		await client
			.db()
			.collection('users')
			.updateOne(
				{ email: session.user?.email },
				{
					$set: {
						[`mesocycles.${body.mesoIndex}.mesocycles.${body.workoutIndex}`]: body.splitExercises
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
