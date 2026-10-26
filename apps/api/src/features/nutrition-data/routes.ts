import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import z from 'zod';
import { NUTRITION_DATA_SEARCH_PAGINATION_LIMIT } from '@myfit/shared/constants';
import { getDb, getSearchDb } from '../../../lib/db.js';
import { searchFoods } from './search-foods.js';
import { nutritionSearchQuery } from './search-query.js';

/** The Postgres error code for a statement cancelled by `statement_timeout`. */
const PG_QUERY_CANCELED = '57014';

/** The search was cancelled for running too long, or waited too long for a free connection. */
function isSearchOverloaded(error: unknown) {
	return (
		(error as { sqlState?: string } | null)?.sqlState === PG_QUERY_CANCELED ||
		(error instanceof Error && error.message === 'timeout exceeded when trying to connect')
	);
}

const nutritionDataRoutes = new Hono()
	/**
	 * Nutrition data search endpoint
	 * Searches food database using full-text search
	 * Public endpoint - no auth required
	 */
	.get('/', zValidator('query', nutritionSearchQuery), async (c) => {
		const { search, offset } = c.req.valid('query');
		try {
			const results = await searchFoods(
				await getSearchDb(),
				search,
				offset,
				NUTRITION_DATA_SEARCH_PAGINATION_LIMIT
			);
			// The food data only changes when the catalogue is re-imported.
			c.header('Cache-Control', 'public, max-age=300');
			return c.json({ results }, 200);
		} catch (error) {
			if (!isSearchOverloaded(error)) throw error;
			console.warn('Food search is overloaded', error);
			c.header('Retry-After', '2');
			return c.json({ error: 'Search is busy, please try again' }, 503);
		}
	})
	/**
	 * Nutrition data get by id endpoint
	 * Retrieves nutrition data for a specific food item by its id
	 * Public endpoint - no auth required
	 */
	.get(
		'/:id',
		zValidator(
			'param',
			z.object({
				id: z.string().min(1, 'ID cannot be empty')
			})
		),
		async (c) => {
			const { id } = c.req.valid('param');
			const db = await getDb();
			const data = await db.orm.public.NutritionData.where({ id }).first();

			if (!data) {
				return c.json({ error: 'Food item not found' }, 404);
			}

			return c.json(data, 200);
		}
	)
	/**
	 * Nutrition data get by code endpoint
	 * Retrieves nutrition data for a specific food item by its code
	 * Public endpoint - no auth required
	 */
	.get(
		'/code/:code',
		zValidator(
			'param',
			z.object({
				code: z.string().min(1, 'Code cannot be empty')
			})
		),
		async (c) => {
			const { code } = c.req.valid('param');
			const db = await getDb();
			const data = await db.orm.public.NutritionData.where({ code }).all();

			return c.json(data, 200);
		}
	);

export { nutritionDataRoutes };
