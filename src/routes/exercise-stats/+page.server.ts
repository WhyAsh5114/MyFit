import { prisma } from '$lib/prisma.js';
import { redirect } from '@sveltejs/kit';

export const load = async ({ parent }) => {
	const { session } = await parent();
	if (!session) redirect(302, '/');

	const exerciseList = prisma.workoutExercise.findMany({
		where: { workout: { userId: session.user!.id } },
		select: { name: true, targetMuscleGroup: true, customMuscleGroup: true },
		distinct: ['name']
	});

	return { exerciseList };
};
