import prisma from '$lib/prisma.js';
import { error } from '@sveltejs/kit';

export const load = async ({ url, locals, parent }) => {
	const { session } = await parent();
	if (!session?.user?.id) error(401, 'Not logged in');

	const exerciseSplitId = parseInt(url.searchParams.get('exerciseSplitId') ?? '');
	if (isNaN(exerciseSplitId)) error(400, 'No exercise split ID given');

	const exerciseSplit = prisma.exerciseSplit.findUnique({
		where: { userId: session.user.id, id: exerciseSplitId },
		include: { exerciseSplitDays: { include: { exercises: true } } }
	});

	return { exerciseSplit };
};
