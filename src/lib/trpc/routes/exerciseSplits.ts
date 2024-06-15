import prisma from '$lib/prisma';
import { z } from 'zod';
import { t } from '../router';

export const exerciseSplits = t.router({
	findById: t.procedure.input(z.number()).query(({ input, ctx }) =>
		prisma.exerciseSplit.findUnique({
			where: { id: input, userId: ctx.session?.user?.id }
		})
	)
});
