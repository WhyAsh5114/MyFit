import type { RequestHandler } from '@sveltejs/kit';
import Ajv from 'ajv';
import MesocycleType from './Mesocycle.json'

const ajv = new Ajv();
const validate = ajv.compile(MesocycleType);

export const POST: RequestHandler = async ({ request }) => {
	const meso = await request.json();
    const valid = validate(meso);

    if (!valid) {
        return new Response('Invalid JSON format for mesocycle', {
            status: 400
        })
    }

	return new Response();
};
