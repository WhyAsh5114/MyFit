/**
 * Unit conversion utilities
 * Converts nutrition data to canonical units (mg, IU, mcg, etc.)
 */

import type { ProcessedNutritionData, RawNutritionData } from './types.js';

/**
 * Maps of unit conversions by nutrient
 * Key format: "nutrient_baseUnit" -> conversion factor and target unit
 */
const UNIT_CONVERSIONS: Record<string, { factor: number; unit: string }> = {
	// Cholesterol conversions
	'cholesterol_mg': { factor: 1, unit: 'mg' },
	'cholesterol_g': { factor: 1000, unit: 'mg' },

	// Sodium conversions
	'sodium_mg': { factor: 1, unit: 'mg' },
	'sodium_g': { factor: 1000, unit: 'mg' },

	// Vitamin A conversions (to IU)
	'vitaminA_iu': { factor: 1, unit: 'IU' },
	'vitaminA_mcg': { factor: 3.33, unit: 'IU' }, // 1 mcg RAE = 3.33 IU
	'vitaminA_rae': { factor: 3.33, unit: 'IU' },

	// Vitamin D conversions (to IU)
	'vitaminD_iu': { factor: 1, unit: 'IU' },
	'vitaminD_mcg': { factor: 40, unit: 'IU' }, // 1 mcg = 40 IU

	// Vitamin E conversions (to mg)
	'vitaminE_mg': { factor: 1, unit: 'mg' },
	'vitaminE_iu': { factor: 0.67, unit: 'mg' }, // 1 IU = 0.67 mg

	// Vitamin K conversions (to mcg)
	'vitaminK_mcg': { factor: 1, unit: 'mcg' },
	'vitaminK_ng': { factor: 0.001, unit: 'mcg' },

	// Vitamin C conversions (to mg)
	'vitaminC_mg': { factor: 1, unit: 'mg' },
	'vitaminC_g': { factor: 1000, unit: 'mg' },

	// B vitamins in mg
	'vitaminB1_mg': { factor: 1, unit: 'mg' },
	'vitaminB2_mg': { factor: 1, unit: 'mg' },
	'vitaminB6_mg': { factor: 1, unit: 'mg' },
	'vitaminB6_mcg': { factor: 0.001, unit: 'mg' },

	// Folate conversions (to mcg)
	'vitaminB9_mcg': { factor: 1, unit: 'mcg' },
	'vitaminB9_ng': { factor: 0.001, unit: 'mcg' },
	'folates_mcg': { factor: 1, unit: 'mcg' },
	'folates_ng': { factor: 0.001, unit: 'mcg' },

	// Vitamin B12 conversions (to mcg)
	'vitaminB12_mcg': { factor: 1, unit: 'mcg' },
	'vitaminB12_ng': { factor: 0.001, unit: 'mcg' },
	'vitaminB12_pg': { factor: 0.000001, unit: 'mcg' },

	// Minerals in mg
	'potassium_mg': { factor: 1, unit: 'mg' },
	'potassium_g': { factor: 1000, unit: 'mg' },
	'calcium_mg': { factor: 1, unit: 'mg' },
	'calcium_g': { factor: 1000, unit: 'mg' },
	'phosphorus_mg': { factor: 1, unit: 'mg' },
	'phosphorus_g': { factor: 1000, unit: 'mg' },
	'iron_mg': { factor: 1, unit: 'mg' },
	'iron_g': { factor: 1000, unit: 'mg' },
	'magnesium_mg': { factor: 1, unit: 'mg' },
	'magnesium_g': { factor: 1000, unit: 'mg' },
	'zinc_mg': { factor: 1, unit: 'mg' },
	'zinc_g': { factor: 1000, unit: 'mg' },
	'copper_mg': { factor: 1, unit: 'mg' },
	'copper_mcg': { factor: 0.001, unit: 'mg' },
	'manganese_mg': { factor: 1, unit: 'mg' },
	'manganese_mcg': { factor: 0.001, unit: 'mg' },
	'caffeine_mg': { factor: 1, unit: 'mg' },
	'caffeine_g': { factor: 1000, unit: 'mg' }
};

/**
 * Detects unit from field name (e.g., "vitamin_a_100g" -> detect if it's in IU, mcg, etc.)
 * This is a heuristic based on Open Food Facts patterns
 */
function detectSourceUnit(fieldName: string, value: string | number): string {
	const numVal = typeof value === 'string' ? parseFloat(value) : value;

	if (!isFinite(numVal)) return 'unknown';

	// For very small values in fields like vitamins, likely micrograms or IU
	const nutrient = fieldName.toLowerCase();

	// Vitamin D and A are often in IU in OpenFoodFacts
	if (nutrient.includes('vitamin_d') || nutrient.includes('vitamin-d')) return 'iu';
	if (nutrient.includes('vitamin_a') || nutrient.includes('vitamin-a')) return 'iu';

	// Vitamin K typically in mcg
	if (nutrient.includes('vitamin_k') || nutrient.includes('vitamin-k')) return 'mcg';

	// B vitamins and C in mg typically
	if (
		nutrient.includes('vitamin_b') ||
		nutrient.includes('vitamin-b') ||
		nutrient.includes('vitamin_c') ||
		nutrient.includes('vitamin-c')
	)
		return 'mg';

	// Folate in mcg
	if (nutrient.includes('folate')) return 'mcg';

	// B12 in mcg
	if (nutrient.includes('vitamin_b12') || nutrient.includes('vitamin-b12')) return 'mcg';

	// Minerals typically in mg
	if (
		nutrient.includes('calcium') ||
		nutrient.includes('phosphorus') ||
		nutrient.includes('magnesium') ||
		nutrient.includes('potassium') ||
		nutrient.includes('iron') ||
		nutrient.includes('zinc') ||
		nutrient.includes('copper') ||
		nutrient.includes('manganese')
	)
		return 'mg';

	// Cholesterol and sodium in mg
	if (nutrient.includes('cholesterol') || nutrient.includes('sodium')) return 'mg';

	// Caffeine in mg
	if (nutrient.includes('caffeine')) return 'mg';

	// Everything else: macros are in grams
	return 'g';
}

/**
 * Convert a value from source unit to target unit
 */
function convertUnit(
	value: number,
	sourceUnit: string,
	nutrient: string
): { value: number; unit: string } {
	const key = `${nutrient}_${sourceUnit}`;
	const conversion = UNIT_CONVERSIONS[key];

	if (!conversion) {
		// If no conversion found, assume it's already in canonical form
		return { value, unit: sourceUnit };
	}

	return {
		value: parseFloat((value * conversion.factor).toFixed(6)),
		unit: conversion.unit
	};
}

/**
 * Extract numeric value and handle special cases
 */
export function parseNutrientValue(
	rawValue: string | number | undefined,
	fieldName: string
): number | null {
	if (!rawValue || rawValue === '') return null;

	const numVal = typeof rawValue === 'string' ? parseFloat(rawValue) : rawValue;

	if (!isFinite(numVal) || numVal < 0) return null;

	return numVal;
}

/**
 * Convert nutrient value to canonical units
 * Returns the converted value and target unit name in the field
 */
export function convertNutrientValue(
	rawValue: string | undefined,
	fieldName: string
): number | null {
	if (!rawValue || rawValue === '') return null;

	const numVal = parseFloat(rawValue);
	if (!isFinite(numVal) || numVal < 0) return null;

	const sourceUnit = detectSourceUnit(fieldName, numVal);
	const nutrient = fieldName
		.replace(/_100g$/, '')
		.replace(/_serving$/, '')
		.replace(/-/g, '_')
		.toLowerCase();

	const { value } = convertUnit(numVal, sourceUnit, nutrient);
	return value;
}

/**
 * Calculate unsaturated fat if not provided
 */
export function calculateUnsaturatedFat(
	totalFat: number | null,
	saturatedFat: number | null
): number | null {
	if (totalFat !== null && saturatedFat !== null && totalFat >= saturatedFat) {
		return parseFloat((totalFat - saturatedFat).toFixed(2));
	}
	return null;
}
