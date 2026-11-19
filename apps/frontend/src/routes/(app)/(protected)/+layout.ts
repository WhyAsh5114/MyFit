import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import type { LayoutLoad } from './$types';

/**
 * Sends visitors with no local account and no session to the login page, which says why and
 * returns them after. It doesn't toast: a hover preloads this load too.
 */
export const load: LayoutLoad = async ({ parent, url }) => {
	const { ownerId } = await parent();
	if (ownerId === null) {
		// SvelteKit throws on `url.hash` in a load, because a load can run where there is no hash.
		const back = encodeURIComponent(`${url.pathname}${url.search}`);
		redirect(307, `${resolve('login')}?redirect=${back}`);
	}
	return { ownerId };
};
