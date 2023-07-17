import type { RequestHandler } from '@sveltejs/kit';
import clientPromise from '$lib/mongodb';

export const GET: RequestHandler = async ({ url, locals }) => {
	const session = await locals.getSession();
	if (!session) {
		return new Response('Invalid session', { status: 403 });
	}

	const workoutIndexRaw = url.searchParams.get('workoutIndex');
	if (!workoutIndexRaw) {
		return new Response('No workout index provided', { status: 400 });
	}

    const workoutIndex = parseInt(workoutIndexRaw);
	const client = await clientPromise;
	try {
		const userData = await client.db().collection('users').findOne({ email: session.user?.email });
		const workoutsList = userData?.workouts as (Workout | null)[] | null;
		if (!workoutsList) {
			return new Response('No workouts created', { status: 400 });
		}

		const currentWorkout = workoutsList[workoutIndex];
		if (!currentWorkout) {
			return new Response('Workout not found', { status: 400 });
		}

		const musclesTargetedInCurrentWorkout: Set<(typeof commonMuscleGroups)[number]> = new Set();
		currentWorkout.exercisesPerformed.forEach((exercise) => {
			musclesTargetedInCurrentWorkout.add(exercise.muscleTarget);
		});

		type MuscleToLastWorkout = {
			muscleTarget: (typeof commonMuscleGroups)[number];
			workoutIndex: number | undefined;
		};
		const muscleToLastWorkoutMap: MuscleToLastWorkout[] = [];
		musclesTargetedInCurrentWorkout.forEach((muscleTarget) => {
			muscleToLastWorkoutMap.push({ muscleTarget, workoutIndex: undefined });
		});

		const olderWorkoutsList = workoutsList.slice(0, workoutIndex);
		for (let i = workoutIndex - 1; i >= 0; i--) {
			// If all muscleTargets have been found in previous workouts, end loop
			let musclesLeftToMatch = 0;
			muscleToLastWorkoutMap.forEach((muscleToLastWorkout) => {
				if (!muscleToLastWorkout.workoutIndex) {
					musclesLeftToMatch++;
				}
			});
			if (musclesLeftToMatch === 0) {
				break;
			}

			// Skip if workout is null (was deleted)
			const olderWorkout = olderWorkoutsList[i];
			if (!olderWorkout) continue;

			// Don't look for workouts older than a week
			const timeDiff = currentWorkout.startTimestamp - olderWorkout.startTimestamp;
			if (timeDiff / 1000 / 60 / 60 / 24 > 7) {
				break;
			}

			olderWorkout.exercisesPerformed.forEach((exercise) => {
				const muscleAndWorkout = muscleToLastWorkoutMap.find(
					(muscleAndWorkout) => muscleAndWorkout.muscleTarget === exercise.muscleTarget
				) as MuscleToLastWorkout;
				if (!muscleAndWorkout.workoutIndex) {
					muscleAndWorkout.workoutIndex = i;
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
