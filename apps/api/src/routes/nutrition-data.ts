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
		'/:search',
		zValidator(
			'param',
			z.object({
				search: z.string().min(1, 'Search query cannot be empty')
			})
		),
		async (c) => {
			const { search } = c.req.valid('param');
			const foodIds = await prisma.$queryRawTyped(searchFoodsQuery(buildPrefixQuery(search)));
			const results = await prisma.nutritionData.findMany({
				where: { id: { in: foodIds.map((f) => f.id) } }
			});

			return c.json({ results }, 200);
		}
	);

export { nutritionDataRoutes };
