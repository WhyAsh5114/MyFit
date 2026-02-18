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
			const value = input[nutrient.key satisfies keyof FoodEntryFormSchema];
			const scaledValue =
				typeof value === 'number'
					? nutrient.key === 'energyKcal_100g'
						? Math.round(value * multiplier)
						: round(value * multiplier, 1)
					: 0;
			return [nutrient.key, scaledValue];
		})
	) as Record<(typeof REQUIRED_NUTRIENTS)[number]['key'], number>;

	const optionalNutrients = Object.fromEntries(
		OPTIONAL_NUTRIENTS.flatMap((nutrient) => {
			const value = input[nutrient.key satisfies keyof FoodEntryFormSchema];
			return typeof value === 'number' ? [[nutrient.key, round(value * multiplier, 1)]] : [];
		})
	) as Record<(typeof OPTIONAL_NUTRIENTS)[number]['key'], number>;

	return {
		productName: input.productName,
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
		productName: foodEntry.productName,
		brands: foodEntry.brands,
		eatenAt: foodEntry.eatenAt,
		quantityG: foodEntry.quantityG,

		...(Object.fromEntries(
			REQUIRED_NUTRIENTS.map((nutrient) => [
				nutrient.key,
				(foodEntry[nutrient.key]) * multiplier
			])
		) as Record<(typeof REQUIRED_NUTRIENTS)[number]['key'], number>),

		...(Object.fromEntries(
			OPTIONAL_NUTRIENTS.map((nutrient) => [
				nutrient.key,
				foodEntry[nutrient.key] ? (foodEntry[nutrient.key] as number) * multiplier : null
			])
		) as Record<(typeof OPTIONAL_NUTRIENTS)[number]['key'], number | null>)
	};
}
