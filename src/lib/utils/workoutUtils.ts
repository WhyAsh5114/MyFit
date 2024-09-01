import { arraySum } from '$lib/utils';
import type { Workout, WorkoutExercise } from './types';

export function getSetVolume(
	set: WorkoutExercise['sets'][number],
	userBodyweight: number,
	bodyweightFraction: number | null
) {
	// TODO: Mini sets?
	return (set.reps + set.RIR) * set.load + (bodyweightFraction ?? 0) * userBodyweight;
}

export function getExerciseVolume(workoutExercise: WorkoutExercise, userBodyweight: number) {
	return arraySum(
		workoutExercise.sets.map((set) => getSetVolume(set, userBodyweight, workoutExercise.bodyweightFraction))
	);
}

export function getWorkoutVolume(workout: Workout) {
	return arraySum(workout.workoutExercises.map((exercise) => getExerciseVolume(exercise, workout.userBodyweight)));
}
