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
const take = 10;

export const mesocycles = t.router({
	findById: t.procedure.input(z.number()).query(({ input, ctx }) =>
		prisma.mesocycle.findUnique({
			where: { id: input, userId: ctx.userId },
			include: { exerciseSplit: true }
		})
	),

	load: t.procedure.input(z.number().optional()).query(async ({ input, ctx }) => {
		const searchString = ctx.event.url.searchParams.get('search') ?? undefined;
		const mesocycles = await prisma.mesocycle.findMany({
			where: { userId: ctx.userId, name: { contains: searchString } },
			orderBy: { id: 'desc' },
			cursor: input !== undefined ? { id: input } : undefined,
			skip: input !== undefined ? 1 : 0,
			take
		});
		return { mesocycles, mesocyclesTake: take };
	}),

	create: t.procedure.input(zodMesocycleInput).mutation(async ({ input, ctx }) => {
		await prisma.mesocycle.create({
			data: {
				...input.mesocycle,
				userId: ctx.userId,
				exerciseSplitId: input.exerciseSplit.id,
				mesocycleCyclicSetChanges: { createMany: { data: input.mesocycleCyclicSetChanges } },
				mesocycleExerciseSplitDays: {
					create: input.exerciseSplit.exerciseSplitDays.map((splitDay, idx) => ({
						...splitDay,
						mesocycleSplitDayExercises: {
							createMany: { data: input.mesocycleExerciseTemplates[idx] }
						}
					}))
				}
			}
		});
		return { message: 'Mesocycle created successfully' };
	}),

	// editById: t.procedure
	// 	.input(z.strictObject({ id: z.number().int(), splitData: zodExerciseSplitInput }))
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

	deleteById: t.procedure.input(z.number().int()).mutation(async ({ input, ctx }) => {
		await prisma.mesocycle.delete({ where: { userId: ctx.userId, id: input } });
		return { message: 'Mesocycle deleted successfully' };
	}),

	progressToNextStage: t.procedure
		.input(
			z.strictObject({
				id: z.number().int(),
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
				const activeMesocycle = await prisma.mesocycle.findFirst({
					where: { userId: ctx.userId, startDate: { not: null }, endDate: null },
					select: { name: true }
				});
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