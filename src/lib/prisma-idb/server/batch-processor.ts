import { z, type ZodTypeAny } from 'zod';
import type { OutboxEventRecord } from '../client/idb-interface';
import type { ChangeLog } from '../../server/generated/prisma/client';
import { prisma } from '$lib/server/prisma';
import { validators, keyPathValidators } from '../validators';

type Op = 'create' | 'update' | 'delete';

type EventsFor<V extends Partial<Record<string, ZodTypeAny>>> = {
	[M in keyof V & string]: {
		[O in Op]: {
			entityType: M;
			operation: O;
			payload: z.infer<V[M]>;
		};
	}[Op];
}[keyof V & string];

export type LogsWithRecords<V extends Partial<Record<string, ZodTypeAny>>> = {
	[M in keyof V & string]: Omit<ChangeLog, 'model' | 'keyPath'> & {
		model: M;
		keyPath: Array<string | number>;
		record?: z.infer<V[M]> | null;
	};
}[keyof V & string];

export interface SyncResult {
	id: string;
	oldKeyPath?: Array<string | number>;
	entityKeyPath: Array<string | number>;
	mergedRecord?: unknown;
	serverVersion?: number;
	error?: string | null;
}

export async function applyPush(
	events: OutboxEventRecord[],
	scopeKey: string | ((event: OutboxEventRecord) => string),
	customValidation?: (event: EventsFor<typeof validators>) => boolean | Promise<boolean>
): Promise<SyncResult[]> {
	{
		const results: SyncResult[] = [];
		for (const event of events) {
			try {
				const resolvedScopeKey = typeof scopeKey === 'function' ? scopeKey(event) : scopeKey;
				let result: SyncResult;
				switch (event.entityType) {
					case 'ExerciseSplit': {
						{
							const validation = validators.ExerciseSplit.safeParse(event.payload);
							if (!validation.success)
								throw new Error(`Validation failed: ${validation.error.message}`);

							if (customValidation) {
								const ok = await customValidation(event as EventsFor<typeof validators>);
								if (!ok) throw new Error('custom validation failed');
							}

							result = await syncExerciseSplit(event, validation.data, resolvedScopeKey);
							break;
						}
					}
					case 'ExerciseSplitDay': {
						{
							const validation = validators.ExerciseSplitDay.safeParse(event.payload);
							if (!validation.success)
								throw new Error(`Validation failed: ${validation.error.message}`);

							if (customValidation) {
								const ok = await customValidation(event as EventsFor<typeof validators>);
								if (!ok) throw new Error('custom validation failed');
							}

							result = await syncExerciseSplitDay(event, validation.data, resolvedScopeKey);
							break;
						}
					}
					case 'ExerciseSplitDaySession': {
						{
							const validation = validators.ExerciseSplitDaySession.safeParse(event.payload);
							if (!validation.success)
								throw new Error(`Validation failed: ${validation.error.message}`);

							if (customValidation) {
								const ok = await customValidation(event as EventsFor<typeof validators>);
								if (!ok) throw new Error('custom validation failed');
							}

							result = await syncExerciseSplitDaySession(event, validation.data, resolvedScopeKey);
							break;
						}
					}
					case 'ExerciseSplitDaySessionExercise': {
						{
							const validation = validators.ExerciseSplitDaySessionExercise.safeParse(
								event.payload
							);
							if (!validation.success)
								throw new Error(`Validation failed: ${validation.error.message}`);

							if (customValidation) {
								const ok = await customValidation(event as EventsFor<typeof validators>);
								if (!ok) throw new Error('custom validation failed');
							}

							result = await syncExerciseSplitDaySessionExercise(
								event,
								validation.data,
								resolvedScopeKey
							);
							break;
						}
					}
					case 'ExerciseSplitDaySessionExerciseNote': {
						{
							const validation = validators.ExerciseSplitDaySessionExerciseNote.safeParse(
								event.payload
							);
							if (!validation.success)
								throw new Error(`Validation failed: ${validation.error.message}`);

							if (customValidation) {
								const ok = await customValidation(event as EventsFor<typeof validators>);
								if (!ok) throw new Error('custom validation failed');
							}

							result = await syncExerciseSplitDaySessionExerciseNote(
								event,
								validation.data,
								resolvedScopeKey
							);
							break;
						}
					}
					case 'ExerciseSplitDaySessionExerciseSecondaryMuscleGroup': {
						{
							const validation =
								validators.ExerciseSplitDaySessionExerciseSecondaryMuscleGroup.safeParse(
									event.payload
								);
							if (!validation.success)
								throw new Error(`Validation failed: ${validation.error.message}`);

							if (customValidation) {
								const ok = await customValidation(event as EventsFor<typeof validators>);
								if (!ok) throw new Error('custom validation failed');
							}

							result = await syncExerciseSplitDaySessionExerciseSecondaryMuscleGroup(
								event,
								validation.data,
								resolvedScopeKey
							);
							break;
						}
					}
					case 'MacroTargets': {
						{
							const validation = validators.MacroTargets.safeParse(event.payload);
							if (!validation.success)
								throw new Error(`Validation failed: ${validation.error.message}`);

							if (customValidation) {
								const ok = await customValidation(event as EventsFor<typeof validators>);
								if (!ok) throw new Error('custom validation failed');
							}

							result = await syncMacroTargets(event, validation.data, resolvedScopeKey);
							break;
						}
					}
					case 'MacroMetrics': {
						{
							const validation = validators.MacroMetrics.safeParse(event.payload);
							if (!validation.success)
								throw new Error(`Validation failed: ${validation.error.message}`);

							if (customValidation) {
								const ok = await customValidation(event as EventsFor<typeof validators>);
								if (!ok) throw new Error('custom validation failed');
							}

							result = await syncMacroMetrics(event, validation.data, resolvedScopeKey);
							break;
						}
					}
					case 'MacroActivityTrackingPreferences': {
						{
							const validation = validators.MacroActivityTrackingPreferences.safeParse(
								event.payload
							);
							if (!validation.success)
								throw new Error(`Validation failed: ${validation.error.message}`);

							if (customValidation) {
								const ok = await customValidation(event as EventsFor<typeof validators>);
								if (!ok) throw new Error('custom validation failed');
							}

							result = await syncMacroActivityTrackingPreferences(
								event,
								validation.data,
								resolvedScopeKey
							);
							break;
						}
					}
					case 'FoodEntry': {
						{
							const validation = validators.FoodEntry.safeParse(event.payload);
							if (!validation.success)
								throw new Error(`Validation failed: ${validation.error.message}`);

							if (customValidation) {
								const ok = await customValidation(event as EventsFor<typeof validators>);
								if (!ok) throw new Error('custom validation failed');
							}

							result = await syncFoodEntry(event, validation.data, resolvedScopeKey);
							break;
						}
					}
					case 'ActivityEntry': {
						{
							const validation = validators.ActivityEntry.safeParse(event.payload);
							if (!validation.success)
								throw new Error(`Validation failed: ${validation.error.message}`);

							if (customValidation) {
								const ok = await customValidation(event as EventsFor<typeof validators>);
								if (!ok) throw new Error('custom validation failed');
							}

							result = await syncActivityEntry(event, validation.data, resolvedScopeKey);
							break;
						}
					}
					case 'NutritionData': {
						{
							const validation = validators.NutritionData.safeParse(event.payload);
							if (!validation.success)
								throw new Error(`Validation failed: ${validation.error.message}`);

							if (customValidation) {
								const ok = await customValidation(event as EventsFor<typeof validators>);
								if (!ok) throw new Error('custom validation failed');
							}

							result = await syncNutritionData(event, validation.data, resolvedScopeKey);
							break;
						}
					}
					case 'GettingStartedAnswers': {
						{
							const validation = validators.GettingStartedAnswers.safeParse(event.payload);
							if (!validation.success)
								throw new Error(`Validation failed: ${validation.error.message}`);

							if (customValidation) {
								const ok = await customValidation(event as EventsFor<typeof validators>);
								if (!ok) throw new Error('custom validation failed');
							}

							result = await syncGettingStartedAnswers(event, validation.data, resolvedScopeKey);
							break;
						}
					}
					case 'DashboardItem': {
						{
							const validation = validators.DashboardItem.safeParse(event.payload);
							if (!validation.success)
								throw new Error(`Validation failed: ${validation.error.message}`);

							if (customValidation) {
								const ok = await customValidation(event as EventsFor<typeof validators>);
								if (!ok) throw new Error('custom validation failed');
							}

							result = await syncDashboardItem(event, validation.data, resolvedScopeKey);
							break;
						}
					}
					case 'User': {
						{
							const validation = validators.User.safeParse(event.payload);
							if (!validation.success)
								throw new Error(`Validation failed: ${validation.error.message}`);

							if (customValidation) {
								const ok = await customValidation(event as EventsFor<typeof validators>);
								if (!ok) throw new Error('custom validation failed');
							}

							result = await syncUser(event, validation.data, resolvedScopeKey);
							break;
						}
					}
					case 'Session': {
						{
							const validation = validators.Session.safeParse(event.payload);
							if (!validation.success)
								throw new Error(`Validation failed: ${validation.error.message}`);

							if (customValidation) {
								const ok = await customValidation(event as EventsFor<typeof validators>);
								if (!ok) throw new Error('custom validation failed');
							}

							result = await syncSession(event, validation.data, resolvedScopeKey);
							break;
						}
					}
					case 'Account': {
						{
							const validation = validators.Account.safeParse(event.payload);
							if (!validation.success)
								throw new Error(`Validation failed: ${validation.error.message}`);

							if (customValidation) {
								const ok = await customValidation(event as EventsFor<typeof validators>);
								if (!ok) throw new Error('custom validation failed');
							}

							result = await syncAccount(event, validation.data, resolvedScopeKey);
							break;
						}
					}
					case 'Verification': {
						{
							const validation = validators.Verification.safeParse(event.payload);
							if (!validation.success)
								throw new Error(`Validation failed: ${validation.error.message}`);

							if (customValidation) {
								const ok = await customValidation(event as EventsFor<typeof validators>);
								if (!ok) throw new Error('custom validation failed');
							}

							result = await syncVerification(event, validation.data, resolvedScopeKey);
							break;
						}
					}
					default:
						throw new Error(`No sync handler for ${event.entityType}`);
				}
				results.push(result);
			} catch (err) {
				const errorMessage = err instanceof Error ? err.message : 'Unknown error';
				results.push({ id: event.id, error: errorMessage, entityKeyPath: event.entityKeyPath });
			}
		}
		return results;
	}
}

export async function materializeLogs(
	logs: Array<ChangeLog>
): Promise<Array<LogsWithRecords<typeof validators>>> {
	{
		const validModelNames = [
			'ExerciseSplit',
			'ExerciseSplitDay',
			'ExerciseSplitDaySession',
			'ExerciseSplitDaySessionExercise',
			'ExerciseSplitDaySessionExerciseNote',
			'ExerciseSplitDaySessionExerciseSecondaryMuscleGroup',
			'MacroTargets',
			'MacroMetrics',
			'MacroActivityTrackingPreferences',
			'FoodEntry',
			'ActivityEntry',
			'NutritionData',
			'GettingStartedAnswers',
			'DashboardItem',
			'User',
			'Session',
			'Account',
			'Verification'
		];
		const results: Array<LogsWithRecords<typeof validators>> = [];
		for (const log of logs) {
			if (!validModelNames.includes(log.model)) {
				throw new Error(`Unknown model: ${log.model}`);
			}
			try {
				switch (log.model) {
					case 'ExerciseSplit': {
						const keyPathValidation = keyPathValidators.ExerciseSplit.safeParse(log.keyPath);
						if (!keyPathValidation.success) {
							throw new Error('Invalid keyPath for ExerciseSplit');
						}
						const validKeyPath = keyPathValidation.data;
						const record = await prisma.exerciseSplit.findUnique({
							where: { id: validKeyPath[0] }
						});
						results.push({ ...log, model: 'ExerciseSplit', keyPath: validKeyPath, record });
						break;
					}
					case 'ExerciseSplitDay': {
						const keyPathValidation = keyPathValidators.ExerciseSplitDay.safeParse(log.keyPath);
						if (!keyPathValidation.success) {
							throw new Error('Invalid keyPath for ExerciseSplitDay');
						}
						const validKeyPath = keyPathValidation.data;
						const record = await prisma.exerciseSplitDay.findUnique({
							where: { id: validKeyPath[0] }
						});
						results.push({ ...log, model: 'ExerciseSplitDay', keyPath: validKeyPath, record });
						break;
					}
					case 'ExerciseSplitDaySession': {
						const keyPathValidation = keyPathValidators.ExerciseSplitDaySession.safeParse(
							log.keyPath
						);
						if (!keyPathValidation.success) {
							throw new Error('Invalid keyPath for ExerciseSplitDaySession');
						}
						const validKeyPath = keyPathValidation.data;
						const record = await prisma.exerciseSplitDaySession.findUnique({
							where: { id: validKeyPath[0] }
						});
						results.push({
							...log,
							model: 'ExerciseSplitDaySession',
							keyPath: validKeyPath,
							record
						});
						break;
					}
					case 'ExerciseSplitDaySessionExercise': {
						const keyPathValidation = keyPathValidators.ExerciseSplitDaySessionExercise.safeParse(
							log.keyPath
						);
						if (!keyPathValidation.success) {
							throw new Error('Invalid keyPath for ExerciseSplitDaySessionExercise');
						}
						const validKeyPath = keyPathValidation.data;
						const record = await prisma.exerciseSplitDaySessionExercise.findUnique({
							where: { id: validKeyPath[0] }
						});
						results.push({
							...log,
							model: 'ExerciseSplitDaySessionExercise',
							keyPath: validKeyPath,
							record
						});
						break;
					}
					case 'ExerciseSplitDaySessionExerciseNote': {
						const keyPathValidation =
							keyPathValidators.ExerciseSplitDaySessionExerciseNote.safeParse(log.keyPath);
						if (!keyPathValidation.success) {
							throw new Error('Invalid keyPath for ExerciseSplitDaySessionExerciseNote');
						}
						const validKeyPath = keyPathValidation.data;
						const record = await prisma.exerciseSplitDaySessionExerciseNote.findUnique({
							where: { id: validKeyPath[0] }
						});
						results.push({
							...log,
							model: 'ExerciseSplitDaySessionExerciseNote',
							keyPath: validKeyPath,
							record
						});
						break;
					}
					case 'ExerciseSplitDaySessionExerciseSecondaryMuscleGroup': {
						const keyPathValidation =
							keyPathValidators.ExerciseSplitDaySessionExerciseSecondaryMuscleGroup.safeParse(
								log.keyPath
							);
						if (!keyPathValidation.success) {
							throw new Error(
								'Invalid keyPath for ExerciseSplitDaySessionExerciseSecondaryMuscleGroup'
							);
						}
						const validKeyPath = keyPathValidation.data;
						const record =
							await prisma.exerciseSplitDaySessionExerciseSecondaryMuscleGroup.findUnique({
								where: { id: validKeyPath[0] }
							});
						results.push({
							...log,
							model: 'ExerciseSplitDaySessionExerciseSecondaryMuscleGroup',
							keyPath: validKeyPath,
							record
						});
						break;
					}
					case 'MacroTargets': {
						const keyPathValidation = keyPathValidators.MacroTargets.safeParse(log.keyPath);
						if (!keyPathValidation.success) {
							throw new Error('Invalid keyPath for MacroTargets');
						}
						const validKeyPath = keyPathValidation.data;
						const record = await prisma.macroTargets.findUnique({
							where: { id: validKeyPath[0] }
						});
						results.push({ ...log, model: 'MacroTargets', keyPath: validKeyPath, record });
						break;
					}
					case 'MacroMetrics': {
						const keyPathValidation = keyPathValidators.MacroMetrics.safeParse(log.keyPath);
						if (!keyPathValidation.success) {
							throw new Error('Invalid keyPath for MacroMetrics');
						}
						const validKeyPath = keyPathValidation.data;
						const record = await prisma.macroMetrics.findUnique({
							where: { id: validKeyPath[0] }
						});
						results.push({ ...log, model: 'MacroMetrics', keyPath: validKeyPath, record });
						break;
					}
					case 'MacroActivityTrackingPreferences': {
						const keyPathValidation = keyPathValidators.MacroActivityTrackingPreferences.safeParse(
							log.keyPath
						);
						if (!keyPathValidation.success) {
							throw new Error('Invalid keyPath for MacroActivityTrackingPreferences');
						}
						const validKeyPath = keyPathValidation.data;
						const record = await prisma.macroActivityTrackingPreferences.findUnique({
							where: { id: validKeyPath[0] }
						});
						results.push({
							...log,
							model: 'MacroActivityTrackingPreferences',
							keyPath: validKeyPath,
							record
						});
						break;
					}
					case 'FoodEntry': {
						const keyPathValidation = keyPathValidators.FoodEntry.safeParse(log.keyPath);
						if (!keyPathValidation.success) {
							throw new Error('Invalid keyPath for FoodEntry');
						}
						const validKeyPath = keyPathValidation.data;
						const record = await prisma.foodEntry.findUnique({
							where: { id: validKeyPath[0] }
						});
						results.push({ ...log, model: 'FoodEntry', keyPath: validKeyPath, record });
						break;
					}
					case 'ActivityEntry': {
						const keyPathValidation = keyPathValidators.ActivityEntry.safeParse(log.keyPath);
						if (!keyPathValidation.success) {
							throw new Error('Invalid keyPath for ActivityEntry');
						}
						const validKeyPath = keyPathValidation.data;
						const record = await prisma.activityEntry.findUnique({
							where: { id: validKeyPath[0] }
						});
						results.push({ ...log, model: 'ActivityEntry', keyPath: validKeyPath, record });
						break;
					}
					case 'NutritionData': {
						const keyPathValidation = keyPathValidators.NutritionData.safeParse(log.keyPath);
						if (!keyPathValidation.success) {
							throw new Error('Invalid keyPath for NutritionData');
						}
						const validKeyPath = keyPathValidation.data;
						const record = await prisma.nutritionData.findUnique({
							where: { id: validKeyPath[0] }
						});
						results.push({ ...log, model: 'NutritionData', keyPath: validKeyPath, record });
						break;
					}
					case 'GettingStartedAnswers': {
						const keyPathValidation = keyPathValidators.GettingStartedAnswers.safeParse(
							log.keyPath
						);
						if (!keyPathValidation.success) {
							throw new Error('Invalid keyPath for GettingStartedAnswers');
						}
						const validKeyPath = keyPathValidation.data;
						const record = await prisma.gettingStartedAnswers.findUnique({
							where: { id: validKeyPath[0] }
						});
						results.push({ ...log, model: 'GettingStartedAnswers', keyPath: validKeyPath, record });
						break;
					}
					case 'DashboardItem': {
						const keyPathValidation = keyPathValidators.DashboardItem.safeParse(log.keyPath);
						if (!keyPathValidation.success) {
							throw new Error('Invalid keyPath for DashboardItem');
						}
						const validKeyPath = keyPathValidation.data;
						const record = await prisma.dashboardItem.findUnique({
							where: { id: validKeyPath[0] }
						});
						results.push({ ...log, model: 'DashboardItem', keyPath: validKeyPath, record });
						break;
					}
					case 'User': {
						const keyPathValidation = keyPathValidators.User.safeParse(log.keyPath);
						if (!keyPathValidation.success) {
							throw new Error('Invalid keyPath for User');
						}
						const validKeyPath = keyPathValidation.data;
						const record = await prisma.user.findUnique({
							where: { id: validKeyPath[0] }
						});
						results.push({ ...log, model: 'User', keyPath: validKeyPath, record });
						break;
					}
					case 'Session': {
						const keyPathValidation = keyPathValidators.Session.safeParse(log.keyPath);
						if (!keyPathValidation.success) {
							throw new Error('Invalid keyPath for Session');
						}
						const validKeyPath = keyPathValidation.data;
						const record = await prisma.session.findUnique({
							where: { id: validKeyPath[0] }
						});
						results.push({ ...log, model: 'Session', keyPath: validKeyPath, record });
						break;
					}
					case 'Account': {
						const keyPathValidation = keyPathValidators.Account.safeParse(log.keyPath);
						if (!keyPathValidation.success) {
							throw new Error('Invalid keyPath for Account');
						}
						const validKeyPath = keyPathValidation.data;
						const record = await prisma.account.findUnique({
							where: { id: validKeyPath[0] }
						});
						results.push({ ...log, model: 'Account', keyPath: validKeyPath, record });
						break;
					}
					case 'Verification': {
						const keyPathValidation = keyPathValidators.Verification.safeParse(log.keyPath);
						if (!keyPathValidation.success) {
							throw new Error('Invalid keyPath for Verification');
						}
						const validKeyPath = keyPathValidation.data;
						const record = await prisma.verification.findUnique({
							where: { id: validKeyPath[0] }
						});
						results.push({ ...log, model: 'Verification', keyPath: validKeyPath, record });
						break;
					}
				}
			} catch (err) {
				const errorMessage = err instanceof Error ? err.message : 'Unknown error';
				console.error(`Failed to fetch record for ${log.model}:`, errorMessage);
			}
		}
		return results;
	}
}

async function syncExerciseSplit(
	event: OutboxEventRecord,
	data: z.infer<typeof validators.ExerciseSplit>,
	scopeKey: string
): Promise<SyncResult> {
	const { id, entityKeyPath, operation } = event;
	const keyPathValidation = keyPathValidators.ExerciseSplit.safeParse(entityKeyPath);
	if (!keyPathValidation.success) {
		throw new Error('Invalid entityKeyPath for ExerciseSplit');
	}

	const validKeyPath = keyPathValidation.data;

	switch (operation) {
		case 'create': {
			const [result] = await prisma.$transaction([
				prisma.exerciseSplit.create({ data }),
				prisma.changeLog.create({
					data: {
						model: 'ExerciseSplit',
						keyPath: validKeyPath,
						operation: 'create',
						scopeKey
					}
				})
			]);
			const newKeyPath = [result.id];
			return { id, entityKeyPath: newKeyPath, mergedRecord: result };
		}

		case 'update': {
			if (!entityKeyPath) throw new Error('Missing entityKeyPath for update');
			const oldKeyPath = [...validKeyPath];
			const [result] = await prisma.$transaction([
				prisma.exerciseSplit.update({
					where: { id: validKeyPath[0] },
					data
				}),
				prisma.changeLog.create({
					data: {
						model: 'ExerciseSplit',
						keyPath: validKeyPath,
						oldKeyPath,
						operation: 'update',
						scopeKey
					}
				})
			]);
			const newKeyPath = [result.id];
			return { id, oldKeyPath, entityKeyPath: newKeyPath, mergedRecord: result };
		}

		case 'delete': {
			if (!entityKeyPath) throw new Error('Missing entityKeyPath for delete');
			await prisma.$transaction([
				prisma.exerciseSplit.delete({
					where: { id: validKeyPath[0] }
				}),
				prisma.changeLog.create({
					data: {
						model: 'ExerciseSplit',
						keyPath: validKeyPath,
						operation: 'delete',
						scopeKey
					}
				})
			]);
			return { id, entityKeyPath: validKeyPath };
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
}

async function syncExerciseSplitDay(
	event: OutboxEventRecord,
	data: z.infer<typeof validators.ExerciseSplitDay>,
	scopeKey: string
): Promise<SyncResult> {
	const { id, entityKeyPath, operation } = event;
	const keyPathValidation = keyPathValidators.ExerciseSplitDay.safeParse(entityKeyPath);
	if (!keyPathValidation.success) {
		throw new Error('Invalid entityKeyPath for ExerciseSplitDay');
	}

	const validKeyPath = keyPathValidation.data;

	switch (operation) {
		case 'create': {
			const [result] = await prisma.$transaction([
				prisma.exerciseSplitDay.create({ data }),
				prisma.changeLog.create({
					data: {
						model: 'ExerciseSplitDay',
						keyPath: validKeyPath,
						operation: 'create',
						scopeKey
					}
				})
			]);
			const newKeyPath = [result.id];
			return { id, entityKeyPath: newKeyPath, mergedRecord: result };
		}

		case 'update': {
			if (!entityKeyPath) throw new Error('Missing entityKeyPath for update');
			const oldKeyPath = [...validKeyPath];
			const [result] = await prisma.$transaction([
				prisma.exerciseSplitDay.update({
					where: { id: validKeyPath[0] },
					data
				}),
				prisma.changeLog.create({
					data: {
						model: 'ExerciseSplitDay',
						keyPath: validKeyPath,
						oldKeyPath,
						operation: 'update',
						scopeKey
					}
				})
			]);
			const newKeyPath = [result.id];
			return { id, oldKeyPath, entityKeyPath: newKeyPath, mergedRecord: result };
		}

		case 'delete': {
			if (!entityKeyPath) throw new Error('Missing entityKeyPath for delete');
			await prisma.$transaction([
				prisma.exerciseSplitDay.delete({
					where: { id: validKeyPath[0] }
				}),
				prisma.changeLog.create({
					data: {
						model: 'ExerciseSplitDay',
						keyPath: validKeyPath,
						operation: 'delete',
						scopeKey
					}
				})
			]);
			return { id, entityKeyPath: validKeyPath };
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
}

async function syncExerciseSplitDaySession(
	event: OutboxEventRecord,
	data: z.infer<typeof validators.ExerciseSplitDaySession>,
	scopeKey: string
): Promise<SyncResult> {
	const { id, entityKeyPath, operation } = event;
	const keyPathValidation = keyPathValidators.ExerciseSplitDaySession.safeParse(entityKeyPath);
	if (!keyPathValidation.success) {
		throw new Error('Invalid entityKeyPath for ExerciseSplitDaySession');
	}

	const validKeyPath = keyPathValidation.data;

	switch (operation) {
		case 'create': {
			const [result] = await prisma.$transaction([
				prisma.exerciseSplitDaySession.create({ data }),
				prisma.changeLog.create({
					data: {
						model: 'ExerciseSplitDaySession',
						keyPath: validKeyPath,
						operation: 'create',
						scopeKey
					}
				})
			]);
			const newKeyPath = [result.id];
			return { id, entityKeyPath: newKeyPath, mergedRecord: result };
		}

		case 'update': {
			if (!entityKeyPath) throw new Error('Missing entityKeyPath for update');
			const oldKeyPath = [...validKeyPath];
			const [result] = await prisma.$transaction([
				prisma.exerciseSplitDaySession.update({
					where: { id: validKeyPath[0] },
					data
				}),
				prisma.changeLog.create({
					data: {
						model: 'ExerciseSplitDaySession',
						keyPath: validKeyPath,
						oldKeyPath,
						operation: 'update',
						scopeKey
					}
				})
			]);
			const newKeyPath = [result.id];
			return { id, oldKeyPath, entityKeyPath: newKeyPath, mergedRecord: result };
		}

		case 'delete': {
			if (!entityKeyPath) throw new Error('Missing entityKeyPath for delete');
			await prisma.$transaction([
				prisma.exerciseSplitDaySession.delete({
					where: { id: validKeyPath[0] }
				}),
				prisma.changeLog.create({
					data: {
						model: 'ExerciseSplitDaySession',
						keyPath: validKeyPath,
						operation: 'delete',
						scopeKey
					}
				})
			]);
			return { id, entityKeyPath: validKeyPath };
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
}

async function syncExerciseSplitDaySessionExercise(
	event: OutboxEventRecord,
	data: z.infer<typeof validators.ExerciseSplitDaySessionExercise>,
	scopeKey: string
): Promise<SyncResult> {
	const { id, entityKeyPath, operation } = event;
	const keyPathValidation =
		keyPathValidators.ExerciseSplitDaySessionExercise.safeParse(entityKeyPath);
	if (!keyPathValidation.success) {
		throw new Error('Invalid entityKeyPath for ExerciseSplitDaySessionExercise');
	}

	const validKeyPath = keyPathValidation.data;

	switch (operation) {
		case 'create': {
			const [result] = await prisma.$transaction([
				prisma.exerciseSplitDaySessionExercise.create({ data }),
				prisma.changeLog.create({
					data: {
						model: 'ExerciseSplitDaySessionExercise',
						keyPath: validKeyPath,
						operation: 'create',
						scopeKey
					}
				})
			]);
			const newKeyPath = [result.id];
			return { id, entityKeyPath: newKeyPath, mergedRecord: result };
		}

		case 'update': {
			if (!entityKeyPath) throw new Error('Missing entityKeyPath for update');
			const oldKeyPath = [...validKeyPath];
			const [result] = await prisma.$transaction([
				prisma.exerciseSplitDaySessionExercise.update({
					where: { id: validKeyPath[0] },
					data
				}),
				prisma.changeLog.create({
					data: {
						model: 'ExerciseSplitDaySessionExercise',
						keyPath: validKeyPath,
						oldKeyPath,
						operation: 'update',
						scopeKey
					}
				})
			]);
			const newKeyPath = [result.id];
			return { id, oldKeyPath, entityKeyPath: newKeyPath, mergedRecord: result };
		}

		case 'delete': {
			if (!entityKeyPath) throw new Error('Missing entityKeyPath for delete');
			await prisma.$transaction([
				prisma.exerciseSplitDaySessionExercise.delete({
					where: { id: validKeyPath[0] }
				}),
				prisma.changeLog.create({
					data: {
						model: 'ExerciseSplitDaySessionExercise',
						keyPath: validKeyPath,
						operation: 'delete',
						scopeKey
					}
				})
			]);
			return { id, entityKeyPath: validKeyPath };
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
}

async function syncExerciseSplitDaySessionExerciseNote(
	event: OutboxEventRecord,
	data: z.infer<typeof validators.ExerciseSplitDaySessionExerciseNote>,
	scopeKey: string
): Promise<SyncResult> {
	const { id, entityKeyPath, operation } = event;
	const keyPathValidation =
		keyPathValidators.ExerciseSplitDaySessionExerciseNote.safeParse(entityKeyPath);
	if (!keyPathValidation.success) {
		throw new Error('Invalid entityKeyPath for ExerciseSplitDaySessionExerciseNote');
	}

	const validKeyPath = keyPathValidation.data;

	switch (operation) {
		case 'create': {
			const [result] = await prisma.$transaction([
				prisma.exerciseSplitDaySessionExerciseNote.create({ data }),
				prisma.changeLog.create({
					data: {
						model: 'ExerciseSplitDaySessionExerciseNote',
						keyPath: validKeyPath,
						operation: 'create',
						scopeKey
					}
				})
			]);
			const newKeyPath = [result.id];
			return { id, entityKeyPath: newKeyPath, mergedRecord: result };
		}

		case 'update': {
			if (!entityKeyPath) throw new Error('Missing entityKeyPath for update');
			const oldKeyPath = [...validKeyPath];
			const [result] = await prisma.$transaction([
				prisma.exerciseSplitDaySessionExerciseNote.update({
					where: { id: validKeyPath[0] },
					data
				}),
				prisma.changeLog.create({
					data: {
						model: 'ExerciseSplitDaySessionExerciseNote',
						keyPath: validKeyPath,
						oldKeyPath,
						operation: 'update',
						scopeKey
					}
				})
			]);
			const newKeyPath = [result.id];
			return { id, oldKeyPath, entityKeyPath: newKeyPath, mergedRecord: result };
		}

		case 'delete': {
			if (!entityKeyPath) throw new Error('Missing entityKeyPath for delete');
			await prisma.$transaction([
				prisma.exerciseSplitDaySessionExerciseNote.delete({
					where: { id: validKeyPath[0] }
				}),
				prisma.changeLog.create({
					data: {
						model: 'ExerciseSplitDaySessionExerciseNote',
						keyPath: validKeyPath,
						operation: 'delete',
						scopeKey
					}
				})
			]);
			return { id, entityKeyPath: validKeyPath };
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
}

async function syncExerciseSplitDaySessionExerciseSecondaryMuscleGroup(
	event: OutboxEventRecord,
	data: z.infer<typeof validators.ExerciseSplitDaySessionExerciseSecondaryMuscleGroup>,
	scopeKey: string
): Promise<SyncResult> {
	const { id, entityKeyPath, operation } = event;
	const keyPathValidation =
		keyPathValidators.ExerciseSplitDaySessionExerciseSecondaryMuscleGroup.safeParse(entityKeyPath);
	if (!keyPathValidation.success) {
		throw new Error(
			'Invalid entityKeyPath for ExerciseSplitDaySessionExerciseSecondaryMuscleGroup'
		);
	}

	const validKeyPath = keyPathValidation.data;

	switch (operation) {
		case 'create': {
			const [result] = await prisma.$transaction([
				prisma.exerciseSplitDaySessionExerciseSecondaryMuscleGroup.create({ data }),
				prisma.changeLog.create({
					data: {
						model: 'ExerciseSplitDaySessionExerciseSecondaryMuscleGroup',
						keyPath: validKeyPath,
						operation: 'create',
						scopeKey
					}
				})
			]);
			const newKeyPath = [result.id];
			return { id, entityKeyPath: newKeyPath, mergedRecord: result };
		}

		case 'update': {
			if (!entityKeyPath) throw new Error('Missing entityKeyPath for update');
			const oldKeyPath = [...validKeyPath];
			const [result] = await prisma.$transaction([
				prisma.exerciseSplitDaySessionExerciseSecondaryMuscleGroup.update({
					where: { id: validKeyPath[0] },
					data
				}),
				prisma.changeLog.create({
					data: {
						model: 'ExerciseSplitDaySessionExerciseSecondaryMuscleGroup',
						keyPath: validKeyPath,
						oldKeyPath,
						operation: 'update',
						scopeKey
					}
				})
			]);
			const newKeyPath = [result.id];
			return { id, oldKeyPath, entityKeyPath: newKeyPath, mergedRecord: result };
		}

		case 'delete': {
			if (!entityKeyPath) throw new Error('Missing entityKeyPath for delete');
			await prisma.$transaction([
				prisma.exerciseSplitDaySessionExerciseSecondaryMuscleGroup.delete({
					where: { id: validKeyPath[0] }
				}),
				prisma.changeLog.create({
					data: {
						model: 'ExerciseSplitDaySessionExerciseSecondaryMuscleGroup',
						keyPath: validKeyPath,
						operation: 'delete',
						scopeKey
					}
				})
			]);
			return { id, entityKeyPath: validKeyPath };
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
}

async function syncMacroTargets(
	event: OutboxEventRecord,
	data: z.infer<typeof validators.MacroTargets>,
	scopeKey: string
): Promise<SyncResult> {
	const { id, entityKeyPath, operation } = event;
	const keyPathValidation = keyPathValidators.MacroTargets.safeParse(entityKeyPath);
	if (!keyPathValidation.success) {
		throw new Error('Invalid entityKeyPath for MacroTargets');
	}

	const validKeyPath = keyPathValidation.data;

	switch (operation) {
		case 'create': {
			const [result] = await prisma.$transaction([
				prisma.macroTargets.create({ data }),
				prisma.changeLog.create({
					data: {
						model: 'MacroTargets',
						keyPath: validKeyPath,
						operation: 'create',
						scopeKey
					}
				})
			]);
			const newKeyPath = [result.id];
			return { id, entityKeyPath: newKeyPath, mergedRecord: result };
		}

		case 'update': {
			if (!entityKeyPath) throw new Error('Missing entityKeyPath for update');
			const oldKeyPath = [...validKeyPath];
			const [result] = await prisma.$transaction([
				prisma.macroTargets.update({
					where: { id: validKeyPath[0] },
					data
				}),
				prisma.changeLog.create({
					data: {
						model: 'MacroTargets',
						keyPath: validKeyPath,
						oldKeyPath,
						operation: 'update',
						scopeKey
					}
				})
			]);
			const newKeyPath = [result.id];
			return { id, oldKeyPath, entityKeyPath: newKeyPath, mergedRecord: result };
		}

		case 'delete': {
			if (!entityKeyPath) throw new Error('Missing entityKeyPath for delete');
			await prisma.$transaction([
				prisma.macroTargets.delete({
					where: { id: validKeyPath[0] }
				}),
				prisma.changeLog.create({
					data: {
						model: 'MacroTargets',
						keyPath: validKeyPath,
						operation: 'delete',
						scopeKey
					}
				})
			]);
			return { id, entityKeyPath: validKeyPath };
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
}

async function syncMacroMetrics(
	event: OutboxEventRecord,
	data: z.infer<typeof validators.MacroMetrics>,
	scopeKey: string
): Promise<SyncResult> {
	const { id, entityKeyPath, operation } = event;
	const keyPathValidation = keyPathValidators.MacroMetrics.safeParse(entityKeyPath);
	if (!keyPathValidation.success) {
		throw new Error('Invalid entityKeyPath for MacroMetrics');
	}

	const validKeyPath = keyPathValidation.data;

	switch (operation) {
		case 'create': {
			const [result] = await prisma.$transaction([
				prisma.macroMetrics.create({ data }),
				prisma.changeLog.create({
					data: {
						model: 'MacroMetrics',
						keyPath: validKeyPath,
						operation: 'create',
						scopeKey
					}
				})
			]);
			const newKeyPath = [result.id];
			return { id, entityKeyPath: newKeyPath, mergedRecord: result };
		}

		case 'update': {
			if (!entityKeyPath) throw new Error('Missing entityKeyPath for update');
			const oldKeyPath = [...validKeyPath];
			const [result] = await prisma.$transaction([
				prisma.macroMetrics.update({
					where: { id: validKeyPath[0] },
					data
				}),
				prisma.changeLog.create({
					data: {
						model: 'MacroMetrics',
						keyPath: validKeyPath,
						oldKeyPath,
						operation: 'update',
						scopeKey
					}
				})
			]);
			const newKeyPath = [result.id];
			return { id, oldKeyPath, entityKeyPath: newKeyPath, mergedRecord: result };
		}

		case 'delete': {
			if (!entityKeyPath) throw new Error('Missing entityKeyPath for delete');
			await prisma.$transaction([
				prisma.macroMetrics.delete({
					where: { id: validKeyPath[0] }
				}),
				prisma.changeLog.create({
					data: {
						model: 'MacroMetrics',
						keyPath: validKeyPath,
						operation: 'delete',
						scopeKey
					}
				})
			]);
			return { id, entityKeyPath: validKeyPath };
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
}

async function syncMacroActivityTrackingPreferences(
	event: OutboxEventRecord,
	data: z.infer<typeof validators.MacroActivityTrackingPreferences>,
	scopeKey: string
): Promise<SyncResult> {
	const { id, entityKeyPath, operation } = event;
	const keyPathValidation =
		keyPathValidators.MacroActivityTrackingPreferences.safeParse(entityKeyPath);
	if (!keyPathValidation.success) {
		throw new Error('Invalid entityKeyPath for MacroActivityTrackingPreferences');
	}

	const validKeyPath = keyPathValidation.data;

	switch (operation) {
		case 'create': {
			const [result] = await prisma.$transaction([
				prisma.macroActivityTrackingPreferences.create({ data }),
				prisma.changeLog.create({
					data: {
						model: 'MacroActivityTrackingPreferences',
						keyPath: validKeyPath,
						operation: 'create',
						scopeKey
					}
				})
			]);
			const newKeyPath = [result.id];
			return { id, entityKeyPath: newKeyPath, mergedRecord: result };
		}

		case 'update': {
			if (!entityKeyPath) throw new Error('Missing entityKeyPath for update');
			const oldKeyPath = [...validKeyPath];
			const [result] = await prisma.$transaction([
				prisma.macroActivityTrackingPreferences.update({
					where: { id: validKeyPath[0] },
					data
				}),
				prisma.changeLog.create({
					data: {
						model: 'MacroActivityTrackingPreferences',
						keyPath: validKeyPath,
						oldKeyPath,
						operation: 'update',
						scopeKey
					}
				})
			]);
			const newKeyPath = [result.id];
			return { id, oldKeyPath, entityKeyPath: newKeyPath, mergedRecord: result };
		}

		case 'delete': {
			if (!entityKeyPath) throw new Error('Missing entityKeyPath for delete');
			await prisma.$transaction([
				prisma.macroActivityTrackingPreferences.delete({
					where: { id: validKeyPath[0] }
				}),
				prisma.changeLog.create({
					data: {
						model: 'MacroActivityTrackingPreferences',
						keyPath: validKeyPath,
						operation: 'delete',
						scopeKey
					}
				})
			]);
			return { id, entityKeyPath: validKeyPath };
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
}

async function syncFoodEntry(
	event: OutboxEventRecord,
	data: z.infer<typeof validators.FoodEntry>,
	scopeKey: string
): Promise<SyncResult> {
	const { id, entityKeyPath, operation } = event;
	const keyPathValidation = keyPathValidators.FoodEntry.safeParse(entityKeyPath);
	if (!keyPathValidation.success) {
		throw new Error('Invalid entityKeyPath for FoodEntry');
	}

	const validKeyPath = keyPathValidation.data;

	switch (operation) {
		case 'create': {
			const [result] = await prisma.$transaction([
				prisma.foodEntry.create({ data }),
				prisma.changeLog.create({
					data: {
						model: 'FoodEntry',
						keyPath: validKeyPath,
						operation: 'create',
						scopeKey
					}
				})
			]);
			const newKeyPath = [result.id];
			return { id, entityKeyPath: newKeyPath, mergedRecord: result };
		}

		case 'update': {
			if (!entityKeyPath) throw new Error('Missing entityKeyPath for update');
			const oldKeyPath = [...validKeyPath];
			const [result] = await prisma.$transaction([
				prisma.foodEntry.update({
					where: { id: validKeyPath[0] },
					data
				}),
				prisma.changeLog.create({
					data: {
						model: 'FoodEntry',
						keyPath: validKeyPath,
						oldKeyPath,
						operation: 'update',
						scopeKey
					}
				})
			]);
			const newKeyPath = [result.id];
			return { id, oldKeyPath, entityKeyPath: newKeyPath, mergedRecord: result };
		}

		case 'delete': {
			if (!entityKeyPath) throw new Error('Missing entityKeyPath for delete');
			await prisma.$transaction([
				prisma.foodEntry.delete({
					where: { id: validKeyPath[0] }
				}),
				prisma.changeLog.create({
					data: {
						model: 'FoodEntry',
						keyPath: validKeyPath,
						operation: 'delete',
						scopeKey
					}
				})
			]);
			return { id, entityKeyPath: validKeyPath };
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
}

async function syncActivityEntry(
	event: OutboxEventRecord,
	data: z.infer<typeof validators.ActivityEntry>,
	scopeKey: string
): Promise<SyncResult> {
	const { id, entityKeyPath, operation } = event;
	const keyPathValidation = keyPathValidators.ActivityEntry.safeParse(entityKeyPath);
	if (!keyPathValidation.success) {
		throw new Error('Invalid entityKeyPath for ActivityEntry');
	}

	const validKeyPath = keyPathValidation.data;

	switch (operation) {
		case 'create': {
			const [result] = await prisma.$transaction([
				prisma.activityEntry.create({ data }),
				prisma.changeLog.create({
					data: {
						model: 'ActivityEntry',
						keyPath: validKeyPath,
						operation: 'create',
						scopeKey
					}
				})
			]);
			const newKeyPath = [result.id];
			return { id, entityKeyPath: newKeyPath, mergedRecord: result };
		}

		case 'update': {
			if (!entityKeyPath) throw new Error('Missing entityKeyPath for update');
			const oldKeyPath = [...validKeyPath];
			const [result] = await prisma.$transaction([
				prisma.activityEntry.update({
					where: { id: validKeyPath[0] },
					data
				}),
				prisma.changeLog.create({
					data: {
						model: 'ActivityEntry',
						keyPath: validKeyPath,
						oldKeyPath,
						operation: 'update',
						scopeKey
					}
				})
			]);
			const newKeyPath = [result.id];
			return { id, oldKeyPath, entityKeyPath: newKeyPath, mergedRecord: result };
		}

		case 'delete': {
			if (!entityKeyPath) throw new Error('Missing entityKeyPath for delete');
			await prisma.$transaction([
				prisma.activityEntry.delete({
					where: { id: validKeyPath[0] }
				}),
				prisma.changeLog.create({
					data: {
						model: 'ActivityEntry',
						keyPath: validKeyPath,
						operation: 'delete',
						scopeKey
					}
				})
			]);
			return { id, entityKeyPath: validKeyPath };
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
}

async function syncNutritionData(
	event: OutboxEventRecord,
	data: z.infer<typeof validators.NutritionData>,
	scopeKey: string
): Promise<SyncResult> {
	const { id, entityKeyPath, operation } = event;
	const keyPathValidation = keyPathValidators.NutritionData.safeParse(entityKeyPath);
	if (!keyPathValidation.success) {
		throw new Error('Invalid entityKeyPath for NutritionData');
	}

	const validKeyPath = keyPathValidation.data;

	switch (operation) {
		case 'create': {
			const [result] = await prisma.$transaction([
				prisma.nutritionData.create({ data }),
				prisma.changeLog.create({
					data: {
						model: 'NutritionData',
						keyPath: validKeyPath,
						operation: 'create',
						scopeKey
					}
				})
			]);
			const newKeyPath = [result.id];
			return { id, entityKeyPath: newKeyPath, mergedRecord: result };
		}

		case 'update': {
			if (!entityKeyPath) throw new Error('Missing entityKeyPath for update');
			const oldKeyPath = [...validKeyPath];
			const [result] = await prisma.$transaction([
				prisma.nutritionData.update({
					where: { id: validKeyPath[0] },
					data
				}),
				prisma.changeLog.create({
					data: {
						model: 'NutritionData',
						keyPath: validKeyPath,
						oldKeyPath,
						operation: 'update',
						scopeKey
					}
				})
			]);
			const newKeyPath = [result.id];
			return { id, oldKeyPath, entityKeyPath: newKeyPath, mergedRecord: result };
		}

		case 'delete': {
			if (!entityKeyPath) throw new Error('Missing entityKeyPath for delete');
			await prisma.$transaction([
				prisma.nutritionData.delete({
					where: { id: validKeyPath[0] }
				}),
				prisma.changeLog.create({
					data: {
						model: 'NutritionData',
						keyPath: validKeyPath,
						operation: 'delete',
						scopeKey
					}
				})
			]);
			return { id, entityKeyPath: validKeyPath };
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
}

async function syncGettingStartedAnswers(
	event: OutboxEventRecord,
	data: z.infer<typeof validators.GettingStartedAnswers>,
	scopeKey: string
): Promise<SyncResult> {
	const { id, entityKeyPath, operation } = event;
	const keyPathValidation = keyPathValidators.GettingStartedAnswers.safeParse(entityKeyPath);
	if (!keyPathValidation.success) {
		throw new Error('Invalid entityKeyPath for GettingStartedAnswers');
	}

	const validKeyPath = keyPathValidation.data;

	switch (operation) {
		case 'create': {
			const [result] = await prisma.$transaction([
				prisma.gettingStartedAnswers.create({ data }),
				prisma.changeLog.create({
					data: {
						model: 'GettingStartedAnswers',
						keyPath: validKeyPath,
						operation: 'create',
						scopeKey
					}
				})
			]);
			const newKeyPath = [result.id];
			return { id, entityKeyPath: newKeyPath, mergedRecord: result };
		}

		case 'update': {
			if (!entityKeyPath) throw new Error('Missing entityKeyPath for update');
			const oldKeyPath = [...validKeyPath];
			const [result] = await prisma.$transaction([
				prisma.gettingStartedAnswers.update({
					where: { id: validKeyPath[0] },
					data
				}),
				prisma.changeLog.create({
					data: {
						model: 'GettingStartedAnswers',
						keyPath: validKeyPath,
						oldKeyPath,
						operation: 'update',
						scopeKey
					}
				})
			]);
			const newKeyPath = [result.id];
			return { id, oldKeyPath, entityKeyPath: newKeyPath, mergedRecord: result };
		}

		case 'delete': {
			if (!entityKeyPath) throw new Error('Missing entityKeyPath for delete');
			await prisma.$transaction([
				prisma.gettingStartedAnswers.delete({
					where: { id: validKeyPath[0] }
				}),
				prisma.changeLog.create({
					data: {
						model: 'GettingStartedAnswers',
						keyPath: validKeyPath,
						operation: 'delete',
						scopeKey
					}
				})
			]);
			return { id, entityKeyPath: validKeyPath };
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
}

async function syncDashboardItem(
	event: OutboxEventRecord,
	data: z.infer<typeof validators.DashboardItem>,
	scopeKey: string
): Promise<SyncResult> {
	const { id, entityKeyPath, operation } = event;
	const keyPathValidation = keyPathValidators.DashboardItem.safeParse(entityKeyPath);
	if (!keyPathValidation.success) {
		throw new Error('Invalid entityKeyPath for DashboardItem');
	}

	const validKeyPath = keyPathValidation.data;

	switch (operation) {
		case 'create': {
			const [result] = await prisma.$transaction([
				prisma.dashboardItem.create({ data }),
				prisma.changeLog.create({
					data: {
						model: 'DashboardItem',
						keyPath: validKeyPath,
						operation: 'create',
						scopeKey
					}
				})
			]);
			const newKeyPath = [result.id];
			return { id, entityKeyPath: newKeyPath, mergedRecord: result };
		}

		case 'update': {
			if (!entityKeyPath) throw new Error('Missing entityKeyPath for update');
			const oldKeyPath = [...validKeyPath];
			const [result] = await prisma.$transaction([
				prisma.dashboardItem.update({
					where: { id: validKeyPath[0] },
					data
				}),
				prisma.changeLog.create({
					data: {
						model: 'DashboardItem',
						keyPath: validKeyPath,
						oldKeyPath,
						operation: 'update',
						scopeKey
					}
				})
			]);
			const newKeyPath = [result.id];
			return { id, oldKeyPath, entityKeyPath: newKeyPath, mergedRecord: result };
		}

		case 'delete': {
			if (!entityKeyPath) throw new Error('Missing entityKeyPath for delete');
			await prisma.$transaction([
				prisma.dashboardItem.delete({
					where: { id: validKeyPath[0] }
				}),
				prisma.changeLog.create({
					data: {
						model: 'DashboardItem',
						keyPath: validKeyPath,
						operation: 'delete',
						scopeKey
					}
				})
			]);
			return { id, entityKeyPath: validKeyPath };
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
}

async function syncUser(
	event: OutboxEventRecord,
	data: z.infer<typeof validators.User>,
	scopeKey: string
): Promise<SyncResult> {
	const { id, entityKeyPath, operation } = event;
	const keyPathValidation = keyPathValidators.User.safeParse(entityKeyPath);
	if (!keyPathValidation.success) {
		throw new Error('Invalid entityKeyPath for User');
	}

	const validKeyPath = keyPathValidation.data;

	switch (operation) {
		case 'create': {
			const [result] = await prisma.$transaction([
				prisma.user.create({ data }),
				prisma.changeLog.create({
					data: {
						model: 'User',
						keyPath: validKeyPath,
						operation: 'create',
						scopeKey
					}
				})
			]);
			const newKeyPath = [result.id];
			return { id, entityKeyPath: newKeyPath, mergedRecord: result };
		}

		case 'update': {
			if (!entityKeyPath) throw new Error('Missing entityKeyPath for update');
			const oldKeyPath = [...validKeyPath];
			const [result] = await prisma.$transaction([
				prisma.user.update({
					where: { id: validKeyPath[0] },
					data
				}),
				prisma.changeLog.create({
					data: {
						model: 'User',
						keyPath: validKeyPath,
						oldKeyPath,
						operation: 'update',
						scopeKey
					}
				})
			]);
			const newKeyPath = [result.id];
			return { id, oldKeyPath, entityKeyPath: newKeyPath, mergedRecord: result };
		}

		case 'delete': {
			if (!entityKeyPath) throw new Error('Missing entityKeyPath for delete');
			await prisma.$transaction([
				prisma.user.delete({
					where: { id: validKeyPath[0] }
				}),
				prisma.changeLog.create({
					data: {
						model: 'User',
						keyPath: validKeyPath,
						operation: 'delete',
						scopeKey
					}
				})
			]);
			return { id, entityKeyPath: validKeyPath };
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
}

async function syncSession(
	event: OutboxEventRecord,
	data: z.infer<typeof validators.Session>,
	scopeKey: string
): Promise<SyncResult> {
	const { id, entityKeyPath, operation } = event;
	const keyPathValidation = keyPathValidators.Session.safeParse(entityKeyPath);
	if (!keyPathValidation.success) {
		throw new Error('Invalid entityKeyPath for Session');
	}

	const validKeyPath = keyPathValidation.data;

	switch (operation) {
		case 'create': {
			const [result] = await prisma.$transaction([
				prisma.session.create({ data }),
				prisma.changeLog.create({
					data: {
						model: 'Session',
						keyPath: validKeyPath,
						operation: 'create',
						scopeKey
					}
				})
			]);
			const newKeyPath = [result.id];
			return { id, entityKeyPath: newKeyPath, mergedRecord: result };
		}

		case 'update': {
			if (!entityKeyPath) throw new Error('Missing entityKeyPath for update');
			const oldKeyPath = [...validKeyPath];
			const [result] = await prisma.$transaction([
				prisma.session.update({
					where: { id: validKeyPath[0] },
					data
				}),
				prisma.changeLog.create({
					data: {
						model: 'Session',
						keyPath: validKeyPath,
						oldKeyPath,
						operation: 'update',
						scopeKey
					}
				})
			]);
			const newKeyPath = [result.id];
			return { id, oldKeyPath, entityKeyPath: newKeyPath, mergedRecord: result };
		}

		case 'delete': {
			if (!entityKeyPath) throw new Error('Missing entityKeyPath for delete');
			await prisma.$transaction([
				prisma.session.delete({
					where: { id: validKeyPath[0] }
				}),
				prisma.changeLog.create({
					data: {
						model: 'Session',
						keyPath: validKeyPath,
						operation: 'delete',
						scopeKey
					}
				})
			]);
			return { id, entityKeyPath: validKeyPath };
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
}

async function syncAccount(
	event: OutboxEventRecord,
	data: z.infer<typeof validators.Account>,
	scopeKey: string
): Promise<SyncResult> {
	const { id, entityKeyPath, operation } = event;
	const keyPathValidation = keyPathValidators.Account.safeParse(entityKeyPath);
	if (!keyPathValidation.success) {
		throw new Error('Invalid entityKeyPath for Account');
	}

	const validKeyPath = keyPathValidation.data;

	switch (operation) {
		case 'create': {
			const [result] = await prisma.$transaction([
				prisma.account.create({ data }),
				prisma.changeLog.create({
					data: {
						model: 'Account',
						keyPath: validKeyPath,
						operation: 'create',
						scopeKey
					}
				})
			]);
			const newKeyPath = [result.id];
			return { id, entityKeyPath: newKeyPath, mergedRecord: result };
		}

		case 'update': {
			if (!entityKeyPath) throw new Error('Missing entityKeyPath for update');
			const oldKeyPath = [...validKeyPath];
			const [result] = await prisma.$transaction([
				prisma.account.update({
					where: { id: validKeyPath[0] },
					data
				}),
				prisma.changeLog.create({
					data: {
						model: 'Account',
						keyPath: validKeyPath,
						oldKeyPath,
						operation: 'update',
						scopeKey
					}
				})
			]);
			const newKeyPath = [result.id];
			return { id, oldKeyPath, entityKeyPath: newKeyPath, mergedRecord: result };
		}

		case 'delete': {
			if (!entityKeyPath) throw new Error('Missing entityKeyPath for delete');
			await prisma.$transaction([
				prisma.account.delete({
					where: { id: validKeyPath[0] }
				}),
				prisma.changeLog.create({
					data: {
						model: 'Account',
						keyPath: validKeyPath,
						operation: 'delete',
						scopeKey
					}
				})
			]);
			return { id, entityKeyPath: validKeyPath };
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
}

async function syncVerification(
	event: OutboxEventRecord,
	data: z.infer<typeof validators.Verification>,
	scopeKey: string
): Promise<SyncResult> {
	const { id, entityKeyPath, operation } = event;
	const keyPathValidation = keyPathValidators.Verification.safeParse(entityKeyPath);
	if (!keyPathValidation.success) {
		throw new Error('Invalid entityKeyPath for Verification');
	}

	const validKeyPath = keyPathValidation.data;

	switch (operation) {
		case 'create': {
			const [result] = await prisma.$transaction([
				prisma.verification.create({ data }),
				prisma.changeLog.create({
					data: {
						model: 'Verification',
						keyPath: validKeyPath,
						operation: 'create',
						scopeKey
					}
				})
			]);
			const newKeyPath = [result.id];
			return { id, entityKeyPath: newKeyPath, mergedRecord: result };
		}

		case 'update': {
			if (!entityKeyPath) throw new Error('Missing entityKeyPath for update');
			const oldKeyPath = [...validKeyPath];
			const [result] = await prisma.$transaction([
				prisma.verification.update({
					where: { id: validKeyPath[0] },
					data
				}),
				prisma.changeLog.create({
					data: {
						model: 'Verification',
						keyPath: validKeyPath,
						oldKeyPath,
						operation: 'update',
						scopeKey
					}
				})
			]);
			const newKeyPath = [result.id];
			return { id, oldKeyPath, entityKeyPath: newKeyPath, mergedRecord: result };
		}

		case 'delete': {
			if (!entityKeyPath) throw new Error('Missing entityKeyPath for delete');
			await prisma.$transaction([
				prisma.verification.delete({
					where: { id: validKeyPath[0] }
				}),
				prisma.changeLog.create({
					data: {
						model: 'Verification',
						keyPath: validKeyPath,
						operation: 'delete',
						scopeKey
					}
				})
			]);
			return { id, entityKeyPath: validKeyPath };
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
}
