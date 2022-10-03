import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent }) => {
    const { user } = await parent();
    if (params.split in user.splits) {
        return { user };
    }
    throw error(404, `${params.split}`);
};
