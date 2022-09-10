import { ErrorResponse, removeSession } from '../../_db';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ request, cookies }) => {
    // Check if cookie exists, if yes, remove it from DB
    const sessionID = cookies.get('sessionID');

    if (sessionID) {
        try {
            await removeSession(sessionID);
        } catch (err) {
            if (err instanceof ErrorResponse) {
                return new Response(err.message, {
                    status: err.status
                })
            }
            return new Response(JSON.stringify(err), {
                status: 500
            })
        }
    }

    // Return 201, and overwrite cookie in browser to expire immediately
    cookies.set('sessionID', '', {
        path: '/',
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 0
    })
    return new Response(null, {
        status: 201
    })
};
