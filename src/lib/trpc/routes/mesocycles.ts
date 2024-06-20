import { prisma } from '$lib/prisma';
import { z } from 'zod';
import { t } from '$lib/trpc/t';
import {
	ExerciseSplitDayCreateWithoutExerciseSplitInputSchema,
	ExerciseSplitSchema,
	MesocycleCyclicSetChangeCreateWithoutMesocycleInputSchema,
	MesocycleExerciseTemplateCreateWithoutMesocycleExerciseSplitDayInputSchema,
	MesocycleUncheckedCreateWithoutUserInputSchema,
	MesocycleUpdateInputSchema
} from '$lib/zodSchemas';
import type { Prisma } from '@prisma/client';
import cuid from 'cuid';

const zodMesocycleCreateInput = z.strictObject({
	mesocycle: MesocycleUncheckedCreateWithoutUserInputSchema,
	mesocycleCyclicSetChanges: z.array(MesocycleCyclicSetChangeCreateWithoutMesocycleInputSchema),
	mesocycleExerciseTemplates: z.array(
		z.array(MesocycleExerciseTemplateCreateWithoutMesocycleExerciseSplitDayInputSchema)
	),
	exerciseSplit: ExerciseSplitSchema.extend({
		exerciseSplitDays: z.array(ExerciseSplitDayCreateWithoutExerciseSplitInputSchema)
	})
});

const zodMesocycleEditInput = z.strictObject({
	mesocycle: MesocycleUpdateInputSchema,
	mesocycleCyclicSetChanges: z.array(MesocycleCyclicSetChangeCreateWithoutMesocycleInputSchema)
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

	create: t.procedure.input(zodMesocycleCreateInput).mutation(async ({ input, ctx }) => {
		const mesocycleId = cuid();
		const mesocycle: Prisma.MesocycleUncheckedCreateInput = {
			id: mesocycleId,
			userId: ctx.userId,
			...input.mesocycle
		};

		const mesocycleCyclicSetChanges: Prisma.MesocycleCyclicSetChangeUncheckedCreateInput[] =
			input.mesocycleCyclicSetChanges.map((setChange) => ({ ...setChange, mesocycleId }));

		const mesocycleExerciseSplitDays: Prisma.MesocycleExerciseSplitDayUncheckedCreateInput[] =
			input.exerciseSplit.exerciseSplitDays.map((splitDay) => ({
				...splitDay,
				mesocycleId,
				id: cuid()
			}));

		const mesocycleExerciseTemplates: Prisma.MesocycleExerciseTemplateUncheckedCreateInput[] =
			input.mesocycleExerciseTemplates.flatMap((dayExercises, dayNumber) =>
				dayExercises.map((exercise) => ({
					...exercise,
					mesocycleExerciseSplitDayId: mesocycleExerciseSplitDays[dayNumber].id as string
				}))
			);

		const transactionQueries = [
			prisma.mesocycle.create({ data: mesocycle }),
			prisma.mesocycleCyclicSetChange.createMany({ data: mesocycleCyclicSetChanges }),
			prisma.mesocycleExerciseSplitDay.createMany({ data: mesocycleExerciseSplitDays }),
			prisma.mesocycleExerciseTemplate.createMany({ data: mesocycleExerciseTemplates })
		];

		await prisma.$transaction(transactionQueries);
		return { message: 'Mesocycle created successfully' };
	}),

	editById: t.procedure
		.input(z.strictObject({ id: z.string().cuid(), mesocycleData: zodMesocycleEditInput }))
		.mutation(async ({ input, ctx }) => {
			await prisma.$transaction(async (tx) => {
				const mesocycle = await prisma.mesocycle.update({
					where: { id: input.id, userId: ctx.userId },
					data: { ...input.mesocycleData.mesocycle },
					select: { id: true }
				});
				await prisma.mesocycleCyclicSetChange.deleteMany({ where: { mesocycleId: mesocycle.id } });
				await prisma.mesocycleCyclicSetChange.createMany({
					data: input.mesocycleData.mesocycleCyclicSetChanges.map((setChange) => ({
						mesocycleId: mesocycle.id,
						...setChange
					}))
				});
			});
			return { message: 'Mesocycle edited successfully' };
		}),

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
