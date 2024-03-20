import clientPromise from '$lib/mongo/mongodb.js';
const client = await clientPromise;

export const GET = async ({ locals }) => {
	const session = await locals.auth();
	if (!session?.user?.id) {
		return new Response('Not logged in', { status: 403 });
	}

	try {
		const exerciseSplits = await client
			.db()
			.collection<WithUID<ExerciseSplit>>('exerciseSplits')
			.find({ userId: session.user.id })
			.toArray();

		return new Response(JSON.stringify(exerciseSplits), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify(error), { status: 500 });
	}
};

export const POST = async ({ locals, request }) => {
	const session = await locals.auth();
	if (!session?.user?.id) {
		return new Response('Not logged in', { status: 403 });
	}

	const exerciseSplit: ExerciseSplit = await request.json();
	try {
		await client
			.db()
			.collection<WithUID<ExerciseSplit>>('exerciseSplits')
			.insertOne({ ...exerciseSplit, userId: session.user.id });

		return new Response('Exercise split created successfully', { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify(error), { status: 500 });
	}
};
