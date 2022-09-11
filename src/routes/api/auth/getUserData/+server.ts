import { ErrorResponse, getUser, loginUser } from '../../_db';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
    const body: { username: string; password: string } = await request.json();

    // Try logging in the user
    try {
        await loginUser(body);
        return new Response(JSON.stringify(await getUser(body.username)), {
            status: 200
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
