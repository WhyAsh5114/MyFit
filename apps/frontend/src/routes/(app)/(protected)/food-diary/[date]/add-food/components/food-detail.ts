import type { Row } from '@myfit/shared/client';
import { forQuantity } from '#lib/domain/nutrition/portion.js';
import { formatNumber } from '#lib/format.js';

/** The fields of a logged entry that its one-line summary reads. */
export type FoodDetailEntry = Pick<
	Row<'FoodEntry'>,
	'brands' | 'energyKcal_100g' | 'quantityG' | 'preferredUnit' | 'servingQuantity' | 'servingSize'
>;

/** One line for a food in the user's history: brand, kcal and amount at its last quantity. */
export function foodDetail(entry: FoodDetailEntry) {
	const { brands, energyKcal_100g, quantityG, preferredUnit, servingQuantity, servingSize } = entry;
	const kcal = formatNumber(forQuantity(energyKcal_100g, quantityG));
	const amount =
		preferredUnit === 'serving' && servingQuantity && servingSize
			? `${Math.round((quantityG / servingQuantity) * 10) / 10} × ${servingSize}`
			: `${formatNumber(quantityG)} g`;
	return [brands, `${kcal} kcal`, amount].filter(Boolean).join(' · ');
}
