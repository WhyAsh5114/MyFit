import { loadOwner } from '#lib/features/account-session.svelte.js';
import { getFoodEntryById } from '#lib/features/food-diary/food-entry/queries/get-by-id.js';
import { getMeals } from '#lib/features/food-diary/meals/queries/get.js';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, depends }) => {
	const userId = loadOwner(depends);
	if (!userId) return { edit: null };
	const [meals, foodEntry] = await Promise.all([
		getMeals(depends, userId),
		getFoodEntryById(depends, { userId, id: params.entryId })
	]);
	return { edit: { userId, meals, foodEntry } };
};
