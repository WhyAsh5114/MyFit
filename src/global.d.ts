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
	split_workouts: Record<string, Array<Exercise>>;
}

interface Exercise {
	id: number;
	name: string;
	reps: number;
	sets: number;
	load: number;
}
