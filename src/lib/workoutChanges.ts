export function applyWorkoutChanges(workout: Workout, plannedRIR: number) {
	// Rep changes per exercise
	workout.exercisesPerformed.forEach((exercise) => {
		// Match reps with RIR
		exercise.repsLoadRIR.forEach((repLoadRIR) => {
			if (repLoadRIR[0] === undefined || repLoadRIR[1] === undefined) return;
			if (repLoadRIR[2] !== plannedRIR) {
				repLoadRIR[0] += repLoadRIR[2] - plannedRIR;
				repLoadRIR[2] = plannedRIR;
			}
		});

		// Increase or decrease load depending on rep range
		const lastSet = exercise.repsLoadRIR[exercise.repsLoadRIR.length - 1] as [number, number, number];
		if (lastSet[0] < exercise.repRangeStart) {
			exercise.repsLoadRIR.forEach((repLoadRIR) => {
				if (repLoadRIR[0] === undefined || repLoadRIR[1] === undefined) return;
				const volume = repLoadRIR[0] * repLoadRIR[1];
				repLoadRIR[1] -= 2.5;
				repLoadRIR[0] = Math.round(volume / repLoadRIR[1]);
			});
		} else if (lastSet[0] >= exercise.repRangeEnd) {
			exercise.repsLoadRIR.forEach((repLoadRIR) => {
				if (repLoadRIR[0] === undefined || repLoadRIR[1] === undefined) return;
				const volume = repLoadRIR[0] * repLoadRIR[1];
				repLoadRIR[1] += 2.5;
				repLoadRIR[0] = Math.round(volume / repLoadRIR[1]);
			});
		}
	});

	// Set changes per muscle group
	for (const [muscleGroup, workloadValue] of Object.entries(workout.muscleGroupWorkloads)) {
		if (workloadValue && workloadValue !== 'high') {
			const muscleSoreness = workout.muscleSorenessToNextWorkout[muscleGroup as (typeof commonMuscleGroups)[number]];

			const workloadMap = { low: 0, moderate: 1, high: 2 };
			const sorenessMap = { none: 0, 'recovered on time': 1, 'interfered with workout': 2 };

			if (muscleSoreness && muscleSoreness !== 'interfered with workout') {
				if (workloadMap[workloadValue] + sorenessMap[muscleSoreness] < 2) {
					const exercisesForMuscleGroup: WorkoutExercise[] = [];
					workout.exercisesPerformed.forEach((exercise) => {
						if (exercise.muscleTarget === muscleGroup) exercisesForMuscleGroup.push(exercise);
					});
					// Add set to exercise with least sets first
					exercisesForMuscleGroup.sort((a, b) => a.repsLoadRIR.length - b.repsLoadRIR.length);
					exercisesForMuscleGroup[0].repsLoadRIR.push([
						undefined,
						exercisesForMuscleGroup[0].repsLoadRIR[0][1] as number,
						plannedRIR
					]);
				}
			}
		}
	}
	return workout;
}
