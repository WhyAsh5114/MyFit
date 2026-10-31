import { refreshAll } from '$app/navigation';
import type { PullChange } from '@prisma-idb/sync-extension-idb/client';
import { invalidateKeys } from '#lib/data/dependencies.js';
import { userKeys } from '#lib/features/user/keys.js';
import { activityEntryKeys } from '#lib/features/food-diary/acitivity-entry/keys.js';
import { activityPreferencesKeys } from '#lib/features/food-diary/activity-preferences/keys.js';
import { foodEntryKeys } from '#lib/features/food-diary/food-entry/keys.js';
import { macroMetricsKeys } from '#lib/features/food-diary/macro-metrics/keys.js';
import { macroTargetsKeys } from '#lib/features/food-diary/macro-targets/keys.js';
import { mealKeys } from '#lib/features/food-diary/meals/keys.js';

type Key = readonly string[];

/**
 * The key prefixes that read each synced model. A model that is missing from this map makes
 * `invalidatePulledChanges` rerun every active `load` instead.
 *
 * `Meal` also covers the food entries: they include their meal, and deleting a meal cascades to
 * its entries, which a pull reports only as a change to the meal.
 */
const KEYS_BY_MODEL: Record<string, Key[]> = {
	User: [userKeys.all],
	Meal: [mealKeys.all, foodEntryKeys.all],
	FoodEntry: [foodEntryKeys.all],
	ActivityEntry: [activityEntryKeys.all],
	ActivityPreferences: [activityPreferencesKeys.all],
	MacroMetrics: [macroMetricsKeys.all],
	MacroTargets: [macroTargetsKeys.all]
};

/** The key prefixes a pull changed, or `null` when a changed model has no mapping. */
export function keysChangedBy(changes: PullChange[]): Key[] | null {
	const models = new Set(changes.map((change) => change.model));
	if ([...models].some((model) => !(model in KEYS_BY_MODEL))) return null;
	return [...new Set([...models].flatMap((model) => KEYS_BY_MODEL[model]))];
}

/**
 * Reruns the active `load`s that read the models a pull changed. If a change touches a model
 * without a mapping, reruns every active `load`, so a new synced model is never stale.
 */
export async function invalidatePulledChanges(changes: PullChange[]) {
	const keys = keysChangedBy(changes);
	if (keys === null) return refreshAll();
	if (keys.length > 0) return invalidateKeys(...keys);
}
