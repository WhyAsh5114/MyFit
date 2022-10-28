import { ErrorResponse, getUserFromSession, setUser } from '../../_db';
import type { RequestHandler } from '@sveltejs/kit';
import { parse } from 'cookie';

export const POST: RequestHandler = async ({ request }) => {
    const { workout }: { workout: Workout } = await request.json();

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

    if (workout.name in user.workouts) {
        return new Response('Workout already exists, try changing date and/or time', {
            status: 409
        });
    }

    // Add the workout to userData
    user.workouts[workout.name] = workout;

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
