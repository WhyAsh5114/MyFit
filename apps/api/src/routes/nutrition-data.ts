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
	 * Health check endpoint
	 * Returns status of the API
	 */
	.get(
		'/',
		zValidator(
			'json',
			z.object({
				search: z.string().min(1, 'Search query cannot be empty')
			})
		),
		async (c) => {
			const { search } = c.req.valid('json');

			const results = await prisma.$queryRawTyped(searchFoodsQuery(buildPrefixQuery(search)));
			results[0].id

			c.json({ status: 'ok', results }, 200);
		}
	);

export { nutritionDataRoutes };
