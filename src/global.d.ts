interface AccountDetails {
	username: string;
	password: string;
}

interface User {
	username: string;
	password?: string;
	splits: Record<string, split>;
	workouts?: Record<string, Array<exercise>>;
}

type UserData = Omit<User, 'password'>;

interface split {
	name: string;
	schedule: string[];
	split_workouts: Record<string, Array<exercise>>;
}

interface exercise {
	id: number;
	name: string;
	reps: number;
	sets: number;
	load: number;
}
