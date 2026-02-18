import { AmphoraIcon, BeefIcon, FlameIcon, WheatIcon } from '@lucide/svelte';
import type { NutritionData, FoodEntry } from '@myfit/api/prisma/client';

/**
 * Single source of truth for nutrient field mappings
 * Type-checked against Prisma schema to catch drift at compile time
 */
export const REQUIRED_NUTRIENTS = [
	{
		key: 'energyKcal_100g' satisfies keyof NutritionData & keyof FoodEntry,
		label: 'Calories',
		unit: 'kcal',
		icon: FlameIcon
	},
	{
		key: 'carbohydratesG_100g' satisfies keyof NutritionData & keyof FoodEntry,
		label: 'Carbs',
		unit: 'g',
		icon: WheatIcon
	},
	{
		key: 'fatG_100g' satisfies keyof NutritionData & keyof FoodEntry,
		label: 'Fat',
		unit: 'g',
		icon: AmphoraIcon
	},
	{
		key: 'proteinsG_100g' satisfies keyof NutritionData & keyof FoodEntry,
		label: 'Protein',
		unit: 'g',
		icon: BeefIcon
	}
] as const;

export const OPTIONAL_NUTRIENTS = [
	{
		key: 'saturatedFatG_100g' satisfies keyof NutritionData & keyof FoodEntry,
		label: 'Saturated fat',
		unit: 'g'
	},
	{
		key: 'unsaturatedFatG_100g' satisfies keyof NutritionData & keyof FoodEntry,
		label: 'Unsaturated fat',
		unit: 'g'
	},
	{
		key: 'monounsaturatedFatG_100g' satisfies keyof NutritionData & keyof FoodEntry,
		label: 'Monounsaturated fat',
		unit: 'g'
	},
	{
		key: 'polyunsaturatedFatG_100g' satisfies keyof NutritionData & keyof FoodEntry,
		label: 'Polyunsaturated fat',
		unit: 'g'
	},
	{
		key: 'transFatG_100g' satisfies keyof NutritionData & keyof FoodEntry,
		label: 'Trans fat',
		unit: 'g'
	},
	{
		key: 'cholesterolMg_100g' satisfies keyof NutritionData & keyof FoodEntry,
		label: 'Cholesterol',
		unit: 'mg'
	},
	{
		key: 'sugarsG_100g' satisfies keyof NutritionData & keyof FoodEntry,
		label: 'Sugars',
		unit: 'g'
	},
	{
		key: 'polyolsG_100g' satisfies keyof NutritionData & keyof FoodEntry,
		label: 'Polyols',
		unit: 'g'
	},
	{
		key: 'fiberG_100g' satisfies keyof NutritionData & keyof FoodEntry,
		label: 'Fiber',
		unit: 'g'
	},
	{
		key: 'saltG_100g' satisfies keyof NutritionData & keyof FoodEntry,
		label: 'Salt',
		unit: 'g'
	},
	{
		key: 'sodiumMg_100g' satisfies keyof NutritionData & keyof FoodEntry,
		label: 'Sodium',
		unit: 'mg'
	},
	{
		key: 'alcoholG_100g' satisfies keyof NutritionData & keyof FoodEntry,
		label: 'Alcohol',
		unit: 'g'
	},
	{
		key: 'vitaminAIU_100g' satisfies keyof NutritionData & keyof FoodEntry,
		label: 'Vitamin A',
		unit: 'IU'
	},
	{
		key: 'vitaminDIU_100g' satisfies keyof NutritionData & keyof FoodEntry,
		label: 'Vitamin D',
		unit: 'IU'
	},
	{
		key: 'vitaminEMg_100g' satisfies keyof NutritionData & keyof FoodEntry,
		label: 'Vitamin E',
		unit: 'mg'
	},
	{
		key: 'vitaminKMcg_100g' satisfies keyof NutritionData & keyof FoodEntry,
		label: 'Vitamin K',
		unit: 'µg'
	},
	{
		key: 'vitaminCMg_100g' satisfies keyof NutritionData & keyof FoodEntry,
		label: 'Vitamin C',
		unit: 'mg'
	},
	{
		key: 'vitaminB1Mg_100g' satisfies keyof NutritionData & keyof FoodEntry,
		label: 'Vitamin B1',
		unit: 'mg'
	},
	{
		key: 'vitaminB2Mg_100g' satisfies keyof NutritionData & keyof FoodEntry,
		label: 'Vitamin B2',
		unit: 'mg'
	},
	{
		key: 'vitaminB6Mg_100g' satisfies keyof NutritionData & keyof FoodEntry,
		label: 'Vitamin B6',
		unit: 'mg'
	},
	{
		key: 'vitaminB9Mcg_100g' satisfies keyof NutritionData & keyof FoodEntry,
		label: 'Vitamin B9',
		unit: 'µg'
	},
	{
		key: 'folatesMcg_100g' satisfies keyof NutritionData & keyof FoodEntry,
		label: 'Folates',
		unit: 'µg'
	},
	{
		key: 'vitaminB12Mcg_100g' satisfies keyof NutritionData & keyof FoodEntry,
		label: 'Vitamin B12',
		unit: 'µg'
	},
	{
		key: 'potassiumMg_100g' satisfies keyof NutritionData & keyof FoodEntry,
		label: 'Potassium',
		unit: 'mg'
	},
	{
		key: 'calciumMg_100g' satisfies keyof NutritionData & keyof FoodEntry,
		label: 'Calcium',
		unit: 'mg'
	},
	{
		key: 'phosphorusMg_100g' satisfies keyof NutritionData & keyof FoodEntry,
		label: 'Phosphorus',
		unit: 'mg'
	},
	{
		key: 'ironMg_100g' satisfies keyof NutritionData & keyof FoodEntry,
		label: 'Iron',
		unit: 'mg'
	},
	{
		key: 'magnesiumMg_100g' satisfies keyof NutritionData & keyof FoodEntry,
		label: 'Magnesium',
		unit: 'mg'
	},
	{
		key: 'zincMg_100g' satisfies keyof NutritionData & keyof FoodEntry,
		label: 'Zinc',
		unit: 'mg'
	},
	{
		key: 'copperMg_100g' satisfies keyof NutritionData & keyof FoodEntry,
		label: 'Copper',
		unit: 'mg'
	},
	{
		key: 'manganeseMg_100g' satisfies keyof NutritionData & keyof FoodEntry,
		label: 'Manganese',
		unit: 'mg'
	},
	{
		key: 'caffeineMg_100g' satisfies keyof NutritionData & keyof FoodEntry,
		label: 'Caffeine',
		unit: 'mg'
	}
] as const;
