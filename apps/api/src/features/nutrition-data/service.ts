import { prisma } from '../../../lib/prisma.js';
import { searchFoodsQuery } from '../../../generated/prisma/sql/searchFoodsQuery.js';

/**
 * Service layer for nutrition data operations
 */
export const nutritionDataService = {
	/**
	 * Search foods by text query using full-text search
	 * Returns basic food info (id, name, brand, calories)
	 */
	async searchFoods(search: string) {
		const results = await prisma.$queryRawTyped(searchFoodsQuery(search));
		return results;
	},

	/**
	 * Get full nutrition data for a specific food by code
	 */
	async getFoodByCode(code: string) {
		return await prisma.nutritionData.findUnique({
			where: { code }
		});
	}
};
