import { ErrorResponse, getUserFromSession, setUser } from '../../_db';
import type { RequestHandler } from '@sveltejs/kit';
import { parse } from 'cookie';

export const POST: RequestHandler = async ({ request }) => {
    const { splitName }: { splitName: string } = await request.json();

    // Get sessionID
    const sessionID = parse(request.headers.get('cookie') || '').sessionID;

    // Make sure user is logged in by checking if
    // sessionID is loaded
    if (!sessionID) {
        return new Response('Not logged in, locals empty', {
            status: 403
        });
    }

    let user: User;
    try {
        user = await getUserFromSession(sessionID);
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

    if (!(splitName in user.splits)) {
        return new Response('Split does not exist', {
            status: 404
        });
    }

    // Remove the split from userData
    delete user.splits[splitName];

    // Make the activeSplit undefined if it was referring to the split being deleted
    if (user.activeSplit === splitName) {
        user.activeSplit = undefined;
    }

    try {
        await setUser(user, sessionID);
        return new Response('Split deleted successfully', {
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
