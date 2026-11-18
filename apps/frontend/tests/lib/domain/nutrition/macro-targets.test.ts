import { describe, expect, it } from 'vitest';
import { macroGramTargets } from '#lib/domain/nutrition/macro-targets.js';

describe('macroGramTargets', () => {
	it('turns percentages into grams of the day’s calories', () => {
		// 2,000 kcal: 50% carbs is 250 g, 30% fat is about 66.7 g, 20% protein is 100 g.
		const grams = macroGramTargets(
			{ carbsG: 50, fatG: 30, proteinG: 20, quantifier: 'Percentage' },
			2000
		);

		expect(grams.carbsG).toBe(250);
		expect(grams.fatG).toBeCloseTo(66.67);
		expect(grams.proteinG).toBe(100);
	});

	it('keeps absolute targets as they are', () => {
		expect(
			macroGramTargets({ carbsG: 230, fatG: 70, proteinG: 150, quantifier: 'Absolute' }, 2000)
		).toEqual({ carbsG: 230, fatG: 70, proteinG: 150 });
	});

	it('leaves a macro without a target empty', () => {
		const grams = macroGramTargets(
			{ carbsG: null, fatG: 30, proteinG: 40, quantifier: 'Percentage' },
			2000
		);

		expect(grams.carbsG).toBeNull();
		expect(macroGramTargets(null, 2000)).toEqual({ carbsG: null, fatG: null, proteinG: null });
	});

	it('keeps absolute targets but drops percentages without a calorie goal', () => {
		expect(
			macroGramTargets({ carbsG: 230, fatG: 70, proteinG: 150, quantifier: 'Absolute' }, null)
		).toEqual({ carbsG: 230, fatG: 70, proteinG: 150 });
		expect(
			macroGramTargets({ carbsG: 50, fatG: 30, proteinG: 20, quantifier: 'Percentage' }, null)
		).toEqual({ carbsG: null, fatG: null, proteinG: null });
	});
});
