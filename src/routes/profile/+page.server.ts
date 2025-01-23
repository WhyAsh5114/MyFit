import { prisma } from '$lib/prisma.js';
import { createContext } from '$lib/trpc/context';
import { createCaller } from '$lib/trpc/router';
import { redirect } from '@sveltejs/kit';

export const load = async (event) => {
	const trpc = createCaller(await createContext(event));
	const session = await event.locals.auth();
	if (!session) redirect(302, '/');

	return {
		V2Counts: trpc.users.checkV2MigrationAvailability(),
		userCounts: {
			workouts: prisma.workout.count({ where: { userId: session.user?.id } }),
			exercises: prisma.workoutExercise.count({ where: { workout: { userId: session.user?.id } } }),
			sets: prisma.workoutExerciseSet.count({ where: { workoutExercise: { workout: { userId: session.user?.id } } } })
		}
	};
};
