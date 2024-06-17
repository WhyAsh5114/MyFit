import prisma from '$lib/prisma';
import { z } from 'zod';
import { t } from '$lib/trpc/t';
import {
	ExerciseSplitDayCreateWithoutExerciseSplitInputSchema,
	ExerciseSplitIncludeSchema,
	ExerciseTemplateCreateWithoutExerciseSplitDayInputSchema
} from '$lib/zodSchemas';

const zodExerciseSplitInput = z.strictObject({
	splitName: z.string(),
	splitDays: z.array(ExerciseSplitDayCreateWithoutExerciseSplitInputSchema),
	splitExercises: z.array(z.array(ExerciseTemplateCreateWithoutExerciseSplitDayInputSchema))
});

export const exerciseSplits = t.router({
	findById: t.procedure.input(z.number()).query(({ input, ctx }) =>
		prisma.exerciseSplit.findUnique({
			where: { id: input, userId: ctx.userId },
			include: { exerciseSplitDays: { include: { exercises: true } } }
		})
	),

	load: t.procedure
		.input(
			z.strictObject({
				cursorId: z.number().optional(),
				include: ExerciseSplitIncludeSchema,
				searchString: z.string().optional()
			})
		)
		.query(async ({ input, ctx }) => {
			return prisma.exerciseSplit.findMany({
				where: { userId: ctx.userId, name: { contains: input.searchString, mode: 'insensitive' } },
				orderBy: { id: 'desc' },
				include: input.include,
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
		await prisma.$transaction(async (tx) => {
			const exerciseSplit = await prisma.exerciseSplit.create({
				data: {
					name: input.splitName,
					userId: ctx.userId,
					exerciseSplitDays: { createMany: { data: input.splitDays } }
				},
				select: { exerciseSplitDays: { select: { id: true } } }
			});

			await prisma.exerciseTemplate.createMany({
				data: input.splitExercises.flatMap((dayExercises, idx) => {
					return dayExercises.map((exercise) => {
						return { ...exercise, exerciseSplitDayId: exerciseSplit.exerciseSplitDays[idx].id };
					});
				})
			});
		});
		return { message: 'Exercise split created successfully' };
	}),

	editById: t.procedure
		.input(z.strictObject({ id: z.number().int(), splitData: zodExerciseSplitInput }))
		.mutation(async ({ input, ctx }) => {
			await prisma.$transaction([
				prisma.exerciseSplit.delete({ where: { id: input.id, userId: ctx.userId } }),
				prisma.exerciseSplit.create({
					data: {
						id: input.id,
						name: input.splitData.splitName,
						userId: ctx.userId,
						exerciseSplitDays: {
							create: input.splitData.splitDays.map((splitDay, idx) => ({
								...splitDay,
								exercises: { createMany: { data: input.splitData.splitExercises[idx] } }
							}))
						}
					}
				})
			]);
			return { message: 'Exercise split edited successfully' };
		}),

	deleteById: t.procedure.input(z.number().int()).mutation(async ({ input, ctx }) => {
		await prisma.exerciseSplit.delete({ where: { userId: ctx.userId, id: input } });
		return { message: 'Exercise split deleted successfully' };
	})
});
