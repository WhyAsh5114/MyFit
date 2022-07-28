interface AccountDetails {
  username: string;
  password: string;
}

interface User {
  username: string;
  password?: string;
  splits: Record<string, Split>;
  workouts?: Record<string, Array<Exercise>>;
}

type UserData = Omit<User, 'password'>;

interface Split {
  name: string;
  schedule: string[];
  splitWorkouts: Record<string, Array<Exercise>>;
  progressiveOverload: number;
  overloadFrequency: '/session' | '/week' | '/month';
  dateCreated: string;
}

interface Exercise {
  id: number;
  name: string;
  reps: number;
  sets: number;
  load: number;
}
