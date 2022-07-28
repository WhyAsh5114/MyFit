import type { GetSession, Handle } from '@sveltejs/kit';
import { parse, serialize } from 'cookie';
import { getUser, getUsernameFromSession } from './routes/api/_db';

export const handle: Handle = async ({ event, resolve }) => {
    const cookies = parse(event.request.headers.get('cookie') || '');

    if (cookies.sessionID) {
        try {
            const username = await getUsernameFromSession(cookies.sessionID);
            const user = await getUser(username);
            if (username) {
                event.locals = { user };
                return resolve(event);
            }
        } catch (error) {
            event.locals = {};
            event.request.headers.set(
                'set-cookie',
                serialize('sessionID', '', {
                    path: '/',
                    httpOnly: true,
                    sameSite: 'strict',
                    maxAge: 0
                })
            );
            return resolve(event);
        }
    }

    event.locals = {};
    return resolve(event);
};

export const getSession: GetSession = (request) => {
    if (request?.locals.user) {
        return {
            user: request.locals.user
        };
    } else {
        return {};
    }
};
