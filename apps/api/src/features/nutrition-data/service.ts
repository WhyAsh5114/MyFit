import type { NutritionData } from '@myfit/shared/nutrition';
import { getDb } from '../../../lib/db.js';
import { NUTRITION_DATA_SEARCH_PAGINATION_LIMIT } from '../../../lib/constants.js';
import { searchFoods, type FoodSearchHit } from './search-foods.js';

/**
 * Service layer for nutrition data operations
 */
export const nutritionDataService = {
	/**
	 * Search foods by text query using full-text search
	 * Returns basic food info (id, name, brand, calories)
	 */
	async searchFoods(search: string, offset: number = 0): Promise<FoodSearchHit[]> {
		return searchFoods(await getDb(), search, offset, NUTRITION_DATA_SEARCH_PAGINATION_LIMIT);
	},

	/**
	 * Get full nutrition data for a specific food by code
	 */
	async getFoodByCode(code: string): Promise<NutritionData[]> {
		const db = await getDb();
		return db.orm.public.NutritionData.where({ code }).all();
	},

	/**
	 * Get full nutrition data for a specific food by ID
	 */
	async getFoodById(id: string): Promise<NutritionData | null> {
		const db = await getDb();
		return db.orm.public.NutritionData.where({ id }).first();
	}
};
