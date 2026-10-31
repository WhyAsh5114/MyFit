import { getMeals } from '#lib/features/food-diary/meals/queries/get.js';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ depends, parent }) => {
	const { ownerId } = await parent();
	return { meals: await getMeals(depends, ownerId) };
};
