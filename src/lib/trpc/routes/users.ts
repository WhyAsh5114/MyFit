import { prisma } from '$lib/prisma';
import { t } from '$lib/trpc/t';

export const users = t.router({
	getEntityCounts: t.procedure.query(async ({ ctx }) => {
		return await prisma.user.findUnique({
			where: { id: ctx.userId },
			select: { _count: { select: { exerciseSplits: true, mesocycles: true, workouts: true } } }
		});
	})
});
