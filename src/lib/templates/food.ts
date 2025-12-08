import type { NutritionData } from '$lib/generated/prisma/client';
import { capitalizeWords, snakeToNormal } from '$lib/my-utils';

function getNutrimentLabels(sampleData: NutritionData) {
	const { id, code, product_name, brands, ...nutriments } = sampleData;
	const { energy_kcal_100g, proteins_100g, carbohydrates_100g, fat_100g, ...others } = nutriments;

	return Object.keys(others).map((key) => capitalizeWords(snakeToNormal(key).slice(0, -4)));
}

export const sampleNutritionData = {
	id: 1,
	code: '2',
	product_name: 'Filets de poulet blanc x2',
	brands: 'SoLo',
	energy_kcal_100g: 141,
	proteins_100g: 30,
	fat_100g: 2.7,
	carbohydrates_100g: 0.9,
	saturated_fat_100g: 0.6,
	unsaturated_fat_100g: null,
	monounsaturated_fat_100g: 0,
	polyunsaturated_fat_100g: 0,
	trans_fat_100g: 0,
	cholesterol_100g: 0,
	sugars_100g: 6.2,
	polyols_100g: null,
	fiber_100g: 2.2,
	salt_100g: 0.4,
	sodium_100g: 0.16,
	alcohol_100g: null,
	vitamin_a_100g: 0,
	vitamin_d_100g: null,
	vitamin_e_100g: null,
	vitamin_k_100g: null,
	vitamin_c_100g: 0,
	vitamin_b1_100g: null,
	vitamin_b2_100g: null,
	vitamin_b6_100g: null,
	vitamin_b9_100g: null,
	folates_100g: null,
	vitamin_b12_100g: null,
	potassium_100g: 0,
	calcium_100g: null,
	phosphorus_100g: null,
	iron_100g: 0,
	magnesium_100g: null,
	zinc_100g: null,
	copper_100g: null,
	manganese_100g: null,
	caffeine_100g: null
} satisfies NutritionData;

export const nutrimentLabels = getNutrimentLabels(sampleNutritionData);
