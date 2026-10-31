import type { PullChange } from '@prisma-idb/sync-extension-idb/client';
import { describe, expect, it } from 'vitest';
import { dependencyId, isUnder } from '#lib/data/dependencies.js';
import { foodEntryKeys } from '#lib/features/food-diary/food-entry/keys.js';
import { macroTargetsKeys } from '#lib/features/food-diary/macro-targets/keys.js';
import { mealKeys } from '#lib/features/food-diary/meals/keys.js';
import { keysChangedBy } from '#lib/services/sync/sync-invalidation.js';

/** A pulled change to `model`. Only the model matters to the invalidation. */
const changeTo = (model: string) => ({ model }) as PullChange;

/** Whether a `load` that depends on `key` reruns when the pull's keys are invalidated. */
const reruns = (key: readonly string[], changes: PullChange[]) => {
	const keys = keysChangedBy(changes);
	return keys === null || isUnder(dependencyId(key), ...keys);
};

describe('keysChangedBy', () => {
	it('covers the food entries along with a changed meal, and nothing else', () => {
		const changes = [changeTo('Meal')];

		expect(reruns(mealKeys.byUser('u1'), changes)).toBe(true);
		expect(reruns(foodEntryKeys.byDate('u1', '2026-10-31'), changes)).toBe(true);
		expect(reruns(macroTargetsKeys.all, changes)).toBe(false);
	});

	it('asks for every load to rerun when a changed model has no mapping', () => {
		expect(keysChangedBy([changeTo('MacroTargets'), changeTo('Recipe')])).toBeNull();
	});

	it('invalidates nothing when the pull changed nothing', () => {
		expect(keysChangedBy([])).toEqual([]);
	});
});

describe('isUnder', () => {
	const day = dependencyId(foodEntryKeys.byDate('u1', '2026-10-31'));

	it('matches the key itself and everything below a prefix', () => {
		expect(isUnder(day, foodEntryKeys.byDate('u1', '2026-10-31'))).toBe(true);
		expect(isUnder(day, foodEntryKeys.byUser('u1'))).toBe(true);
		expect(isUnder(day, foodEntryKeys.all)).toBe(true);
	});

	it('leaves other users, days and models alone', () => {
		expect(isUnder(day, foodEntryKeys.byUser('u'))).toBe(false);
		expect(isUnder(day, foodEntryKeys.byUser('u12'))).toBe(false);
		expect(isUnder(day, foodEntryKeys.byDate('u1', '2026-10-30'))).toBe(false);
		expect(isUnder(day, mealKeys.byUser('u1'))).toBe(false);
	});

	it('keeps ids that hold separators in one segment', () => {
		const id = dependencyId(foodEntryKeys.byId('u1', 'generated:u1/2026'));
		expect(isUnder(id, foodEntryKeys.byUser('u1'))).toBe(true);
		expect(isUnder(id, foodEntryKeys.byId('u1', 'generated'))).toBe(false);
	});
});
