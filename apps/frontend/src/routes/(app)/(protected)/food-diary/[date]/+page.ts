import { loadDiaryDay } from '#lib/features/food-diary/load-day.js';
import { parseSelectedDay } from '#lib/features/food-diary/selected-day.js';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, depends, parent }) => {
	const { ownerId } = await parent();
	return { diary: await loadDiaryDay(depends, ownerId, parseSelectedDay(params.date)) };
};
