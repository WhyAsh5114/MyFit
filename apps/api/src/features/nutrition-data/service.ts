import { prisma } from '../../../lib/prisma.js';
import { searchFoodsQuery } from '../../../generated/prisma/sql/searchFoodsQuery.js';

/**
 * Build a PostgreSQL full-text search query with prefix matching
 */
function buildPrefixQuery(search: string): string {
	return search
		.trim()
		.split(/\s+/)
		.map((word) => `${word}:*`)
		.join(' & ');
}

/**
 * Service layer for nutrition data operations
 */
export const nutritionDataService = {
	/**
	 * Search foods by text query using full-text search
	 * Returns basic food info (id, name, brand, calories)
	 */
	async searchFoods(search: string) {
		const foodIds = await prisma.$queryRawTyped(searchFoodsQuery(buildPrefixQuery(search)));
		const results = await prisma.nutritionData.findMany({
			where: { id: { in: foodIds.map((f) => f.id) } },
			select: {
				id: true,
				product_name: true,
				code: true,
				energy_kcal_100g: true,
				brands: true
			}
		});
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
