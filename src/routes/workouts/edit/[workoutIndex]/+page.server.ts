import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params, parent, fetch }) => {
	const session = await locals.getSession();
	const { workouts, mesocycles } = await parent();

	if (!session) {
		throw error(403, 'Not logged in');
	} else if (parseInt(params.workoutIndex) < 0) {
		throw error(400, 'Invalid workout index');
	} else if (!workouts) {
		throw error(400, 'No workouts created');
	} else if (!mesocycles) {
		throw error(400, 'No mesocycles created');
	}

	const workout = workouts[parseInt(params.workoutIndex)] as Workout | null;
	let referenceWorkout: null | undefined | Workout = undefined;
	if (workout?.referenceWorkout) {
		referenceWorkout = workouts[workout.referenceWorkout] as Workout | null;
	}

	if (!workout) {
		throw error(404, 'Workout not found');
	}

	const muscleTargetsAndSets: Record<string, number> = {};
	workout.exercisesPerformed.forEach((exercise) => {
		if (muscleTargetsAndSets[exercise.muscleTarget]) {
			muscleTargetsAndSets[exercise.muscleTarget] += exercise.repsLoadRIR.length;
		} else {
			muscleTargetsAndSets[exercise.muscleTarget] = exercise.repsLoadRIR.length;
		}
	});

	const reqBody: APIWorkoutGetPreviouslyTargetedWorkouts = {
		muscleTargets: Object.keys(muscleTargetsAndSets) as (typeof commonMuscleGroups)[number][],
		workoutIndex: parseInt(params.workoutIndex)
	};
	const response = await fetch('/api/workouts/getPreviouslyTargetedWorkouts', {
		method: 'POST',
		body: JSON.stringify(reqBody),
		headers: {
			'content-type': 'application/json'
		}
	});

	const muscleSorenessData: MuscleSorenessData[] = [];
	if (response.ok) {
		const resBody: MuscleToLastWorkout[] = JSON.parse(await response.text());
		resBody.forEach((muscleAndWorkout) => {
			muscleSorenessData.push({ ...muscleAndWorkout, sorenessRating: undefined });
		});
	}
	const musclesTargetedPreviously = muscleSorenessData;

	return {
		workout,
		workoutIndex: parseInt(params.workoutIndex),
		parentMesocycle: mesocycles[workout.mesoID] as Mesocycle | null,
		referenceWorkout,
		musclesTargetedPreviously
	};
};
