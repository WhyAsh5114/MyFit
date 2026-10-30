import { QueryClient } from '@tanstack/svelte-query';
import type { PullChange } from '@prisma-idb/sync-extension-idb/client';
import { describe, expect, it } from 'vitest';
import { foodEntryKeys } from '#lib/features/food-diary/food-entry/keys.js';
import { macroTargetsKeys } from '#lib/features/food-diary/macro-targets/keys.js';
import { mealKeys } from '#lib/features/food-diary/meals/keys.js';
import { invalidatePulledChanges } from '#lib/features/sync-invalidation.js';

/** A pulled change to `model`. Only the model matters to the invalidation. */
const changeTo = (model: string) => ({ model }) as PullChange;

/** A client that holds one loaded query for meals, food entries and macro targets. */
function clientWithLoadedQueries() {
	const queryClient = new QueryClient();
	for (const queryKey of [
		mealKeys.byUser('u1'),
		foodEntryKeys.byUser('u1'),
		macroTargetsKeys.all
	]) {
		queryClient.setQueryData(queryKey, []);
	}
	return queryClient;
}

/** Whether the query under `queryKey` is marked stale. */
const isStale = (queryClient: QueryClient, queryKey: readonly unknown[]) =>
	queryClient.getQueryState(queryKey)?.isInvalidated ?? false;

describe('invalidatePulledChanges', () => {
	it('invalidates the food entries along with a changed meal, and nothing else', async () => {
		const queryClient = clientWithLoadedQueries();

		await invalidatePulledChanges(queryClient, [changeTo('Meal')]);

		expect(isStale(queryClient, mealKeys.byUser('u1'))).toBe(true);
		expect(isStale(queryClient, foodEntryKeys.byUser('u1'))).toBe(true);
		expect(isStale(queryClient, macroTargetsKeys.all)).toBe(false);
	});

	it('invalidates every query when a changed model has no mapping', async () => {
		const queryClient = clientWithLoadedQueries();

		await invalidatePulledChanges(queryClient, [changeTo('MacroTargets'), changeTo('Recipe')]);

		expect(isStale(queryClient, mealKeys.byUser('u1'))).toBe(true);
		expect(isStale(queryClient, macroTargetsKeys.all)).toBe(true);
	});

	it('invalidates nothing when the pull changed nothing', async () => {
		const queryClient = clientWithLoadedQueries();

		await invalidatePulledChanges(queryClient, []);

		expect(isStale(queryClient, mealKeys.byUser('u1'))).toBe(false);
	});
});
