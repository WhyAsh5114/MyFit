import { ErrorResponse, loginUser } from '../../_db';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, cookies }) => {
    const body: { username: string; password: string } = await request.json();

    // Try logging in the user
    try {
        const id = await loginUser(body);
        cookies.set('sessionID', id, {
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 7,
            path: '/',
            httpOnly: true,
            secure: true
        })
        return new Response('Logged in successfully', {
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
        })
    }
};
