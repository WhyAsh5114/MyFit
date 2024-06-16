import prisma from '$lib/prisma';
import { z } from 'zod';
import { t } from '$lib/trpc/t';
import { ChangeType, MuscleGroup, SetType } from '@prisma/client';

const zodExerciseSplitInput = z.strictObject({
	splitName: z.string(),
	splitDays: z.array(z.strictObject({ name: z.string(), isRestDay: z.boolean() })),
	splitExercises: z.array(
		z.array(
			z.strictObject({
				name: z.string(),
				targetMuscleGroup: z.nativeEnum(MuscleGroup),
				customMuscleGroup: z.string().nullable(),
				involvesBodyweight: z.boolean(),
				setType: z.nativeEnum(SetType),
				repRangeStart: z.number().int(),
				repRangeEnd: z.number().int(),
				changeType: z.nativeEnum(ChangeType).nullable(),
				changeAmount: z.number().nullable(),
				note: z.string().nullable()
			})
		)
	)
});
const take = 10;

export const exerciseSplits = t.router({
	findById: t.procedure.input(z.number()).query(({ input, ctx }) =>
		prisma.exerciseSplit.findUnique({
			where: { id: input, userId: ctx.userId },
			include: { exerciseSplitDays: { include: { exercises: true } } }
		})
	),

	load: t.procedure.input(z.number().optional()).query(async ({ input, ctx }) => {
		const searchString = ctx.event.url.searchParams.get('search') ?? undefined;
		const exerciseSplits = await prisma.exerciseSplit.findMany({
			where: { userId: ctx.userId, name: { contains: searchString } },
			orderBy: { id: 'desc' },
			include: { exerciseSplitDays: true },
			cursor: input !== undefined ? { id: input } : undefined,
			skip: input !== undefined ? 1 : 0,
			take
		});
		return { exerciseSplits, exerciseSplitsTake: take };
	}),

	create: t.procedure.input(zodExerciseSplitInput).mutation(async ({ input, ctx }) => {
		await prisma.exerciseSplit.create({
			data: {
				name: input.splitName,
				userId: ctx.userId,
				exerciseSplitDays: {
					create: input.splitDays.map((splitDay, idx) => ({
						...splitDay,
						exercises: { createMany: { data: input.splitExercises[idx] } }
					}))
				}
			}
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
