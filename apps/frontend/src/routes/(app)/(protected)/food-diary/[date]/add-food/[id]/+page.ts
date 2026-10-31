import { getMeals } from '#lib/features/food-diary/meals/queries/get.js';
import type { PageLoad } from './$types';

// The food itself is read from the nutrition API by the page: a load would hold the navigation
// on the network.
export const load: PageLoad = async ({ depends, parent }) => {
	const { ownerId } = await parent();
	return { meals: await getMeals(depends, ownerId) };
};
