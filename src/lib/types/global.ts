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
  "Calves",
  "Abs",
  "Neck"
] as const;
type MuscleGroup = (typeof MuscleGroups)[number];

const ExerciseWeightTypes = ["Weighted", "Bodyweight"] as const;
type ExerciseWeightType = (typeof ExerciseWeightTypes)[number];

type WithSerializedId<T> = T & { id: string };
