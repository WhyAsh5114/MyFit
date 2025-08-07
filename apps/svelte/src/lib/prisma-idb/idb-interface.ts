import * as Prisma from '@prisma/client';
import type { DBSchema } from 'idb';

export interface PrismaIDBSchema extends DBSchema {
	ExerciseSplit: {
		key: [id: Prisma.ExerciseSplit['id']];
		value: Prisma.ExerciseSplit;
	};
	ExerciseSplitDay: {
		key: [id: Prisma.ExerciseSplitDay['id']];
		value: Prisma.ExerciseSplitDay;
		indexes: {
			exerciseSplitId_dayIndexIndex: [
				exerciseSplitId: Prisma.ExerciseSplitDay['exerciseSplitId'],
				dayIndex: Prisma.ExerciseSplitDay['dayIndex']
			];
		};
	};
	ExerciseSplitDaySession: {
		key: [id: Prisma.ExerciseSplitDaySession['id']];
		value: Prisma.ExerciseSplitDaySession;
		indexes: {
			exerciseSplitDayId_sessionIndexIndex: [
				exerciseSplitDayId: Prisma.ExerciseSplitDaySession['exerciseSplitDayId'],
				sessionIndex: Prisma.ExerciseSplitDaySession['sessionIndex']
			];
		};
	};
	ExerciseSplitDaySessionExercise: {
		key: [id: Prisma.ExerciseSplitDaySessionExercise['id']];
		value: Prisma.ExerciseSplitDaySessionExercise;
		indexes: {
			exerciseSplitDaySessionId_exerciseIndexIndex: [
				exerciseSplitDaySessionId: Prisma.ExerciseSplitDaySessionExercise['exerciseSplitDaySessionId'],
				exerciseIndex: Prisma.ExerciseSplitDaySessionExercise['exerciseIndex']
			];
		};
	};
	ExerciseSplitDaySessionExerciseNote: {
		key: [id: Prisma.ExerciseSplitDaySessionExerciseNote['id']];
		value: Prisma.ExerciseSplitDaySessionExerciseNote;
	};
	ExerciseSplitDaySessionExerciseSecondaryMuscleGroup: {
		key: [id: Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroup['id']];
		value: Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroup;
		indexes: {
			exerciseId_muscleGroupIndex: [
				exerciseId: Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroup['exerciseId'],
				muscleGroup: Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroup['muscleGroup']
			];
		};
	};
	MacroTargets: {
		key: [id: Prisma.MacroTargets['id']];
		value: Prisma.MacroTargets;
		indexes: {
			userIdIndex: [userId: Prisma.MacroTargets['userId']];
		};
	};
	MacroMetrics: {
		key: [id: Prisma.MacroMetrics['id']];
		value: Prisma.MacroMetrics;
	};
	MacroActivityTrackingPreferences: {
		key: [id: Prisma.MacroActivityTrackingPreferences['id']];
		value: Prisma.MacroActivityTrackingPreferences;
		indexes: {
			userIdIndex: [userId: Prisma.MacroActivityTrackingPreferences['userId']];
		};
	};
	FoodEntry: {
		key: [id: Prisma.FoodEntry['id']];
		value: Prisma.FoodEntry;
	};
	NutritionData: {
		key: [id: Prisma.NutritionData['id']];
		value: Prisma.NutritionData;
	};
	GettingStartedAnswers: {
		key: [id: Prisma.GettingStartedAnswers['id']];
		value: Prisma.GettingStartedAnswers;
		indexes: {
			userIdIndex: [userId: Prisma.GettingStartedAnswers['userId']];
		};
	};
	DashboardItem: {
		key: [id: Prisma.DashboardItem['id']];
		value: Prisma.DashboardItem;
		indexes: {
			userIdIndex: [userId: Prisma.DashboardItem['userId']];
			userId_typeIndex: [
				userId: Prisma.DashboardItem['userId'],
				type: Prisma.DashboardItem['type']
			];
		};
	};
	User: {
		key: [id: Prisma.User['id']];
		value: Prisma.User;
		indexes: {
			emailIndex: [email: Prisma.User['email']];
		};
	};
	Session: {
		key: [id: Prisma.Session['id']];
		value: Prisma.Session;
		indexes: {
			tokenIndex: [token: Prisma.Session['token']];
		};
	};
	Account: {
		key: [id: Prisma.Account['id']];
		value: Prisma.Account;
	};
	Verification: {
		key: [id: Prisma.Verification['id']];
		value: Prisma.Verification;
	};
}
