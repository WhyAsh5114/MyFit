import type { Row } from '@myfit/shared/client';
import { KCAL_PER_GRAM } from './constants.js';

/** A target in grams for each macro, or null for a macro without one. */
export type MacroGramTargets = {
	carbsG: number | null;
	fatG: number | null;
	proteinG: number | null;
};

type Targets = Pick<Row<'MacroTargets'>, 'carbsG' | 'fatG' | 'proteinG' | 'quantifier'>;

/**
 * Each macro's target in grams. Percentage targets are shares of the day's calories, so they grow
 * with the calories the day allows, and there are none without a calorie goal (`dayKcal` null).
 * Absolute targets stand on their own.
 */
export function macroGramTargets(
	targets: Targets | null,
	dayKcal: number | null
): MacroGramTargets {
	if (!targets) return { carbsG: null, fatG: null, proteinG: null };
	if (targets.quantifier === 'Absolute') {
		return { carbsG: targets.carbsG, fatG: targets.fatG, proteinG: targets.proteinG };
	}

	const grams = (percent: number | null, kcalPerGram: number) =>
		percent === null || dayKcal === null ? null : (dayKcal * percent) / 100 / kcalPerGram;
	return {
		carbsG: grams(targets.carbsG, KCAL_PER_GRAM.carbs),
		fatG: grams(targets.fatG, KCAL_PER_GRAM.fat),
		proteinG: grams(targets.proteinG, KCAL_PER_GRAM.protein)
	};
}
