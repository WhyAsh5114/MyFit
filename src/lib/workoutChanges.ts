export function applyWorkoutChanges(workout: Workout, plannedRIR: number) {
	// Set new plannedRIR to each set of each exercise
	workout.exercisesPerformed.forEach((exercise) => {
		exercise.repsLoadRIR.forEach((repLoadRIR) => {
			repLoadRIR[2] = plannedRIR;
		})
	})

	// Rep changes per exercise
	workout.exercisesPerformed.forEach((exercise) => {
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

		// Increase rep if RIR lesser with planned RIR
		exercise.repsLoadRIR.forEach((repLoadRIR) => {
			if (repLoadRIR[0] === undefined || repLoadRIR[1] === undefined) return;
			if (repLoadRIR[2] > plannedRIR) {
				repLoadRIR[0] += repLoadRIR[2] - plannedRIR;
			}
		});
	});

	// Set changes per muscle group
	for (const [muscleGroup, workloadValue] of Object.entries(workout.muscleGroupWorkloads)) {
		if (workloadValue && workloadValue !== 'high') {
			const muscleSoreness = workout.muscleSorenessToNextWorkout[muscleGroup as (typeof commonMuscleGroups)[number]];

			if (muscleSoreness && muscleSoreness !== 'interfered with workout') {
				if (
					(workloadValue === 'low' && muscleSoreness === 'recovered on time') ||
					(workloadValue === 'moderate' && muscleSoreness === 'none')
				) {
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
