import type { FoodEntryFormSchema } from '$lib/features/food-diary/food-entry/food-entry.schema';
import type { Prisma } from '@myfit/api/prisma/client';
import { REQUIRED_NUTRIENTS, OPTIONAL_NUTRIENTS } from './nutrients.js';

function round(value: number, decimals: number) {
	const factor = Math.pow(10, decimals);
	return Math.round(value * factor) / factor;
}

export function foodEntryFormSchemaToFoodEntry(
	input: FoodEntryFormSchema,
	userId: string
): Prisma.FoodEntryUncheckedCreateInput {
	const factor = input.quantityG / 100;

	const requiredNutrients = Object.fromEntries(
		REQUIRED_NUTRIENTS.map((nutrient) => {
			const value = input[nutrient.nutritionDataKey];
			const scaledValue =
				typeof value === 'number'
					? nutrient.foodEntryKey === 'energyKcal'
						? Math.round(value * factor)
						: round(value * factor, 1)
					: 0;
			return [nutrient.foodEntryKey, scaledValue];
		})
	) as Record<(typeof REQUIRED_NUTRIENTS)[number]['foodEntryKey'], number>;

	const optionalNutrients = Object.fromEntries(
		OPTIONAL_NUTRIENTS.flatMap((nutrient) => {
			const value = input[nutrient.nutritionDataKey];
			return typeof value === 'number' ? [[nutrient.foodEntryKey, round(value * factor, 1)]] : [];
		})
	) as Record<(typeof OPTIONAL_NUTRIENTS)[number]['foodEntryKey'], number>;

	return {
		productName: input.product_name,
		brands: input.brands,
		eatenAt: input.eatenAt,
		quantityG: input.quantityG,
		userId,

		...requiredNutrients,
		...optionalNutrients
	};
}
