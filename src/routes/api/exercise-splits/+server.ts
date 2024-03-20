import { EXERCISE_SPLITS_PER_PAGE } from '$lib/constants.js';
import clientPromise from '$lib/mongo/mongodb.js';
import type { Filter } from 'mongodb';
const client = await clientPromise;

export const GET = async ({ locals, url }) => {
	const session = await locals.auth();
	if (!session?.user?.id) {
		return new Response('Not logged in', { status: 403 });
	}

	const pageNumber = parseInt(url.searchParams.get('page') ?? '') - 1;
	if (isNaN(pageNumber) || pageNumber < 0)
		return new Response('Invalid page number', { status: 400 });
	const searchString = url.searchParams.get('search');
	const includeTotalCount = url.searchParams.has('includeTotalCount');

	try {
		const findQuery: Filter<WithUID<ExerciseSplit>> = {
			userId: session.user.id
		};
		if (searchString) findQuery.name = { $regex: new RegExp(searchString, 'i') };

		const responseBody: { exerciseSplits: ExerciseSplit[]; exerciseSplitsCount?: number } = {
			exerciseSplits: await client
				.db()
				.collection<WithUID<ExerciseSplit>>('exerciseSplits')
				.find(findQuery)
				.skip(EXERCISE_SPLITS_PER_PAGE * pageNumber)
				.limit(EXERCISE_SPLITS_PER_PAGE)
				.toArray()
		};

		if (includeTotalCount) {
			responseBody.exerciseSplitsCount = await client
				.db()
				.collection<WithUID<ExerciseSplit>>('exerciseSplits')
				.countDocuments(findQuery);
		}

		return new Response(JSON.stringify(responseBody), { status: 200 });
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
