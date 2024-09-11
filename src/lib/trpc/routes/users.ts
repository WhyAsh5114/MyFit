import { prisma } from '$lib/prisma';
import { t } from '$lib/trpc/t';

export const users = t.router({
	getEntityCounts: t.procedure.query(async ({ ctx }) => {
		const queryResult = await prisma.user.findUnique({
			where: { id: ctx.userId },
			select: { _count: { select: { exerciseSplits: true, mesocycles: true, workouts: true } } }
		});
		if (!queryResult) {
			return null;
		}

		const startedMesocycles = await prisma.mesocycle.count({
			where: { userId: ctx.userId, startDate: { not: null } }
		});

		const entityCounts = { ...queryResult._count, startedMesocycles };
		return entityCounts;
	})
});
