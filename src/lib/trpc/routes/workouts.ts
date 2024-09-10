import { prisma } from '$lib/prisma';
import { t } from '$lib/trpc/t';
import { arraySum } from '$lib/utils';
import {
	progressiveOverloadMagic,
	type WorkoutExerciseInProgress,
	type WorkoutExerciseWithSets
} from '$lib/utils/workoutUtils';
import {
	WorkoutExerciseCreateWithoutWorkoutInputSchema,
	WorkoutExerciseMiniSetCreateWithoutParentSetInputSchema,
	WorkoutExerciseSetCreateWithoutWorkoutExerciseInputSchema
} from '$lib/zodSchemas';
import {
	Prisma,
	WorkoutStatus,
	type Mesocycle,
	type MesocycleExerciseSplitDay,
	type MuscleGroup,
	type PrismaPromise,
	type WorkoutExercise,
	type WorkoutOfMesocycle
} from '@prisma/client';
import { TRPCError } from '@trpc/server';
import cuid from 'cuid';
import { z } from 'zod';

type TodaysWorkoutData = {
	startedAt: Date | string;
	endedAt: Date | string | null;
	userBodyweight: number | null;
	workoutExercises: Pick<WorkoutExercise, 'name' | 'targetMuscleGroup' | 'customMuscleGroup'>[];
	workoutOfMesocycle?: Pick<WorkoutOfMesocycle, 'workoutStatus' | 'splitDayIndex'> & {
		mesocycle: Mesocycle;
		cycleNumber: number;
		splitDayName: string;
	};
};

type TodaysWorkoutExercises = {
	todaysWorkoutExercises: WorkoutExerciseInProgress[];
	previousWorkoutData: null | {
		exercises: WorkoutExerciseWithSets[];
		userBodyweight: number;
	};
};

const createActiveMesocycleWithProgressionDataInclude = (splitDayIndex?: number) => {
	const workoutsWhere = splitDayIndex !== undefined ? { where: { splitDayIndex } } : {};

	return Prisma.validator<Prisma.MesocycleInclude>()({
		mesocycleExerciseSplitDays: {
			include: { mesocycleSplitDayExercises: true }
		},
		mesocycleCyclicSetChanges: true,
		workoutsOfMesocycle: {
			include: {
				workout: {
					include: {
						workoutExercises: { include: { sets: { include: { miniSets: true } } } }
					}
				}
			},
			...workoutsWhere
		}
	});
};

export type ActiveMesocycleWithProgressionData = Prisma.MesocycleGetPayload<{
	include: ReturnType<typeof createActiveMesocycleWithProgressionDataInclude>;
}>;

const workoutInputDataSchema = z.object({
	startedAt: z.date().or(z.string().datetime()),
	userBodyweight: z.number(),
	workoutOfMesocycle: z
		.object({
			mesocycle: z.object({ id: z.string().cuid() }),
			splitDayIndex: z.number().int(),
			workoutStatus: z.nativeEnum(WorkoutStatus).nullable(),
			cycleNumber: z.number().int()
		})
		.optional()
});

const createWorkoutSchema = z.strictObject({
	workoutData: workoutInputDataSchema,
	workoutExercises: z.array(WorkoutExerciseCreateWithoutWorkoutInputSchema),
	workoutExercisesSets: z.array(z.array(WorkoutExerciseSetCreateWithoutWorkoutExerciseInputSchema)),
	workoutExercisesMiniSets: z.array(z.array(z.array(WorkoutExerciseMiniSetCreateWithoutParentSetInputSchema)))
});

export const workouts = t.router({
	load: t.procedure.input(z.strictObject({ cursorId: z.string().cuid().optional() })).query(async ({ input, ctx }) => {
		return prisma.workout.findMany({
			where: { userId: ctx.userId },
			orderBy: { startedAt: 'desc' },
			include: {
				workoutOfMesocycle: {
					include: {
						mesocycle: {
							select: {
								id: true,
								name: true,
								mesocycleExerciseSplitDays: {
									select: { name: true },
									orderBy: { dayIndex: 'asc' }
								}
							}
						}
					}
				}
			},
			cursor: input.cursorId !== undefined ? { id: input.cursorId } : undefined,
			skip: input.cursorId !== undefined ? 1 : 0,
			take: 10
		});
	}),

	findById: t.procedure.input(z.string().cuid()).query(({ input, ctx }) =>
		prisma.workout.findUnique({
			where: { id: input, userId: ctx.userId },
			include: {
				workoutOfMesocycle: {
					include: {
						mesocycle: {
							include: {
								mesocycleExerciseSplitDays: { select: { name: true }, orderBy: { dayIndex: 'asc' } }
							}
						}
					}
				},
				workoutExercises: { include: { sets: { include: { miniSets: true } } } }
			}
		})
	),

	deleteById: t.procedure.input(z.string().cuid()).mutation(async ({ input, ctx }) => {
		await prisma.workout.delete({ where: { userId: ctx.userId, id: input } });
		return { message: 'Workout deleted successfully' };
	}),

	getTodaysWorkoutData: t.procedure.query(async ({ ctx }) => {
		const data = await prisma.mesocycle.findFirst({
			where: { userId: ctx.userId, startDate: { not: null }, endDate: null },
			include: {
				mesocycleExerciseSplitDays: {
					include: {
						mesocycleSplitDayExercises: {
							select: { name: true, targetMuscleGroup: true, customMuscleGroup: true }
						}
					}
				},
				mesocycleCyclicSetChanges: true,
				workoutsOfMesocycle: {
					include: { workout: true },
					orderBy: { workout: { startedAt: 'desc' } }
				}
			}
		});
		const lastBodyweight = data?.workoutsOfMesocycle.map((v) => v.workout.userBodyweight).filter((b) => b !== null)[0];
		const userBodyweight = lastBodyweight ?? null;

		const todaysWorkoutData: TodaysWorkoutData = {
			workoutExercises: [],
			userBodyweight,
			startedAt: new Date(),
			endedAt: null
		};

		if (data === null) {
			return todaysWorkoutData;
		}

		const { isRestDay, splitDayIndex, cycleNumber, todaysSplitDay } = getBasicDayInfo(
			data,
			data.workoutsOfMesocycle.length
		);
		const { mesocycleCyclicSetChanges, workoutsOfMesocycle, mesocycleExerciseSplitDays, ...mesocycleData } = data;

		todaysWorkoutData.workoutOfMesocycle = {
			mesocycle: mesocycleData,
			splitDayName: todaysSplitDay.name,
			workoutStatus: isRestDay ? 'RestDay' : null,
			cycleNumber,
			splitDayIndex
		};

		if (!isRestDay) {
			todaysWorkoutData.workoutExercises = todaysSplitDay.mesocycleSplitDayExercises.map((exercise) => ({
				name: exercise.name,
				targetMuscleGroup: exercise.targetMuscleGroup,
				customMuscleGroup: exercise.customMuscleGroup
			}));
		}

		return todaysWorkoutData;
	}),

	getTodaysWorkoutExercises: t.procedure
		.input(z.strictObject({ userBodyweight: z.number(), splitDayIndex: z.number().int() }))
		.query(async ({ ctx, input }) => {
			const data: ActiveMesocycleWithProgressionData | null = await prisma.mesocycle.findFirst({
				where: {
					userId: ctx.userId,
					startDate: { not: null },
					endDate: null
				},
				include: createActiveMesocycleWithProgressionDataInclude(input.splitDayIndex)
			});

			const noExercisesData: TodaysWorkoutExercises = {
				todaysWorkoutExercises: [],
				previousWorkoutData: null
			};
			if (!data) return noExercisesData;

			const totalWorkouts = await prisma.workoutOfMesocycle.count({ where: { mesocycleId: data?.id } });
			const { isRestDay, cycleNumber, splitDayIndex } = getBasicDayInfo(data, totalWorkouts);
			if (isRestDay) return noExercisesData;

			const todaysWorkoutExercises: TodaysWorkoutExercises = progressiveOverloadMagic(
				data,
				cycleNumber,
				input.userBodyweight,
				splitDayIndex
			);
			return todaysWorkoutExercises;
		}),

	create: t.procedure.input(createWorkoutSchema).mutation(async ({ ctx, input }) => {
		const workout: Prisma.WorkoutUncheckedCreateInput = {
			id: cuid(),
			userId: ctx.userId,
			startedAt: input.workoutData.startedAt,
			endedAt: new Date(),
			userBodyweight: input.workoutData.userBodyweight
		};

		const { workoutOfMesocycle } = input.workoutData;
		if (workoutOfMesocycle) {
			workout.workoutOfMesocycle = {
				create: {
					mesocycleId: workoutOfMesocycle.mesocycle.id,
					splitDayIndex: workoutOfMesocycle.splitDayIndex
				}
			};
		}

		const workoutExercises: Prisma.WorkoutExerciseUncheckedCreateInput[] = input.workoutExercises.map((ex) => ({
			...ex,
			workoutId: workout.id as string,
			id: cuid()
		}));

		const workoutExercisesSets: Prisma.WorkoutExerciseSetUncheckedCreateInput[] = input.workoutExercisesSets.flatMap(
			(sets, exerciseIdx) =>
				sets.map((set) => ({
					...set,
					id: cuid(),
					workoutExerciseId: workoutExercises[exerciseIdx].id as string
				}))
		);

		let setIndex = 0;
		const workoutExercisesMiniSets: Prisma.WorkoutExerciseMiniSetUncheckedCreateInput[] =
			input.workoutExercisesMiniSets.flatMap((sets) =>
				sets.flatMap((miniSets) => {
					const mappedMiniSets = miniSets.map((miniSet) => ({
						...miniSet,
						workoutExerciseSetId: workoutExercisesSets[setIndex].id as string
					}));
					setIndex += 1;
					return mappedMiniSets;
				})
			);

		const transactionQueries: PrismaPromise<unknown>[] = [
			prisma.workout.create({ data: workout }),
			prisma.workoutExercise.createMany({ data: workoutExercises }),
			prisma.workoutExerciseSet.createMany({ data: workoutExercisesSets }),
			prisma.workoutExerciseMiniSet.createMany({ data: workoutExercisesMiniSets })
		];

		let mesocycleCompleted: boolean | undefined = undefined;

		if (workoutOfMesocycle && workoutOfMesocycle.workoutStatus === undefined) {
			const mesocycleData = await prisma.mesocycle.findFirst({
				where: { id: workoutOfMesocycle.mesocycle.id, userId: ctx.userId },
				select: {
					RIRProgression: true,
					mesocycleExerciseSplitDays: { select: { id: true }, orderBy: { dayIndex: 'asc' } },
					_count: { select: { workoutsOfMesocycle: true } }
				}
			});

			if (!mesocycleData) {
				throw new TRPCError({ code: 'BAD_REQUEST', message: 'Mesocycle not found' });
			}

			const todaysSplitDay = mesocycleData.mesocycleExerciseSplitDays[workoutOfMesocycle.splitDayIndex];
			if (!todaysSplitDay) {
				throw new TRPCError({ code: 'BAD_REQUEST', message: 'Related mesocycle exercise split day not found' });
			}

			// Update mesocycle's exercise templates according to new workout
			transactionQueries.push(
				prisma.mesocycleExerciseTemplate.deleteMany({
					where: {
						mesocycleExerciseSplitDay: {
							dayIndex: workoutOfMesocycle.splitDayIndex,
							mesocycle: {
								id: workoutOfMesocycle.mesocycle.id,
								userId: ctx.userId
							}
						}
					}
				}),
				prisma.mesocycleExerciseTemplate.createMany({
					data: workoutExercises.map((ex, exerciseIdx) => {
						const { workoutId, ...exercise } = ex;
						return {
							...exercise,
							mesocycleExerciseSplitDayId: todaysSplitDay.id,
							sets: input.workoutExercisesSets[exerciseIdx].length
						};
					})
				})
			);

			// End mesocycle if all workouts completed
			const totalWorkouts = arraySum(mesocycleData.RIRProgression) * mesocycleData.mesocycleExerciseSplitDays.length;
			const completedWorkouts = mesocycleData._count.workoutsOfMesocycle;

			if (completedWorkouts >= totalWorkouts) {
				transactionQueries.push(
					prisma.mesocycle.update({
						where: { id: workoutOfMesocycle.mesocycle.id, userId: ctx.userId },
						data: { endDate: new Date() }
					})
				);
				mesocycleCompleted = true;
			} else {
				mesocycleCompleted = false;
			}
		}

		await prisma.$transaction(transactionQueries);
		return { message: 'Workout created successfully', mesocycleCompleted };
	}),

	editById: t.procedure
		.input(
			z.strictObject({
				id: z.string().cuid(),
				data: createWorkoutSchema,
				endedAt: z.date().or(z.string().date())
			})
		)
		.mutation(async ({ ctx, input }) => {
			const workout: Prisma.WorkoutUncheckedCreateInput = {
				id: input.id,
				userId: ctx.userId,
				startedAt: input.data.workoutData.startedAt,
				endedAt: input.endedAt,
				userBodyweight: input.data.workoutData.userBodyweight
			};

			const workoutOfMesocycle = await prisma.workoutOfMesocycle.findFirst({
				where: { workoutId: input.id }
			});

			const workoutExercises: Prisma.WorkoutExerciseUncheckedCreateInput[] = input.data.workoutExercises.map((ex) => ({
				...ex,
				workoutId: workout.id as string,
				id: cuid()
			}));

			const workoutExercisesSets: Prisma.WorkoutExerciseSetUncheckedCreateInput[] =
				input.data.workoutExercisesSets.flatMap((sets, exerciseIdx) =>
					sets.map((set) => ({
						...set,
						id: cuid(),
						workoutExerciseId: workoutExercises[exerciseIdx].id as string
					}))
				);

			let setIndex = 0;
			const workoutExercisesMiniSets: Prisma.WorkoutExerciseMiniSetUncheckedCreateInput[] =
				input.data.workoutExercisesMiniSets.flatMap((sets) =>
					sets.flatMap((miniSets) => {
						const mappedMiniSets = miniSets.map((miniSet) => ({
							...miniSet,
							workoutExerciseSetId: workoutExercisesSets[setIndex].id as string
						}));
						setIndex += 1;
						return mappedMiniSets;
					})
				);

			const transactionQueries = [
				prisma.workout.delete({ where: { id: input.id } }),
				prisma.workout.create({ data: workout }),
				prisma.workoutExercise.createMany({ data: workoutExercises }),
				prisma.workoutExerciseSet.createMany({ data: workoutExercisesSets }),
				prisma.workoutExerciseMiniSet.createMany({ data: workoutExercisesMiniSets }),
				...(workoutOfMesocycle ? [prisma.workoutOfMesocycle.create({ data: workoutOfMesocycle })] : [])
			];

			await prisma.$transaction(transactionQueries);
			return { message: 'Workout edited successfully' };
		}),

	completeWorkoutWithoutExercises: t.procedure
		.input(
			z.strictObject({
				splitDayIndex: z.number().int(),
				userBodyweight: z.number(),
				workoutStatus: z.nativeEnum(WorkoutStatus),
				mesocycleId: z.string().cuid()
			})
		)
		.mutation(async ({ ctx, input }) => {
			await prisma.workout.create({
				data: {
					startedAt: new Date(),
					endedAt: new Date(),
					userId: ctx.userId,
					workoutOfMesocycle: {
						create: {
							splitDayIndex: input.splitDayIndex,
							mesocycleId: input.mesocycleId,
							workoutStatus: input.workoutStatus
						}
					},
					userBodyweight: input.userBodyweight
				}
			});
			if (input.workoutStatus === 'RestDay') return { message: 'Rest day completed successfully' };
			else return { message: 'Workout skipped successfully' };
		}),

	getExerciseHistory: t.procedure
		.input(z.strictObject({ exerciseName: z.string(), cursorId: z.string().cuid().optional() }))
		.query(async ({ ctx, input }) => {
			return await prisma.workoutExercise.findMany({
				where: { workout: { userId: ctx.userId }, name: input.exerciseName },
				include: {
					workout: {
						select: {
							startedAt: true,
							workoutOfMesocycle: {
								select: {
									splitDayIndex: true,
									mesocycle: {
										select: {
											name: true,
											mesocycleExerciseSplitDays: {
												select: { name: true },
												orderBy: { dayIndex: 'asc' }
											}
										}
									}
								}
							}
						}
					},
					sets: { include: { miniSets: true } }
				},
				cursor: input.cursorId !== undefined ? { id: input.cursorId } : undefined,
				skip: input.cursorId !== undefined ? 1 : 0,
				take: 10,
				orderBy: { workout: { startedAt: 'desc' } }
			});
		})
});

function getBasicDayInfo(
	mesocycleData: {
		mesocycleExerciseSplitDays: (MesocycleExerciseSplitDay & {
			mesocycleSplitDayExercises: {
				name: string;
				targetMuscleGroup: MuscleGroup;
				customMuscleGroup: string | null;
			}[];
		})[];
		workoutsOfMesocycle: WorkoutOfMesocycle[];
	},
	totalWorkouts: number
) {
	const { mesocycleExerciseSplitDays } = mesocycleData;
	const splitLength = mesocycleExerciseSplitDays.length;
	const todaysSplitDay = mesocycleExerciseSplitDays[totalWorkouts % splitLength];
	const isRestDay = todaysSplitDay.isRestDay;
	const splitDayIndex = totalWorkouts % splitLength;
	const cycleNumber = 1 + Math.floor(totalWorkouts / splitLength);
	return { isRestDay, splitDayIndex, cycleNumber, todaysSplitDay };
}
