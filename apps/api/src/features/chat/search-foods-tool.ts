import { OPTIONAL_NUTRIENT_FIELDS, REQUIRED_NUTRIENT_FIELDS } from '@myfit/shared/nutrition';
import { getDb, getSearchDb } from '../../../lib/db.js';
import { searchFoods } from '../nutrition-data/search-foods.js';

/** Few enough that the full nutrients of each stay a small part of the model's context. */
const MAX_FOODS = 5;

const NUTRIENT_KEYS = [...REQUIRED_NUTRIENT_FIELDS, ...OPTIONAL_NUTRIENT_FIELDS].map((f) => f.key);

/**
 * The food search the app's search box uses, with every nutrient of each match, per 100 g.
 * A nutrient the product has no value for is left out, so the model can tell it is unknown.
 */
export async function findFoods(query: string) {
	const hits = await searchFoods(await getSearchDb(), query, 0, MAX_FOODS);
	const db = await getDb();
	const rows = await Promise.all(
		hits.map((hit) => db.orm.public.NutritionData.where({ id: hit.id }).first())
	);

	return {
		foods: rows
			.filter((row) => row !== null && row !== undefined)
			.map((row) => {
				const values = row as unknown as Record<string, unknown>;
				const per100g: Record<string, number> = {};
				for (const key of NUTRIENT_KEYS) {
					const value = values[key];
					if (typeof value === 'number') per100g[key] = value;
				}
				return {
					name: row.productName,
					brands: row.brands ?? null,
					servingSize: row.servingSize ?? null,
					servingQuantityG: row.servingQuantity ?? null,
					per100g
				};
			})
	};
}
