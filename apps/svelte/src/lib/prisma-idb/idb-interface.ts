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
		key: [code: Prisma.NutritionData['code']];
		value: Prisma.NutritionData;
	};
	GettingStartedAnswers: {
		key: [id: Prisma.GettingStartedAnswers['id']];
		value: Prisma.GettingStartedAnswers;
		indexes: {
			userIdIndex: [userId: Prisma.GettingStartedAnswers['userId']];
		};
	};
	DashboardItems: {
		key: [id: Prisma.DashboardItems['id']];
		value: Prisma.DashboardItems;
		indexes: {
			userIdIndex: [userId: Prisma.DashboardItems['userId']];
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
