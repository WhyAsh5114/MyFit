import { ErrorResponse, removeSession } from '../../_db';
import { parse, serialize } from 'cookie';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ request }) => {
    // Check if cookie exists, if yes, remove it from DB
    const cookies = parse(request.headers.get('set-cookie') || '');

    if (cookies.sessionID) {
        try {
            await removeSession(cookies.sessionID);
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
    return new Response(null, {
        headers: {
            'set-cookie': serialize('sessionID', '', {
                path: '/',
                httpOnly: true,
                sameSite: 'strict',
                maxAge: 0
            })
        },
        status: 201
    })
};
