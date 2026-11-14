import { describe, expect, it } from 'vitest';
import { calculateActivityCalories } from '#lib/domain/nutrition/activity-calories.js';

const walker = { bodyweight: 70, bodyweightUnit: 'kg', height: 175, heightUnit: 'cm' } as const;

describe('calculateActivityCalories', () => {
	it('estimates walking calories from steps, stride and weight', () => {
		// Stride 175 × 0.43 = 75.25 cm, so 10,000 steps is 7.525 km, 1.505 h at 5 km/h,
		// and 3.5 MET × 70 kg × 1.505 h = 368.7 kcal.
		expect(calculateActivityCalories({ ...walker, stepCount: 10_000 })).toBe(369);
	});

	it('is zero without steps', () => {
		expect(calculateActivityCalories({ ...walker, stepCount: 0 })).toBe(0);
		expect(calculateActivityCalories({ ...walker, stepCount: -5 })).toBe(0);
	});

	it('counts at least 1 kcal for any steps', () => {
		expect(calculateActivityCalories({ ...walker, stepCount: 1 })).toBe(1);
	});

	it('gives the same result in pounds and inches', () => {
		// 154.324 lb is 70 kg, and 68.898 in is 175 cm, to the precision that survives rounding.
		const imperial = {
			bodyweight: 154.324,
			bodyweightUnit: 'lb',
			height: 68.898,
			heightUnit: 'in',
			stepCount: 10_000
		} as const;
		expect(calculateActivityCalories(imperial)).toBe(369);
	});
});
