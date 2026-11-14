import { describe, expect, it } from 'vitest';
import {
	matchesHistorySearch,
	mealForTime,
	mealTimes,
	rankFoodHistory,
	usualMealAt
} from '#lib/domain/food-history/rank.js';

const now = new Date(2026, 10, 13, 13, 0);
const daysAgo = (days: number, hour = 13) => {
	const moment = new Date(now);
	moment.setDate(moment.getDate() - days);
	moment.setHours(hour, 0, 0, 0);
	return moment;
};
const entry = <E extends object = object>(productName: string, days: number, extra?: E) => ({
	productName,
	brands: null as string | null,
	eatenAt: daysAgo(days),
	mealId: null as string | null,
	...extra
});

describe('rankFoodHistory', () => {
	it('groups spellings of one food and keeps its latest entry', () => {
		const foods = rankFoodHistory(
			[
				{ ...entry('Chapati', 3), quantityG: 40 },
				{ ...entry(' chapati ', 1), quantityG: 60 }
			],
			now
		);
		expect(foods).toHaveLength(1);
		expect(foods[0].count).toBe(2);
		expect(foods[0].latest.quantityG).toBe(60);
	});

	it('keeps the same name from different brands apart', () => {
		const foods = rankFoodHistory(
			[entry('Milk', 1, { brands: 'Amul' }), entry('Milk', 1, { brands: 'Gokul' })],
			now
		);
		expect(foods).toHaveLength(2);
	});

	it('ranks a frequent food above a one-off from the same day, and halves weight per half-life', () => {
		const foods = rankFoodHistory(
			[entry('Oats', 0), entry('Chapati', 2), entry('Chapati', 3), entry('Chapati', 4)],
			now
		);
		expect(foods.map((f) => f.latest.productName)).toEqual(['Chapati', 'Oats']);
		const [old] = rankFoodHistory([entry('Rice', 14)], now);
		expect(old.score).toBeCloseTo(0.5);
	});

	it('lets a recent food overtake one that was frequent long ago', () => {
		const stale = Array.from({ length: 4 }, () => entry('Poha', 60));
		const foods = rankFoodHistory([...stale, entry('Upma', 1)], now);
		expect(foods[0].latest.productName).toBe('Upma');
	});
});

describe('matchesHistorySearch', () => {
	const food = { productName: 'Gawar sabji', brands: 'Home', eatenAt: now };
	it('matches word prefixes of the name and brand, ignoring case and accents', () => {
		expect(matchesHistorySearch(food, 'gaw')).toBe(true);
		expect(matchesHistorySearch(food, 'SABJI home')).toBe(true);
		expect(matchesHistorySearch({ ...food, productName: 'Café au lait' }, 'cafe')).toBe(true);
	});
	it('needs every typed word', () => {
		expect(matchesHistorySearch(food, 'gawar dal')).toBe(false);
		expect(matchesHistorySearch(food, 'abji')).toBe(false);
		expect(matchesHistorySearch(food, '  ')).toBe(false);
	});
});

describe('mealForTime', () => {
	const active = new Set(['breakfast', 'lunch', 'dinner']);
	const food = {
		meals: [
			{ mealId: 'dinner', minute: 21 * 60 },
			{ mealId: 'lunch', minute: 13 * 60 + 30 },
			{ mealId: 'old-meal', minute: 13 * 60 }
		]
	};
	it('picks the active meal logged nearest this time of day', () => {
		expect(mealForTime(food, active, new Date(2026, 10, 13, 12, 45))).toBe('lunch');
		expect(mealForTime(food, active, new Date(2026, 10, 13, 20, 0))).toBe('dinner');
	});
	it('wraps around midnight', () => {
		expect(mealForTime(food, active, new Date(2026, 10, 13, 0, 30))).toBe('dinner');
	});
	it('is null when the food was never logged in an active meal', () => {
		expect(mealForTime({ meals: [{ mealId: null, minute: 600 }] }, active, now)).toBeNull();
	});
});

describe('usualMealAt', () => {
	const active = new Set(['breakfast', 'lunch', 'dinner']);
	const at = (hour: number, minute = 0) => new Date(2026, 10, 13, hour, minute);
	const times = mealTimes([
		{ productName: 'Milk', eatenAt: at(8), mealId: 'breakfast' },
		{ productName: 'Chapati', eatenAt: at(13), mealId: 'lunch' },
		{ productName: 'Chapati', eatenAt: at(21), mealId: 'dinner' },
		{ productName: 'Dal', eatenAt: at(21, 30), mealId: 'dinner' },
		{ productName: 'Tea', eatenAt: at(20, 30), mealId: 'snacks' },
		{ productName: 'Tea', eatenAt: at(20, 45), mealId: 'snacks' },
		{ productName: 'Tea', eatenAt: at(20, 50), mealId: 'snacks' },
		{ productName: 'Water', eatenAt: at(21), mealId: null }
	]);

	it('picks the meal the user logs most near this time, whichever food it is', () => {
		// Milk was only ever breakfast, but logged again at 9 pm it goes into dinner.
		expect(usualMealAt(times, active, at(21))).toBe('dinner');
		expect(usualMealAt(times, active, at(7, 30))).toBe('breakfast');
	});
	it('skips meals that are no longer active', () => {
		expect(usualMealAt(times, new Set([...active, 'snacks']), at(20, 45))).toBe('snacks');
		expect(usualMealAt(times, active, at(20, 45))).toBe('dinner');
	});
	it('is null when nothing was logged near this time', () => {
		expect(usualMealAt(times, active, at(3))).toBeNull();
	});
});
