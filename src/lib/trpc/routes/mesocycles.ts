import prisma from '$lib/prisma';
import { z } from 'zod';
import { t } from '$lib/trpc/t';
import {
	ExerciseSplitDayCreateWithoutExerciseSplitInputSchema,
	ExerciseSplitSchema,
	MesocycleCyclicSetChangeCreateWithoutMesocycleInputSchema,
	MesocycleExerciseTemplateCreateWithoutMesocycleExerciseSplitDayInputSchema,
	MesocycleUncheckedCreateWithoutUserInputSchema
} from '$lib/zodSchemas';
import type { Prisma } from '@prisma/client';

const zodMesocycleInput = z.strictObject({
	mesocycle: MesocycleUncheckedCreateWithoutUserInputSchema,
	mesocycleCyclicSetChanges: z.array(MesocycleCyclicSetChangeCreateWithoutMesocycleInputSchema),
	mesocycleExerciseTemplates: z.array(
		z.array(MesocycleExerciseTemplateCreateWithoutMesocycleExerciseSplitDayInputSchema)
	),
	exerciseSplit: ExerciseSplitSchema.extend({
		exerciseSplitDays: z.array(ExerciseSplitDayCreateWithoutExerciseSplitInputSchema)
	})
});

const getActiveMesocycleName = async (userId: string) => {
	return await prisma.mesocycle.findFirst({
		where: { userId, startDate: { not: null }, endDate: null },
		select: { name: true, id: true }
	});
};

export const mesocycles = t.router({
	findById: t.procedure.input(z.string().cuid()).query(
		async ({ input, ctx }) =>
			await prisma.mesocycle.findUnique({
				where: { id: input, userId: ctx.userId },
				include: {
					exerciseSplit: true,
					mesocycleExerciseSplitDays: { include: { mesocycleSplitDayExercises: true } },
					mesocycleCyclicSetChanges: true
				}
			})
	),

	findActiveMesocycle: t.procedure.query(async ({ ctx }) => {
		return await getActiveMesocycleName(ctx.userId);
	}),

	load: t.procedure
		.input(
			z.object({ cursorId: z.string().cuid().optional(), searchString: z.string().optional() })
		)
		.query(async ({ input, ctx }) => {
			return prisma.mesocycle.findMany({
				where: { userId: ctx.userId, name: { contains: input.searchString, mode: 'insensitive' } },
				orderBy: { id: 'desc' },
				cursor: input.cursorId !== undefined ? { id: input.cursorId } : undefined,
				skip: input.cursorId !== undefined ? 1 : 0,
				take: 10
			});
		}),

	create: t.procedure.input(zodMesocycleInput).mutation(async ({ input, ctx }) => {
		await prisma.$transaction(async (tx) => {
			const mesocycle = await prisma.mesocycle.create({
				data: {
					...input.mesocycle,
					userId: ctx.userId,
					mesocycleCyclicSetChanges: { createMany: { data: input.mesocycleCyclicSetChanges } },
					mesocycleExerciseSplitDays: {
						createMany: { data: input.exerciseSplit.exerciseSplitDays }
					}
				},
				select: { mesocycleExerciseSplitDays: { select: { id: true } } }
			});

			await prisma.mesocycleExerciseTemplate.createMany({
				data: input.mesocycleExerciseTemplates.flatMap((dayExercises, idx) => {
					return dayExercises.map((exercise) => {
						return {
							...exercise,
							mesocycleExerciseSplitDayId: mesocycle.mesocycleExerciseSplitDays[idx].id
						};
					});
				})
			});
		});
		return { message: 'Mesocycle created successfully' };
	}),

	// editById: t.procedure
	// 	.input(z.strictObject({ id: z.string().cuid(), splitData: zodExerciseSplitInput }))
	// 	.mutation(async ({ input, ctx }) => {
	// 		await prisma.$transaction([
	// 			prisma.exerciseSplit.delete({ where: { id: input.id, userId: ctx.userId } }),
	// 			prisma.exerciseSplit.create({
	// 				data: {
	// 					id: input.id,
	// 					name: input.splitData.splitName,
	// 					userId: ctx.userId,
	// 					exerciseSplitDays: {
	// 						create: input.splitData.splitDays.map((splitDay, idx) => ({
	// 							...splitDay,
	// 							exercises: { createMany: { data: input.splitData.splitExercises[idx] } }
	// 						}))
	// 					}
	// 				}
	// 			})
	// 		]);
	// 		return { message: 'Exercise split edited successfully' };
	// 	}),

	deleteById: t.procedure.input(z.string().cuid()).mutation(async ({ input, ctx }) => {
		await prisma.mesocycle.delete({ where: { userId: ctx.userId, id: input } });
		return { message: 'Mesocycle deleted successfully' };
	}),

	progressToNextStage: t.procedure
		.input(
			z.strictObject({
				id: z.string().cuid(),
				startDate: z.date().nullable(),
				endDate: z.date().nullable()
			})
		)
		.mutation(async ({ input, ctx }) => {
			const now = new Date();
			let updateClause: Prisma.MesocycleUpdateInput;
			if (!input.startDate) updateClause = { startDate: now };
			else if (!input.endDate) updateClause = { endDate: now };
			else return { error: 'Mesocycle already completed' };

			if (!input.startDate) {
				const activeMesocycle = await getActiveMesocycleName(ctx.userId);
				if (activeMesocycle) {
					return {
						error: 'A mesocycle is already active',
						description: activeMesocycle.name
					};
				}
			}

			const updatedMesocycle = await prisma.mesocycle.update({
				where: { id: input.id, userId: ctx.userId },
				data: updateClause
			});
			return {
				message: `Mesocycle ${!input.startDate ? 'started' : 'stopped'} successfully`,
				startDate: updatedMesocycle.startDate,
				endDate: updatedMesocycle.endDate
			};
		})
});
