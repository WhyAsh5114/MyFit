import { page } from '$app/state';

/**
 * The signed-in user, from the `(app)` layout's data. It reads reactive page state, so calling it
 * in a template or `$derived` keeps up with changes. `null` while no account is on screen.
 */
export const getCurrentUser = () => page.data.user ?? null;
