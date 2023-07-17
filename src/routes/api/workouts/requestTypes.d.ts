type APIWorkoutCreate = {
	workout: Workout;
	sorenessValues?: {
		muscleTarget: (typeof commonMuscleGroups)[number];
		sorenessRating: undefined;
		fromWorkoutID: number;
	};
};

type APIWorkoutDelete = {
	workoutIndex: number;
};

type APIWorkoutGetPreviouslyTargetedWorkouts = {
	muscleTargets: (typeof commonMuscleGroups)[number][];
	workoutIndex?: number;
}
