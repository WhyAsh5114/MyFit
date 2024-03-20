import { EXERCISE_SPLITS_PER_PAGE } from '$lib/constants.js';
import clientPromise from '$lib/mongo/mongodb.js';
const client = await clientPromise;

export const GET = async ({ locals, url }) => {
	const session = await locals.auth();
	if (!session?.user?.id) {
		return new Response('Not logged in', { status: 403 });
	}

	const pageNumber = parseInt(url.searchParams.get('page') ?? '') - 1;
	if (isNaN(pageNumber) || pageNumber < 0)
		return new Response('Invalid page number', { status: 400 });

	try {
		const exerciseSplitsCount = await client.db().collection('exerciseSplits').countDocuments();
		const exerciseSplits = await client
			.db()
			.collection<WithUID<ExerciseSplit>>('exerciseSplits')
			.find({ userId: session.user.id })
			.skip(EXERCISE_SPLITS_PER_PAGE * pageNumber)
			.limit(EXERCISE_SPLITS_PER_PAGE)
			.toArray();

		return new Response(
			JSON.stringify({ exerciseSplits, exerciseSplitsCount }),
			{ status: 200 }
		);
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
