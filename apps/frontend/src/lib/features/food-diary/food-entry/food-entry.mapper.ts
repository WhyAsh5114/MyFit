import type { FoodEntryFormSchema } from '$lib/features/food-diary/food-entry/food-entry.schema';
import type { Prisma } from '@myfit/api/prisma/client';

const optionalNutrimentsMap = {
	saturated_fat: 'saturated_fat_100g',
	unsaturated_fat: 'unsaturated_fat_100g',
	monounsaturated_fat: 'monounsaturated_fat_100g',
	polyunsaturated_fat: 'polyunsaturated_fat_100g',
	trans_fat: 'trans_fat_100g',
	cholesterol: 'cholesterol_100g',
	sugars: 'sugars_100g',
	polyols: 'polyols_100g',
	fiber: 'fiber_100g',
	salt: 'salt_100g',
	sodium: 'sodium_100g',
	alcohol: 'alcohol_100g',
	vitamin_a: 'vitamin_a_100g',
	vitamin_d: 'vitamin_d_100g',
	vitamin_e: 'vitamin_e_100g',
	vitamin_k: 'vitamin_k_100g',
	vitamin_c: 'vitamin_c_100g',
	vitamin_b1: 'vitamin_b1_100g',
	vitamin_b2: 'vitamin_b2_100g',
	vitamin_b6: 'vitamin_b6_100g',
	vitamin_b9: 'vitamin_b9_100g',
	folates: 'folates_100g',
	vitamin_b12: 'vitamin_b12_100g',
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
	const factor = input.quantity / 100;

	return {
		product_name: input.product_name,
		brands: input.brands,
		eatenAt: input.eatenAt,
		quantity_g: input.quantity,
		userId,

		protein_g: round(input.proteins_100g * factor, 1),
		carbs_g: round(input.carbohydrates_100g * factor, 1),
		fat_g: round(input.fat_100g * factor, 1),
		energy_kcal: Math.round(input.energy_kcal_100g * factor),

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
