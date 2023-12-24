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

type WithSID<T> = Omit<T, "_id"> & { _id: string };
