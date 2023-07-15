import type { RequestHandler } from '@sveltejs/kit';
import Ajv from 'ajv';
import WorkoutType from '../Workout.json';
import clientPromise from '$lib/mongodb';

const ajv = new Ajv({ removeAdditional: true });
const validate = ajv.compile(WorkoutType);

export const POST: RequestHandler = async ({ request, locals }) => {
	const session = await locals.getSession();
	if (!session) {
		return new Response('Invalid session', {
			status: 403
		});
	}

	const { workout }: APIWorkoutCreate = await request.json();
	const valid = validate(workout);
	if (!valid) {
		return new Response(`Invalid JSON format for workout: ${ajv.errorsText(validate.errors)}`, {
			status: 400
		});
	}

	const client = await clientPromise;
	try {
		await client
			.db()
			.collection('users')
			.updateOne({ email: session.user?.email }, { $push: { workouts: workout } });

		return new Response('Workout created successfully', {
			status: 200
		});
	} catch (e) {
		return new Response(JSON.stringify(e), {
			status: 500
		});
	}
};
