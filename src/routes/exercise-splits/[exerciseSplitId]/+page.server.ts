import prisma from '$lib/prisma.js';
import { fail } from '@sveltejs/kit';
import { createContext } from '$lib/trpc/context';
import { createCaller } from '$lib/trpc/router';
import type { ExerciseSplitRuneDataType } from '../+page.server';

export const load = async (event) => ({
	exerciseSplit: createCaller(await createContext(event)).exerciseSplits.findById(
		parseInt(event.params.exerciseSplitId)
	)
});

export const actions = {
	delete_exercise_split: async ({ locals, params }) => {
		const session = await locals.auth();
		if (!session?.user?.id) return fail(403, { message: 'Not logged in' });

		await prisma.exerciseSplit.delete({
			where: { userId: session.user.id, id: parseInt(params.exerciseSplitId) }
		});
		return { message: 'Exercise split deleted successfully' };
	},
	edit_exercise_split: async ({ locals, request, params }) => {
		const session = await locals.auth();
		if (!session?.user?.id) return fail(403, { message: 'Not logged in' });

		const formData = await request.formData();
		const data = formData.get('exerciseSplitRuneData');
		if (!data) return fail(400, { message: "Exercise split wasn't received" });

		const id = parseInt(params.exerciseSplitId);
		const exerciseSplitRuneData = JSON.parse(data.toString()) as ExerciseSplitRuneDataType;

		await prisma.$transaction([
			prisma.exerciseSplit.delete({ where: { id, userId: session.user.id } }),
			prisma.exerciseSplit.create({
				data: {
					id,
					name: exerciseSplitRuneData.splitName,
					userId: session.user.id,
					exerciseSplitDays: {
						create: exerciseSplitRuneData.splitDays.map((splitDay, idx) => ({
							...splitDay,
							exercises: { createMany: { data: exerciseSplitRuneData.splitExercises[idx] } }
						}))
					}
				}
			})
		]);
		return { success: true, message: 'Exercise split edited successfully' };
	}
};
