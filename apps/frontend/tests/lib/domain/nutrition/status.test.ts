import { describe, expect, it } from 'vitest';
import { calorieStatus, goalDirection } from '#lib/domain/nutrition/status.js';

describe('goalDirection', () => {
	it('reads the weekly balance', () => {
		expect(goalDirection(-3850)).toBe('cut');
		expect(goalDirection(3850)).toBe('bulk');
		expect(goalDirection(0)).toBe('maintain');
	});

	it('treats a balance within about 0.1 kg a week as maintaining', () => {
		expect(goalDirection(-700)).toBe('maintain');
		expect(goalDirection(700)).toBe('maintain');
		expect(goalDirection(-800)).toBe('cut');
	});
});

describe('calorieStatus', () => {
	const day = (consumed: number, goal: 'cut' | 'maintain' | 'bulk', finished: boolean) =>
		calorieStatus({ consumed, target: 2100, goal, finished });

	it('stays neutral while a day in progress is under target', () => {
		expect(day(889, 'cut', false)).toEqual({ kind: 'neutral' });
		expect(day(889, 'bulk', false)).toEqual({ kind: 'neutral' });
	});

	it('flags going over during the day, because that cannot be undone', () => {
		expect(day(2200, 'cut', false)).toEqual({
			kind: 'off-target',
			direction: 'over',
			severity: 'slight'
		});
		expect(day(2400, 'maintain', false)).toEqual({
			kind: 'off-target',
			direction: 'over',
			severity: 'far'
		});
	});

	it('does not flag a bulk day as over until well past the target', () => {
		expect(day(2300, 'bulk', false)).toEqual({ kind: 'neutral' });
		expect(day(2500, 'bulk', false)).toEqual({
			kind: 'off-target',
			direction: 'over',
			severity: 'slight'
		});
	});

	it('judges the same finished day differently for each goal', () => {
		// 2,410 kcal against 2,100: over on a cut, close on maintain, on target on a bulk.
		expect(day(2410, 'cut', true)).toEqual({
			kind: 'off-target',
			direction: 'over',
			severity: 'far'
		});
		expect(day(2410, 'maintain', true)).toEqual({
			kind: 'off-target',
			direction: 'over',
			severity: 'slight'
		});
		expect(day(2410, 'bulk', true)).toEqual({ kind: 'on-target' });
	});

	it('accepts a cut day anywhere from 80% to 102%', () => {
		expect(day(1700, 'cut', true)).toEqual({ kind: 'on-target' });
		expect(day(2140, 'cut', true)).toEqual({ kind: 'on-target' });
		expect(day(1600, 'cut', true)).toEqual({
			kind: 'off-target',
			direction: 'under',
			severity: 'slight'
		});
	});

	it('treats a short bulk day as the bigger miss', () => {
		expect(day(1650, 'bulk', true)).toEqual({
			kind: 'off-target',
			direction: 'under',
			severity: 'far'
		});
		expect(day(1650, 'maintain', true)).toEqual({
			kind: 'off-target',
			direction: 'under',
			severity: 'far'
		});
	});

	it('is neutral when there is no target', () => {
		expect(calorieStatus({ consumed: 500, target: 0, goal: 'cut', finished: true })).toEqual({
			kind: 'neutral'
		});
	});
});
