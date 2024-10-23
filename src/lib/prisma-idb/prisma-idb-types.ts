import type { DBSchema } from 'idb';

export const MuscleGroup = {
	Chest: 'Chest',
	FrontDelts: 'FrontDelts',
	SideDelts: 'SideDelts',
	RearDelts: 'RearDelts',
	Lats: 'Lats',
	Traps: 'Traps',
	Triceps: 'Triceps',
	Biceps: 'Biceps',
	Forearms: 'Forearms',
	Quads: 'Quads',
	Hamstrings: 'Hamstrings',
	Glutes: 'Glutes',
	Calves: 'Calves',
	Abs: 'Abs',
	Neck: 'Neck',
	Adductors: 'Adductors',
	Abductors: 'Abductors',
	Custom: 'Custom'
} as const;

export const SetType = {
	Straight: 'Straight',
	V2: 'V2',
	Drop: 'Drop',
	Down: 'Down',
	Myorep: 'Myorep',
	MyorepMatch: 'MyorepMatch'
} as const;

export const ChangeType = {
	Percentage: 'Percentage',
	AbsoluteLoad: 'AbsoluteLoad'
} as const;

export const WorkoutStatus = {
	Skipped: 'Skipped',
	RestDay: 'RestDay'
} as const;

export interface PrismaIDBSchema extends DBSchema {
	exerciseSplit: { key: ['id']; value: { id: string; name: string; userId: string } };
	exerciseSplitDay: {
		key: ['id'];
		value: { id: string; name: string; dayIndex: number; isRestDay: boolean; exerciseSplitId: string };
	};
	exerciseTemplate: {
		key: ['id'];
		value: {
			id: string;
			name: string;
			exerciseIndex: number;
			targetMuscleGroup: (typeof MuscleGroup)[keyof typeof MuscleGroup];
			customMuscleGroup: string;
			bodyweightFraction: number;
			setType: (typeof SetType)[keyof typeof SetType];
			repRangeStart: number;
			repRangeEnd: number;
			changeType: (typeof ChangeType)[keyof typeof ChangeType];
			changeAmount: number;
			note: string;
			exerciseSplitDayId: string;
		};
	};
	mesocycle: {
		key: ['id'];
		value: {
			id: string;
			name: string;
			userId: string;
			exerciseSplitId: string;
			RIRProgression: number;
			startDate: Date;
			endDate: Date;
			startOverloadPercentage: number;
			lastSetToFailure: boolean;
			forceRIRMatching: boolean;
		};
	};
	mesocycleCyclicSetChange: {
		key: ['id'];
		value: {
			id: string;
			mesocycleId: string;
			muscleGroup: (typeof MuscleGroup)[keyof typeof MuscleGroup];
			customMuscleGroup: string;
			regardlessOfProgress: boolean;
			setIncreaseAmount: number;
			maxVolume: number;
		};
	};
	mesocycleExerciseSplitDay: {
		key: ['id'];
		value: { id: string; name: string; dayIndex: number; isRestDay: boolean; mesocycleId: string };
	};
	mesocycleExerciseTemplate: {
		key: ['id'];
		value: {
			id: string;
			name: string;
			exerciseIndex: number;
			targetMuscleGroup: (typeof MuscleGroup)[keyof typeof MuscleGroup];
			customMuscleGroup: string;
			bodyweightFraction: number;
			sets: number;
			setType: (typeof SetType)[keyof typeof SetType];
			repRangeStart: number;
			repRangeEnd: number;
			changeType: (typeof ChangeType)[keyof typeof ChangeType];
			changeAmount: number;
			note: string;
			mesocycleExerciseSplitDayId: string;
			overloadPercentage: number;
			lastSetToFailure: boolean;
			forceRIRMatching: boolean;
			minimumWeightChange: number;
		};
	};
	user: {
		key: ['id'];
		value: {
			id: string;
			name: string;
			email: string;
			emailVerified: Date;
			image: string;
			createdAt: Date;
			updatedAt: Date;
			migratedFromV2: boolean;
		};
	};
	account: {
		key: ['provider', 'providerAccountId'];
		value: {
			userId: string;
			type: string;
			provider: string;
			providerAccountId: string;
			refresh_token: string;
			access_token: string;
			expires_at: number;
			token_type: string;
			scope: string;
			id_token: string;
			session_state: string;
			createdAt: Date;
			updatedAt: Date;
		};
	};
	session: {
		key: ['sessionToken'];
		value: { sessionToken: string; userId: string; expires: Date; createdAt: Date; updatedAt: Date };
	};
	verificationToken: { key: ['identifier', 'token']; value: { identifier: string; token: string; expires: Date } };
	workoutOfMesocycle: {
		key: ['id'];
		value: {
			id: string;
			workoutId: string;
			mesocycleId: string;
			splitDayIndex: number;
			workoutStatus: (typeof WorkoutStatus)[keyof typeof WorkoutStatus];
		};
	};
	workout: {
		key: ['id'];
		value: { id: string; userBodyweight: number; startedAt: Date; endedAt: Date; userId: string };
	};
	workoutExercise: {
		key: ['id'];
		value: {
			id: string;
			exerciseIndex: number;
			name: string;
			workoutId: string;
			targetMuscleGroup: (typeof MuscleGroup)[keyof typeof MuscleGroup];
			customMuscleGroup: string;
			bodyweightFraction: number;
			setType: (typeof SetType)[keyof typeof SetType];
			changeType: (typeof ChangeType)[keyof typeof ChangeType];
			changeAmount: number;
			repRangeStart: number;
			repRangeEnd: number;
			note: string;
			overloadPercentage: number;
			lastSetToFailure: boolean;
			forceRIRMatching: boolean;
			minimumWeightChange: number;
		};
	};
	workoutExerciseSet: {
		key: ['id'];
		value: {
			id: string;
			setIndex: number;
			workoutExerciseId: string;
			reps: number;
			load: number;
			RIR: number;
			skipped: boolean;
		};
	};
	workoutExerciseMiniSet: {
		key: ['id'];
		value: { id: string; miniSetIndex: number; reps: number; load: number; RIR: number; workoutExerciseSetId: string };
	};
}
