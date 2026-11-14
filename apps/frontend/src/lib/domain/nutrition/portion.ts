import type { Row } from '@myfit/shared/client';

/** A food's macros per 100 g, as foods and food entries store them. */
export type MacrosPer100g = Pick<
	Row<'FoodEntry'>,
	'energyKcal_100g' | 'carbohydratesG_100g' | 'fatG_100g' | 'proteinsG_100g'
>;

/** Macros for an amount eaten. */
export type Macros = { kcal: number; carbsG: number; fatG: number; proteinG: number };

/** A per-100 g value scaled to `quantityG` grams. */
export const forQuantity = (per100g: number, quantityG: number) => (per100g * quantityG) / 100;

/** The macros in `quantityG` grams of `food`. Unrounded. */
export function macrosFor(food: MacrosPer100g, quantityG: number): Macros {
	return {
		kcal: forQuantity(food.energyKcal_100g, quantityG),
		carbsG: forQuantity(food.carbohydratesG_100g, quantityG),
		fatG: forQuantity(food.fatG_100g, quantityG),
		proteinG: forQuantity(food.proteinsG_100g, quantityG)
	};
}

/** The macros eaten across `entries`, each scaled by its own quantity. Unrounded. */
export function totalMacros(
	entries: (MacrosPer100g & Pick<Row<'FoodEntry'>, 'quantityG'>)[]
): Macros {
	const total: Macros = { kcal: 0, carbsG: 0, fatG: 0, proteinG: 0 };
	for (const entry of entries) {
		const macros = macrosFor(entry, entry.quantityG);
		total.kcal += macros.kcal;
		total.carbsG += macros.carbsG;
		total.fatG += macros.fatG;
		total.proteinG += macros.proteinG;
	}
	return total;
}
