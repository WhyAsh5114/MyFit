type APIWorkoutCreate = {
	workout: Workout;
	sorenessValues: MuscleSorenessData[];
};

interface APIWorkoutUpdate extends APIWorkoutCreate {
	workoutIndex: number;
}

type APIWorkoutDelete = {
	workoutIndex: number;
};

type APIWorkoutGetPreviouslyTargetedWorkouts = {
	muscleTargets: (typeof commonMuscleGroups)[number][];
	workoutIndex?: number;
};

type MuscleToLastWorkout = {
	muscleTarget: (typeof commonMuscleGroups)[number];
	workoutIndex?: number;
};
