import {
	createWorkoutExerciseInProgressFromMesocycleExerciseTemplate,
	type TodaysWorkoutData,
	type WorkoutExerciseInProgress
} from '$lib/mesoToWorkouts';
import { prisma } from '$lib/prisma';
import { t } from '$lib/trpc/t';
import {
	WorkoutExerciseCreateWithoutWorkoutInputSchema,
	WorkoutExerciseMiniSetCreateWithoutParentSetInputSchema,
	WorkoutExerciseSetCreateWithoutWorkoutExerciseInputSchema
} from '$lib/zodSchemas';
import {
	WorkoutStatus,
	type MesocycleExerciseSplitDay,
	type MuscleGroup,
	type Prisma,
	type WorkoutOfMesocycle
} from '@prisma/client';
import { TRPCError } from '@trpc/server';
import cuid from 'cuid';
import { z } from 'zod';

const includeProgressionDataClause = {
	mesocycleExerciseSplitDays: { include: { mesocycleSplitDayExercises: true } },
	mesocycleCyclicSetChanges: true,
	workoutsOfMesocycle: { include: { workout: { include: { workoutExercises: true } } } }
} as const;

type ActiveMesocycleWithProgressionData = Prisma.MesocycleGetPayload<{
	include: typeof includeProgressionDataClause;
}>;

const todaysWorkoutDataSchema = z.object({
	startedAt: z.date().or(z.string().datetime()),
	userBodyweight: z.number().nullable(),
	workoutOfMesocycle: z
		.object({
			mesocycle: z.object({ id: z.string().cuid() }),
			splitDayName: z.string(),
			workoutStatus: z.nativeEnum(WorkoutStatus).optional(),
			dayNumber: z.number().int(),
			cycleNumber: z.number().int()
		})
		.optional()
});

const createWorkoutSchema = z.strictObject({
	workoutData: todaysWorkoutDataSchema,
	workoutExercises: z.array(WorkoutExerciseCreateWithoutWorkoutInputSchema),
	workoutExercisesSets: z.array(z.array(WorkoutExerciseSetCreateWithoutWorkoutExerciseInputSchema)),
	workoutExercisesMiniSets: z.array(
		z.array(z.array(WorkoutExerciseMiniSetCreateWithoutParentSetInputSchema))
	)
});

export const workouts = t.router({
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
					include: { workout: { include: { workoutExercises: true } } },
					orderBy: { workout: { startedAt: 'desc' } }
				}
			}
		});
		const lastBodyweight = data?.workoutsOfMesocycle
			.map((v) => v.workout.userBodyweight)
			.filter((b) => b !== null)
			.at(-1);
		const userBodyweight = lastBodyweight ?? null;
		if (data === null)
			return {
				workoutExercises: [],
				userBodyweight,
				startedAt: new Date()
			} satisfies TodaysWorkoutData;

		const { isRestDay, dayNumber, cycleNumber, todaysSplitDay } = getBasicDayInfo(data);
		const {
			mesocycleCyclicSetChanges,
			workoutsOfMesocycle,
			mesocycleExerciseSplitDays,
			...mesocycleData
		} = data;

		if (isRestDay)
			return {
				workoutExercises: [],
				workoutOfMesocycle: {
					mesocycle: mesocycleData,
					splitDayName: '',
					workoutStatus: 'RestDay',
					dayNumber,
					cycleNumber
				},
				userBodyweight,
				startedAt: new Date()
			} satisfies TodaysWorkoutData;
		else
			return {
				workoutExercises: todaysSplitDay.mesocycleSplitDayExercises.map((exercise) => ({
					name: exercise.name,
					targetMuscleGroup: exercise.targetMuscleGroup,
					customMuscleGroup: exercise.customMuscleGroup
				})),
				workoutOfMesocycle: {
					mesocycle: mesocycleData,
					splitDayName: todaysSplitDay.name,
					dayNumber,
					cycleNumber
				},
				userBodyweight,
				startedAt: new Date()
			} satisfies TodaysWorkoutData;
	}),

	getTodaysWorkoutExercises: t.procedure
		.input(z.strictObject({ userBodyweight: z.number() }))
		.query(async ({ ctx, input }) => {
			const data = await prisma.mesocycle.findFirst({
				where: { userId: ctx.userId, startDate: { not: null }, endDate: null },
				include: includeProgressionDataClause
			});
			if (!data) return [];

			const { isRestDay } = getBasicDayInfo(data);
			if (isRestDay) return [];

			return progressiveOverloadMagic(data, input.userBodyweight);
		}),

	createWorkout: t.procedure.input(createWorkoutSchema).mutation(async ({ ctx, input }) => {
		const workout: Prisma.WorkoutUncheckedCreateInput = {
			id: cuid(),
			userId: ctx.userId,
			startedAt: input.workoutData.startedAt,
			endedAt: new Date(),
			userBodyweight: input.workoutData.userBodyweight
		};
		if (input.workoutData.workoutOfMesocycle)
			workout.workoutOfMesocycle = {
				create: {
					mesocycleId: input.workoutData.workoutOfMesocycle.mesocycle.id,
					splitDayName: input.workoutData.workoutOfMesocycle.splitDayName
				}
			};
		const workoutExercises: Prisma.WorkoutExerciseUncheckedCreateInput[] =
			input.workoutExercises.map((ex) => ({ ...ex, workoutId: workout.id as string, id: cuid() }));

		const workoutExercisesSets: Prisma.WorkoutExerciseSetUncheckedCreateInput[] =
			input.workoutExercisesSets.flatMap((sets, exerciseIdx) =>
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

		// TODO: update mesocycleExerciseSplitDays... oh god

		const transactionQueries = [
			prisma.workout.create({ data: workout }),
			prisma.workoutExercise.createMany({ data: workoutExercises }),
			prisma.workoutExerciseSet.createMany({ data: workoutExercisesSets }),
			prisma.workoutExerciseMiniSet.createMany({ data: workoutExercisesMiniSets })
		];

		await prisma.$transaction(transactionQueries);
		return { message: 'Workout created successfully' };
	}),

	completeRestDay: t.procedure.mutation(async ({ ctx }) => {
		const activeMesocycle = await prisma.mesocycle.findFirst({
			where: { userId: ctx.userId, startDate: { not: null }, endDate: null },
			select: { id: true }
		});
		if (!activeMesocycle)
			throw new TRPCError({ code: 'BAD_REQUEST', message: 'No active mesocycle found' });

		await prisma.workout.create({
			data: {
				startedAt: new Date(),
				endedAt: new Date(),
				userId: ctx.userId,
				workoutOfMesocycle: {
					create: { splitDayName: '', mesocycleId: activeMesocycle.id, workoutStatus: 'RestDay' }
				}
			}
		});
		return { message: 'Rest day completed successfully' };
	})
});

function getBasicDayInfo(mesocycleData: {
	mesocycleExerciseSplitDays: (MesocycleExerciseSplitDay & {
		mesocycleSplitDayExercises: {
			name: string;
			targetMuscleGroup: MuscleGroup;
			customMuscleGroup: string | null;
		}[];
	})[];
	workoutsOfMesocycle: WorkoutOfMesocycle[];
}) {
	const { mesocycleExerciseSplitDays, workoutsOfMesocycle } = mesocycleData;
	const totalWorkouts = workoutsOfMesocycle.length;
	const splitLength = mesocycleExerciseSplitDays.length;
	const todaysSplitDay = mesocycleExerciseSplitDays[totalWorkouts % splitLength];
	const isRestDay = todaysSplitDay.isRestDay;
	const dayNumber = (totalWorkouts % splitLength) + 1;
	const cycleNumber = 1 + Math.floor(totalWorkouts / splitLength);
	return { isRestDay, dayNumber, cycleNumber, todaysSplitDay };
}

function progressiveOverloadMagic(
	mesocycleWithProgressionData: ActiveMesocycleWithProgressionData,
	userBodyweight: number | null
): WorkoutExerciseInProgress[] {
	const {
		mesocycleCyclicSetChanges,
		mesocycleExerciseSplitDays,
		workoutsOfMesocycle,
		...mesocycle
	} = mesocycleWithProgressionData;

	const todaysSplitDay =
		mesocycleExerciseSplitDays[workoutsOfMesocycle.length % mesocycleExerciseSplitDays.length];
	const workoutExercises = todaysSplitDay.mesocycleSplitDayExercises.map((fullExercise) => {
		const { mesocycleExerciseSplitDayId, ...exercise } = fullExercise;
		return createWorkoutExerciseInProgressFromMesocycleExerciseTemplate(exercise);
	});

	// Fill in reps, load, RIR from previous workouts (lastSetToFailure?)
	// Add miniSets and stuff if drop / myorep match sets
	// Match RIR according to forceRIRMatching and RIRProgression
	// Perform progressive overload according to mesocycle progression values
	// Increase sets based on cyclic set changes

	return workoutExercises;
}
