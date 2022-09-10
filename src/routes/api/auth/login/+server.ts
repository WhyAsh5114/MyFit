import { ErrorResponse, loginUser } from '../../_db';
import type { RequestHandler } from '@sveltejs/kit';
import { serialize } from 'cookie';

export const POST: RequestHandler = async ({ request }) => {
    const body: { username: string; password: string } = await request.json();

    // Try logging in the user
    try {
        const id = await loginUser(body);
        return new Response('Logged in successfully', {
            status: 200,
            headers: {
                'set-cookie': serialize('sessionID', id, {
                    sameSite: 'strict',
                    maxAge: 60 * 60 * 24 * 7,
                    path: '/',
                    httpOnly: true,
                    secure: true
                })
            }
        });
    } catch (err) {
        if (err instanceof ErrorResponse) {
            return new Response(err.message, {
                status: err.status
            });
        }
        return new Response('Internal server error', {
            status: 500
        })
    }
};
