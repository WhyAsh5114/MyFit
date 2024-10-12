import { prisma } from '$lib/prisma.js';
import { redirect } from '@sveltejs/kit';

export const load = async ({ parent }) => {
	const { session } = await parent();
	if (session) redirect(302, '/dashboard');

	return {
		workoutCount: prisma.workout.count(),
		exerciseCount: prisma.workoutExercise.count(),
		setsCount: prisma.workoutExerciseSet.count()
	};
};

export type HomePageCounts = {
	workoutCount: Promise<number>;
	exerciseCount: Promise<number>;
	setsCount: Promise<number>;
};
