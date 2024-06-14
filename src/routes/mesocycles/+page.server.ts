import prisma from '$lib/prisma.js';
import { error, fail } from '@sveltejs/kit';
import { Prisma, type ExerciseSplit, type ExerciseSplitDay } from '@prisma/client';
import type {
	MesocycleCyclicSetChangeWithoutIDs,
	MesocycleExerciseTemplateWithoutIDs,
	MesocycleRuneType
} from './manage/mesocycleRunes.svelte.js';

type ExerciseSplitWithSplitDays = ExerciseSplit & {
	exerciseSplitDays: Omit<ExerciseSplitDay, 'id' | 'exerciseSplitId' | 'exercises'>[];
};

export type CreateMesocycleActionDataType = {
	mesocycle: MesocycleRuneType;
	mesocycleCyclicSetChanges: MesocycleCyclicSetChangeWithoutIDs[];
	mesocycleExerciseTemplates: MesocycleExerciseTemplateWithoutIDs[][];
	exerciseSplit: ExerciseSplitWithSplitDays;
};

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
	},
	create_mesocycle: async ({ request, locals }) => {
		const session = await locals.auth();
		if (!session?.user?.id) return fail(403, { message: 'Not logged in' });

		const formData = await request.formData();
		const data = formData.get('mesocycleRuneData');
		if (!data) return fail(400, { message: "Mesocycle wasn't received" });

		const mesocycleCreateData = JSON.parse(data.toString()) as CreateMesocycleActionDataType;
		await prisma.mesocycle.create({
			data: {
				...mesocycleCreateData.mesocycle,
				userId: session.user.id,
				exerciseSplitId: mesocycleCreateData.exerciseSplit.id,
				mesocycleCyclicSetChanges: {
					createMany: { data: mesocycleCreateData.mesocycleCyclicSetChanges }
				},
				mesocycleExerciseSplitDays: {
					create: mesocycleCreateData.exerciseSplit.exerciseSplitDays.map((splitDay, idx) => ({
						...splitDay,
						mesocycleSplitDayExercises: {
							createMany: { data: mesocycleCreateData.mesocycleExerciseTemplates[idx] }
						}
					}))
				}
			}
		});
		return { success: true, message: 'Mesocycle created successfully' };
	}
};
