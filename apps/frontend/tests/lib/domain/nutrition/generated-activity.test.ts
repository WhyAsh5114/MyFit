import { describe, expect, it } from 'vitest';
import type { Row } from '@myfit/shared/client';
import {
	generatedActivityId,
	unsavedFixedActivity,
	withGeneratedActivity
} from '#lib/domain/nutrition/generated-activity.js';

const startOfDay = new Date(2026, 10, 18);
const fixed = { adjustmentType: 'Static', staticCalories: 400 } as const;
const base = { userId: 'u1', day: '2026-11-18', today: '2026-11-18', startOfDay };

const entry = (overrides: Partial<Row<'ActivityEntry'>>): Row<'ActivityEntry'> => ({
	id: 'a1',
	userId: 'u1',
	name: 'Walk',
	performedAt: new Date(2026, 10, 18, 9),
	calories: 150,
	quantity: 30,
	quantityUnit: 'min',
	systemGenerated: false,
	...overrides
});

describe('unsavedFixedActivity', () => {
	it('gives the day its fixed amount before anything is saved', () => {
		expect(unsavedFixedActivity({ ...base, entries: [], preferences: fixed })).toEqual({
			id: generatedActivityId('u1', '2026-11-18'),
			userId: 'u1',
			name: 'Daily fixed activity',
			performedAt: startOfDay,
			calories: 400,
			quantity: 1,
			quantityUnit: 'day',
			systemGenerated: true
		});
	});

	it('is null once the saved entry matches', () => {
		const saved = entry({ systemGenerated: true, calories: 400, quantity: 1, quantityUnit: 'day' });
		expect(unsavedFixedActivity({ ...base, entries: [saved], preferences: fixed })).toBeNull();
	});

	it('replaces a saved entry with a different amount, keeping its time', () => {
		const performedAt = new Date(2026, 10, 18, 7);
		const saved = entry({ systemGenerated: true, calories: 300, quantityUnit: 'day', performedAt });
		expect(unsavedFixedActivity({ ...base, entries: [saved], preferences: fixed })).toMatchObject({
			calories: 400,
			performedAt
		});
	});

	it('is null for a day that has not started', () => {
		expect(
			unsavedFixedActivity({ ...base, today: '2026-11-17', entries: [], preferences: fixed })
		).toBeNull();
	});

	it('is null without a fixed amount', () => {
		const dynamic = { adjustmentType: 'Dynamic', staticCalories: null } as const;
		expect(unsavedFixedActivity({ ...base, entries: [], preferences: dynamic })).toBeNull();
		expect(unsavedFixedActivity({ ...base, entries: [], preferences: null })).toBeNull();
	});
});

describe('withGeneratedActivity', () => {
	const walk = entry({});
	const generated = entry({ id: 'g', systemGenerated: true, calories: 400 });

	it('adds the generated entry, or replaces the saved one in place', () => {
		expect(withGeneratedActivity([walk], generated)).toEqual([walk, generated]);
		const old = entry({ id: 'g', systemGenerated: true, calories: 300 });
		expect(withGeneratedActivity([old, walk], generated)).toEqual([generated, walk]);
	});

	it('leaves the entries alone without one', () => {
		expect(withGeneratedActivity([walk], null)).toEqual([walk]);
	});
});
