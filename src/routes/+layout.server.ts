import type { ServerLoad } from '@sveltejs/kit';
import { getUser, getUsernameFromSession } from './api/_db';
import { parse } from 'cookie';

// If user is logged in, don't show Logout option
export const load: ServerLoad = async ({ request }) => {
    const cookies = parse(request.headers.get('cookie') || '');
    if (!cookies.sessionID) {
        return {};
    }

    const username = await getUsernameFromSession(cookies.sessionID);
    try {
        if (username) {
            return {
                user: await getUser(username)
            }
        }
    } catch (err) {
        return {};
    }
};
