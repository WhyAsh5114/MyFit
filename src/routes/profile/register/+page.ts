import { redirect, type Load } from '@sveltejs/kit';

export const load: Load = async ({ parent }) => {
    const { user } = await parent();
    if (user) {
        throw redirect(307, '/profile');
    }
};
