const muscleGroups: typeof MuscleGroups = [
	"Chest",
	"Front delts",
	"Side delts",
	"Rear delts",
	"Back",
	"Traps",
	"Triceps",
	"Biceps",
	"Forearms",
	"Quads",
	"Hamstrings",
	"Glutes",
	"Calves"
] as const;

const exerciseWeightTypes: typeof ExerciseWeightTypes = [
	"Barbell",
	"Dumbbell",
	"Machine",
	"Bodyweight"
] as const;

const caloricStates: typeof CaloricStates = {
	"Hypo-caloric": -1,
	"Iso-caloric": 0,
	"Hyper-caloric": 1
} as const;

export { muscleGroups, exerciseWeightTypes, caloricStates };
