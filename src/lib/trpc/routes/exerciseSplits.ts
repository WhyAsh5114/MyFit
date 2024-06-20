import { prisma } from '$lib/prisma';
import { z } from 'zod';
import { t } from '$lib/trpc/t';
import {
	ExerciseSplitDayCreateWithoutExerciseSplitInputSchema,
	ExerciseTemplateCreateWithoutExerciseSplitDayInputSchema
} from '$lib/zodSchemas';
import type { ExerciseSplit, ExerciseSplitDay, Prisma } from '@prisma/client';
import cuid from 'cuid';

const zodExerciseSplitInput = z.strictObject({
	splitName: z.string(),
	splitDays: z.array(ExerciseSplitDayCreateWithoutExerciseSplitInputSchema),
	splitExercises: z.array(z.array(ExerciseTemplateCreateWithoutExerciseSplitDayInputSchema))
});

const createOrEditExerciseSplit = async (
	input: z.infer<typeof zodExerciseSplitInput>,
	userId: string,
	editingId?: string
) => {
	const exerciseSplitId = editingId ?? cuid();
	const exerciseSplit: ExerciseSplit = { id: exerciseSplitId, name: input.splitName, userId };

	const exerciseSplitDays: ExerciseSplitDay[] = input.splitDays.map((splitDay) => ({
		...splitDay,
		id: cuid(),
		exerciseSplitId: exerciseSplit.id
	}));

	const exerciseTemplates: Prisma.ExerciseTemplateUncheckedCreateInput[] =
		input.splitExercises.flatMap((dayExercises, dayNumber) =>
			dayExercises.map((exercise) => ({
				...exercise,
				id: cuid(),
				exerciseSplitDayId: exerciseSplitDays[dayNumber].id
			}))
		);

	const transactionQueries = [
		prisma.exerciseSplit.create({ data: exerciseSplit }),
		prisma.exerciseSplitDay.createMany({ data: exerciseSplitDays }),
		prisma.exerciseTemplate.createMany({ data: exerciseTemplates })
	];

	if (editingId)
		transactionQueries.unshift(prisma.exerciseSplit.delete({ where: { id: editingId, userId } }));

	await prisma.$transaction(transactionQueries);
};

export const exerciseSplits = t.router({
	findById: t.procedure.input(z.string().cuid()).query(({ input, ctx }) =>
		prisma.exerciseSplit.findUnique({
			where: { id: input, userId: ctx.userId },
			include: { exerciseSplitDays: { include: { exercises: true } } }
		})
	),

	load: t.procedure
		.input(
			z.strictObject({
				cursorId: z.string().cuid().optional(),
				searchString: z.string().optional()
			})
		)
		.query(async ({ input, ctx }) => {
			return prisma.exerciseSplit.findMany({
				where: { userId: ctx.userId, name: { contains: input.searchString, mode: 'insensitive' } },
				orderBy: { id: 'desc' },
				include: { exerciseSplitDays: true },
				cursor: input.cursorId !== undefined ? { id: input.cursorId } : undefined,
				skip: input.cursorId !== undefined ? 1 : 0,
				take: 10
			});
		}),

	loadAllNames: t.procedure.query(async ({ ctx }) => {
		return prisma.exerciseSplit.findMany({
			where: { userId: ctx.userId },
			orderBy: { id: 'desc' }
		});
	}),

	create: t.procedure.input(zodExerciseSplitInput).mutation(async ({ input, ctx }) => {
		await createOrEditExerciseSplit(input, ctx.userId);
		return { message: 'Exercise split created successfully' };
	}),

	editById: t.procedure
		.input(z.strictObject({ id: z.string().cuid(), splitData: zodExerciseSplitInput }))
		.mutation(async ({ input, ctx }) => {
			await createOrEditExerciseSplit(input.splitData, ctx.userId, input.id);
			return { message: 'Exercise split edited successfully' };
		}),

	deleteById: t.procedure.input(z.string().cuid()).mutation(async ({ input, ctx }) => {
		await prisma.exerciseSplit.delete({ where: { userId: ctx.userId, id: input } });
		return { message: 'Exercise split deleted successfully' };
	})
});
