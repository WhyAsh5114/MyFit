import { ErrorResponse, registerUser } from '../../_db';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
    const body: AccountDetails = await request.json();

    // Try registering user, if failed, user already exists
    try {
        await registerUser(body);
        return new Response('Account created successfully', {
            status: 201
        });
    } catch (err) {
        if (err instanceof ErrorResponse) {
            return new Response(err.message, {
                status: err.status
            });
        }
        return new Response(JSON.stringify(err), {
            status: 500
        });
    }
};
