import type { Row } from '@myfit/shared/client';
import { describe, expect, it } from 'vitest';
import { calculateDailyNutritionStats } from '#lib/domain/nutrition/stats.js';

const metrics = {
	bodyweight: 80,
	bodyweightUnit: 'kg',
	height: 180,
	heightUnit: 'cm',
	age: 30,
	bodyFatPercentage: 15,
	gender: 'Male'
} as Row<'MacroMetrics'>;

describe('calculateDailyNutritionStats', () => {
	it('spreads the weekly change over the target and credits burned calories', () => {
		const stats = calculateDailyNutritionStats({
			metrics,
			weeklyCaloricChange: -3500,
			foodEntries: [{ energyKcal_100g: 200, quantityG: 150 }],
			activityEntries: [{ calories: 100 }, { calories: 50 }]
		});

		expect(stats).not.toBeNull();
		expect(stats!.caloriesConsumed).toBe(300);
		expect(stats!.caloriesBurned).toBe(150);
		expect(stats!.targetCalories).toBeCloseTo(stats!.bmr - 500);
		expect(stats!.caloriesRemaining).toBeCloseTo(stats!.targetCalories - 300 + 150);
	});

	it('returns null when the body metrics are incomplete', () => {
		const incomplete = { ...metrics, age: NaN } as Row<'MacroMetrics'>;

		expect(
			calculateDailyNutritionStats({ metrics: incomplete, weeklyCaloricChange: 0 })
		).toBeNull();
	});
});
