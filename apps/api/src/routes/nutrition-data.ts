import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import z from 'zod';
import { prisma } from '../../lib/prisma.js';
import { searchFoodsQuery } from '../../generated/prisma/sql/searchFoodsQuery.js';

function buildPrefixQuery(search: string): string {
	return search
		.trim()
		.split(/\s+/)
		.map((word) => `${word}:*`)
		.join(' & ');
}

const nutritionDataRoutes = new Hono()
	/**
	 * Nutrition data search endpoint
	 * Searches food database using full-text search
	 */
	.get(
		'/',
		zValidator(
			'query',
			z.object({
				search: z.string().min(1, 'Search query cannot be empty')
			})
		),
		async (c) => {
			const { search } = c.req.valid('query');
			const foodIds = await prisma.$queryRawTyped(searchFoodsQuery(buildPrefixQuery(search)));
			const results = await prisma.nutritionData.findMany({
				where: { id: { in: foodIds.map((f) => f.id) } },
				select: { id: true, product_name: true, code: true, energy_kcal_100g: true, brands: true }
			});

			return c.json({ results }, 200);
		}
	)
	/**
	 * Nutrition data get by code endpoint
	 * Retrieves nutrition data for a specific food item by its code
	 */
	.get(
		'/:code',
		zValidator(
			'param',
			z.object({
				code: z.string().min(1, 'Code cannot be empty')
			})
		),
		async (c) => {
			const { code } = c.req.valid('param');
			const data = await prisma.nutritionData.findUnique({
				where: { code }
			});

			if (!data) {
				return c.json({ error: 'Food item not found' }, 404);
			}

			return c.json(data, 200);
		}
	);

export { nutritionDataRoutes };
