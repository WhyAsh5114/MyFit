import { prisma } from '$lib/prisma';
import { createWorkoutExerciseInProgressFromMesocycleExerciseTemplate } from '$lib/mesoToWorkouts';
import { t } from '$lib/trpc/t';
import type { Prisma } from '@prisma/client';

const includeMesocycleClause = {
	mesocycleExerciseSplitDays: { include: { mesocycleSplitDayExercises: true } },
	mesocycleCyclicSetChanges: true,
	workoutsOfMesocycle: { include: { workout: { include: { workoutExercises: true } } } }
} as const;

type ActiveMesocycleWithProgressionData = Prisma.MesocycleGetPayload<{
	include: typeof includeMesocycleClause;
}>;

export const workouts = t.router({
	getTodaysWorkoutExercises: t.procedure.query(async ({ ctx }) => {
		const data = await prisma.mesocycle.findFirst({
			where: { userId: ctx.userId, startDate: { not: null }, endDate: null },
			include: includeMesocycleClause
		});
		if (data === null) return null;
		return progressiveOverloadMagic(data);
	})
});

function progressiveOverloadMagic(
	mesocycleWithProgressionData: ActiveMesocycleWithProgressionData
) {
	const {
		mesocycleCyclicSetChanges,
		mesocycleExerciseSplitDays,
		workoutsOfMesocycle,
		...mesocycle
	} = mesocycleWithProgressionData;

	const todaysSplitDay = mesocycleExerciseSplitDays[workoutsOfMesocycle.length];
	if (todaysSplitDay.isRestDay) return 'RestDay';

	const workoutExercises = todaysSplitDay.mesocycleSplitDayExercises.map((fullExercise) =>
		createWorkoutExerciseInProgressFromMesocycleExerciseTemplate(fullExercise)
	);

	// Fill in reps, load, RIR from previous workouts (lastSetToFailure?)
	// Match RIR according to forceRIRMatching and RIRProgression
	// Perform progressive overload according to mesocycle progression values
	// Increase sets based on cyclic set changes

	return workoutExercises;
}
