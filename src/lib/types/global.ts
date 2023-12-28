const MuscleGroups = [
  "Chest",
  "Front delts",
  "Side delts",
  "Rear delts",
  "Back (vertical pulls)",
  "Back (horizontal pulls)",
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
