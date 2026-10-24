import type { NutritionData } from '../../prisma-types.js';
import { pool } from '../../../lib/pool.js';
import { NUTRITION_DATA_SEARCH_PAGINATION_LIMIT } from '../../../lib/constants.js';
import { SEARCH_FOODS_SQL } from './search-foods.js';

// Every column except `searchVector`, which is an index artifact the client never needs.
const NUTRITION_DATA_COLUMNS = `
	id, code, "productName", brands, completeness, "uniqueScans", "servingQuantity", "servingSize",
	"energyKcal_100g", "proteinsG_100g", "fatG_100g", "carbohydratesG_100g",
	"saturatedFatG_100g", "unsaturatedFatG_100g", "monounsaturatedFatG_100g", "polyunsaturatedFatG_100g",
	"transFatG_100g", "cholesterolMg_100g", "sugarsG_100g", "polyolsG_100g", "fiberG_100g", "saltG_100g",
	"sodiumMg_100g", "alcoholG_100g", "vitaminAIU_100g", "vitaminDIU_100g", "vitaminEMg_100g",
	"vitaminKMcg_100g", "vitaminCMg_100g", "vitaminB1Mg_100g", "vitaminB2Mg_100g", "vitaminB6Mg_100g",
	"vitaminB9Mcg_100g", "folatesMcg_100g", "vitaminB12Mcg_100g", "potassiumMg_100g", "calciumMg_100g",
	"phosphorusMg_100g", "ironMg_100g", "magnesiumMg_100g", "zincMg_100g", "copperMg_100g",
	"manganeseMg_100g", "caffeineMg_100g"
`;

type SearchResult = Pick<
	NutritionData,
	'id' | 'code' | 'productName' | 'brands' | 'energyKcal_100g' | 'servingSize' | 'servingQuantity'
>;

/**
 * Service layer for nutrition data operations
 */
export const nutritionDataService = {
	/**
	 * Search foods by text query using full-text search
	 * Returns basic food info (id, name, brand, calories)
	 */
	async searchFoods(search: string, offset: number = 0): Promise<SearchResult[]> {
		const { rows } = await pool.query<SearchResult>(SEARCH_FOODS_SQL, [
			search,
			offset,
			NUTRITION_DATA_SEARCH_PAGINATION_LIMIT
		]);
		return rows;
	},

	/**
	 * Get full nutrition data for a specific food by code
	 */
	async getFoodByCode(code: string): Promise<NutritionData[]> {
		const { rows } = await pool.query<NutritionData>(
			`SELECT ${NUTRITION_DATA_COLUMNS} FROM "NutritionData" WHERE code = $1`,
			[code]
		);
		return rows;
	},

	/**
	 * Get full nutrition data for a specific food by ID
	 */
	async getFoodById(id: string): Promise<NutritionData | null> {
		const { rows } = await pool.query<NutritionData>(
			`SELECT ${NUTRITION_DATA_COLUMNS} FROM "NutritionData" WHERE id = $1`,
			[id]
		);
		return rows[0] ?? null;
	}
};
