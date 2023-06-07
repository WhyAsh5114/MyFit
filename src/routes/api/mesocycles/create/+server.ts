import type { RequestHandler } from '@sveltejs/kit';
import Ajv from 'ajv';
import MesocycleType from './Mesocycle.json';
import clientPromise from '$lib/mongodb';

const ajv = new Ajv({ removeAdditional: true });
const validate = ajv.compile(MesocycleType);

export const POST: RequestHandler = async ({ request, locals }) => {
	const session = await locals.getSession();
	if (!session) {
		return new Response('Invalid session', {
			status: 403
		});
	}

	const meso = await request.json();
	const valid = validate(meso);
	if (!valid) {
		return new Response('Invalid JSON format for mesocycle', {
			status: 400
		});
	}
	console.log(meso);

	const client = await clientPromise;
	try {
		await client
			.db()
			.collection('users')
			.updateOne({ email: session.user?.email }, { $push: { mesocycles: meso } });

		return new Response('Settings saved successfully', {
			status: 200
		});
	} catch (e) {
		return new Response(JSON.stringify(e), {
			status: 500
		});
	}
};
