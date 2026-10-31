import { loadOwner } from '#lib/features/account-session.svelte.js';
import { getMeals } from '#lib/features/food-diary/meals/queries/get.js';
import type { PageLoad } from './$types';

// The food itself is read from the nutrition API by the page: a load would hold the navigation
// on the network.
export const load: PageLoad = async ({ depends }) => {
	const userId = loadOwner(depends);
	return { log: userId ? { userId, meals: await getMeals(depends, userId) } : null };
};
