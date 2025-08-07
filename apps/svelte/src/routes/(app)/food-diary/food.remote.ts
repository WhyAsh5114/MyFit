import { query, command } from '$app/server';
import { prisma } from '$lib/prisma';
import { searchFoodsQuery } from '@prisma/client/sql';
import z from 'zod';

function buildPrefixQuery(search: string): string {
	return search
		.trim()
		.split(/\s+/)
		.map((word) => `${word}:*`)
		.join(' & ');
}

export const getFoodById = command(z.strictObject({ id: z.int() }), async (data) => {
	return await prisma.nutritionData.findUniqueOrThrow({
		where: { id: data.id }
	});
});

export const searchFoods = query(z.strictObject({ query: z.string() }), async (data) => {
	const results = await prisma.$queryRawTyped(searchFoodsQuery(buildPrefixQuery(data.query)));

	return await prisma.nutritionData.findMany({
		where: { id: { in: results.map((r) => r.id) } }
	});
});
