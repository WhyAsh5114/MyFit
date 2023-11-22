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

export function range(start: number, stop: number | undefined, step: number | undefined) {
	if (typeof stop == "undefined") {
		stop = start;
		start = 0;
	}
	if (typeof step == "undefined") step = 1;
	if ((step > 0 && start >= stop) || (step < 0 && start <= stop)) return [];
	let result = [];
	for (let i = start; step > 0 ? i < stop : i > stop; i += step) result.push(i);
	return result;
}
