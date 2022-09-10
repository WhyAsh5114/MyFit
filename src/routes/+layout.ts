import type { Load } from '@sveltejs/kit';

// If user is logged in, don't show Logout option
export const load: Load = ({ data }) => {
    if (data?.user) {
        return {
            props: {
                user: data.user
            }
        };
    } else {
        return {};
    }
};
