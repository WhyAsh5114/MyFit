import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

// TODO: all fetch requests from client (for example saving a split), should have a loader after sending a reauest
// To prevent double requesting in real world scenario where database requests aren't instantaneous
// Also might want to use redis cloud for this project?


export const load: LayoutServerLoad = async ({ parent }) => {
    const { user } = await parent();

    if (user) {
        return { user };
    } else {
        throw redirect(307, `/profile/login?page=/splits/new`);
    }
};
