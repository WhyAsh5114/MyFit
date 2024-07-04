import { prisma } from '$lib/prisma';
import {
	createWorkoutExerciseInProgressFromMesocycleExerciseTemplate,
	type TodaysWorkoutData,
	type WorkoutExerciseInProgress
} from '$lib/mesoToWorkouts';
import { t } from '$lib/trpc/t';
import type {
	MesocycleExerciseSplitDay,
	MuscleGroup,
	Prisma,
	WorkoutOfMesocycle
} from '@prisma/client';
import { z } from 'zod';

const includeProgressionDataClause = {
	mesocycleExerciseSplitDays: { include: { mesocycleSplitDayExercises: true } },
	mesocycleCyclicSetChanges: true,
	workoutsOfMesocycle: { include: { workout: { include: { workoutExercises: true } } } }
} as const;

type ActiveMesocycleWithProgressionData = Prisma.MesocycleGetPayload<{
	include: typeof includeProgressionDataClause;
}>;

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
		const lastWorkout = data?.workoutsOfMesocycle.map((v) => v.workout).at(-1);
		const userBodyweight = lastWorkout?.userBodyweight ?? null;
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

	const todaysSplitDay = mesocycleExerciseSplitDays[workoutsOfMesocycle.length];
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
