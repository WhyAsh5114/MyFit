import { prisma } from '$lib/prisma';
import {
	createWorkoutExerciseInProgressFromMesocycleExerciseTemplate,
	type WorkoutExerciseInProgress,
	type WorkoutInProgress
} from '$lib/mesoToWorkouts';
import { t } from '$lib/trpc/t';
import type { Prisma } from '@prisma/client';
import { z } from 'zod';

const includeMesocycleClause = {
	mesocycleExerciseSplitDays: { include: { mesocycleSplitDayExercises: true } },
	mesocycleCyclicSetChanges: true,
	workoutsOfMesocycle: { include: { workout: { include: { workoutExercises: true } } } }
} as const;

type ActiveMesocycleWithProgressionData = Prisma.MesocycleGetPayload<{
	include: typeof includeMesocycleClause;
}>;

export const workouts = t.router({
	getTodaysWorkoutData: t.procedure
		.input(z.strictObject({ userBodyweight: z.number().optional() }))
		.query(async ({ ctx, input }) => {
			const data = await prisma.mesocycle.findFirst({
				where: { userId: ctx.userId, startDate: { not: null }, endDate: null },
				include: includeMesocycleClause
			});
			const userBodyweight =
				input.userBodyweight ??
				(
					await prisma.workout.findFirst({
						where: { userId: ctx.userId },
						orderBy: { createdAt: 'desc' }
					})
				)?.userBodyweight ??
				null;

			if (data === null)
				return { workoutExercises: [], userBodyweight } satisfies WorkoutInProgress;

			const { mesocycleExerciseSplitDays, workoutsOfMesocycle } = data;
			const totalWorkouts = workoutsOfMesocycle.length;
			const splitLength = mesocycleExerciseSplitDays.length;
			const todaysSplitDay = mesocycleExerciseSplitDays[totalWorkouts];
			const isRestDay = mesocycleExerciseSplitDays[totalWorkouts].isRestDay;

			if (isRestDay)
				return {
					workoutExercises: [],
					workoutOfMesocycle: {
						mesocycleName: data.name,
						splitDayName: '',
						workoutStatus: 'RestDay',
						dayNumber: (totalWorkouts % splitLength) + 1,
						cycleNumber: 1 + Math.floor(totalWorkouts / splitLength)
					},
					userBodyweight
				} satisfies WorkoutInProgress;
			else
				return {
					workoutExercises: progressiveOverloadMagic(data, userBodyweight),
					workoutOfMesocycle: {
						mesocycleName: data.name,
						splitDayName: todaysSplitDay.name,
						dayNumber: (totalWorkouts % splitLength) + 1,
						cycleNumber: 1 + Math.floor(totalWorkouts / splitLength)
					},
					userBodyweight
				} satisfies WorkoutInProgress;
		})
});

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
	const workoutExercises = todaysSplitDay.mesocycleSplitDayExercises.map((fullExercise) =>
		createWorkoutExerciseInProgressFromMesocycleExerciseTemplate(fullExercise)
	);

	// Fill in reps, load, RIR from previous workouts (lastSetToFailure?)
	// Add miniSets and stuff if drop / myorep match sets
	// Match RIR according to forceRIRMatching and RIRProgression
	// Perform progressive overload according to mesocycle progression values
	// Increase sets based on cyclic set changes

	return workoutExercises;
}
