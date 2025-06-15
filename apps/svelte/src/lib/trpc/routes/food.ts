import { prisma } from '$lib/prisma';
import { t } from '$lib/trpc/router';
import { z } from 'zod';

export const food = t.router({
	search: t.procedure.input(z.strictObject({ query: z.string() })).query(async ({ input }) => {
		return await prisma.nutritionData.findMany({
			where: {
				OR: [
					{ product_name: { contains: input.query, mode: 'insensitive' } },
					{ brands: { contains: input.query, mode: 'insensitive' } }
				]
			},
			take: 10
		});
	}),

	getById: t.procedure.input(z.strictObject({ id: z.number() })).query(async ({ input }) => {
		return await prisma.nutritionData.findUnique({
			where: { id: input.id }
		});
	}),

	getByCode: t.procedure.input(z.strictObject({ code: z.string() })).query(async ({ input }) => {
		return await prisma.nutritionData.findMany({
			where: { code: input.code }
		});
	})
});
