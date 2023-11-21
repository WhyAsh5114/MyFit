export const muscleGroups: typeof MuscleGroups = [
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

export const exerciseWeightTypes: typeof ExerciseWeightTypes = ["Weighted", "Bodyweight"] as const;

export const caloricStates: typeof CaloricStates = [
	{
		name: "Hypo-caloric",
		commonTerm: "Deficit",
		value: -1
	},
	{
		name: "Iso-caloric",
		commonTerm: "Maintenance",
		value: 0
	},
	{
		name: "Hyper-caloric",
		commonTerm: "Surplus",
		value: 1
	}
] as const;