import prisma from '$lib/prisma.js';
import { fail } from '@sveltejs/kit';
import type {
	ExerciseSplitDayRuneType,
	ExerciseTemplateRuneType
} from './[mode]/exerciseSplitRunes.svelte';

export type ExerciseSplitRuneDataType = {
	splitName: string;
	splitDays: ExerciseSplitDayRuneType[];
	splitExercises: ExerciseTemplateRuneType[][];
};

export const load = async ({ parent, url }) => {
	const { session } = await parent();
	const cursorId = url.searchParams.get('cursorId');
	const cursor = cursorId ? { id: parseInt(cursorId) } : undefined;

	const exerciseSplits = prisma.exerciseSplit.findMany({
		take: 5,
		skip: cursor ? 1 : 0,
		cursor,
		where: { userId: session.user.id },
		orderBy: { id: 'asc' }
	});

	return { exerciseSplits };
};

export const actions = {
	create_exercise_split: async ({ request, locals }) => {
		const session = await locals.auth();
		if (!session?.user?.id) return fail(403, { message: 'Not logged in' });

		const formData = await request.formData();
		const data = formData.get('exerciseSplitRuneData');
		if (!data) return fail(400, { message: "Exercise split wasn't received" });

		try {
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
		} catch (error) {
			console.error(error);
			return fail(500, { message: 'Internal server error' });
		}
	}
};
