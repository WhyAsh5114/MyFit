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

export const workloadFeedback: typeof WorkloadFeedback = [
	{ name: "none", value: 0, bgColor: "checked:!bg-warning" },
	{ name: "decent", value: 1, bgColor: "checked:!bg-accent" },
	{ name: "pushed my limits", value: 2, bgColor: "checked:!bg-success" },
	{ name: "too much work", value: 3, bgColor: "checked:!bg-warning" }
];

export const sorenessFeedback: typeof SorenessFeedback = [
	{ name: "none", value: 0, bgColor: "checked:!bg-warning" },
	{ name: "little bit", value: 1, bgColor: "checked:!bg-success" },
	{ name: "recovered on time", value: 2, bgColor: "checked:!bg-accent" },
	{ name: "interfered with workout", value: 3, bgColor: "checked:!bg-error" }
] as const;

export const jointPainFeedback: typeof JointPainFeedback = [
	{ name: "no pain", value: 0, bgColor: "checked:!bg-success" },
	{ name: "some pain", value: 1, bgColor: "checked:!bg-warning" },
	{ name: "it hurts", value: 2, bgColor: "checked:!bg-error" }
] as const;

export const pumpFeedback: typeof PumpFeedback = [
	{ name: "no pump", value: 0, bgColor: "checked:!bg-warning" },
	{ name: "decent pump", value: 1, bgColor: "checked:!bg-success" },
	{ name: "great pump", value: 2, bgColor: "checked:!bg-accent" }
] as const;
