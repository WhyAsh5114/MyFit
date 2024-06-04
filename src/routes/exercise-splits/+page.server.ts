import prisma from '$lib/prisma.js';
import { error, fail } from '@sveltejs/kit';
import type {
	ExerciseSplitDayRuneType,
	ExerciseTemplateRuneType
} from './new/exerciseSplitRunes.svelte';

export type ExerciseSplitRuneDataType = {
	splitName: string;
	splitDays: ExerciseSplitDayRuneType[];
	splitExercises: ExerciseTemplateRuneType[][];
};

const take = 10;

export const load = async ({ parent }) => {
	const { session } = await parent();
	if (!session?.user?.id) error(401, 'Not logged in');

	const exerciseSplits = prisma.exerciseSplit.findMany({
		take,
		where: { userId: session.user.id },
		orderBy: { id: 'desc' },
		include: { exerciseSplitDays: true }
	});

	return { exerciseSplits, exerciseSplitsTake: take };
};

export const actions = {
	load_more_exercise_splits: async ({ request, locals }) => {
		const session = await locals.auth();
		if (!session?.user?.id) return fail(403, { message: 'Not logged in' });

		const data = await request.json();
		if (!data.cursorId) return fail(400, { message: "CursorId wasn't received" });

		return await prisma.exerciseSplit.findMany({
			take,
			where: { userId: session.user.id },
			orderBy: { id: 'desc' },
			include: { exerciseSplitDays: true },
			cursor: { id: parseInt(data.cursorId) }
		});
	},
	create_exercise_split: async ({ request, locals }) => {
		const session = await locals.auth();
		if (!session?.user?.id) return fail(403, { message: 'Not logged in' });

		const formData = await request.formData();
		const data = formData.get('exerciseSplitRuneData');
		if (!data) return fail(400, { message: "Exercise split wasn't received" });

		const exerciseSplitRuneData = JSON.parse(data.toString()) as ExerciseSplitRuneDataType;
		// TODO: maybe use interactive transactions to reduce query time from 3.6 seconds...
		await prisma.exerciseSplit.create({
			data: {
				name: exerciseSplitRuneData.splitName,
				userId: session.user.id,
				exerciseSplitDays: {
					create: exerciseSplitRuneData.splitDays.map((splitDay, idx) => ({
						...splitDay,
						exercises: { createMany: { data: exerciseSplitRuneData.splitExercises[idx] } }
					}))
				}
			}
		});
		return { success: true, message: 'Exercise split created successfully' };
	}
};
