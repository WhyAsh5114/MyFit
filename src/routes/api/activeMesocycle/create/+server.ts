import type { RequestHandler } from '@sveltejs/kit';
import Ajv from 'ajv';
import ActiveMesocycleType from '../ActiveMesocycle.json';
import clientPromise from '$lib/mongodb';

const ajv = new Ajv({ removeAdditional: true });
const validate = ajv.compile(ActiveMesocycleType);

export const POST: RequestHandler = async ({ request, locals }) => {
	const session = await locals.getSession();
	if (!session) {
		return new Response('Invalid session', {
			status: 403
		});
	}

	const { activeMesocycle }: APIActiveMesocycleCreate = await request.json();
	const valid = validate(activeMesocycle);
	if (!valid) {
		return new Response(`Invalid JSON format for active mesocycle: ${ajv.errorsText(validate.errors)}`, {
			status: 400
		});
	}

	const client = await clientPromise;
	try {
		await client
			.db()
			.collection('users')
			.updateOne({ email: session.user?.email }, { $set: { activeMesocycle } });

		return new Response('Mesocycle created successfully', {
			status: 200
		});
	} catch (e) {
		return new Response(JSON.stringify(e), {
			status: 500
		});
	}
};
