import prisma from '$lib/prisma';
import { z } from 'zod';
import { t } from '$lib/trpc/t';

const take = 10;

export const exerciseSplits = t.router({
	findById: t.procedure.input(z.number()).query(({ input, ctx }) =>
		prisma.exerciseSplit.findUnique({
			where: { id: input, userId: ctx.session?.user?.id },
			include: { exerciseSplitDays: { include: { exercises: true } } }
		})
	),
	load: t.procedure.query(({ ctx }) => {
		const searchString = ctx.event.url.searchParams.get('search') ?? undefined;
		const exerciseSplits = prisma.exerciseSplit.findMany({
			where: { userId: ctx.session?.user?.id, name: { contains: searchString } },
			orderBy: { id: 'desc' },
			include: { exerciseSplitDays: true },
			take
		});
		return { exerciseSplits, exerciseSplitsTake: 10 };
	}),
	load_more: t.procedure.input(z.number()).query(async ({ input, ctx }) => {
		const searchString = ctx.event.url.searchParams.get('search') ?? undefined;
		const exerciseSplits = await prisma.exerciseSplit.findMany({
			where: { userId: ctx.session?.user?.id, name: { contains: searchString } },
			orderBy: { id: 'desc' },
			include: { exerciseSplitDays: true },
			cursor: { id: input },
			skip: 1,
			take
		});
		return exerciseSplits;
	})
});
