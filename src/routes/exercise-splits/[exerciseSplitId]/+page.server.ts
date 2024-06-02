import prisma from '$lib/prisma.js';
import { error } from '@sveltejs/kit';

export const load = async ({ params, parent }) => {
	const { session } = await parent();
	if (!session?.user?.id) error(401, 'Not logged in');

	const exerciseSplit = await prisma.exerciseSplit.findUnique({
		where: { userId: session.user.id, id: parseInt(params.exerciseSplitId) },
		include: { exerciseSplitDays: true }
	});

	return { exerciseSplit };
};
