import prisma from '$lib/prisma';
import { error } from '@sveltejs/kit';

export const load = async ({ parent }) => {
	const { session } = await parent();
	if (!session?.user?.id) error(401, 'Not logged in');

	const exerciseSplits = prisma.exerciseSplit.findMany({
		where: { userId: session.user.id },
		orderBy: { id: 'desc' }
	});

	return { exerciseSplits };
};
