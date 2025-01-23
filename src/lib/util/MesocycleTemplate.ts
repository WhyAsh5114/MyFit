export function getTotalDuration(RIRProgression: RIRProgressionData[]) {
  let totalDuration = 0;
  RIRProgression.forEach(({ cycles }) => {
    totalDuration += cycles;
  });
  return totalDuration;
}

export function getDayNumber(
  workouts: (string | null)[],
  exerciseSplit: MesocycleTemplate["exerciseSplit"]
) {
  return workouts.length % exerciseSplit.length;
}

export function getCycleNumber(
  exerciseSplit: MesocycleTemplate["exerciseSplit"],
  workouts: (string | null)[]
) {
  return 1 + Math.floor(workouts.length / exerciseSplit.length);
}

export function getTodaysSplitWorkout(
  workouts: (string | null)[],
  exerciseSplit: MesocycleTemplate["exerciseSplit"]
) {
  const workoutIdx = workouts.length % exerciseSplit.length;
  const workout = exerciseSplit[workoutIdx];
  return workout;
}

export function getMuscleGroups(exercises: SplitExercise[] | WorkoutExercise[]) {
  const muscleGroups = new Set<MuscleGroup>();
  exercises.forEach(({ targetMuscleGroup }) => {
    muscleGroups.add(targetMuscleGroup);
  });
  return muscleGroups;
}

export function getMuscleGroupsAndSets(
  exercises: SplitExercise[] | WorkoutExerciseWithoutSetNumbers[]
) {
  const muscleGroupAndSets: { muscleGroup: MuscleGroup; sets: number }[] = [];
  exercises.forEach((exercise) => {
    const { targetMuscleGroup } = exercise;
    const idx = muscleGroupAndSets.findIndex(
      ({ muscleGroup }) => targetMuscleGroup === muscleGroup
    );
    let totalSets;
    if (typeof exercise.sets === "number") {
      totalSets = exercise.sets;
    } else {
      totalSets = exercise.sets.length;
    }
    if (idx !== -1) {
      muscleGroupAndSets[idx].sets += totalSets;
    } else {
      muscleGroupAndSets.push({ muscleGroup: targetMuscleGroup, sets: totalSets });
    }
  });
  return muscleGroupAndSets;
}

export function getTotalSets(exercises: SplitExercise[] | WorkoutExerciseWithoutSetNumbers[]) {
  let totalSets = 0;
  exercises.forEach(({ sets }) => {
    if (typeof sets === "number") {
      totalSets += sets;
    } else {
      totalSets += sets.length;
    }
  });
  return totalSets;
}

export function getPlannedRIR(
  { exerciseSplit, RIRProgression }: MesocycleTemplate,
  workouts: (string | null)[]
) {
  const progressionPrefixSum = RIRProgression.map(({ cycles }) => cycles).reduce(
    (acc, val, i) => acc.concat(i > 0 ? acc[i - 1] + val : val),
    [] as number[]
  );
  const cycleNumber = getCycleNumber(exerciseSplit, workouts);
  const plannedRIR = progressionPrefixSum.findIndex((el) => el >= cycleNumber);
  return RIRProgression[plannedRIR].specificRIR;
}
