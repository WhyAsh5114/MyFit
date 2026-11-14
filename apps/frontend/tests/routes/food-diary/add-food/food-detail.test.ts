import { describe, expect, it } from 'vitest';
import {
	foodDetail,
	type FoodDetailEntry
} from '../../../../src/routes/(app)/(protected)/food-diary/[date]/add-food/food-detail.js';

const entry = (extra: Partial<FoodDetailEntry> = {}): FoodDetailEntry => ({
	brands: null,
	energyKcal_100g: 200,
	quantityG: 50,
	preferredUnit: 'g',
	servingQuantity: null,
	servingSize: null,
	...extra
});

describe('foodDetail', () => {
	it('shows brand, kcal at the logged amount and grams', () => {
		expect(foodDetail(entry({ brands: 'Amul' }))).toBe('Amul · 100 kcal · 50 g');
	});

	it('leaves out a missing brand', () => {
		expect(foodDetail(entry())).toBe('100 kcal · 50 g');
	});

	it('shows servings when that was the preferred unit', () => {
		expect(
			foodDetail(
				entry({
					quantityG: 90,
					preferredUnit: 'serving',
					servingQuantity: 30,
					servingSize: 'slice'
				})
			)
		).toBe('180 kcal · 3 × slice');
	});

	it('falls back to grams when the serving is unknown', () => {
		expect(foodDetail(entry({ preferredUnit: 'serving' }))).toBe('100 kcal · 50 g');
	});
});
