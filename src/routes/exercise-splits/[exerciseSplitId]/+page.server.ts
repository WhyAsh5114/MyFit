import prisma from '$lib/prisma.js';
import { error, fail } from '@sveltejs/kit';

export const load = async ({ params, parent }) => {
	const { session } = await parent();
	if (!session?.user?.id) error(401, 'Not logged in');

	const exerciseSplitId = parseInt(params.exerciseSplitId);
	if (isNaN(exerciseSplitId) || exerciseSplitId < 0) error(400, 'Invalid exercise split ID');

	const exerciseSplit = prisma.exerciseSplit.findUnique({
		where: { userId: session.user.id, id: parseInt(params.exerciseSplitId) },
		include: { exerciseSplitDays: { include: { exercises: true } } }
	});

	return { exerciseSplit };
};

export const actions = {
	delete_exercise_split: async ({ locals, params }) => {
		const session = await locals.auth();
		if (!session?.user?.id) return fail(403, { message: 'Not logged in' });

		await prisma.exerciseSplit.delete({
			where: { userId: session.user.id, id: parseInt(params.exerciseSplitId) }
		});
		return { message: 'Exercise split deleted successfully' };
	}
};
