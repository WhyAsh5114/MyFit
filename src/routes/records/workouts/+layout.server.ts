import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ parent }) => {
    const { user } = await parent();

    if (user) {
        return { user };
    } else {
        throw redirect(307, `/profile/login?page=/records/workouts`);
    }
};
