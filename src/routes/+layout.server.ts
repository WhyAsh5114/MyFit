import type { LayoutServerLoad } from './$types';
import { getUser, getUsernameFromSession } from './api/_db';

export const load: LayoutServerLoad = async ({ cookies }) => {
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
