export function dateFormatter(timestamp: number) {
	const date = new Date(timestamp);
	return date.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

export function splitExercisesToWorkoutExercise(exercises: SplitExercise[]) {
	const workoutExercises: WorkoutExerciseWithoutSetNumbers[] = [];
	exercises.forEach(({ sets, ...splitExerciseProps }) => {
		const workoutExercise: WorkoutExerciseWithoutSetNumbers = {
			...splitExerciseProps,
			jointPainRating: null,
			pumpRating: null,
			sets: Array(sets)
				.fill(undefined)
				.map(() => {
					return { reps: null, load: null, RIR: null };
				})
		};
		workoutExercises.push(workoutExercise);
	});
	return workoutExercises;
}
