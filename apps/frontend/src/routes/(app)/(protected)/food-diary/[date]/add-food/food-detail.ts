import type { Row } from '@myfit/shared/client';

/** The fields of a logged entry that its one-line summary reads. */
export type FoodDetailEntry = Pick<
	Row<'FoodEntry'>,
	'brands' | 'energyKcal_100g' | 'quantityG' | 'preferredUnit' | 'servingQuantity' | 'servingSize'
>;

/** One line for a food in the user's history: brand, kcal and amount at its last quantity. */
export function foodDetail(entry: FoodDetailEntry) {
	const { brands, energyKcal_100g, quantityG, preferredUnit, servingQuantity, servingSize } = entry;
	const kcal = Math.round(energyKcal_100g * (quantityG / 100)).toLocaleString();
	const amount =
		preferredUnit === 'serving' && servingQuantity && servingSize
			? `${Math.round((quantityG / servingQuantity) * 10) / 10} × ${servingSize}`
			: `${Math.round(quantityG).toLocaleString()} g`;
	return [brands, `${kcal} kcal`, amount].filter(Boolean).join(' · ');
}
