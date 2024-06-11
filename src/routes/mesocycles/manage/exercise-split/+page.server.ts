import prisma from '$lib/prisma';
import type { Prisma } from '@prisma/client';
import { error } from '@sveltejs/kit';

export const load = async ({ parent, url }) => {
	const { session } = await parent();
	if (!session?.user?.id) error(401, 'Not logged in');

	const whereClause: Prisma.ExerciseSplitWhereInput = { userId: session.user.id };
	const searchString = url.searchParams.get('search');
	if (searchString) whereClause.name = { contains: searchString };

	const take = 10;
	const exerciseSplits = prisma.exerciseSplit.findMany({
		take,
		where: whereClause,
		orderBy: { id: 'desc' },
		include: { exerciseSplitDays: true }
	});

	return { exerciseSplits, exerciseSplitsTake: take };
};
