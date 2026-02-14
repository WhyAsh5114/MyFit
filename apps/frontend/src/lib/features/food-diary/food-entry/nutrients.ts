import { AmphoraIcon, BeefIcon, FlameIcon, WheatIcon } from '@lucide/svelte';
import type { NutritionData, FoodEntry } from '@myfit/api/prisma/client';

/**
 * Single source of truth for nutrient field mappings
 * Type-checked against Prisma schema to catch drift at compile time
 */
export const REQUIRED_NUTRIENTS = [
	{
		nutritionDataKey: 'energy_kcal_100g' satisfies keyof NutritionData,
		foodEntryKey: 'energyKcal' satisfies keyof FoodEntry,
		label: 'Calories',
		unit: 'kcal',
		icon: FlameIcon
	},
	{
		nutritionDataKey: 'carbohydrates_100g' satisfies keyof NutritionData,
		foodEntryKey: 'carbsG' satisfies keyof FoodEntry,
		label: 'Carbs',
		unit: 'g',
		icon: WheatIcon
	},
	{
		nutritionDataKey: 'fat_100g' satisfies keyof NutritionData,
		foodEntryKey: 'fatG' satisfies keyof FoodEntry,
		label: 'Fat',
		unit: 'g',
		icon: AmphoraIcon
	},
	{
		nutritionDataKey: 'proteins_100g' satisfies keyof NutritionData,
		foodEntryKey: 'proteinG' satisfies keyof FoodEntry,
		label: 'Protein',
		unit: 'g',
		icon: BeefIcon
	}
] as const;

export const OPTIONAL_NUTRIENTS = [
	{
		nutritionDataKey: 'saturated_fat_100g' satisfies keyof NutritionData,
		foodEntryKey: 'saturatedFat' satisfies keyof FoodEntry,
		label: 'Saturated fat',
		unit: 'g'
	},
	{
		nutritionDataKey: 'unsaturated_fat_100g' satisfies keyof NutritionData,
		foodEntryKey: 'unsaturatedFat' satisfies keyof FoodEntry,
		label: 'Unsaturated fat',
		unit: 'g'
	},
	{
		nutritionDataKey: 'monounsaturated_fat_100g' satisfies keyof NutritionData,
		foodEntryKey: 'monounsaturatedFat' satisfies keyof FoodEntry,
		label: 'Monounsaturated fat',
		unit: 'g'
	},
	{
		nutritionDataKey: 'polyunsaturated_fat_100g' satisfies keyof NutritionData,
		foodEntryKey: 'polyunsaturatedFat' satisfies keyof FoodEntry,
		label: 'Polyunsaturated fat',
		unit: 'g'
	},
	{
		nutritionDataKey: 'trans_fat_100g' satisfies keyof NutritionData,
		foodEntryKey: 'transFat' satisfies keyof FoodEntry,
		label: 'Trans fat',
		unit: 'g'
	},
	{
		nutritionDataKey: 'cholesterol_100g' satisfies keyof NutritionData,
		foodEntryKey: 'cholesterol' satisfies keyof FoodEntry,
		label: 'Cholesterol',
		unit: 'mg'
	},
	{
		nutritionDataKey: 'sugars_100g' satisfies keyof NutritionData,
		foodEntryKey: 'sugars' satisfies keyof FoodEntry,
		label: 'Sugars',
		unit: 'g'
	},
	{
		nutritionDataKey: 'polyols_100g' satisfies keyof NutritionData,
		foodEntryKey: 'polyols' satisfies keyof FoodEntry,
		label: 'Polyols',
		unit: 'g'
	},
	{
		nutritionDataKey: 'fiber_100g' satisfies keyof NutritionData,
		foodEntryKey: 'fiber' satisfies keyof FoodEntry,
		label: 'Fiber',
		unit: 'g'
	},
	{
		nutritionDataKey: 'salt_100g' satisfies keyof NutritionData,
		foodEntryKey: 'salt' satisfies keyof FoodEntry,
		label: 'Salt',
		unit: 'g'
	},
	{
		nutritionDataKey: 'sodium_100g' satisfies keyof NutritionData,
		foodEntryKey: 'sodium' satisfies keyof FoodEntry,
		label: 'Sodium',
		unit: 'mg'
	},
	{
		nutritionDataKey: 'alcohol_100g' satisfies keyof NutritionData,
		foodEntryKey: 'alcohol' satisfies keyof FoodEntry,
		label: 'Alcohol',
		unit: 'g'
	},
	{
		nutritionDataKey: 'vitamin_a_100g' satisfies keyof NutritionData,
		foodEntryKey: 'vitaminA' satisfies keyof FoodEntry,
		label: 'Vitamin A',
		unit: 'IU'
	},
	{
		nutritionDataKey: 'vitamin_d_100g' satisfies keyof NutritionData,
		foodEntryKey: 'vitaminD' satisfies keyof FoodEntry,
		label: 'Vitamin D',
		unit: 'IU'
	},
	{
		nutritionDataKey: 'vitamin_e_100g' satisfies keyof NutritionData,
		foodEntryKey: 'vitaminE' satisfies keyof FoodEntry,
		label: 'Vitamin E',
		unit: 'mg'
	},
	{
		nutritionDataKey: 'vitamin_k_100g' satisfies keyof NutritionData,
		foodEntryKey: 'vitaminK' satisfies keyof FoodEntry,
		label: 'Vitamin K',
		unit: 'µg'
	},
	{
		nutritionDataKey: 'vitamin_c_100g' satisfies keyof NutritionData,
		foodEntryKey: 'vitaminC' satisfies keyof FoodEntry,
		label: 'Vitamin C',
		unit: 'mg'
	},
	{
		nutritionDataKey: 'vitamin_b1_100g' satisfies keyof NutritionData,
		foodEntryKey: 'vitaminB1' satisfies keyof FoodEntry,
		label: 'Vitamin B1',
		unit: 'mg'
	},
	{
		nutritionDataKey: 'vitamin_b2_100g' satisfies keyof NutritionData,
		foodEntryKey: 'vitaminB2' satisfies keyof FoodEntry,
		label: 'Vitamin B2',
		unit: 'mg'
	},
	{
		nutritionDataKey: 'vitamin_b6_100g' satisfies keyof NutritionData,
		foodEntryKey: 'vitaminB6' satisfies keyof FoodEntry,
		label: 'Vitamin B6',
		unit: 'mg'
	},
	{
		nutritionDataKey: 'vitamin_b9_100g' satisfies keyof NutritionData,
		foodEntryKey: 'vitaminB9' satisfies keyof FoodEntry,
		label: 'Vitamin B9',
		unit: 'µg'
	},
	{
		nutritionDataKey: 'folates_100g' satisfies keyof NutritionData,
		foodEntryKey: 'folates' satisfies keyof FoodEntry,
		label: 'Folates',
		unit: 'µg'
	},
	{
		nutritionDataKey: 'vitamin_b12_100g' satisfies keyof NutritionData,
		foodEntryKey: 'vitaminB12' satisfies keyof FoodEntry,
		label: 'Vitamin B12',
		unit: 'µg'
	},
	{
		nutritionDataKey: 'potassium_100g' satisfies keyof NutritionData,
		foodEntryKey: 'potassium' satisfies keyof FoodEntry,
		label: 'Potassium',
		unit: 'mg'
	},
	{
		nutritionDataKey: 'calcium_100g' satisfies keyof NutritionData,
		foodEntryKey: 'calcium' satisfies keyof FoodEntry,
		label: 'Calcium',
		unit: 'mg'
	},
	{
		nutritionDataKey: 'phosphorus_100g' satisfies keyof NutritionData,
		foodEntryKey: 'phosphorus' satisfies keyof FoodEntry,
		label: 'Phosphorus',
		unit: 'mg'
	},
	{
		nutritionDataKey: 'iron_100g' satisfies keyof NutritionData,
		foodEntryKey: 'iron' satisfies keyof FoodEntry,
		label: 'Iron',
		unit: 'mg'
	},
	{
		nutritionDataKey: 'magnesium_100g' satisfies keyof NutritionData,
		foodEntryKey: 'magnesium' satisfies keyof FoodEntry,
		label: 'Magnesium',
		unit: 'mg'
	},
	{
		nutritionDataKey: 'zinc_100g' satisfies keyof NutritionData,
		foodEntryKey: 'zinc' satisfies keyof FoodEntry,
		label: 'Zinc',
		unit: 'mg'
	},
	{
		nutritionDataKey: 'copper_100g' satisfies keyof NutritionData,
		foodEntryKey: 'copper' satisfies keyof FoodEntry,
		label: 'Copper',
		unit: 'mg'
	},
	{
		nutritionDataKey: 'manganese_100g' satisfies keyof NutritionData,
		foodEntryKey: 'manganese' satisfies keyof FoodEntry,
		label: 'Manganese',
		unit: 'mg'
	},
	{
		nutritionDataKey: 'caffeine_100g' satisfies keyof NutritionData,
		foodEntryKey: 'caffeine' satisfies keyof FoodEntry,
		label: 'Caffeine',
		unit: 'mg'
	}
] as const;
