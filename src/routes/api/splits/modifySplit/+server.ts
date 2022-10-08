import { ErrorResponse, setUser } from '../../_db';
import type { RequestHandler } from '@sveltejs/kit';
import { parse } from 'cookie';

// TODO: playwright tests

export const POST: RequestHandler = async ({ request }) => {
    const {
        thisActive,
        oldSplitName,
        split,
        user
    }: { thisActive: boolean; oldSplitName: string; split: Split; user: User } =
        await request.json();

    // Get sessionID
    const sessionID = parse(request.headers.get('cookie') || '').sessionID;

    // Make sure user is logged in by checking if
    // sessionID is loaded
    if (!user || !sessionID) {
        return new Response('Not logged in, locals empty', {
            status: 403
        });
    }

    // Check if old split exists
    if (!(oldSplitName in user.splits)) {
        return new Response('Split does not exist', {
            status: 404
        });
    }

    // Delete old split
    delete user.splits[oldSplitName];
    user.splits[split.name] = split;

    // Change activeSplit of user according to request
    if (thisActive) {
        user.activeSplit = split.name;
    } else {
        if (user.activeSplit === split.name) {
            user.activeSplit = undefined;
        }
    }

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
