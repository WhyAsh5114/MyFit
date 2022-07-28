import { ErrorResponse, getUser, loginUser } from '../_db';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
    const body: { username: string; password: string } = await request.json();

    // Try logging in the user
    try {
        await loginUser(body);
        return {
            status: 200,
            body: {
                user: JSON.stringify(await getUser(body.username))
            }
        };
    } catch (err) {
        if (err instanceof ErrorResponse) {
            return {
                status: err.status,
                body: {
                    message: err.message
                }
            };
        }
        return {
            status: 500,
            body: {
                message: 'Internal server error'
            }
        };
    }
};
