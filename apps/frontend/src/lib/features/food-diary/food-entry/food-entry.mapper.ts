import type { FoodEntryFormSchema } from '$lib/features/food-diary/food-entry/food-entry.schema';
import type { Prisma } from '@myfit/api/prisma/client';

const optionalNutrimentsMap = {
	saturatedFat: 'saturated_fat_100g',
	unsaturatedFat: 'unsaturated_fat_100g',
	monounsaturatedFat: 'monounsaturated_fat_100g',
	polyunsaturatedFat: 'polyunsaturated_fat_100g',
	transFat: 'trans_fat_100g',
	cholesterol: 'cholesterol_100g',
	sugars: 'sugars_100g',
	polyols: 'polyols_100g',
	fiber: 'fiber_100g',
	salt: 'salt_100g',
	sodium: 'sodium_100g',
	alcohol: 'alcohol_100g',
	vitaminA: 'vitamin_a_100g',
	vitaminD: 'vitamin_d_100g',
	vitaminE: 'vitamin_e_100g',
	vitaminK: 'vitamin_k_100g',
	vitaminC: 'vitamin_c_100g',
	vitaminB1: 'vitamin_b1_100g',
	vitaminB2: 'vitamin_b2_100g',
	vitaminB6: 'vitamin_b6_100g',
	vitaminB9: 'vitamin_b9_100g',
	folates: 'folates_100g',
	vitaminB12: 'vitamin_b12_100g',
	potassium: 'potassium_100g',
	calcium: 'calcium_100g',
	phosphorus: 'phosphorus_100g',
	iron: 'iron_100g',
	magnesium: 'magnesium_100g',
	zinc: 'zinc_100g',
	copper: 'copper_100g',
	manganese: 'manganese_100g',
	caffeine: 'caffeine_100g'
} as const;

function round(value: number, decimals: number) {
	const factor = Math.pow(10, decimals);
	return Math.round(value * factor) / factor;
}

export function foodEntryFormSchemaToFoodEntry(
	input: FoodEntryFormSchema,
	userId: string
): Prisma.FoodEntryUncheckedCreateInput {
	const factor = input.quantityG / 100;

	return {
		productName: input.productName,
		brands: input.brands,
		eatenAt: input.eatenAt,
		quantityG: input.quantityG,
		userId,

		proteinG: round(input.proteins_100g * factor, 1),
		carbsG: round(input.carbohydrates_100g * factor, 1),
		fatG: round(input.fat_100g * factor, 1),
		energyKcal: Math.round(input.energy_kcal_100g * factor),

		...Object.entries(optionalNutrimentsMap).reduce(
			(acc, [key, value]) => {
				const inputKey = key as keyof typeof optionalNutrimentsMap;
				const valueKey =
					value as (typeof optionalNutrimentsMap)[keyof typeof optionalNutrimentsMap];
				const inputValue = input[valueKey];

				if (inputValue !== null) {
					acc[inputKey] = round(inputValue * factor, 1);
				}

				return acc;
			},
			{} as Record<keyof typeof optionalNutrimentsMap, number | null>
		)
	};
}
