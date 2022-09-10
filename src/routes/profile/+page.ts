import { redirect, type Load } from '@sveltejs/kit';

export const load: Load = ({ data }) => {
    if (data?.user) {
        return {
            props: {
                user: data.user
            }
        };
    } else {
        throw redirect(307, '/profile/login');
    }
};
