import { loadOwner } from '#lib/features/account-session.svelte.js';
import { getActivityPreferences } from '#lib/features/food-diary/activity-preferences/queries/get.js';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ depends }) => {
	const userId = loadOwner(depends);
	return {
		activity: userId ? { userId, preferences: await getActivityPreferences(depends, userId) } : null
	};
};
