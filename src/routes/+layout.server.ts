import type { LayoutServerLoad } from './$types';
import { getUser, getUsernameFromSession } from './api/_db';

export const load: LayoutServerLoad = async ({ cookies }) => {
    const sessionID = cookies.get('sessionID');
    if (!sessionID) {
        return { user: undefined };
    }

    try {
        const username = await getUsernameFromSession(sessionID);
        if (username) {
            const user = await getUser(username);
            delete user.password;
            return { user };
        } else {
            await fetch('/api/aut/logout', {
                method: 'GET'
            });
            return { user: undefined };
        }
    } catch (err) {
        return { user: undefined };
    }
};
