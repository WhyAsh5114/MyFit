const MINIMUM_LOAD_CHANGE = 5;
const VOLUME_INCREASE_RATE = 0.025;

function getSetVolume(exerciseBodyweight: number | undefined, set: WorkoutExerciseSet) {
	if (exerciseBodyweight !== undefined) {
		return set.reps * (set.load + exerciseBodyweight);
	} else {
		return set.reps * set.load;
	}
}

function getTotalVolume(exerciseBodyweight: number | undefined, sets: WorkoutExerciseSet[]) {
	let totalVolume = 0;
	sets.forEach((set) => {
		totalVolume += getSetVolume(exerciseBodyweight, set);
	});
	return totalVolume;
}

function updateRIR(plannedRIR: number | null, set: WorkoutExerciseSet) {
	if (plannedRIR !== null) {
		if (set.RIR > plannedRIR) {
			set.reps += set.RIR - plannedRIR;
			set.RIR = plannedRIR;
		}
	}
}

function matchSetVolumeWithNewLoad(
	exercise: WorkoutExercise,
	set: WorkoutExerciseSet,
	newLoad: number
) {
	const oldVolume = getSetVolume(exercise.bodyweight, set);
	let newSet: WorkoutExerciseSet = { reps: set.reps, load: newLoad, RIR: set.RIR };
	let newVolume = getSetVolume(exercise.bodyweight, newSet);
	let absoluteDifference = Math.abs(newVolume - oldVolume);
	while (true) {
		if (newVolume > oldVolume) newSet.reps--;
		else newSet.reps++;

		newVolume = getSetVolume(exercise.bodyweight, newSet);
		let newAbsoluteDifference = Math.abs(newVolume - oldVolume);
		if (newAbsoluteDifference < absoluteDifference) {
			absoluteDifference = newAbsoluteDifference;
		} else {
			break;
		}
	}
	return newSet;
}

export function applyProgressiveOverload(
	workout: WorkoutExercise[],
	newBodyweight: number | null = null,
	plannedRIR: number | null = null
) {
	// Don't modify instance
	workout = JSON.parse(JSON.stringify(workout));

	workout.forEach((exercise) => {
		// Set new bodyweight
		if (exercise.bodyweight !== undefined && newBodyweight !== null) {
			exercise.bodyweight = newBodyweight;
		}

		// Apply progressive overload
		const originalTotalVolume = getTotalVolume(exercise.bodyweight, exercise.sets);
		let newTotalVolume = getTotalVolume(exercise.bodyweight, exercise.sets);
		while (newTotalVolume < (1 + VOLUME_INCREASE_RATE) * originalTotalVolume) {
			const minimumVolumeSet = exercise.sets.reduce(
				(min, set) =>
					getSetVolume(exercise.bodyweight, set) < getSetVolume(exercise.bodyweight, min)
						? set
						: min,
				exercise.sets[0]
			);
			minimumVolumeSet.reps++;
			newTotalVolume = getTotalVolume(exercise.bodyweight, exercise.sets);
		}
		console.log(originalTotalVolume, newTotalVolume, newTotalVolume / originalTotalVolume);

		exercise.sets.forEach((set) => {
			updateRIR(plannedRIR, set);

			if (set.reps < exercise.repRangeStart) {
				set = matchSetVolumeWithNewLoad(exercise, set, set.load + MINIMUM_LOAD_CHANGE);
			} else if (set.reps >= exercise.repRangeEnd) {
				set = matchSetVolumeWithNewLoad(exercise, set, set.load - MINIMUM_LOAD_CHANGE);
			}
		});
	});
	return workout;
}
