import prisma from '$lib/prisma.js';
import { fail } from '@sveltejs/kit';
import type { ExerciseSplitDayWithoutIDs, ExerciseTemplateWithoutIDs } from '$lib/types';
import { createCaller } from '$lib/trpc/router';
import { createContext } from '$lib/trpc/context';

export type ExerciseSplitRuneDataType = {
	splitName: string;
	splitDays: ExerciseSplitDayWithoutIDs[];
	splitExercises: ExerciseTemplateWithoutIDs[][];
};

const take = 10;

export const load = async (event) => {
	const tRPC = createCaller(await createContext(event));
	return tRPC.exerciseSplits.load();
};

export const actions = {
	create_exercise_split: async ({ request, locals }) => {
		const session = await locals.auth();
		if (!session?.user?.id) return fail(403, { message: 'Not logged in' });

		const formData = await request.formData();
		const data = formData.get('exerciseSplitRuneData');
		if (!data) return fail(400, { message: "Exercise split wasn't received" });

		const exerciseSplitRuneData = JSON.parse(data.toString()) as ExerciseSplitRuneDataType;
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
