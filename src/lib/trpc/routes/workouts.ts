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
import { createId } from '@paralleldrive/cuid2';
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
	note: string | null;
};

type WorkoutExercisesWithPreviousData = {
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
			include: { mesocycleSplitDayExercises: { orderBy: { exerciseIndex: 'asc' } } },
			orderBy: { dayIndex: 'asc' }
		},
		mesocycleCyclicSetChanges: true,
		workoutsOfMesocycle: {
			include: {
				workout: {
					include: {
						workoutExercises: {
							include: {
								sets: { include: { miniSets: { orderBy: { miniSetIndex: 'asc' } } }, orderBy: { setIndex: 'asc' } }
							},
							orderBy: { exerciseIndex: 'asc' }
						}
					}
				}
			},
			orderBy: { workout: { startedAt: 'asc' } },
			...workoutsWhere
		}
	});
};

export type ActiveMesocycleWithProgressionData = Prisma.MesocycleGetPayload<{
	include: ReturnType<typeof createActiveMesocycleWithProgressionDataInclude>;
}>;

const workoutInputDataSchema = z.object({
	startedAt: z.date().or(z.string().datetime()).optional(),
	userBodyweight: z.number(),
	workoutOfMesocycle: z
		.object({
			mesocycle: z.object({ id: z.string().cuid2() }),
			splitDayIndex: z.number().int(),
			workoutStatus: z.nativeEnum(WorkoutStatus).nullable()
		})
		.optional(),
	note: z.string().optional()
});

const createWorkoutSchema = z.strictObject({
	workoutData: workoutInputDataSchema,
	workoutExercises: z.array(WorkoutExerciseCreateWithoutWorkoutInputSchema),
	workoutExercisesSets: z.array(z.array(WorkoutExerciseSetCreateWithoutWorkoutExerciseInputSchema)),
	workoutExercisesMiniSets: z.array(z.array(z.array(WorkoutExerciseMiniSetCreateWithoutParentSetInputSchema)))
});

const loadWorkoutsSchema = z.strictObject({
	cursorId: z.string().cuid2().optional(),
	filters: z
		.object({
			startDate: z.date().optional(),
			endDate: z.date().optional(),
			selectedWorkoutStatuses: z.array(z.union([z.literal('RestDay'), z.literal('Skipped'), z.null()])).optional(),
			selectedMesocycles: z.array(z.union([z.string(), z.null()])).optional()
		})
		.optional()
});

export const workouts = t.router({
	load: t.procedure.input(loadWorkoutsSchema).query(async ({ input, ctx }) => {
		let whereClause: Prisma.WorkoutWhereInput = { userId: ctx.userId };
		const andConditions: Prisma.WorkoutWhereInput['AND'] = [];
		const { filters } = input;

		if (filters?.startDate) {
			whereClause = { ...whereClause, startedAt: { gte: filters.startDate } };
		}

		if (filters?.endDate) {
			const endDate = new Date(Number(filters.endDate) + 1000 * 60 * 60 * 24);
			whereClause = { ...whereClause, startedAt: { lte: endDate } };
		}

		if (filters?.selectedWorkoutStatuses) {
			const orClause: Prisma.WorkoutWhereInput['OR'] = [
				{ workoutOfMesocycle: { workoutStatus: { in: filters.selectedWorkoutStatuses.filter((m) => m !== null) } } }
			];

			if (filters.selectedWorkoutStatuses.includes(null)) {
				orClause.push({ workoutOfMesocycle: { workoutStatus: { equals: null } } });
				orClause.push({ workoutOfMesocycle: null });
			}

			andConditions.push({ OR: orClause });
		}

		if (filters?.selectedMesocycles) {
			const orClause: Prisma.WorkoutWhereInput['OR'] = [
				{ workoutOfMesocycle: { mesocycle: { name: { in: filters.selectedMesocycles.filter((m) => m !== null) } } } }
			];

			if (filters.selectedMesocycles.includes(null)) {
				orClause.push({ workoutOfMesocycle: null });
			}

			andConditions.push({ OR: orClause });
		}

		whereClause = { ...whereClause, AND: andConditions };

		return prisma.workout.findMany({
			where: whereClause,
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

	getFilterData: t.procedure.query(async ({ ctx }) => {
		const firstWorkout = await prisma.workout.findFirst({
			where: { userId: ctx.userId },
			select: { startedAt: true },
			orderBy: { startedAt: 'asc' }
		});

		if (!firstWorkout) {
			return null;
		}
		const firstWorkoutDate = firstWorkout.startedAt;

		const lastWorkout = await prisma.workout.findFirst({
			where: { userId: ctx.userId },
			select: { startedAt: true },
			orderBy: { startedAt: 'desc' }
		});
		const lastWorkoutDate = lastWorkout!.startedAt;

		const allMesocycles = await prisma.mesocycle.findMany({
			where: { userId: ctx.userId },
			select: { name: true, startDate: true, endDate: true }
		});

		return { firstWorkoutDate, lastWorkoutDate, allMesocycles };
	}),

	findById: t.procedure.input(z.string().cuid2()).query(({ input, ctx }) =>
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
				workoutExercises: {
					orderBy: { exerciseIndex: 'asc' },
					include: {
						sets: { include: { miniSets: { orderBy: { miniSetIndex: 'asc' } } }, orderBy: { setIndex: 'asc' } }
					}
				}
			}
		})
	),

	deleteById: t.procedure.input(z.string().cuid2()).mutation(async ({ input, ctx }) => {
		const workoutToDelete = await prisma.workout.findUniqueOrThrow({
			where: { userId: ctx.userId, id: input },
			select: {
				workoutOfMesocycle: {
					select: {
						id: true,
						splitDayIndex: true,
						mesocycle: {
							select: {
								id: true,
								startDate: true,
								endDate: true,
								mesocycleExerciseSplitDays: { select: { name: true } }
							}
						}
					}
				}
			}
		});

		const mesocycle = workoutToDelete.workoutOfMesocycle?.mesocycle;
		if (mesocycle && mesocycle.startDate && mesocycle.endDate === null) {
			const wom = workoutToDelete.workoutOfMesocycle!;
			const workoutsOfMeso = await prisma.workout.findMany({
				where: { workoutOfMesocycle: { mesocycleId: mesocycle.id } },
				select: { workoutOfMesocycle: { select: { splitDayIndex: true } } }
			});

			const workoutsPerSplitDay: number[] = Array(mesocycle.mesocycleExerciseSplitDays.length).fill(0);
			workoutsOfMeso.forEach((w) => workoutsPerSplitDay[w.workoutOfMesocycle!.splitDayIndex]++);

			const maxSplitDayWorkouts = Math.max(...workoutsPerSplitDay);
			const lastSplitDayPerformed = workoutsPerSplitDay.findLastIndex((count) => count === maxSplitDayWorkouts);

			if (lastSplitDayPerformed !== wom.splitDayIndex) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: `You can only delete the latest workout of the active mesocycle: ${mesocycle.mesocycleExerciseSplitDays[lastSplitDayPerformed].name} (Day ${lastSplitDayPerformed + 1})`
				});
			}
		}

		await prisma.workout.delete({ where: { id: input, userId: ctx.userId } });
		return { message: 'Workout deleted successfully' };
	}),

	getTodaysWorkoutData: t.procedure.query(async ({ ctx }) => {
		const data = await prisma.mesocycle.findFirst({
			where: { userId: ctx.userId, startDate: { not: null }, endDate: null },
			include: {
				mesocycleExerciseSplitDays: {
					include: {
						mesocycleSplitDayExercises: {
							select: { name: true, targetMuscleGroup: true, customMuscleGroup: true },
							orderBy: { exerciseIndex: 'asc' }
						}
					},
					orderBy: { dayIndex: 'asc' }
				},
				mesocycleCyclicSetChanges: true,
				workoutsOfMesocycle: {
					include: { workout: true },
					orderBy: { workout: { startedAt: 'desc' } }
				}
			}
		});
		const lastBodyweight = data?.workoutsOfMesocycle.map((wm) => wm.workout.userBodyweight)[0];
		const userBodyweight = lastBodyweight ?? null;

		const todaysWorkoutData: TodaysWorkoutData = {
			workoutExercises: [],
			userBodyweight,
			startedAt: new Date(),
			endedAt: null,
			note: null
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

	getSkippedWorkoutData: t.procedure.input(z.number().int()).query(async ({ ctx, input }) => {
		const splitDayIndex = input;

		const data = await prisma.mesocycle.findFirst({
			where: { userId: ctx.userId, startDate: { not: null }, endDate: null },
			include: {
				mesocycleExerciseSplitDays: {
					include: {
						mesocycleSplitDayExercises: {
							select: { name: true, targetMuscleGroup: true, customMuscleGroup: true },
							orderBy: { exerciseIndex: 'asc' }
						}
					},
					orderBy: { dayIndex: 'asc' }
				},
				mesocycleCyclicSetChanges: true,
				workoutsOfMesocycle: {
					include: { workout: true },
					orderBy: { workout: { startedAt: 'desc' } }
				}
			}
		});
		const lastBodyweight = data?.workoutsOfMesocycle.map((wm) => wm.workout.userBodyweight)[0];
		const userBodyweight = lastBodyweight ?? null;

		const todaysWorkoutData: TodaysWorkoutData = {
			workoutExercises: [],
			userBodyweight,
			startedAt: new Date(),
			endedAt: null,
			note: null
		};

		if (data === null) {
			return todaysWorkoutData;
		}

		const { isRestDay, cycleNumber, todaysSplitDay } = getBasicDayInfoForSkippedWorkout(
			data,
			data.workoutsOfMesocycle.length,
			splitDayIndex
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

	getSkippedWorkoutsOfCurrentCycle: t.procedure.query(async ({ ctx }) => {
		const data = await prisma.mesocycle.findFirst({
			where: { userId: ctx.userId, startDate: { not: null }, endDate: null },
			select: {
				mesocycleExerciseSplitDays: {
					select: { name: true },
					orderBy: { dayIndex: 'asc' }
				},
				workoutsOfMesocycle: {
					select: { splitDayIndex: true, workoutStatus: true },
					orderBy: { workout: { startedAt: 'desc' } }
				}
			}
		});

		if (data === null) {
			return [];
		}

		const { workoutsOfMesocycle, mesocycleExerciseSplitDays } = data;
		const currentCycleWorkouts = workoutsOfMesocycle.slice(
			0,
			workoutsOfMesocycle.length % mesocycleExerciseSplitDays.length
		);
		const skippedWorkouts = currentCycleWorkouts.filter((wm) => wm.workoutStatus === 'Skipped');
		const skippedWorkoutsWithNames = skippedWorkouts
			.map((workout) => ({
				...workout,
				splitDayName: mesocycleExerciseSplitDays[workout.splitDayIndex].name
			}))
			.toReversed();

		return skippedWorkoutsWithNames;
	}),

	getWorkoutExercisesWithPreviousData: t.procedure
		.input(z.strictObject({ userBodyweight: z.number(), splitDayIndex: z.number().int() }))
		.query(async ({ ctx, input }) => {
			const { splitDayIndex } = input;
			const data: ActiveMesocycleWithProgressionData | null = await prisma.mesocycle.findFirst({
				where: {
					userId: ctx.userId,
					startDate: { not: null },
					endDate: null
				},
				include: createActiveMesocycleWithProgressionDataInclude(input.splitDayIndex)
			});

			const workoutExercisesWithPreviousData: WorkoutExercisesWithPreviousData = {
				todaysWorkoutExercises: [],
				previousWorkoutData: null
			};
			if (!data) return workoutExercisesWithPreviousData;

			const totalWorkouts = await prisma.workoutOfMesocycle.count({ where: { mesocycleId: data?.id } });
			const { isRestDay, cycleNumber } = getBasicDayInfoForSkippedWorkout(data, totalWorkouts, splitDayIndex);
			if (isRestDay) return workoutExercisesWithPreviousData;

			workoutExercisesWithPreviousData.todaysWorkoutExercises = progressiveOverloadMagic(
				data,
				cycleNumber,
				input.userBodyweight,
				splitDayIndex
			);

			const previousWorkout = data.workoutsOfMesocycle.filter((wm) => wm.workoutStatus === null).at(-1)?.workout;
			if (previousWorkout) {
				workoutExercisesWithPreviousData.previousWorkoutData = {
					exercises: previousWorkout.workoutExercises,
					userBodyweight: previousWorkout.userBodyweight
				};
			}

			return workoutExercisesWithPreviousData;
		}),

	create: t.procedure.input(createWorkoutSchema).mutation(async ({ ctx, input }) => {
		const workout: Prisma.WorkoutUncheckedCreateInput = {
			id: createId(),
			userId: ctx.userId,
			startedAt: input.workoutData.startedAt ?? new Date(),
			endedAt: new Date(),
			userBodyweight: input.workoutData.userBodyweight,
			note: input.workoutData.note
		};

		const { workoutOfMesocycle } = input.workoutData;
		if (workoutOfMesocycle) {
			workout.workoutOfMesocycle = {
				create: {
					mesocycleId: workoutOfMesocycle.mesocycle.id,
					splitDayIndex: workoutOfMesocycle.splitDayIndex,
					workoutStatus: workoutOfMesocycle.workoutStatus
				}
			};
		}

		const workoutExercises: Prisma.WorkoutExerciseUncheckedCreateInput[] = input.workoutExercises.map((ex) => ({
			...ex,
			workoutId: workout.id as string,
			id: createId()
		}));

		const workoutExercisesSets: Prisma.WorkoutExerciseSetUncheckedCreateInput[] = input.workoutExercisesSets.flatMap(
			(sets, exerciseIdx) =>
				sets.map((set) => ({
					...set,
					id: createId(),
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

		if (!workoutOfMesocycle) {
			await prisma.$transaction(transactionQueries);
			return { message: 'Workout created successfully' };
		}

		// Update mesocycle data using this new workout
		const mesocycleData = await prisma.mesocycle.findFirst({
			where: { id: workoutOfMesocycle.mesocycle.id, userId: ctx.userId },
			select: {
				RIRProgression: true,
				mesocycleExerciseSplitDays: { select: { id: true }, orderBy: { dayIndex: 'asc' } },
				workoutsOfMesocycle: {
					select: { workoutId: true, splitDayIndex: true },
					orderBy: { workout: { startedAt: 'desc' } }
				}
			}
		});

		if (!mesocycleData) {
			throw new TRPCError({ code: 'BAD_REQUEST', message: 'Mesocycle not found' });
		}

		// Update mesocycle's exercise templates according to new workout
		if (workoutOfMesocycle.workoutStatus === null) {
			const todaysSplitDay = mesocycleData.mesocycleExerciseSplitDays[workoutOfMesocycle.splitDayIndex];
			if (!todaysSplitDay) {
				throw new TRPCError({ code: 'BAD_REQUEST', message: 'Related mesocycle exercise split day not found' });
			}

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
		}

		// Delete skipped workout if repeating
		const currentCycleWorkouts = mesocycleData.workoutsOfMesocycle.slice(
			0,
			mesocycleData.workoutsOfMesocycle.length % mesocycleData.mesocycleExerciseSplitDays.length
		);
		const repeatOfSkippedWorkout = currentCycleWorkouts.find(
			(wm) => wm.splitDayIndex === input.workoutData.workoutOfMesocycle?.splitDayIndex
		);

		// End mesocycle if all workouts completed (shouldn't happen when repeating skipped workouts)
		let mesocycleCompleted: boolean | undefined = undefined;
		const totalWorkouts = arraySum(mesocycleData.RIRProgression) * mesocycleData.mesocycleExerciseSplitDays.length;
		const completedWorkouts = mesocycleData.workoutsOfMesocycle.length + 1; // +1 as we assume this new workout to be completed as well
		mesocycleCompleted = completedWorkouts >= totalWorkouts;

		if (repeatOfSkippedWorkout) {
			transactionQueries.push(prisma.workout.delete({ where: { id: repeatOfSkippedWorkout.workoutId } }));
		} else if (mesocycleCompleted) {
			transactionQueries.push(
				prisma.mesocycle.update({
					where: { id: workoutOfMesocycle.mesocycle.id, userId: ctx.userId },
					data: { endDate: new Date() }
				})
			);
		}

		await prisma.$transaction(transactionQueries);

		let message = 'Workout created successfully';
		if (workoutOfMesocycle?.workoutStatus === 'RestDay') {
			message = 'Rest day completed successfully';
		}
		if (workoutOfMesocycle?.workoutStatus === 'Skipped') {
			message = 'Workout skipped successfully';
		}
		return { message, mesocycleCompleted };
	}),

	editById: t.procedure
		.input(
			z.strictObject({
				id: z.string().cuid2(),
				data: createWorkoutSchema,
				endedAt: z.date().or(z.string().date())
			})
		)
		.mutation(async ({ ctx, input }) => {
			const workout: Prisma.WorkoutUncheckedCreateInput = {
				id: input.id,
				userId: ctx.userId,
				startedAt: input.data.workoutData.startedAt!,
				endedAt: input.endedAt,
				userBodyweight: input.data.workoutData.userBodyweight,
				note: input.data.workoutData.note
			};

			const workoutOfMesocycle = await prisma.workoutOfMesocycle.findFirst({
				where: { workoutId: input.id }
			});

			const workoutExercises: Prisma.WorkoutExerciseUncheckedCreateInput[] = input.data.workoutExercises.map((ex) => ({
				...ex,
				workoutId: workout.id as string,
				id: createId()
			}));

			const workoutExercisesSets: Prisma.WorkoutExerciseSetUncheckedCreateInput[] =
				input.data.workoutExercisesSets.flatMap((sets, exerciseIdx) =>
					sets.map((set) => ({
						...set,
						id: createId(),
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

	getExerciseHistory: t.procedure
		.input(z.strictObject({ exerciseName: z.string(), cursorId: z.string().cuid2().optional() }))
		.query(async ({ ctx, input }) => {
			return await prisma.workoutExercise.findMany({
				where: { workout: { userId: ctx.userId }, name: input.exerciseName },
				include: {
					workout: {
						select: {
							startedAt: true,
							userBodyweight: true,
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
					sets: { include: { miniSets: true }, orderBy: { setIndex: 'asc' } }
				},
				cursor: input.cursorId !== undefined ? { id: input.cursorId } : undefined,
				skip: input.cursorId !== undefined ? 1 : 0,
				take: 10,
				orderBy: { workout: { startedAt: 'desc' } }
			});
		}),

	getUserExercises: t.procedure.input(z.enum(['minimal', 'extensive'])).query(async ({ ctx, input }) => {
		const selectQuery: Prisma.WorkoutExerciseSelect | undefined =
			input === 'minimal' ? { name: true, targetMuscleGroup: true, customMuscleGroup: true } : undefined;

		return prisma.workoutExercise.findMany({
			where: { workout: { userId: ctx.userId } },
			distinct: ['name'],
			orderBy: { workout: { startedAt: 'desc' } },
			select: selectQuery
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

function getBasicDayInfoForSkippedWorkout(
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
	totalWorkouts: number,
	skippedWorkoutIndex: number
) {
	const { mesocycleExerciseSplitDays } = mesocycleData;
	const splitLength = mesocycleExerciseSplitDays.length;
	const todaysSplitDay = mesocycleExerciseSplitDays[skippedWorkoutIndex];
	const isRestDay = todaysSplitDay.isRestDay;
	const cycleNumber = 1 + Math.floor(totalWorkouts / splitLength);
	return { isRestDay, cycleNumber, todaysSplitDay };
}
