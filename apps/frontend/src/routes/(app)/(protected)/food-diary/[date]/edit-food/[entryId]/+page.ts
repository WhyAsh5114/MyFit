import { getFoodEntryById } from '#lib/features/food-diary/food-entry/queries/get-by-id.js';
import { getMeals } from '#lib/features/food-diary/meals/queries/get.js';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, depends, parent }) => {
	const { ownerId } = await parent();
	const [meals, foodEntry] = await Promise.all([
		getMeals(depends, ownerId),
		getFoodEntryById(depends, { userId: ownerId, id: params.entryId })
	]);
	return { meals, foodEntry };
};
