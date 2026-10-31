import { getMacroTargets } from '#lib/features/food-diary/macro-targets/queries/get.js';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ depends, parent }) => {
	const { ownerId } = await parent();
	return { macroTargets: await getMacroTargets(depends, ownerId) };
};
