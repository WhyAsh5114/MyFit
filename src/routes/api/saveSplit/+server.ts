import { ErrorResponse, setUser } from '../_db';
import type { RequestHandler } from '@sveltejs/kit';
import { parse } from 'cookie';

export const POST: RequestHandler = async ({ request, locals }) => {
    const split: Split = await request.json();

    // Get sessionID
    const sessionID = parse(request.headers.get('cookie') || '').sessionID;

    // Make sure user is logged in by checking if
    // locals.user and sessionID are loaded
    if (!locals.user || !sessionID) {
        return new Response('Not logged in, locals empty', {
            status: 403
        })
    }

    if (split.name in locals.user.splits) {
        return new Response('Split already exists', {
            status: 409
        })
    }

    // Add the split to userData in locals
    locals.user.splits[split.name] = split;
    // Make the new split the active split
    locals.user.activeSplit = split.name;

    try {
        await setUser(locals.user, sessionID);
        return new Response('Split saved successfully', {
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
