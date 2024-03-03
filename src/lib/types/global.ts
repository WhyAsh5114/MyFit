const MuscleGroups = [
  "Chest",
  "Front delts",
  "Side delts",
  "Rear delts",
  "Lats",
  "Traps",
  "Triceps",
  "Biceps",
  "Forearms",
  "Quads",
  "Hamstrings",
  "Glutes",
  "Calves",
  "Abs"
] as const;
type MuscleGroup = (typeof MuscleGroups)[number];

type WithSID<T> = T & { _id: string };
type WithUID<T> = T & { userId: string };
