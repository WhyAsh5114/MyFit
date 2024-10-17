import { prisma } from '$lib/prisma.js';
import type { Session } from '@auth/sveltekit';
import { redirect } from '@sveltejs/kit';

export const load = async ({ parent, url }) => {
	const { session } = await parent();
	if (session && !url.searchParams.has('forceView')) redirect(302, '/dashboard');

	return {
		session,
		workoutCount: prisma.workout.count(),
		exerciseCount: prisma.workoutExercise.count(),
		setsCount: prisma.workoutExerciseSet.count()
	};
};

export type HomePageCounts = {
	session: Session | null;
	workoutCount: Promise<number>;
	exerciseCount: Promise<number>;
	setsCount: Promise<number>;
};
