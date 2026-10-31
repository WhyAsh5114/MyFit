import { loadOwner } from '#lib/features/account-session.svelte.js';
import { getLocalUser } from '#lib/features/user/queries/get.js';
import type { LayoutLoad } from './$types';

export const prerender = false;
export const ssr = false;
export const csr = true;

export const load: LayoutLoad = async ({ depends }) => {
	const ownerId = loadOwner(depends);
	// Nothing to read until the session cacher has opened the account's database.
	const user = ownerId ? await getLocalUser(depends) : null;
	return { ownerId, user };
};
