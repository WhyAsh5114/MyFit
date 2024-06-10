import prisma from '$lib/prisma.js';
import { error, fail } from '@sveltejs/kit';
import { Prisma } from '@prisma/client';

const take = 10;

export const load = async ({ parent, url }) => {
	const { session } = await parent();
	if (!session?.user?.id) error(401, 'Not logged in');

	const whereClause: Prisma.MesocycleWhereInput = { userId: session.user.id };
	const searchString = url.searchParams.get('search');
	if (searchString) whereClause.name = { contains: searchString };

	const mesocycles = prisma.mesocycle.findMany({
		take,
		where: whereClause,
		orderBy: { id: 'desc' }
	});

	return { mesocycles, mesocyclesTake: take };
};

export const actions = {
	load_more_mesocycles: async ({ request, locals }) => {
		const session = await locals.auth();
		if (!session?.user?.id) return fail(403, { message: 'Not logged in' });

		const data = await request.json();
		if (!data.cursorId) return fail(400, { message: "CursorId wasn't received" });

		return await prisma.mesocycle.findMany({
			take,
			skip: 1,
			where: { userId: session.user.id },
			orderBy: { id: 'desc' },
			cursor: { id: parseInt(data.cursorId) }
		});
	}
};
