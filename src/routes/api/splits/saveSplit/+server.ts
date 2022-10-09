import { ErrorResponse, getUserFromSession, setUser } from '../../_db';
import type { RequestHandler } from '@sveltejs/kit';
import { parse } from 'cookie';

// TODO: user should not be a parameter to any POST request
// use sessionID to authenticate, and get user

export const POST: RequestHandler = async ({ request }) => {
    const { split }: { split: Split } = await request.json();

    // Get sessionID
    const sessionID = parse(request.headers.get('cookie') || '').sessionID;

    // Make sure user is logged in by checking if
    // locals.user and sessionID are loaded
    if (!sessionID) {
        return new Response('Not logged in, no sessionID cookie found', {
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

    if (split.name in user.splits) {
        return new Response('Split already exists', {
            status: 409
        });
    }

    // Add the split to userData
    user.splits[split.name] = split;
    // Make the new split the active split
    user.activeSplit = split.name;

    try {
        await setUser(user, sessionID);
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
