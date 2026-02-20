/**
 * Raw nutrition data structure from Open Food Facts CSV
 */
export type RawNutritionData = {
	code: string;
	product_name: string;
	brands: string;

	// 100g macros
	'energy-kcal_100g': string;
	proteins_100g: string;
	fat_100g: string;
	carbohydrates_100g: string;
	'saturated-fat_100g': string;
	'unsaturated-fat_100g': string;
	'monounsaturated-fat_100g': string;
	'polyunsaturated-fat_100g': string;
	'trans-fat_100g': string;
	cholesterol_100g: string;
	sugars_100g: string;
	polyols_100g: string;
	fiber_100g: string;
	salt_100g: string;
	sodium_100g: string;
	alcohol_100g: string;
	'vitamin-a_100g': string;
	'vitamin-d_100g': string;
	'vitamin-e_100g': string;
	'vitamin-k_100g': string;
	'vitamin-c_100g': string;
	'vitamin-b1_100g': string;
	'vitamin-b2_100g': string;
	'vitamin-b6_100g': string;
	'vitamin-b9_100g': string;
	folates_100g: string;
	'vitamin-b12_100g': string;
	potassium_100g: string;
	calcium_100g: string;
	phosphorus_100g: string;
	iron_100g: string;
	magnesium_100g: string;
	zinc_100g: string;
	copper_100g: string;
	manganese_100g: string;
	caffeine_100g: string;

	// Data quality metrics
	completeness: string;
	unique_scans_n: string;

	// Serving size info
	serving_quantity: number;
	serving_quantity_unit: string;
	serving_size: string;

	// Serving macros
	'energy-kcal_serving': string;
	proteins_serving: string;
	fat_serving: string;
	carbohydrates_serving: string;
	'saturated-fat_serving': string;
	'unsaturated-fat_serving': string;
	'monounsaturated-fat_serving': string;
	'polyunsaturated-fat_serving': string;
	'trans-fat_serving': string;
	cholesterol_serving: string;
	sugars_serving: string;
	polyols_serving: string;
	fiber_serving: string;
	salt_serving: string;
	sodium_serving: string;
	alcohol_serving: string;
	'vitamin-a_serving': string;
	'vitamin-d_serving': string;
	'vitamin-e_serving': string;
	'vitamin-k_serving': string;
	'vitamin-c_serving': string;
	'vitamin-b1_serving': string;
	'vitamin-b2_serving': string;
	'vitamin-b6_serving': string;
	'vitamin-b9_serving': string;
	folates_serving: string;
	'vitamin-b12_serving': string;
	potassium_serving: string;
	calcium_serving: string;
	phosphorus_serving: string;
	iron_serving: string;
	magnesium_serving: string;
	zinc_serving: string;
	copper_serving: string;
	manganese_serving: string;
	caffeine_serving: string;
};

/**
 * Processed nutrition data in camelCase with units
 */
export type ProcessedNutritionData = {
	code: string;
	productName: string;
	brands: string | null;

	// Serving size metadata
	servingQuantity: number | null;
	servingSize: string | null;

	// Data quality metrics
	completeness: number | null;
	uniqueScans: number | null;

	// 100g macros (required)
	energyKcal_100g: number | null;
	proteinsG_100g: number | null;
	fatG_100g: number | null;
	carbohydratesG_100g: number | null;

	// 100g micronutrients (optional)
	saturatedFatG_100g: number | null;
	unsaturatedFatG_100g: number | null;
	monounsaturatedFatG_100g: number | null;
	polyunsaturatedFatG_100g: number | null;
	transFatG_100g: number | null;
	cholesterolMg_100g: number | null;
	sugarsG_100g: number | null;
	polyolsG_100g: number | null;
	fiberG_100g: number | null;
	saltG_100g: number | null;
	sodiumMg_100g: number | null;
	alcoholG_100g: number | null;
	vitaminAIU_100g: number | null;
	vitaminDIU_100g: number | null;
	vitaminEMg_100g: number | null;
	vitaminKMcg_100g: number | null;
	vitaminCMg_100g: number | null;
	vitaminB1Mg_100g: number | null;
	vitaminB2Mg_100g: number | null;
	vitaminB6Mg_100g: number | null;
	vitaminB9Mcg_100g: number | null;
	folatesMcg_100g: number | null;
	vitaminB12Mcg_100g: number | null;
	potassiumMg_100g: number | null;
	calciumMg_100g: number | null;
	phosphorusMg_100g: number | null;
	ironMg_100g: number | null;
	magnesiumMg_100g: number | null;
	zincMg_100g: number | null;
	copperMg_100g: number | null;
	manganeseMg_100g: number | null;
	caffeineMg_100g: number | null;
};

/**
 * Unit conversion metadata
 */
export type UnitConversion = {
	sourceUnit: string;
	targetUnit: string;
	factor: number;
	/** If true, unit requires value conversion. If false, just rename the unit. */
	requiresConversion: boolean;
};
