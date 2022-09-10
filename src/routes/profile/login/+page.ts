import { redirect, type Load } from '@sveltejs/kit';

export const load: Load = ({ data, params }) => {
    if (data?.user) {
        throw redirect(307, '/profile/login');
    }
};