import { loadOwner } from '#lib/features/account-session.svelte.js';
import { loadDiaryDay } from '#lib/features/food-diary/load-day.js';
import { parseSelectedDay } from '#lib/features/food-diary/selected-day.js';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, depends }) => {
	const userId = loadOwner(depends);
	return {
		diary: userId ? await loadDiaryDay(depends, userId, parseSelectedDay(params.date)) : null
	};
};
