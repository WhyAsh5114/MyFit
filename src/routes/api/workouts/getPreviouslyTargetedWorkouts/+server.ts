import type { RequestHandler } from '@sveltejs/kit';
import Ajv from 'ajv';
import RequestBodySchema from './RequestBodySchema.json';
import clientPromise from '$lib/mongodb';

const ajv = new Ajv({ removeAdditional: true });
const validate = ajv.compile(RequestBodySchema);

export const POST: RequestHandler = async ({ request, locals }) => {
	const session = await locals.getSession();
	if (!session) {
		return new Response('Invalid session', { status: 403 });
	}

	const { muscleTargets, workoutIndex }: APIWorkoutGetPreviouslyTargetedWorkouts = await request.json();
	const valid = validate({ muscleTargets, workoutIndex });
	if (!valid) {
		return new Response('Invalid JSON format for muscleTargets', { status: 400 });
	}

	const client = await clientPromise;
	try {
		const userData = await client
			.db()
			.collection('users')
			.findOne({ email: session.user?.email });
		const workoutsList = userData?.workouts as (Workout | null)[] | null;
		if (!workoutsList) {
			return new Response('No workouts created', { status: 400 });
		}

		const muscleToLastWorkoutMap: MuscleToLastWorkout[] = [];
		muscleTargets.forEach((muscleTarget) => {
			muscleToLastWorkoutMap.push({ muscleTarget, workoutIndex: undefined });
		});

		let olderWorkoutsList;
		let currentWorkout: Workout | undefined;
		if (workoutIndex !== undefined) {
			currentWorkout = userData?.workouts[workoutIndex];
			if (!currentWorkout) {
				return new Response('Current workout not found', { status: 404 });
			}
			olderWorkoutsList = workoutsList.slice(0, workoutIndex);
		} else {
			olderWorkoutsList = workoutsList;
		}

		let musclesLeftToMatch = muscleToLastWorkoutMap.length;
		for (let i = olderWorkoutsList.length - 1; i >= 0; i--) {
			// If all muscleTargets have been found in previous workouts, end loop
			if (musclesLeftToMatch === 0) {
				break;
			}

			// Skip if workout is null (was deleted)
			const olderWorkout = olderWorkoutsList[i];
			if (!olderWorkout) continue;

			// Skip if workout isn't of active mesocycle
			if (olderWorkout.mesoID !== userData?.activeMesocycle.mesoID) continue;

			// Don't look for workouts older than a week
			if (currentWorkout) {
				const timeDiff = currentWorkout.startTimestamp - olderWorkout.startTimestamp;
				if (timeDiff / 1000 / 60 / 60 / 24 > 7) {
					break;
				}
			}

			// Loop over each exercise in this older workout
			olderWorkout.exercisesPerformed.forEach((exercise) => {
				// Find the object with same muscleTarget in muscleToLastWorkoutMap
				const muscleAndWorkout = muscleToLastWorkoutMap.find(
					(muscleAndWorkout) => muscleAndWorkout.muscleTarget === exercise.muscleTarget
				);
				// If object's workoutIndex is undefined (not matched), match it
				if (muscleAndWorkout && muscleAndWorkout.workoutIndex === undefined) {
					muscleAndWorkout.workoutIndex = i;
					musclesLeftToMatch--;
				}
			});
		}

		return new Response(JSON.stringify(muscleToLastWorkoutMap), {
			status: 200,
			headers: {
				'content-type': 'application/json'
			}
		});
	} catch (e) {
		return new Response(JSON.stringify(e), {
			status: 500
		});
	}
};
