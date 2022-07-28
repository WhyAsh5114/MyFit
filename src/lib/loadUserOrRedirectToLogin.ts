import type { Load } from '@sveltejs/kit';

export const loadUserOrRedirectToLogin: Load = ({ session, url }) => {
    // Pass user as prop if logged in
    if (session?.user) {
        return {
            props: {
                user: session.user
            }
        };
        // Redirect to login if not logged in
    } else {
        return {
            redirect: `/profile/login?page=${url.pathname}`,
            status: 302
        };
    }
};
