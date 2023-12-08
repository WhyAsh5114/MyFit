type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};

type AllUserPreferences = {
  bodyweight: number;
};

type UserPreferences = Nullable<AllUserPreferences>;
