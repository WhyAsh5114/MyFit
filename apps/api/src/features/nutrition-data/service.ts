import { prisma } from '../../../lib/prisma.js';
import { searchFoodsQuery } from '../../../generated/prisma/sql/searchFoodsQuery.js';
import { NUTRITION_DATA_SEARCH_PAGINATION_LIMIT } from '../../../lib/constants.js';

/**
 * Service layer for nutrition data operations
 */
export const nutritionDataService = {
	/**
	 * Search foods by text query using full-text search
	 * Returns basic food info (id, name, brand, calories)
	 */
	async searchFoods(search: string, offset: number = 0) {
		const results = await prisma.$queryRawTyped(
			searchFoodsQuery(search, offset, NUTRITION_DATA_SEARCH_PAGINATION_LIMIT)
		);
		return results;
	},

	/**
	 * Get full nutrition data for a specific food by code
	 */
	async getFoodByCode(code: string) {
		return await prisma.nutritionData.findMany({
			where: { code }
		});
	},

	/**
	 * Get full nutrition data for a specific food by ID
	 */
	async getFoodById(id: string) {
		return await prisma.nutritionData.findUnique({
			where: { id }
		});
	}
};
