import { loadOwner } from '#lib/features/account-session.svelte.js';
import { getMacroTargets } from '#lib/features/food-diary/macro-targets/queries/get.js';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ depends }) => {
	const userId = loadOwner(depends);
	return {
		targets: userId ? { userId, macroTargets: await getMacroTargets(depends, userId) } : null
	};
};
