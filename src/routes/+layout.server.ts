import type { ServerLoad } from '@sveltejs/kit';

// If user is logged in, don't show Logout option
export const load: ServerLoad = ({ locals }) => {
    if (locals?.user) {
        return {
            props: {
                user: locals.user
            }
        };
    } else {
        return {};
    }
};
