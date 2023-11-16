type Nullable<T> = {
	[P in keyof T]: T[P] | null;
};

type UserProperties = {
	mesocycleTemplates: (null | MesocycleTemplate)[];
	weightTypeIncrements: Record<ExerciseWeightType, number>;
	workouts: (null | Workout)[];
};

type AppUser = Nullable<UserProperties>;
