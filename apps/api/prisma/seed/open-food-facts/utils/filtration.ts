/**
 * Filtration logic for nutrition data
 * Only validates that all 4 required macros are present
 */

import type { ProcessedNutritionData } from './types.js';

/**
 * Check if record has all 4 required macros (100g only)
 * Requires: energy, carbs, protein, AND fat (all non-null and > 0)
 */
function hasRequiredMacros(record: ProcessedNutritionData): boolean {
	const hasEnergy = record.energyKcal_100g !== null && record.energyKcal_100g > 0;
	const hasCarbs = record.carbohydratesG_100g !== null && record.carbohydratesG_100g >= 0;
	const hasProtein = record.proteinsG_100g !== null && record.proteinsG_100g >= 0;
	const hasFat = record.fatG_100g !== null && record.fatG_100g >= 0;

	return hasEnergy && hasCarbs && hasProtein && hasFat;
}

/**
 * Check if record has basic required fields
 */
function hasRequiredFields(record: ProcessedNutritionData): boolean {
	return Boolean(record.code && record.code.trim()) &&
		Boolean(record.productName && record.productName.trim());
}

/**
 * Check if record should be imported
 * Requirements:
 * 1. Has valid code and product name
 * 2. Has all 4 required macros (energyKcal, proteinsG, fatG, carbohydratesG)
 */
export function isValidRecord(record: ProcessedNutritionData): boolean {
	if (!hasRequiredFields(record)) return false;
	return hasRequiredMacros(record);
}

/**
 * Sanitize a record by removing invalid entries
 * This ensures nulls are truly null and not NaN or Infinity
 */
export function sanitizeRecord(record: ProcessedNutritionData): ProcessedNutritionData {
	const sanitizeValue = (val: number | null): number | null => {
		if (val === null) return null;
		if (!isFinite(val) || val < 0) return null;
		return val;
	};

	const sanitizeString = (val: string | null): string | null => {
		if (!val || typeof val !== 'string') return null;
		const trimmed = val.trim();
		return trimmed.length > 0 ? trimmed : null;
	};

	return {
		code: sanitizeString(record.code) || '',
		productName: sanitizeString(record.productName) || '',
		brands: sanitizeString(record.brands),

		// Serving fields
		servingQuantity: sanitizeValue(record.servingQuantity),
		servingSize: sanitizeString(record.servingSize),

		// Data quality metrics
		completeness: sanitizeValue(record.completeness),
		uniqueScans: record.uniqueScans !== null && isFinite(record.uniqueScans) && record.uniqueScans >= 0 ? record.uniqueScans : null,

		// 100g macros (required)
		energyKcal_100g: sanitizeValue(record.energyKcal_100g),
		proteinsG_100g: sanitizeValue(record.proteinsG_100g),
		fatG_100g: sanitizeValue(record.fatG_100g),
		carbohydratesG_100g: sanitizeValue(record.carbohydratesG_100g),

		// 100g micronutrients (optional)
		saturatedFatG_100g: sanitizeValue(record.saturatedFatG_100g),
		unsaturatedFatG_100g: sanitizeValue(record.unsaturatedFatG_100g),
		monounsaturatedFatG_100g: sanitizeValue(record.monounsaturatedFatG_100g),
		polyunsaturatedFatG_100g: sanitizeValue(record.polyunsaturatedFatG_100g),
		transFatG_100g: sanitizeValue(record.transFatG_100g),
		cholesterolMg_100g: sanitizeValue(record.cholesterolMg_100g),
		sugarsG_100g: sanitizeValue(record.sugarsG_100g),
		polyolsG_100g: sanitizeValue(record.polyolsG_100g),
		fiberG_100g: sanitizeValue(record.fiberG_100g),
		saltG_100g: sanitizeValue(record.saltG_100g),
		sodiumMg_100g: sanitizeValue(record.sodiumMg_100g),
		alcoholG_100g: sanitizeValue(record.alcoholG_100g),
		vitaminAIU_100g: sanitizeValue(record.vitaminAIU_100g),
		vitaminDIU_100g: sanitizeValue(record.vitaminDIU_100g),
		vitaminEMg_100g: sanitizeValue(record.vitaminEMg_100g),
		vitaminKMcg_100g: sanitizeValue(record.vitaminKMcg_100g),
		vitaminCMg_100g: sanitizeValue(record.vitaminCMg_100g),
		vitaminB1Mg_100g: sanitizeValue(record.vitaminB1Mg_100g),
		vitaminB2Mg_100g: sanitizeValue(record.vitaminB2Mg_100g),
		vitaminB6Mg_100g: sanitizeValue(record.vitaminB6Mg_100g),
		vitaminB9Mcg_100g: sanitizeValue(record.vitaminB9Mcg_100g),
		folatesMcg_100g: sanitizeValue(record.folatesMcg_100g),
		vitaminB12Mcg_100g: sanitizeValue(record.vitaminB12Mcg_100g),
		potassiumMg_100g: sanitizeValue(record.potassiumMg_100g),
		calciumMg_100g: sanitizeValue(record.calciumMg_100g),
		phosphorusMg_100g: sanitizeValue(record.phosphorusMg_100g),
		ironMg_100g: sanitizeValue(record.ironMg_100g),
		magnesiumMg_100g: sanitizeValue(record.magnesiumMg_100g),
		zincMg_100g: sanitizeValue(record.zincMg_100g),
		copperMg_100g: sanitizeValue(record.copperMg_100g),
		manganeseMg_100g: sanitizeValue(record.manganeseMg_100g),
		caffeineMg_100g: sanitizeValue(record.caffeineMg_100g)
	};
}
