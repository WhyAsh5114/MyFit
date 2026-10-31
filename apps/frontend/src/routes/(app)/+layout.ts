import { accountReady } from '#lib/features/account/account-session.svelte.js';
import { getLocalUser } from '#lib/features/user/queries/get.js';
import type { LayoutLoad } from './$types';

export const prerender = false;
export const ssr = false;
export const csr = true;

export const load: LayoutLoad = async ({ depends }) => {
	// Waits behind the account root's dialogs until there is an account to read for.
	const ownerId = await accountReady(depends);
	const user = ownerId ? await getLocalUser(depends, ownerId) : null;
	return { ownerId, user };
};
