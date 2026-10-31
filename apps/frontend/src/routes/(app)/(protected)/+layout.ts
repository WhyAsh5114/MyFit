import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { toast } from 'svelte-sonner';
import { m } from '#lib/paraglide/messages.js';
import type { LayoutLoad } from './$types';

/** Sends visitors with no local account and no session to the login page, and returns them after. */
export const load: LayoutLoad = async ({ parent, url }) => {
	const { ownerId } = await parent();
	if (ownerId === null) {
		toast.info(m['account.loginToContinue']());
		const back = encodeURIComponent(`${url.pathname}${url.search}${url.hash}`);
		redirect(307, `${resolve('login')}?redirect=${back}`);
	}
	return { ownerId };
};
