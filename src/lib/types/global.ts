const MuscleGroups = [
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
type MuscleGroup = (typeof MuscleGroups)[number];

const ExerciseWeightTypes = ["Barbell", "Dumbbell", "Machine", "Bodyweight"] as const;
type ExerciseWeightType = (typeof ExerciseWeightTypes)[number];

type WithSerializedId<T> = T & { id: string };
