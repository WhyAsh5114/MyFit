import prisma from '$lib/prisma.js';
import type {
	ExerciseSplitDayRuneType,
	ExerciseTemplateRuneType
} from './[mode]/exerciseSplitRunes.svelte.js';

export type RequestType = {
	splitName: string;
	splitDays: ExerciseSplitDayRuneType[];
	splitExercises: ExerciseTemplateRuneType[][];
};

export const POST = async ({ request, locals }) => {
	const session = await locals.auth();
	if (!session?.user?.id) return new Response('Not logged in', { status: 403 });

	const exerciseSplitRuneData: RequestType = await request.json();
	try {
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
		return new Response('Exercise split created successfully', { status: 200 });
	} catch (error) {
		console.error(error);
		return new Response('Internal server error', { status: 500 });
	}
};
