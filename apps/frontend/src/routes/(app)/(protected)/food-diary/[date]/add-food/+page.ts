import { getFoodHistory } from '#lib/features/food-diary/food-entry/queries/get-history.js';
import { getMeals } from '#lib/features/food-diary/meals/queries/get.js';
import type { PageLoad } from './$types';

// The search text is filtered in the page, so typing never reruns this load.
export const load: PageLoad = async ({ depends, parent }) => {
	const { ownerId } = await parent();
	const [meals, history] = await Promise.all([
		getMeals(depends, ownerId),
		getFoodHistory(depends, ownerId)
	]);
	return { meals, history };
};
