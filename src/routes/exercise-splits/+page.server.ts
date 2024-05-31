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

export const load = async ({ parent }) => {
	const { session } = await parent();

	const exerciseSplitsCount = prisma.exerciseSplit.count();
	const exerciseSplits = prisma.exerciseSplit.findMany({
		where: { userId: session?.user?.id },
		include: { exerciseSplitDays: { select: { name: true, isRestDay: true } } }
	});
	return { exerciseSplits, exerciseSplitsCount };
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
