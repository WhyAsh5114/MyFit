import type { QueryClient, QueryKey } from '@tanstack/svelte-query';
import type { PullChange } from '@prisma-idb/sync-extension-idb/client';
import { userKeys } from './user/keys';
import { activityEntryKeys } from './food-diary/acitivity-entry/keys';
import { activityPreferencesKeys } from './food-diary/activity-preferences/keys';
import { foodEntryKeys } from './food-diary/food-entry/keys';
import { macroMetricsKeys } from './food-diary/macro-metrics/keys';
import { macroTargetsKeys } from './food-diary/macro-targets/keys';
import { mealKeys } from './food-diary/meals/keys';

/**
 * The query-key prefixes that read each synced model. A model that is missing from this
 * map makes `invalidatePulledChanges` refetch every active query instead.
 *
 * `Meal` also covers the food entry queries: they include their meal, and deleting a
 * meal cascades to its entries, which a pull reports only as a change to the meal.
 */
const QUERY_KEYS_BY_MODEL: Record<string, QueryKey[]> = {
	User: [userKeys.all],
	Meal: [mealKeys.all, foodEntryKeys.all],
	FoodEntry: [foodEntryKeys.all],
	ActivityEntry: [activityEntryKeys.all],
	ActivityPreferences: [activityPreferencesKeys.all],
	MacroMetrics: [macroMetricsKeys.all],
	MacroTargets: [macroTargetsKeys.all]
};

/**
 * Refetches the active queries that read the models a pull changed. If a change touches a
 * model without a mapping, refetches every active query, so a new synced model is never stale.
 */
export async function invalidatePulledChanges(queryClient: QueryClient, changes: PullChange[]) {
	const models = new Set(changes.map((change) => change.model));
	if (models.size === 0) return;

	if ([...models].some((model) => !(model in QUERY_KEYS_BY_MODEL))) {
		await queryClient.invalidateQueries({ refetchType: 'active' });
		return;
	}

	const queryKeys = new Set([...models].flatMap((model) => QUERY_KEYS_BY_MODEL[model]));
	await Promise.all(
		[...queryKeys].map((queryKey) =>
			queryClient.invalidateQueries({ queryKey, refetchType: 'active' })
		)
	);
}
