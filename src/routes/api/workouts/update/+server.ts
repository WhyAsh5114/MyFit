import type { RequestHandler } from '@sveltejs/kit';
import Ajv from 'ajv';
import RequestBodyType from './RequestBodySchema.json';
import clientPromise from '$lib/mongodb';

const ajv = new Ajv({ removeAdditional: true });
const validate = ajv.compile(RequestBodyType);

export const POST: RequestHandler = async ({ request, locals }) => {
	const session = await locals.getSession();
	if (!session) {
		return new Response('Invalid session', {
			status: 403
		});
	}

	const { workoutIndex, workout, sorenessValues }: APIWorkoutUpdate = await request.json();
	const valid = validate({ workout, sorenessValues });
	if (!valid || !(workoutIndex >= 0)) {
		return new Response(`Invalid JSON format for workout update: ${ajv.errorsText(validate.errors)}`, {
			status: 400
		});
	}

	const client = await clientPromise;
	try {
		await client
			.db()
			.collection('users')
			.updateOne({ email: session.user?.email }, { $set: { [`workouts.${workoutIndex}`]: workout } });

		// Group soreness values by workout ID
		type GroupedMuscleSorenessData = {
			workoutIndex: number | undefined;
			muscleTargets: (typeof commonMuscleGroups)[number][];
			sorenessRatings: Workout['muscleSorenessToNextWorkout'][(typeof commonMuscleGroups)[number]][];
		};
		const groupedSorenessValues = sorenessValues.reduce((arr: GroupedMuscleSorenessData[], record) => {
			const index = arr.findIndex((inside: GroupedMuscleSorenessData) => inside.workoutIndex === record.workoutIndex);
			if (index === -1) {
				arr.push({
					workoutIndex: record.workoutIndex as number,
					muscleTargets: [record.muscleTarget],
					sorenessRatings: [record.sorenessRating]
				});
			} else {
				arr[index].muscleTargets.push(record.muscleTarget);
				arr[index].sorenessRatings.push(record.sorenessRating);
			}
			return arr;
		}, []);

		groupedSorenessValues.forEach((sorenessValues) => {
			sorenessValues.muscleTargets.forEach(async (muscleTarget, i) => {
				if (sorenessValues.workoutIndex === undefined) return;
				await client
					.db()
					.collection('users')
					.updateOne(
						{ email: session.user?.email },
						{
							$set: {
								[`workouts.${sorenessValues.workoutIndex}.muscleSorenessToNextWorkout.${muscleTarget}`]:
									sorenessValues.sorenessRatings[i]
							}
						}
					);
			});
		});

		return new Response('Workout updated successfully', {
			status: 200
		});
	} catch (e) {
		return new Response(JSON.stringify(e), {
			status: 500
		});
	}
};
