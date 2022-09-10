import type { ServerLoad } from '@sveltejs/kit';
import { getUser, getUsernameFromSession } from './api/_db';

export const load: ServerLoad = async ({ request, cookies }) => {
    const sessionID = cookies.get('sessionID');
    if (!sessionID) {
        return {};
    }

    const username = await getUsernameFromSession(sessionID);
    try {
        if (username) {
            const user = await getUser(username);
            delete user.password;
            return { user };
        }
    } catch (err) {
        return {};
    }
};
