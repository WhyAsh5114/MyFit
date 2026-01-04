import type { LogsWithRecords } from '../server/batch-processor';
import { validators } from '../validators';
import type { PrismaIDBClient } from './prisma-idb-client';
import { z } from 'zod';

const handlerMap = {
	ExerciseSplit: {
		create: async (client: PrismaIDBClient, record: z.infer<typeof validators.ExerciseSplit>) =>
			client.exerciseSplit.create({ data: record }, undefined, true),
		update: async (client: PrismaIDBClient, record: z.infer<typeof validators.ExerciseSplit>) =>
			client.exerciseSplit.update({ where: { id: record.id }, data: record }, undefined, true),
		delete: async (client: PrismaIDBClient, record: z.infer<typeof validators.ExerciseSplit>) =>
			client.exerciseSplit.delete({ where: { id: record.id } }, undefined, true)
	},
	ExerciseSplitDay: {
		create: async (client: PrismaIDBClient, record: z.infer<typeof validators.ExerciseSplitDay>) =>
			client.exerciseSplitDay.create({ data: record }, undefined, true),
		update: async (client: PrismaIDBClient, record: z.infer<typeof validators.ExerciseSplitDay>) =>
			client.exerciseSplitDay.update({ where: { id: record.id }, data: record }, undefined, true),
		delete: async (client: PrismaIDBClient, record: z.infer<typeof validators.ExerciseSplitDay>) =>
			client.exerciseSplitDay.delete({ where: { id: record.id } }, undefined, true)
	},
	ExerciseSplitDaySession: {
		create: async (
			client: PrismaIDBClient,
			record: z.infer<typeof validators.ExerciseSplitDaySession>
		) => client.exerciseSplitDaySession.create({ data: record }, undefined, true),
		update: async (
			client: PrismaIDBClient,
			record: z.infer<typeof validators.ExerciseSplitDaySession>
		) =>
			client.exerciseSplitDaySession.update(
				{ where: { id: record.id }, data: record },
				undefined,
				true
			),
		delete: async (
			client: PrismaIDBClient,
			record: z.infer<typeof validators.ExerciseSplitDaySession>
		) => client.exerciseSplitDaySession.delete({ where: { id: record.id } }, undefined, true)
	},
	ExerciseSplitDaySessionExercise: {
		create: async (
			client: PrismaIDBClient,
			record: z.infer<typeof validators.ExerciseSplitDaySessionExercise>
		) => client.exerciseSplitDaySessionExercise.create({ data: record }, undefined, true),
		update: async (
			client: PrismaIDBClient,
			record: z.infer<typeof validators.ExerciseSplitDaySessionExercise>
		) =>
			client.exerciseSplitDaySessionExercise.update(
				{ where: { id: record.id }, data: record },
				undefined,
				true
			),
		delete: async (
			client: PrismaIDBClient,
			record: z.infer<typeof validators.ExerciseSplitDaySessionExercise>
		) =>
			client.exerciseSplitDaySessionExercise.delete({ where: { id: record.id } }, undefined, true)
	},
	ExerciseSplitDaySessionExerciseNote: {
		create: async (
			client: PrismaIDBClient,
			record: z.infer<typeof validators.ExerciseSplitDaySessionExerciseNote>
		) => client.exerciseSplitDaySessionExerciseNote.create({ data: record }, undefined, true),
		update: async (
			client: PrismaIDBClient,
			record: z.infer<typeof validators.ExerciseSplitDaySessionExerciseNote>
		) =>
			client.exerciseSplitDaySessionExerciseNote.update(
				{ where: { id: record.id }, data: record },
				undefined,
				true
			),
		delete: async (
			client: PrismaIDBClient,
			record: z.infer<typeof validators.ExerciseSplitDaySessionExerciseNote>
		) =>
			client.exerciseSplitDaySessionExerciseNote.delete(
				{ where: { id: record.id } },
				undefined,
				true
			)
	},
	ExerciseSplitDaySessionExerciseSecondaryMuscleGroup: {
		create: async (
			client: PrismaIDBClient,
			record: z.infer<typeof validators.ExerciseSplitDaySessionExerciseSecondaryMuscleGroup>
		) =>
			client.exerciseSplitDaySessionExerciseSecondaryMuscleGroup.create(
				{ data: record },
				undefined,
				true
			),
		update: async (
			client: PrismaIDBClient,
			record: z.infer<typeof validators.ExerciseSplitDaySessionExerciseSecondaryMuscleGroup>
		) =>
			client.exerciseSplitDaySessionExerciseSecondaryMuscleGroup.update(
				{ where: { id: record.id }, data: record },
				undefined,
				true
			),
		delete: async (
			client: PrismaIDBClient,
			record: z.infer<typeof validators.ExerciseSplitDaySessionExerciseSecondaryMuscleGroup>
		) =>
			client.exerciseSplitDaySessionExerciseSecondaryMuscleGroup.delete(
				{ where: { id: record.id } },
				undefined,
				true
			)
	},
	MacroTargets: {
		create: async (client: PrismaIDBClient, record: z.infer<typeof validators.MacroTargets>) =>
			client.macroTargets.create({ data: record }, undefined, true),
		update: async (client: PrismaIDBClient, record: z.infer<typeof validators.MacroTargets>) =>
			client.macroTargets.update({ where: { id: record.id }, data: record }, undefined, true),
		delete: async (client: PrismaIDBClient, record: z.infer<typeof validators.MacroTargets>) =>
			client.macroTargets.delete({ where: { id: record.id } }, undefined, true)
	},
	MacroMetrics: {
		create: async (client: PrismaIDBClient, record: z.infer<typeof validators.MacroMetrics>) =>
			client.macroMetrics.create({ data: record }, undefined, true),
		update: async (client: PrismaIDBClient, record: z.infer<typeof validators.MacroMetrics>) =>
			client.macroMetrics.update({ where: { id: record.id }, data: record }, undefined, true),
		delete: async (client: PrismaIDBClient, record: z.infer<typeof validators.MacroMetrics>) =>
			client.macroMetrics.delete({ where: { id: record.id } }, undefined, true)
	},
	MacroActivityTrackingPreferences: {
		create: async (
			client: PrismaIDBClient,
			record: z.infer<typeof validators.MacroActivityTrackingPreferences>
		) => client.macroActivityTrackingPreferences.create({ data: record }, undefined, true),
		update: async (
			client: PrismaIDBClient,
			record: z.infer<typeof validators.MacroActivityTrackingPreferences>
		) =>
			client.macroActivityTrackingPreferences.update(
				{ where: { id: record.id }, data: record },
				undefined,
				true
			),
		delete: async (
			client: PrismaIDBClient,
			record: z.infer<typeof validators.MacroActivityTrackingPreferences>
		) =>
			client.macroActivityTrackingPreferences.delete({ where: { id: record.id } }, undefined, true)
	},
	FoodEntry: {
		create: async (client: PrismaIDBClient, record: z.infer<typeof validators.FoodEntry>) =>
			client.foodEntry.create({ data: record }, undefined, true),
		update: async (client: PrismaIDBClient, record: z.infer<typeof validators.FoodEntry>) =>
			client.foodEntry.update({ where: { id: record.id }, data: record }, undefined, true),
		delete: async (client: PrismaIDBClient, record: z.infer<typeof validators.FoodEntry>) =>
			client.foodEntry.delete({ where: { id: record.id } }, undefined, true)
	},
	ActivityEntry: {
		create: async (client: PrismaIDBClient, record: z.infer<typeof validators.ActivityEntry>) =>
			client.activityEntry.create({ data: record }, undefined, true),
		update: async (client: PrismaIDBClient, record: z.infer<typeof validators.ActivityEntry>) =>
			client.activityEntry.update({ where: { id: record.id }, data: record }, undefined, true),
		delete: async (client: PrismaIDBClient, record: z.infer<typeof validators.ActivityEntry>) =>
			client.activityEntry.delete({ where: { id: record.id } }, undefined, true)
	},
	NutritionData: {
		create: async (client: PrismaIDBClient, record: z.infer<typeof validators.NutritionData>) =>
			client.nutritionData.create({ data: record }, undefined, true),
		update: async (client: PrismaIDBClient, record: z.infer<typeof validators.NutritionData>) =>
			client.nutritionData.update({ where: { id: record.id }, data: record }, undefined, true),
		delete: async (client: PrismaIDBClient, record: z.infer<typeof validators.NutritionData>) =>
			client.nutritionData.delete({ where: { id: record.id } }, undefined, true)
	},
	GettingStartedAnswers: {
		create: async (
			client: PrismaIDBClient,
			record: z.infer<typeof validators.GettingStartedAnswers>
		) => client.gettingStartedAnswers.create({ data: record }, undefined, true),
		update: async (
			client: PrismaIDBClient,
			record: z.infer<typeof validators.GettingStartedAnswers>
		) =>
			client.gettingStartedAnswers.update(
				{ where: { id: record.id }, data: record },
				undefined,
				true
			),
		delete: async (
			client: PrismaIDBClient,
			record: z.infer<typeof validators.GettingStartedAnswers>
		) => client.gettingStartedAnswers.delete({ where: { id: record.id } }, undefined, true)
	},
	DashboardItem: {
		create: async (client: PrismaIDBClient, record: z.infer<typeof validators.DashboardItem>) =>
			client.dashboardItem.create({ data: record }, undefined, true),
		update: async (client: PrismaIDBClient, record: z.infer<typeof validators.DashboardItem>) =>
			client.dashboardItem.update({ where: { id: record.id }, data: record }, undefined, true),
		delete: async (client: PrismaIDBClient, record: z.infer<typeof validators.DashboardItem>) =>
			client.dashboardItem.delete({ where: { id: record.id } }, undefined, true)
	},
	User: {
		create: async (client: PrismaIDBClient, record: z.infer<typeof validators.User>) =>
			client.user.create({ data: record }, undefined, true),
		update: async (client: PrismaIDBClient, record: z.infer<typeof validators.User>) =>
			client.user.update({ where: { id: record.id }, data: record }, undefined, true),
		delete: async (client: PrismaIDBClient, record: z.infer<typeof validators.User>) =>
			client.user.delete({ where: { id: record.id } }, undefined, true)
	},
	Session: {
		create: async (client: PrismaIDBClient, record: z.infer<typeof validators.Session>) =>
			client.session.create({ data: record }, undefined, true),
		update: async (client: PrismaIDBClient, record: z.infer<typeof validators.Session>) =>
			client.session.update({ where: { id: record.id }, data: record }, undefined, true),
		delete: async (client: PrismaIDBClient, record: z.infer<typeof validators.Session>) =>
			client.session.delete({ where: { id: record.id } }, undefined, true)
	},
	Account: {
		create: async (client: PrismaIDBClient, record: z.infer<typeof validators.Account>) =>
			client.account.create({ data: record }, undefined, true),
		update: async (client: PrismaIDBClient, record: z.infer<typeof validators.Account>) =>
			client.account.update({ where: { id: record.id }, data: record }, undefined, true),
		delete: async (client: PrismaIDBClient, record: z.infer<typeof validators.Account>) =>
			client.account.delete({ where: { id: record.id } }, undefined, true)
	},
	Verification: {
		create: async (client: PrismaIDBClient, record: z.infer<typeof validators.Verification>) =>
			client.verification.create({ data: record }, undefined, true),
		update: async (client: PrismaIDBClient, record: z.infer<typeof validators.Verification>) =>
			client.verification.update({ where: { id: record.id }, data: record }, undefined, true),
		delete: async (client: PrismaIDBClient, record: z.infer<typeof validators.Verification>) =>
			client.verification.delete({ where: { id: record.id } }, undefined, true)
	}
};
export async function applyPull(
	idbClient: PrismaIDBClient,
	logsWithRecords: LogsWithRecords<typeof validators>[]
) {
	let missingRecords = 0;

	for (const change of logsWithRecords) {
		const { model, operation, record } = change;
		if (!record) {
			missingRecords++;
			continue;
		}

		if (model === 'ExerciseSplit') {
			const handler = handlerMap.ExerciseSplit[operation];
			await handler(idbClient, record);
		} else if (model === 'ExerciseSplitDay') {
			const handler = handlerMap.ExerciseSplitDay[operation];
			await handler(idbClient, record);
		} else if (model === 'ExerciseSplitDaySession') {
			const handler = handlerMap.ExerciseSplitDaySession[operation];
			await handler(idbClient, record);
		} else if (model === 'ExerciseSplitDaySessionExercise') {
			const handler = handlerMap.ExerciseSplitDaySessionExercise[operation];
			await handler(idbClient, record);
		} else if (model === 'ExerciseSplitDaySessionExerciseNote') {
			const handler = handlerMap.ExerciseSplitDaySessionExerciseNote[operation];
			await handler(idbClient, record);
		} else if (model === 'ExerciseSplitDaySessionExerciseSecondaryMuscleGroup') {
			const handler = handlerMap.ExerciseSplitDaySessionExerciseSecondaryMuscleGroup[operation];
			await handler(idbClient, record);
		} else if (model === 'MacroTargets') {
			const handler = handlerMap.MacroTargets[operation];
			await handler(idbClient, record);
		} else if (model === 'MacroMetrics') {
			const handler = handlerMap.MacroMetrics[operation];
			await handler(idbClient, record);
		} else if (model === 'MacroActivityTrackingPreferences') {
			const handler = handlerMap.MacroActivityTrackingPreferences[operation];
			await handler(idbClient, record);
		} else if (model === 'FoodEntry') {
			const handler = handlerMap.FoodEntry[operation];
			await handler(idbClient, record);
		} else if (model === 'ActivityEntry') {
			const handler = handlerMap.ActivityEntry[operation];
			await handler(idbClient, record);
		} else if (model === 'NutritionData') {
			const handler = handlerMap.NutritionData[operation];
			await handler(idbClient, record);
		} else if (model === 'GettingStartedAnswers') {
			const handler = handlerMap.GettingStartedAnswers[operation];
			await handler(idbClient, record);
		} else if (model === 'DashboardItem') {
			const handler = handlerMap.DashboardItem[operation];
			await handler(idbClient, record);
		} else if (model === 'User') {
			const handler = handlerMap.User[operation];
			await handler(idbClient, record);
		} else if (model === 'Session') {
			const handler = handlerMap.Session[operation];
			await handler(idbClient, record);
		} else if (model === 'Account') {
			const handler = handlerMap.Account[operation];
			await handler(idbClient, record);
		} else if (model === 'Verification') {
			const handler = handlerMap.Verification[operation];
			await handler(idbClient, record);
		}
	}

	return { missingRecords, totalAppliedRecords: logsWithRecords.length - missingRecords };
}
