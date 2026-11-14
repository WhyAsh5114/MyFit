import { describe, expect, it } from 'vitest';
import { forQuantity, macrosFor, totalMacros } from '#lib/domain/nutrition/portion.js';

const oats = { energyKcal_100g: 380, carbohydratesG_100g: 66, fatG_100g: 7, proteinsG_100g: 13 };
const milk = { energyKcal_100g: 64, carbohydratesG_100g: 5, fatG_100g: 3.5, proteinsG_100g: 3.3 };

describe('forQuantity', () => {
	it('scales a per-100 g value to the amount eaten', () => {
		expect(forQuantity(380, 50)).toBe(190);
		expect(forQuantity(380, 100)).toBe(380);
		expect(forQuantity(380, 0)).toBe(0);
	});
});

describe('macrosFor', () => {
	it('scales every macro by the same quantity', () => {
		expect(macrosFor(oats, 50)).toEqual({ kcal: 190, carbsG: 33, fatG: 3.5, proteinG: 6.5 });
	});
});

describe('totalMacros', () => {
	it('sums each entry at its own quantity', () => {
		const total = totalMacros([
			{ ...oats, quantityG: 50 },
			{ ...milk, quantityG: 200 }
		]);
		expect(total.kcal).toBeCloseTo(318);
		expect(total.carbsG).toBeCloseTo(43);
		expect(total.fatG).toBeCloseTo(10.5);
		expect(total.proteinG).toBeCloseTo(13.1);
	});

	it('is zero for no entries', () => {
		expect(totalMacros([])).toEqual({ kcal: 0, carbsG: 0, fatG: 0, proteinG: 0 });
	});
});
