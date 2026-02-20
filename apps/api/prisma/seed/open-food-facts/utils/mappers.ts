/**
 * Mappers for transforming raw OpenFoodFacts data to ProcessedNutritionData
 * Only extracts 100g nutrients (no serving calculations)
 */

import type { ProcessedNutritionData, RawNutritionData } from './types.js';
import { parseNutrientValue, calculateUnsaturatedFat } from './unit-conversion.js';

/**
 * Map raw CSV field names to processed field names and values
 * Only processes 100g data, all values are direct numeric extracts (no unit conversion)
 */
export function mapRawToProcessed(raw: RawNutritionData): ProcessedNutritionData {
	// Helper to safely parse numeric values
	const parseValue = (val: string | number | undefined): number | null => {
		if (!val || val === '') return null;
		const numVal = typeof val === 'string' ? parseFloat(val) : val;
		return isFinite(numVal) && numVal >= 0 ? numVal : null;
	};

	// 100g macros
	const fatG_100g = parseValue(raw.fat_100g);
	const saturatedFatG_100g = parseValue(raw['saturated-fat_100g']);
	const unsaturatedFatG_100g_calc = calculateUnsaturatedFat(fatG_100g, saturatedFatG_100g);

	return {
		code: raw.code,
		productName: raw.product_name,
		brands: raw.brands || null,

		// Serving fields
		servingQuantity: raw.serving_quantity ? parseFloat(String(raw.serving_quantity)) : null,
		servingSize: raw.serving_size || null,

		// Data quality metrics
		completeness: parseValue(raw.completeness),
		uniqueScans: raw.unique_scans_n ? Math.round(parseFloat(String(raw.unique_scans_n))) : null,

		// 100g macros (required)
		energyKcal_100g: parseValue(raw['energy-kcal_100g']),
		proteinsG_100g: parseValue(raw.proteins_100g),
		fatG_100g,
		carbohydratesG_100g: parseValue(raw.carbohydrates_100g),

		// 100g micronutrients (optional)
		saturatedFatG_100g,
		unsaturatedFatG_100g: unsaturatedFatG_100g_calc ?? parseValue(raw['unsaturated-fat_100g']),
		monounsaturatedFatG_100g: parseValue(raw['monounsaturated-fat_100g']),
		polyunsaturatedFatG_100g: parseValue(raw['polyunsaturated-fat_100g']),
		transFatG_100g: parseValue(raw['trans-fat_100g']),
		cholesterolMg_100g: parseValue(raw.cholesterol_100g),
		sugarsG_100g: parseValue(raw.sugars_100g),
		polyolsG_100g: parseValue(raw.polyols_100g),
		fiberG_100g: parseValue(raw.fiber_100g),
		saltG_100g: parseValue(raw.salt_100g),
		sodiumMg_100g: parseValue(raw.sodium_100g),
		alcoholG_100g: parseValue(raw.alcohol_100g),
		vitaminAIU_100g: parseValue(raw['vitamin-a_100g']),
		vitaminDIU_100g: parseValue(raw['vitamin-d_100g']),
		vitaminEMg_100g: parseValue(raw['vitamin-e_100g']),
		vitaminKMcg_100g: parseValue(raw['vitamin-k_100g']),
		vitaminCMg_100g: parseValue(raw['vitamin-c_100g']),
		vitaminB1Mg_100g: parseValue(raw['vitamin-b1_100g']),
		vitaminB2Mg_100g: parseValue(raw['vitamin-b2_100g']),
		vitaminB6Mg_100g: parseValue(raw['vitamin-b6_100g']),
		vitaminB9Mcg_100g: parseValue(raw['vitamin-b9_100g']),
		folatesMcg_100g: parseValue(raw.folates_100g),
		vitaminB12Mcg_100g: parseValue(raw['vitamin-b12_100g']),
		potassiumMg_100g: parseValue(raw.potassium_100g),
		calciumMg_100g: parseValue(raw.calcium_100g),
		phosphorusMg_100g: parseValue(raw.phosphorus_100g),
		ironMg_100g: parseValue(raw.iron_100g),
		magnesiumMg_100g: parseValue(raw.magnesium_100g),
		zincMg_100g: parseValue(raw.zinc_100g),
		copperMg_100g: parseValue(raw.copper_100g),
		manganeseMg_100g: parseValue(raw.manganese_100g),
		caffeineMg_100g: parseValue(raw.caffeine_100g)
	};
}

/**
 * Convert ProcessedNutritionData to TSV row for COPY command
 */
export function toTsvRow(data: ProcessedNutritionData): string {
	const escapeText = (v: string | null): string => {
		if (!v) return '\\N';
		return v
			.replace(/\\/g, '\\\\')
			.replace(/\n/g, '\\n')
			.replace(/\r/g, '\\r')
			.replace(/\t/g, '\\t');
	};

	const formatNum = (v: number | null): string => {
		if (v === null || !isFinite(v)) return '\\N';
		return v.toFixed(2);
	};

	const formatNum_RequiredField = (v: number | null): string => {
		if (v === null || !isFinite(v)) return '0.00';
		return v.toFixed(2);
	};

	const formatInt = (v: number | null): string => {
		if (v === null || !isFinite(v)) return '0';
		return String(Math.round(v));
	};

	return [
		escapeText(data.code),
		escapeText(data.productName),
		escapeText(data.brands),
		// Serving fields
		formatNum(data.servingQuantity),
		escapeText(data.servingSize),
		// Data quality metrics
		formatNum_RequiredField(data.completeness),
		formatInt(data.uniqueScans),
		// 100g macros
		formatNum(data.energyKcal_100g),
		formatNum(data.proteinsG_100g),
		formatNum(data.fatG_100g),
		formatNum(data.carbohydratesG_100g),
		// 100g micronutrients
		formatNum(data.saturatedFatG_100g),
		formatNum(data.unsaturatedFatG_100g),
		formatNum(data.monounsaturatedFatG_100g),
		formatNum(data.polyunsaturatedFatG_100g),
		formatNum(data.transFatG_100g),
		formatNum(data.cholesterolMg_100g),
		formatNum(data.sugarsG_100g),
		formatNum(data.polyolsG_100g),
		formatNum(data.fiberG_100g),
		formatNum(data.saltG_100g),
		formatNum(data.sodiumMg_100g),
		formatNum(data.alcoholG_100g),
		formatNum(data.vitaminAIU_100g),
		formatNum(data.vitaminDIU_100g),
		formatNum(data.vitaminEMg_100g),
		formatNum(data.vitaminKMcg_100g),
		formatNum(data.vitaminCMg_100g),
		formatNum(data.vitaminB1Mg_100g),
		formatNum(data.vitaminB2Mg_100g),
		formatNum(data.vitaminB6Mg_100g),
		formatNum(data.vitaminB9Mcg_100g),
		formatNum(data.folatesMcg_100g),
		formatNum(data.vitaminB12Mcg_100g),
		formatNum(data.potassiumMg_100g),
		formatNum(data.calciumMg_100g),
		formatNum(data.phosphorusMg_100g),
		formatNum(data.ironMg_100g),
		formatNum(data.magnesiumMg_100g),
		formatNum(data.zincMg_100g),
		formatNum(data.copperMg_100g),
		formatNum(data.manganeseMg_100g),
		formatNum(data.caffeineMg_100g)
	].join('\t') + '\n';
}
