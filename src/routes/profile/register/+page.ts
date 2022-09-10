import { redirect, type Load } from '@sveltejs/kit';

export const load: Load = ({ data }) => {
    if (data?.user) {
        throw redirect(307, '/profile');
    }
};