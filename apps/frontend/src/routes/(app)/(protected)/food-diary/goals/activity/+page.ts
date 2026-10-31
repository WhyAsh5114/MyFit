import { getActivityPreferences } from '#lib/features/food-diary/activity-preferences/queries/get.js';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ depends, parent }) => {
	const { ownerId } = await parent();
	return { preferences: await getActivityPreferences(depends, ownerId) };
};
