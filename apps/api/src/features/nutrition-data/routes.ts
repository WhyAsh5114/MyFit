import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import z from 'zod';
import { nutritionDataService } from './service.js';

const nutritionDataRoutes = new Hono()
	/**
	 * Nutrition data search endpoint
	 * Searches food database using full-text search
	 * Public endpoint - no auth required
	 */
	.get(
		'/',
		zValidator(
			'query',
			z.object({
				search: z.string().min(1, 'Search query cannot be empty'),
				offset: z.coerce.number().min(0).optional().default(0)
			})
		),
		async (c) => {
			const { search, offset } = c.req.valid('query');
			const results = await nutritionDataService.searchFoods(search, offset);
			return c.json({ results }, 200);
		}
	)
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
			const data = await nutritionDataService.getFoodById(id);

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
			const data = await nutritionDataService.getFoodByCode(code);

			return c.json(data, 200);
		}
	);

export { nutritionDataRoutes };
