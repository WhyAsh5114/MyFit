import { describe, expect, it } from 'vitest';
import { hasCalculationErrors } from '#lib/domain/nutrition/energy-check.js';

describe('hasCalculationErrors', () => {
	it('accepts kcal that matches the macros exactly', () => {
		// 66×4 + 13×4 + 7×9 = 379
		expect(hasCalculationErrors(379, 66, 13, 7)).toBe(false);
	});

	it('allows 10% of the kcal on a large food', () => {
		// Macros give 379; 10% of 420 is 42, and the gap is 41.
		expect(hasCalculationErrors(420, 66, 13, 7)).toBe(false);
		// 10% of 430 is 43, and the gap is 51.
		expect(hasCalculationErrors(430, 66, 13, 7)).toBe(true);
	});

	it('allows 10 kcal on a small food', () => {
		// Macros give 20; 10% of 30 is 3, so the 10 kcal floor applies.
		expect(hasCalculationErrors(30, 5, 0, 0)).toBe(false);
		expect(hasCalculationErrors(31, 5, 0, 0)).toBe(true);
	});
});
