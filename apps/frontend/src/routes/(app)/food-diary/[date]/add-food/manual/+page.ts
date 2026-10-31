import { loadOwner } from '#lib/features/account-session.svelte.js';
import { getMeals } from '#lib/features/food-diary/meals/queries/get.js';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ depends }) => {
	const userId = loadOwner(depends);
	return { manual: userId ? { userId, meals: await getMeals(depends, userId) } : null };
};
