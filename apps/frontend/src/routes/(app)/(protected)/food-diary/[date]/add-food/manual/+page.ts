import { getMeals } from '#lib/features/food-diary/meals/queries/get.js';
import { momentOnDay } from '#lib/features/food-diary/_common/day-bounds.js';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ depends, parent, params }) => {
	const { ownerId } = await parent();
	return { meals: await getMeals(depends, ownerId), eatenAt: momentOnDay(params.date) };
};
