type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};

interface AllUserPreferences {
  bodyweight: number;
}

type UserPreferences = Nullable<AllUserPreferences>;
