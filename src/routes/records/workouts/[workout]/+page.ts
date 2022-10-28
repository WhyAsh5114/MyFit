import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent }) => {
    const { user } = await parent();
    if (params.workout in user.workouts) {
        return { user };
    }
    throw error(404, `${params.workout}`);
};
