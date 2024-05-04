import prisma from '$lib/prisma.js';

export const load = async ({ parent }) => {
	const { session } = await parent();

	const exerciseSplits = prisma.exerciseSplit.findMany({
		where: { userId: session?.user?.id }
	});
	return { exerciseSplits };
};
