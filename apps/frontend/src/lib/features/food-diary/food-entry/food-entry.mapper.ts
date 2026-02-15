import type { FoodEntryFormSchema } from '$lib/features/food-diary/food-entry/food-entry.schema';
import type { FoodEntry, Prisma } from '@myfit/api/prisma/client';
import { REQUIRED_NUTRIENTS, OPTIONAL_NUTRIENTS } from './nutrients.js';
import { round } from '$lib/my-utils.js';

export function foodEntryFormSchemaToFoodEntry(
	input: FoodEntryFormSchema,
	userId: string
): Prisma.FoodEntryUncheckedCreateInput {
	const multiplier = input.quantityG / 100;

	const requiredNutrients = Object.fromEntries(
		REQUIRED_NUTRIENTS.map((nutrient) => {
			const value = input[nutrient.nutritionDataKey];
			const scaledValue =
				typeof value === 'number'
					? nutrient.foodEntryKey === 'energyKcal'
						? Math.round(value * multiplier)
						: round(value * multiplier, 1)
					: 0;
			return [nutrient.foodEntryKey, scaledValue];
		})
	) as Record<(typeof REQUIRED_NUTRIENTS)[number]['foodEntryKey'], number>;

	const optionalNutrients = Object.fromEntries(
		OPTIONAL_NUTRIENTS.flatMap((nutrient) => {
			const value = input[nutrient.nutritionDataKey];
			return typeof value === 'number' ? [[nutrient.foodEntryKey, round(value * multiplier, 1)]] : [];
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

export function foodEntryToFoodEntryFormSchema(foodEntry: FoodEntry): FoodEntryFormSchema {
	const multiplier = 100 / foodEntry.quantityG;

	return {
		product_name: foodEntry.productName,
		brands: foodEntry.brands,
		eatenAt: foodEntry.eatenAt,
		quantityG: foodEntry.quantityG,

		...(Object.fromEntries(
			REQUIRED_NUTRIENTS.map((nutrient) => [
				nutrient.nutritionDataKey,
				foodEntry[nutrient.foodEntryKey] * multiplier
			])
		) as Record<(typeof REQUIRED_NUTRIENTS)[number]['nutritionDataKey'], number>),

		...(Object.fromEntries(
			OPTIONAL_NUTRIENTS.map((nutrient) => [
				nutrient.nutritionDataKey,
				foodEntry[nutrient.foodEntryKey] ? foodEntry[nutrient.foodEntryKey]! * multiplier : null
			])
		) as Record<(typeof OPTIONAL_NUTRIENTS)[number]['nutritionDataKey'], number | null>)
	};
}
