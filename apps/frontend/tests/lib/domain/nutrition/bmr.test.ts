import { describe, expect, it } from 'vitest';
import { calculateBMR } from '#lib/domain/nutrition/bmr.js';

const male = {
	bodyweight: 80,
	bodyweightUnit: 'kg',
	height: 180,
	heightUnit: 'cm',
	age: 30,
	bodyFatPercentage: 15,
	gender: 'Male'
} as const;

describe('calculateBMR', () => {
	it('uses the male formula', () => {
		// 88.362 + 13.397×80 + 4.799×180 − 5.677×30 − 6.8×15
		expect(calculateBMR(male)).toBeCloseTo(1751.632);
	});

	it('uses the female formula', () => {
		const female = { ...male, bodyweight: 60, height: 165, age: 25, bodyFatPercentage: 25 };
		// 447.593 + 9.247×60 + 3.098×165 − 4.33×25 − 4.7×25
		expect(calculateBMR({ ...female, gender: 'Female' })).toBeCloseTo(1287.833);
	});

	it('gives the same result in pounds and inches', () => {
		// 100 lb is 45.3592 kg, and 70 in is 177.8 cm.
		const imperial = {
			...male,
			bodyweight: 100,
			bodyweightUnit: 'lb',
			height: 70,
			heightUnit: 'in'
		} as const;
		const metric = { ...male, bodyweight: 45.3592, height: 177.8 };
		expect(calculateBMR(imperial)).toBeCloseTo(calculateBMR(metric)!);
	});

	it.each(['bodyweight', 'height', 'age', 'bodyFatPercentage'] as const)(
		'is null when %s is missing',
		(field) => {
			expect(calculateBMR({ ...male, [field]: NaN })).toBeNull();
		}
	);
});
