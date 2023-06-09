type APIMesocyclesCreate = {
	meso: Mesocycle;
}

type APIMesocyclesDelete = {
	mesoIndex: number;
}

type APIMesocyclesUpdate = {
	mesoIndex: number;
	meso: Mesocycle;
}

type APIMesocyclesUpdateWorkout = {
	mesoIndex: number;
	workoutIndex: number;
	splitExercises: SplitExercise[];
};
