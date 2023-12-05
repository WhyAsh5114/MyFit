export function applyProgressiveOverload(
	workout: WorkoutExercise[],
	newBodyweight: number | null = null
) {
	workout = JSON.parse(JSON.stringify(workout));
	workout.forEach((exercise) => {
		if (exercise.bodyweight !== undefined && newBodyweight !== null) {
			exercise.bodyweight = newBodyweight;
		}
	});
	return workout;
}
