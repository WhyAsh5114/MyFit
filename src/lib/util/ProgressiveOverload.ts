const MINIMUM_LOAD_CHANGE = 5;
const VOLUME_INCREASE_RATE = 0.025;

export function getSetVolume(
  exerciseBodyweight: number | undefined | null,
  set: WorkoutExerciseSet
) {
  if (exerciseBodyweight !== undefined && exerciseBodyweight !== null) {
    return set.reps * (set.load + exerciseBodyweight);
  }
  return set.reps * set.load;
}

export function getTotalVolume(
  exerciseBodyweight: number | undefined | null,
  sets: WorkoutExerciseSet[]
) {
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
  const newSet: WorkoutExerciseSet = { reps: set.reps, load: newLoad, RIR: set.RIR };
  let newVolume = getSetVolume(exercise.bodyweight, newSet);
  let absoluteDifference = Math.abs(newVolume - oldVolume);
  for (let i = 0; i <= 100; i++) {
    if (newVolume > oldVolume) {
      newSet.reps--;
    } else {
      newSet.reps++;
    }

    newVolume = getSetVolume(exercise.bodyweight, newSet);
    const newAbsoluteDifference = Math.abs(newVolume - oldVolume);
    if (newAbsoluteDifference < absoluteDifference) {
      absoluteDifference = newAbsoluteDifference;
    } else {
      if (newVolume > oldVolume && newSet.reps > exercise.repRangeStart) {
        newSet.reps--;
      } else if (newSet.reps < exercise.repRangeEnd - 1) {
        newSet.reps++;
      }
      break;
    }
  }
  return newSet;
}

export function applyProgressiveOverload(
  exercises: WorkoutExercise[],
  newBodyweight: number | null = null,
  plannedRIR: number | null = null
) {
  let loopCounter = 0;

  // Don't modify instance
  exercises = JSON.parse(JSON.stringify(exercises));

  exercises.forEach((exercise) => {
    const originalTotalVolume = getTotalVolume(exercise.bodyweight, exercise.sets);

    // Set new bodyweight
    if (exercise.bodyweight !== undefined && newBodyweight !== null) {
      exercise.bodyweight = newBodyweight;
    }

    // Apply progressive overload
    let newTotalVolume = getTotalVolume(exercise.bodyweight, exercise.sets);
    while (newTotalVolume < (1 + VOLUME_INCREASE_RATE) * originalTotalVolume && loopCounter < 100) {
      // This is rep change
      const minimumVolumeSet = exercise.sets.reduce(
        (min, set) =>
          getSetVolume(exercise.bodyweight, set) < getSetVolume(exercise.bodyweight, min)
            ? set
            : min,
        exercise.sets[0]
      );
      minimumVolumeSet.reps++;
      newTotalVolume = getTotalVolume(exercise.bodyweight, exercise.sets);
      loopCounter++;

      // TODO: implement load change, choose optimal approach
    }

    exercise.sets.forEach((set, setNumber) => {
      loopCounter = 0;
      while (set.reps < exercise.repRangeStart && loopCounter < 100) {
        if (set.load - MINIMUM_LOAD_CHANGE <= 0) break;
        set = matchSetVolumeWithNewLoad(exercise, set, set.load - MINIMUM_LOAD_CHANGE);
        loopCounter++;
      }
      loopCounter = 0;
      while (set.reps >= exercise.repRangeEnd && loopCounter < 100) {
        set = matchSetVolumeWithNewLoad(exercise, set, set.load + MINIMUM_LOAD_CHANGE);
        loopCounter++;
      }
      exercise.sets[setNumber] = set;
      updateRIR(plannedRIR, set);
    });

    // Apply progressive overload
    newTotalVolume = getTotalVolume(exercise.bodyweight, exercise.sets);
    loopCounter = 0;
    while (newTotalVolume < (1 + VOLUME_INCREASE_RATE) * originalTotalVolume && loopCounter < 100) {
      // This is rep change
      const minimumVolumeSet = exercise.sets.reduce(
        (min, set) =>
          getSetVolume(exercise.bodyweight, set) < getSetVolume(exercise.bodyweight, min)
            ? set
            : min,
        exercise.sets[0]
      );
      minimumVolumeSet.reps++;
      newTotalVolume = getTotalVolume(exercise.bodyweight, exercise.sets);

      // TODO: implement load change, choose optimal approach
      loopCounter++;
    }

    // Sort sets by load
    exercise.sets.sort((setA, setB) => setB.load - setA.load);
  });
  return exercises;
}
