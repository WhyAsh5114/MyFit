import { getMacroMetrics } from '#lib/features/food-diary/macro-metrics/queries/get.js';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ depends, parent }) => {
	const { ownerId } = await parent();
	return { macroMetrics: await getMacroMetrics(depends, ownerId) };
};
