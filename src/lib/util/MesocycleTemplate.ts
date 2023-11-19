export function calculateTotalDuration(RIRProgression: RIRProgressionData[]) {
	let totalDuration = 0;
	RIRProgression.forEach(({ cycles }) => {
		totalDuration += cycles;
	});
	return totalDuration;
}

export function getTodaysWorkout(
	workouts: string[],
	exerciseSplit: MesocycleTemplate["exerciseSplit"]
) {
	const workoutIdx = workouts.length % exerciseSplit.length;
	const workout = exerciseSplit[workoutIdx];
	return { workout, workoutIdx };
}

export function getMuscleGroups(exercises: SplitExercise[]) {
	const muscleGroups: Set<MuscleGroup> = new Set();
	exercises.forEach(({ targetMuscleGroup }) => {
		muscleGroups.add(targetMuscleGroup);
	});
	return muscleGroups;
}

export function getMuscleGroupsAndSets(exercises: SplitExercise[]) {
	const muscleGroupAndSets: { muscleGroup: MuscleGroup; sets: number }[] = [];
	exercises.forEach((exercise) => {
		const targetMuscleGroup = exercise.targetMuscleGroup;
		const idx = muscleGroupAndSets.findIndex(
			({ muscleGroup }) => targetMuscleGroup === muscleGroup
		);
		if (idx !== -1) {
			muscleGroupAndSets[idx].sets += exercise.sets;
		} else {
			muscleGroupAndSets.push({ muscleGroup: targetMuscleGroup, sets: exercise.sets });
		}
	});
	return muscleGroupAndSets;
}

export function getTotalSets(exercises: SplitExercise[]) {
	let totalSets = 0;
	exercises.forEach(({ sets }) => {
		totalSets += sets;
	});
	return totalSets;
}

export function getCycleNumber(
	exerciseSplit: MesocycleTemplate["exerciseSplit"],
	workouts: string[]
) {
	return 1 + Math.floor(workouts.length / exerciseSplit.length);
}

export function getPlannedRIR(
	{ exerciseSplit, RIRProgression }: MesocycleTemplate,
	workouts: string[]
) {
	const cycleNumber = getCycleNumber(exerciseSplit, workouts);
	let cyclesPassed = 0;
	let plannedRIR = -1;
	for (const { specificRIR, cycles } of RIRProgression) {
		cyclesPassed += cycles;
		if (cycleNumber < cyclesPassed) {
			plannedRIR = specificRIR;
			break;
		}
	}
	return plannedRIR;
}
