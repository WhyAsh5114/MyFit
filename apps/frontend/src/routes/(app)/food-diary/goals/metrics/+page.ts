import { loadOwner } from '#lib/features/account-session.svelte.js';
import { getMacroMetrics } from '#lib/features/food-diary/macro-metrics/queries/get.js';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ depends }) => {
	const userId = loadOwner(depends);
	return {
		metrics: userId ? { userId, macroMetrics: await getMacroMetrics(depends, userId) } : null
	};
};
