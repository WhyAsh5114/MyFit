/* eslint-disable @typescript-eslint/no-unused-vars */
import { openDB } from 'idb';
import type { IDBPDatabase, StoreNames, IDBPTransaction } from 'idb';
import type { Prisma } from '$lib/server/generated/prisma/client';
import * as IDBUtils from './idb-utils';
import type { PrismaIDBSchema } from './idb-interface';
import { v4 as uuidv4 } from 'uuid';
const IDB_VERSION = 1;
export class PrismaIDBClient {
	private static instance: PrismaIDBClient;
	_db!: IDBPDatabase<PrismaIDBSchema>;

	private constructor() {}
	exerciseSplit!: ExerciseSplitIDBClass;
	exerciseSplitDay!: ExerciseSplitDayIDBClass;
	exerciseSplitDaySession!: ExerciseSplitDaySessionIDBClass;
	exerciseSplitDaySessionExercise!: ExerciseSplitDaySessionExerciseIDBClass;
	exerciseSplitDaySessionExerciseNote!: ExerciseSplitDaySessionExerciseNoteIDBClass;
	exerciseSplitDaySessionExerciseSecondaryMuscleGroup!: ExerciseSplitDaySessionExerciseSecondaryMuscleGroupIDBClass;
	macroTargets!: MacroTargetsIDBClass;
	macroMetrics!: MacroMetricsIDBClass;
	macroActivityTrackingPreferences!: MacroActivityTrackingPreferencesIDBClass;
	foodEntry!: FoodEntryIDBClass;
	activityEntry!: ActivityEntryIDBClass;
	nutritionData!: NutritionDataIDBClass;
	gettingStartedAnswers!: GettingStartedAnswersIDBClass;
	dashboardItem!: DashboardItemIDBClass;
	user!: UserIDBClass;
	session!: SessionIDBClass;
	account!: AccountIDBClass;
	verification!: VerificationIDBClass;
	public static async createClient(): Promise<PrismaIDBClient> {
		if (!PrismaIDBClient.instance) {
			const client = new PrismaIDBClient();
			await client.initialize();
			PrismaIDBClient.instance = client;
		}
		return PrismaIDBClient.instance;
	}
	public async resetDatabase() {
		this._db.close();
		window.indexedDB.deleteDatabase('prisma-idb');
		await PrismaIDBClient.instance.initialize();
	}
	private async initialize() {
		this._db = await openDB<PrismaIDBSchema>('prisma-idb', IDB_VERSION, {
			upgrade(db) {
				db.createObjectStore('ExerciseSplit', { keyPath: ['id'] });
				const ExerciseSplitDayStore = db.createObjectStore('ExerciseSplitDay', { keyPath: ['id'] });
				ExerciseSplitDayStore.createIndex(
					'exerciseSplitId_dayIndexIndex',
					['exerciseSplitId', 'dayIndex'],
					{ unique: true }
				);
				const ExerciseSplitDaySessionStore = db.createObjectStore('ExerciseSplitDaySession', {
					keyPath: ['id']
				});
				ExerciseSplitDaySessionStore.createIndex(
					'exerciseSplitDayId_sessionIndexIndex',
					['exerciseSplitDayId', 'sessionIndex'],
					{ unique: true }
				);
				const ExerciseSplitDaySessionExerciseStore = db.createObjectStore(
					'ExerciseSplitDaySessionExercise',
					{ keyPath: ['id'] }
				);
				ExerciseSplitDaySessionExerciseStore.createIndex(
					'exerciseSplitDaySessionId_exerciseIndexIndex',
					['exerciseSplitDaySessionId', 'exerciseIndex'],
					{ unique: true }
				);
				db.createObjectStore('ExerciseSplitDaySessionExerciseNote', { keyPath: ['id'] });
				const ExerciseSplitDaySessionExerciseSecondaryMuscleGroupStore = db.createObjectStore(
					'ExerciseSplitDaySessionExerciseSecondaryMuscleGroup',
					{ keyPath: ['id'] }
				);
				ExerciseSplitDaySessionExerciseSecondaryMuscleGroupStore.createIndex(
					'exerciseId_muscleGroupIndex',
					['exerciseId', 'muscleGroup'],
					{ unique: true }
				);
				const MacroTargetsStore = db.createObjectStore('MacroTargets', { keyPath: ['id'] });
				MacroTargetsStore.createIndex('userIdIndex', ['userId'], { unique: true });
				db.createObjectStore('MacroMetrics', { keyPath: ['id'] });
				const MacroActivityTrackingPreferencesStore = db.createObjectStore(
					'MacroActivityTrackingPreferences',
					{ keyPath: ['id'] }
				);
				MacroActivityTrackingPreferencesStore.createIndex('userIdIndex', ['userId'], {
					unique: true
				});
				db.createObjectStore('FoodEntry', { keyPath: ['id'] });
				db.createObjectStore('ActivityEntry', { keyPath: ['id'] });
				const NutritionDataStore = db.createObjectStore('NutritionData', { keyPath: ['id'] });
				NutritionDataStore.createIndex('codeIndex', ['code'], { unique: true });
				const GettingStartedAnswersStore = db.createObjectStore('GettingStartedAnswers', {
					keyPath: ['id']
				});
				GettingStartedAnswersStore.createIndex('userIdIndex', ['userId'], { unique: true });
				const DashboardItemStore = db.createObjectStore('DashboardItem', { keyPath: ['id'] });
				DashboardItemStore.createIndex('userIdIndex', ['userId'], { unique: true });
				DashboardItemStore.createIndex('userId_typeIndex', ['userId', 'type'], { unique: true });
				const UserStore = db.createObjectStore('User', { keyPath: ['id'] });
				UserStore.createIndex('emailIndex', ['email'], { unique: true });
				const SessionStore = db.createObjectStore('Session', { keyPath: ['id'] });
				SessionStore.createIndex('tokenIndex', ['token'], { unique: true });
				db.createObjectStore('Account', { keyPath: ['id'] });
				db.createObjectStore('Verification', { keyPath: ['id'] });
			}
		});
		this.exerciseSplit = new ExerciseSplitIDBClass(this, ['id']);
		this.exerciseSplitDay = new ExerciseSplitDayIDBClass(this, ['id']);
		this.exerciseSplitDaySession = new ExerciseSplitDaySessionIDBClass(this, ['id']);
		this.exerciseSplitDaySessionExercise = new ExerciseSplitDaySessionExerciseIDBClass(this, [
			'id'
		]);
		this.exerciseSplitDaySessionExerciseNote = new ExerciseSplitDaySessionExerciseNoteIDBClass(
			this,
			['id']
		);
		this.exerciseSplitDaySessionExerciseSecondaryMuscleGroup =
			new ExerciseSplitDaySessionExerciseSecondaryMuscleGroupIDBClass(this, ['id']);
		this.macroTargets = new MacroTargetsIDBClass(this, ['id']);
		this.macroMetrics = new MacroMetricsIDBClass(this, ['id']);
		this.macroActivityTrackingPreferences = new MacroActivityTrackingPreferencesIDBClass(this, [
			'id'
		]);
		this.foodEntry = new FoodEntryIDBClass(this, ['id']);
		this.activityEntry = new ActivityEntryIDBClass(this, ['id']);
		this.nutritionData = new NutritionDataIDBClass(this, ['id']);
		this.gettingStartedAnswers = new GettingStartedAnswersIDBClass(this, ['id']);
		this.dashboardItem = new DashboardItemIDBClass(this, ['id']);
		this.user = new UserIDBClass(this, ['id']);
		this.session = new SessionIDBClass(this, ['id']);
		this.account = new AccountIDBClass(this, ['id']);
		this.verification = new VerificationIDBClass(this, ['id']);
	}
}
class BaseIDBModelClass<T extends keyof PrismaIDBSchema> {
	protected client: PrismaIDBClient;
	protected keyPath: string[];
	private eventEmitter: EventTarget;

	constructor(client: PrismaIDBClient, keyPath: string[]) {
		this.client = client;
		this.keyPath = keyPath;
		this.eventEmitter = new EventTarget();
	}
	subscribe(
		event: 'create' | 'update' | 'delete' | ('create' | 'update' | 'delete')[],
		callback: (
			e: CustomEventInit<{
				keyPath: PrismaIDBSchema[T]['key'];
				oldKeyPath?: PrismaIDBSchema[T]['key'];
			}>
		) => void
	) {
		if (Array.isArray(event)) {
			event.forEach((event) => this.eventEmitter.addEventListener(event, callback));
			return;
		}
		this.eventEmitter.addEventListener(event, callback);
	}
	unsubscribe(
		event: 'create' | 'update' | 'delete' | ('create' | 'update' | 'delete')[],
		callback: (
			e: CustomEventInit<{
				keyPath: PrismaIDBSchema[T]['key'];
				oldKeyPath?: PrismaIDBSchema[T]['key'];
			}>
		) => void
	) {
		if (Array.isArray(event)) {
			event.forEach((event) => this.eventEmitter.removeEventListener(event, callback));
			return;
		}
		this.eventEmitter.removeEventListener(event, callback);
	}
	protected emit(
		event: 'create' | 'update' | 'delete',
		keyPath: PrismaIDBSchema[T]['key'],
		oldKeyPath?: PrismaIDBSchema[T]['key']
	) {
		if (event === 'update') {
			this.eventEmitter.dispatchEvent(new CustomEvent(event, { detail: { keyPath, oldKeyPath } }));
			return;
		}
		this.eventEmitter.dispatchEvent(new CustomEvent(event, { detail: { keyPath } }));
	}
}
class ExerciseSplitIDBClass extends BaseIDBModelClass<'ExerciseSplit'> {
	private async _applyWhereClause<
		W extends Prisma.Args<Prisma.ExerciseSplitDelegate, 'findFirstOrThrow'>['where'],
		R extends Prisma.Result<Prisma.ExerciseSplitDelegate, object, 'findFirstOrThrow'>
	>(records: R[], whereClause: W, tx: IDBUtils.TransactionType): Promise<R[]> {
		if (!whereClause) return records;
		records = await IDBUtils.applyLogicalFilters<Prisma.ExerciseSplitDelegate, R, W>(
			records,
			whereClause,
			tx,
			this.keyPath,
			this._applyWhereClause.bind(this)
		);
		return (
			await Promise.all(
				records.map(async (record) => {
					const stringFields = ['id', 'name', 'userId'] as const;
					for (const field of stringFields) {
						if (!IDBUtils.whereStringFilter(record, field, whereClause[field])) return null;
					}
					if (whereClause.user) {
						const { is, isNot, ...rest } = whereClause.user;
						if (is !== null && is !== undefined) {
							const relatedRecord = await this.client.user.findFirst(
								{ where: { ...is, id: record.userId } },
								tx
							);
							if (!relatedRecord) return null;
						}
						if (isNot !== null && isNot !== undefined) {
							const relatedRecord = await this.client.user.findFirst(
								{ where: { ...isNot, id: record.userId } },
								tx
							);
							if (relatedRecord) return null;
						}
						if (Object.keys(rest).length) {
							const relatedRecord = await this.client.user.findFirst(
								{ where: { ...whereClause.user, id: record.userId } },
								tx
							);
							if (!relatedRecord) return null;
						}
					}
					if (whereClause.splitDays) {
						if (whereClause.splitDays.every) {
							const violatingRecord = await this.client.exerciseSplitDay.findFirst({
								where: { NOT: { ...whereClause.splitDays.every }, exerciseSplitId: record.id },
								tx
							});
							if (violatingRecord !== null) return null;
						}
						if (whereClause.splitDays.some) {
							const relatedRecords = await this.client.exerciseSplitDay.findMany({
								where: { ...whereClause.splitDays.some, exerciseSplitId: record.id },
								tx
							});
							if (relatedRecords.length === 0) return null;
						}
						if (whereClause.splitDays.none) {
							const violatingRecord = await this.client.exerciseSplitDay.findFirst({
								where: { ...whereClause.splitDays.none, exerciseSplitId: record.id },
								tx
							});
							if (violatingRecord !== null) return null;
						}
					}
					return record;
				})
			)
		).filter((result) => result !== null);
	}
	private _applySelectClause<
		S extends Prisma.Args<Prisma.ExerciseSplitDelegate, 'findMany'>['select']
	>(
		records: Prisma.Result<Prisma.ExerciseSplitDelegate, object, 'findFirstOrThrow'>[],
		selectClause: S
	): Prisma.Result<Prisma.ExerciseSplitDelegate, { select: S }, 'findFirstOrThrow'>[] {
		if (!selectClause) {
			return records as Prisma.Result<
				Prisma.ExerciseSplitDelegate,
				{ select: S },
				'findFirstOrThrow'
			>[];
		}
		return records.map((record) => {
			const partialRecord: Partial<typeof record> = record;
			for (const untypedKey of ['id', 'user', 'name', 'userId', 'splitDays']) {
				const key = untypedKey as keyof typeof record & keyof S;
				if (!selectClause[key]) delete partialRecord[key];
			}
			return partialRecord;
		}) as Prisma.Result<Prisma.ExerciseSplitDelegate, { select: S }, 'findFirstOrThrow'>[];
	}
	private async _applyRelations<Q extends Prisma.Args<Prisma.ExerciseSplitDelegate, 'findMany'>>(
		records: Prisma.Result<Prisma.ExerciseSplitDelegate, object, 'findFirstOrThrow'>[],
		tx: IDBUtils.TransactionType,
		query?: Q
	): Promise<Prisma.Result<Prisma.ExerciseSplitDelegate, Q, 'findFirstOrThrow'>[]> {
		if (!query)
			return records as Prisma.Result<Prisma.ExerciseSplitDelegate, Q, 'findFirstOrThrow'>[];
		const recordsWithRelations = records.map(async (record) => {
			const unsafeRecord = record as Record<string, unknown>;
			const attach_user = query.select?.user || query.include?.user;
			if (attach_user) {
				unsafeRecord['user'] = await this.client.user.findUnique(
					{
						...(attach_user === true ? {} : attach_user),
						where: { id: record.userId! }
					},
					tx
				);
			}
			const attach_splitDays = query.select?.splitDays || query.include?.splitDays;
			if (attach_splitDays) {
				unsafeRecord['splitDays'] = await this.client.exerciseSplitDay.findMany(
					{
						...(attach_splitDays === true ? {} : attach_splitDays),
						where: { exerciseSplitId: record.id! }
					},
					tx
				);
			}
			return unsafeRecord;
		});
		return (await Promise.all(recordsWithRelations)) as Prisma.Result<
			Prisma.ExerciseSplitDelegate,
			Q,
			'findFirstOrThrow'
		>[];
	}
	async _applyOrderByClause<
		O extends Prisma.Args<Prisma.ExerciseSplitDelegate, 'findMany'>['orderBy'],
		R extends Prisma.Result<Prisma.ExerciseSplitDelegate, object, 'findFirstOrThrow'>
	>(records: R[], orderByClause: O, tx: IDBUtils.TransactionType): Promise<void> {
		if (orderByClause === undefined) return;
		const orderByClauses = IDBUtils.convertToArray(orderByClause);
		const indexedKeys = await Promise.all(
			records.map(async (record) => {
				const keys = await Promise.all(
					orderByClauses.map(async (clause) => await this._resolveOrderByKey(record, clause, tx))
				);
				return { keys, record };
			})
		);
		indexedKeys.sort((a, b) => {
			for (let i = 0; i < orderByClauses.length; i++) {
				const clause = orderByClauses[i];
				const comparison = IDBUtils.genericComparator(
					a.keys[i],
					b.keys[i],
					this._resolveSortOrder(clause)
				);
				if (comparison !== 0) return comparison;
			}
			return 0;
		});
		for (let i = 0; i < records.length; i++) {
			records[i] = indexedKeys[i].record;
		}
	}
	async _resolveOrderByKey(
		record: Prisma.Result<Prisma.ExerciseSplitDelegate, object, 'findFirstOrThrow'>,
		orderByInput: Prisma.ExerciseSplitOrderByWithRelationInput,
		tx: IDBUtils.TransactionType
	): Promise<unknown> {
		const scalarFields = ['id', 'name', 'userId'] as const;
		for (const field of scalarFields) if (orderByInput[field]) return record[field];
		if (orderByInput.user) {
			return await this.client.user._resolveOrderByKey(
				await this.client.user.findFirstOrThrow({ where: { id: record.userId } }),
				orderByInput.user,
				tx
			);
		}
		if (orderByInput.splitDays) {
			return await this.client.exerciseSplitDay.count(
				{ where: { exerciseSplitId: record.id } },
				tx
			);
		}
	}
	_resolveSortOrder(
		orderByInput: Prisma.ExerciseSplitOrderByWithRelationInput
	): Prisma.SortOrder | { sort: Prisma.SortOrder; nulls?: 'first' | 'last' } {
		const scalarFields = ['id', 'name', 'userId'] as const;
		for (const field of scalarFields) if (orderByInput[field]) return orderByInput[field];
		if (orderByInput.user) {
			return this.client.user._resolveSortOrder(orderByInput.user);
		}
		if (orderByInput.splitDays?._count) {
			return orderByInput.splitDays._count;
		}
		throw new Error('No field in orderBy clause');
	}
	private async _fillDefaults<
		D extends Prisma.Args<Prisma.ExerciseSplitDelegate, 'create'>['data']
	>(data: D, tx?: IDBUtils.ReadwriteTransactionType): Promise<D> {
		if (data === undefined) data = {} as NonNullable<D>;
		if (data.id === undefined) {
			data.id = uuidv4();
		}
		return data;
	}
	_getNeededStoresForWhere<
		W extends Prisma.Args<Prisma.ExerciseSplitDelegate, 'findMany'>['where']
	>(whereClause: W, neededStores: Set<StoreNames<PrismaIDBSchema>>) {
		if (whereClause === undefined) return;
		for (const param of IDBUtils.LogicalParams) {
			if (whereClause[param]) {
				for (const clause of IDBUtils.convertToArray(whereClause[param])) {
					this._getNeededStoresForWhere(clause, neededStores);
				}
			}
		}
		if (whereClause.user) {
			neededStores.add('User');
			this.client.user._getNeededStoresForWhere(whereClause.user, neededStores);
		}
		if (whereClause.splitDays) {
			neededStores.add('ExerciseSplitDay');
			this.client.exerciseSplitDay._getNeededStoresForWhere(
				whereClause.splitDays.every,
				neededStores
			);
			this.client.exerciseSplitDay._getNeededStoresForWhere(
				whereClause.splitDays.some,
				neededStores
			);
			this.client.exerciseSplitDay._getNeededStoresForWhere(
				whereClause.splitDays.none,
				neededStores
			);
		}
	}
	_getNeededStoresForFind<Q extends Prisma.Args<Prisma.ExerciseSplitDelegate, 'findMany'>>(
		query?: Q
	): Set<StoreNames<PrismaIDBSchema>> {
		const neededStores: Set<StoreNames<PrismaIDBSchema>> = new Set();
		neededStores.add('ExerciseSplit');
		this._getNeededStoresForWhere(query?.where, neededStores);
		if (query?.orderBy) {
			const orderBy = IDBUtils.convertToArray(query.orderBy);
			const orderBy_user = orderBy.find((clause) => clause.user);
			if (orderBy_user) {
				this.client.user
					._getNeededStoresForFind({ orderBy: orderBy_user.user })
					.forEach((storeName) => neededStores.add(storeName));
			}
			const orderBy_splitDays = orderBy.find((clause) => clause.splitDays);
			if (orderBy_splitDays) {
				neededStores.add('ExerciseSplitDay');
			}
		}
		if (query?.select?.user || query?.include?.user) {
			neededStores.add('User');
			if (typeof query.select?.user === 'object') {
				this.client.user
					._getNeededStoresForFind(query.select.user)
					.forEach((storeName) => neededStores.add(storeName));
			}
			if (typeof query.include?.user === 'object') {
				this.client.user
					._getNeededStoresForFind(query.include.user)
					.forEach((storeName) => neededStores.add(storeName));
			}
		}
		if (query?.select?.splitDays || query?.include?.splitDays) {
			neededStores.add('ExerciseSplitDay');
			if (typeof query.select?.splitDays === 'object') {
				this.client.exerciseSplitDay
					._getNeededStoresForFind(query.select.splitDays)
					.forEach((storeName) => neededStores.add(storeName));
			}
			if (typeof query.include?.splitDays === 'object') {
				this.client.exerciseSplitDay
					._getNeededStoresForFind(query.include.splitDays)
					.forEach((storeName) => neededStores.add(storeName));
			}
		}
		return neededStores;
	}
	_getNeededStoresForCreate<
		D extends Partial<Prisma.Args<Prisma.ExerciseSplitDelegate, 'create'>['data']>
	>(data: D): Set<StoreNames<PrismaIDBSchema>> {
		const neededStores: Set<StoreNames<PrismaIDBSchema>> = new Set();
		neededStores.add('ExerciseSplit');
		if (data?.user) {
			neededStores.add('User');
			if (data.user.create) {
				const createData = Array.isArray(data.user.create) ? data.user.create : [data.user.create];
				createData.forEach((record) =>
					this.client.user
						._getNeededStoresForCreate(record)
						.forEach((storeName) => neededStores.add(storeName))
				);
			}
			if (data.user.connectOrCreate) {
				IDBUtils.convertToArray(data.user.connectOrCreate).forEach((record) =>
					this.client.user
						._getNeededStoresForCreate(record.create)
						.forEach((storeName) => neededStores.add(storeName))
				);
			}
		}
		if (data?.userId !== undefined) {
			neededStores.add('User');
		}
		if (data?.splitDays) {
			neededStores.add('ExerciseSplitDay');
			if (data.splitDays.create) {
				const createData = Array.isArray(data.splitDays.create)
					? data.splitDays.create
					: [data.splitDays.create];
				createData.forEach((record) =>
					this.client.exerciseSplitDay
						._getNeededStoresForCreate(record)
						.forEach((storeName) => neededStores.add(storeName))
				);
			}
			if (data.splitDays.connectOrCreate) {
				IDBUtils.convertToArray(data.splitDays.connectOrCreate).forEach((record) =>
					this.client.exerciseSplitDay
						._getNeededStoresForCreate(record.create)
						.forEach((storeName) => neededStores.add(storeName))
				);
			}
			if (data.splitDays.createMany) {
				IDBUtils.convertToArray(data.splitDays.createMany.data).forEach((record) =>
					this.client.exerciseSplitDay
						._getNeededStoresForCreate(record)
						.forEach((storeName) => neededStores.add(storeName))
				);
			}
		}
		return neededStores;
	}
	_getNeededStoresForUpdate<Q extends Prisma.Args<Prisma.ExerciseSplitDelegate, 'update'>>(
		query: Partial<Q>
	): Set<StoreNames<PrismaIDBSchema>> {
		const neededStores = this._getNeededStoresForFind(query).union(
			this._getNeededStoresForCreate(
				query.data as Prisma.Args<Prisma.ExerciseSplitDelegate, 'create'>['data']
			)
		);
		if (query.data?.user?.connect) {
			neededStores.add('User');
			IDBUtils.convertToArray(query.data.user.connect).forEach((connect) => {
				this.client.user._getNeededStoresForWhere(connect, neededStores);
			});
		}
		if (query.data?.user?.update) {
			neededStores.add('User');
			IDBUtils.convertToArray(query.data.user.update).forEach((update) => {
				this.client.user
					._getNeededStoresForUpdate(update as Prisma.Args<Prisma.UserDelegate, 'update'>)
					.forEach((store) => neededStores.add(store));
			});
		}
		if (query.data?.user?.upsert) {
			neededStores.add('User');
			IDBUtils.convertToArray(query.data.user.upsert).forEach((upsert) => {
				const update = {
					where: upsert.where,
					data: { ...upsert.update, ...upsert.create }
				} as Prisma.Args<Prisma.UserDelegate, 'update'>;
				this.client.user
					._getNeededStoresForUpdate(update)
					.forEach((store) => neededStores.add(store));
			});
		}
		if (query.data?.splitDays?.connect) {
			neededStores.add('ExerciseSplitDay');
			IDBUtils.convertToArray(query.data.splitDays.connect).forEach((connect) => {
				this.client.exerciseSplitDay._getNeededStoresForWhere(connect, neededStores);
			});
		}
		if (query.data?.splitDays?.set) {
			neededStores.add('ExerciseSplitDay');
			IDBUtils.convertToArray(query.data.splitDays.set).forEach((setWhere) => {
				this.client.exerciseSplitDay._getNeededStoresForWhere(setWhere, neededStores);
			});
		}
		if (query.data?.splitDays?.updateMany) {
			neededStores.add('ExerciseSplitDay');
			IDBUtils.convertToArray(query.data.splitDays.updateMany).forEach((update) => {
				this.client.exerciseSplitDay
					._getNeededStoresForUpdate(
						update as Prisma.Args<Prisma.ExerciseSplitDayDelegate, 'update'>
					)
					.forEach((store) => neededStores.add(store));
			});
		}
		if (query.data?.splitDays?.update) {
			neededStores.add('ExerciseSplitDay');
			IDBUtils.convertToArray(query.data.splitDays.update).forEach((update) => {
				this.client.exerciseSplitDay
					._getNeededStoresForUpdate(
						update as Prisma.Args<Prisma.ExerciseSplitDayDelegate, 'update'>
					)
					.forEach((store) => neededStores.add(store));
			});
		}
		if (query.data?.splitDays?.upsert) {
			neededStores.add('ExerciseSplitDay');
			IDBUtils.convertToArray(query.data.splitDays.upsert).forEach((upsert) => {
				const update = {
					where: upsert.where,
					data: { ...upsert.update, ...upsert.create }
				} as Prisma.Args<Prisma.ExerciseSplitDayDelegate, 'update'>;
				this.client.exerciseSplitDay
					._getNeededStoresForUpdate(update)
					.forEach((store) => neededStores.add(store));
			});
		}
		if (query.data?.splitDays?.delete || query.data?.splitDays?.deleteMany) {
			this.client.exerciseSplitDay._getNeededStoresForNestedDelete(neededStores);
		}
		if (query.data?.id !== undefined) {
			neededStores.add('ExerciseSplitDay');
		}
		return neededStores;
	}
	_getNeededStoresForNestedDelete(neededStores: Set<StoreNames<PrismaIDBSchema>>): void {
		neededStores.add('ExerciseSplit');
		this.client.exerciseSplitDay._getNeededStoresForNestedDelete(neededStores);
	}
	private _removeNestedCreateData<
		D extends Prisma.Args<Prisma.ExerciseSplitDelegate, 'create'>['data']
	>(data: D): Prisma.Result<Prisma.ExerciseSplitDelegate, object, 'findFirstOrThrow'> {
		const recordWithoutNestedCreate = structuredClone(data);
		delete recordWithoutNestedCreate?.user;
		delete recordWithoutNestedCreate?.splitDays;
		return recordWithoutNestedCreate as Prisma.Result<
			Prisma.ExerciseSplitDelegate,
			object,
			'findFirstOrThrow'
		>;
	}
	private _preprocessListFields(
		records: Prisma.Result<Prisma.ExerciseSplitDelegate, object, 'findMany'>
	): void {}
	async findMany<Q extends Prisma.Args<Prisma.ExerciseSplitDelegate, 'findMany'>>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.ExerciseSplitDelegate, Q, 'findMany'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		const records = await this._applyWhereClause(
			await tx.objectStore('ExerciseSplit').getAll(),
			query?.where,
			tx
		);
		await this._applyOrderByClause(records, query?.orderBy, tx);
		const relationAppliedRecords = (await this._applyRelations(
			records,
			tx,
			query
		)) as Prisma.Result<Prisma.ExerciseSplitDelegate, object, 'findFirstOrThrow'>[];
		const selectClause = query?.select;
		let selectAppliedRecords = this._applySelectClause(relationAppliedRecords, selectClause);
		if (query?.distinct) {
			const distinctFields = IDBUtils.convertToArray(query.distinct);
			const seen = new Set<string>();
			selectAppliedRecords = selectAppliedRecords.filter((record) => {
				const key = distinctFields.map((field) => record[field]).join('|');
				if (seen.has(key)) return false;
				seen.add(key);
				return true;
			});
		}
		this._preprocessListFields(selectAppliedRecords);
		return selectAppliedRecords as Prisma.Result<Prisma.ExerciseSplitDelegate, Q, 'findMany'>;
	}
	async findFirst<Q extends Prisma.Args<Prisma.ExerciseSplitDelegate, 'findFirst'>>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.ExerciseSplitDelegate, Q, 'findFirst'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		return (await this.findMany(query, tx))[0] ?? null;
	}
	async findFirstOrThrow<Q extends Prisma.Args<Prisma.ExerciseSplitDelegate, 'findFirstOrThrow'>>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.ExerciseSplitDelegate, Q, 'findFirstOrThrow'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		const record = await this.findFirst(query, tx);
		if (!record) {
			tx.abort();
			throw new Error('Record not found');
		}
		return record;
	}
	async findUnique<Q extends Prisma.Args<Prisma.ExerciseSplitDelegate, 'findUnique'>>(
		query: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.ExerciseSplitDelegate, Q, 'findUnique'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		let record;
		if (query.where.id !== undefined) {
			record = await tx.objectStore('ExerciseSplit').get([query.where.id]);
		}
		if (!record) return null;

		const recordWithRelations = this._applySelectClause(
			await this._applyRelations(
				await this._applyWhereClause([record], query.where, tx),
				tx,
				query
			),
			query.select
		)[0];
		this._preprocessListFields([recordWithRelations]);
		return recordWithRelations as Prisma.Result<Prisma.ExerciseSplitDelegate, Q, 'findUnique'>;
	}
	async findUniqueOrThrow<Q extends Prisma.Args<Prisma.ExerciseSplitDelegate, 'findUniqueOrThrow'>>(
		query: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.ExerciseSplitDelegate, Q, 'findUniqueOrThrow'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		const record = await this.findUnique(query, tx);
		if (!record) {
			tx.abort();
			throw new Error('Record not found');
		}
		return record;
	}
	async count<Q extends Prisma.Args<Prisma.ExerciseSplitDelegate, 'count'>>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.ExerciseSplitDelegate, Q, 'count'>> {
		tx = tx ?? this.client._db.transaction(['ExerciseSplit'], 'readonly');
		if (!query?.select || query.select === true) {
			const records = await this.findMany({ where: query?.where }, tx);
			return records.length as Prisma.Result<Prisma.ExerciseSplitDelegate, Q, 'count'>;
		}
		const result: Partial<Record<keyof Prisma.ExerciseSplitCountAggregateInputType, number>> = {};
		for (const key of Object.keys(query.select)) {
			const typedKey = key as keyof typeof query.select;
			if (typedKey === '_all') {
				result[typedKey] = (await this.findMany({ where: query.where }, tx)).length;
				continue;
			}
			result[typedKey] = (
				await this.findMany({ where: { [`${typedKey}`]: { not: null } } }, tx)
			).length;
		}
		return result as Prisma.Result<Prisma.ExerciseSplitDelegate, Q, 'count'>;
	}
	async create<Q extends Prisma.Args<Prisma.ExerciseSplitDelegate, 'create'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.ExerciseSplitDelegate, Q, 'create'>> {
		const storesNeeded = this._getNeededStoresForCreate(query.data);
		tx = tx ?? this.client._db.transaction(Array.from(storesNeeded), 'readwrite');
		if (query.data.user) {
			const fk: Partial<PrismaIDBSchema['User']['key']> = [];
			if (query.data.user?.create) {
				const record = await this.client.user.create({ data: query.data.user.create }, tx);
				fk[0] = record.id;
			}
			if (query.data.user?.connect) {
				const record = await this.client.user.findUniqueOrThrow(
					{ where: query.data.user.connect },
					tx
				);
				delete query.data.user.connect;
				fk[0] = record.id;
			}
			if (query.data.user?.connectOrCreate) {
				const record = await this.client.user.upsert(
					{
						where: query.data.user.connectOrCreate.where,
						create: query.data.user.connectOrCreate.create,
						update: {}
					},
					tx
				);
				fk[0] = record.id;
			}
			const unsafeData = query.data as Record<string, unknown>;
			unsafeData.userId = fk[0];
			delete unsafeData.user;
		} else if (query.data?.userId !== undefined && query.data.userId !== null) {
			await this.client.user.findUniqueOrThrow(
				{
					where: { id: query.data.userId }
				},
				tx
			);
		}
		const record = this._removeNestedCreateData(await this._fillDefaults(query.data, tx));
		const keyPath = await tx.objectStore('ExerciseSplit').add(record);
		if (query.data?.splitDays?.create) {
			for (const elem of IDBUtils.convertToArray(query.data.splitDays.create)) {
				await this.client.exerciseSplitDay.create(
					{
						data: { ...elem, exerciseSplit: { connect: { id: keyPath[0] } } } as Prisma.Args<
							Prisma.ExerciseSplitDayDelegate,
							'create'
						>['data']
					},
					tx
				);
			}
		}
		if (query.data?.splitDays?.connect) {
			await Promise.all(
				IDBUtils.convertToArray(query.data.splitDays.connect).map(async (connectWhere) => {
					await this.client.exerciseSplitDay.update(
						{ where: connectWhere, data: { exerciseSplitId: keyPath[0] } },
						tx
					);
				})
			);
		}
		if (query.data?.splitDays?.connectOrCreate) {
			await Promise.all(
				IDBUtils.convertToArray(query.data.splitDays.connectOrCreate).map(
					async (connectOrCreate) => {
						await this.client.exerciseSplitDay.upsert(
							{
								where: connectOrCreate.where,
								create: { ...connectOrCreate.create, exerciseSplitId: keyPath[0] } as NonNullable<
									Prisma.Args<Prisma.ExerciseSplitDayDelegate, 'create'>['data']
								>,
								update: { exerciseSplitId: keyPath[0] }
							},
							tx
						);
					}
				)
			);
		}
		if (query.data?.splitDays?.createMany) {
			await this.client.exerciseSplitDay.createMany(
				{
					data: IDBUtils.convertToArray(query.data.splitDays.createMany.data).map((createData) => ({
						...createData,
						exerciseSplitId: keyPath[0]
					}))
				},
				tx
			);
		}
		const data = (await tx.objectStore('ExerciseSplit').get(keyPath))!;
		const recordsWithRelations = this._applySelectClause(
			await this._applyRelations<object>([data], tx, query),
			query.select
		)[0];
		this._preprocessListFields([recordsWithRelations]);
		this.emit('create', keyPath);
		return recordsWithRelations as Prisma.Result<Prisma.ExerciseSplitDelegate, Q, 'create'>;
	}
	async createMany<Q extends Prisma.Args<Prisma.ExerciseSplitDelegate, 'createMany'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.ExerciseSplitDelegate, Q, 'createMany'>> {
		const createManyData = IDBUtils.convertToArray(query.data);
		tx = tx ?? this.client._db.transaction(['ExerciseSplit'], 'readwrite');
		for (const createData of createManyData) {
			const record = this._removeNestedCreateData(await this._fillDefaults(createData, tx));
			const keyPath = await tx.objectStore('ExerciseSplit').add(record);
			this.emit('create', keyPath);
		}
		return { count: createManyData.length };
	}
	async createManyAndReturn<
		Q extends Prisma.Args<Prisma.ExerciseSplitDelegate, 'createManyAndReturn'>
	>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.ExerciseSplitDelegate, Q, 'createManyAndReturn'>> {
		const createManyData = IDBUtils.convertToArray(query.data);
		const records: Prisma.Result<Prisma.ExerciseSplitDelegate, object, 'findMany'> = [];
		tx = tx ?? this.client._db.transaction(['ExerciseSplit'], 'readwrite');
		for (const createData of createManyData) {
			const record = this._removeNestedCreateData(await this._fillDefaults(createData, tx));
			const keyPath = await tx.objectStore('ExerciseSplit').add(record);
			this.emit('create', keyPath);
			records.push(this._applySelectClause([record], query.select)[0]);
		}
		this._preprocessListFields(records);
		return records as Prisma.Result<Prisma.ExerciseSplitDelegate, Q, 'createManyAndReturn'>;
	}
	async delete<Q extends Prisma.Args<Prisma.ExerciseSplitDelegate, 'delete'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.ExerciseSplitDelegate, Q, 'delete'>> {
		const storesNeeded = this._getNeededStoresForFind(query);
		this._getNeededStoresForNestedDelete(storesNeeded);
		tx = tx ?? this.client._db.transaction(Array.from(storesNeeded), 'readwrite');
		const record = await this.findUnique(query, tx);
		if (!record) throw new Error('Record not found');
		const relatedExerciseSplitDay = await this.client.exerciseSplitDay.findMany(
			{ where: { exerciseSplitId: record.id } },
			tx
		);
		if (relatedExerciseSplitDay.length)
			throw new Error('Cannot delete record, other records depend on it');
		await tx.objectStore('ExerciseSplit').delete([record.id]);
		this.emit('delete', [record.id]);
		return record;
	}
	async deleteMany<Q extends Prisma.Args<Prisma.ExerciseSplitDelegate, 'deleteMany'>>(
		query?: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.ExerciseSplitDelegate, Q, 'deleteMany'>> {
		const storesNeeded = this._getNeededStoresForFind(query);
		this._getNeededStoresForNestedDelete(storesNeeded);
		tx = tx ?? this.client._db.transaction(Array.from(storesNeeded), 'readwrite');
		const records = await this.findMany(query, tx);
		for (const record of records) {
			await this.delete({ where: { id: record.id } }, tx);
		}
		return { count: records.length };
	}
	async update<Q extends Prisma.Args<Prisma.ExerciseSplitDelegate, 'update'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.ExerciseSplitDelegate, Q, 'update'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForUpdate(query)), 'readwrite');
		const record = await this.findUnique({ where: query.where }, tx);
		if (record === null) {
			tx.abort();
			throw new Error('Record not found');
		}
		const startKeyPath: PrismaIDBSchema['ExerciseSplit']['key'] = [record.id];
		const stringFields = ['id', 'name', 'userId'] as const;
		for (const field of stringFields) {
			IDBUtils.handleStringUpdateField(record, field, query.data[field]);
		}
		if (query.data.user) {
			if (query.data.user.connect) {
				const other = await this.client.user.findUniqueOrThrow(
					{ where: query.data.user.connect },
					tx
				);
				record.userId = other.id;
			}
			if (query.data.user.create) {
				const other = await this.client.user.create({ data: query.data.user.create }, tx);
				record.userId = other.id;
			}
			if (query.data.user.update) {
				const updateData = query.data.user.update.data ?? query.data.user.update;
				await this.client.user.update(
					{
						where: {
							...query.data.user.update.where,
							id: record.userId!
						} as Prisma.UserWhereUniqueInput,
						data: updateData
					},
					tx
				);
			}
			if (query.data.user.upsert) {
				await this.client.user.upsert(
					{
						where: {
							...query.data.user.upsert.where,
							id: record.userId!
						} as Prisma.UserWhereUniqueInput,
						create: { ...query.data.user.upsert.create, id: record.userId! } as Prisma.Args<
							Prisma.UserDelegate,
							'upsert'
						>['create'],
						update: query.data.user.upsert.update
					},
					tx
				);
			}
			if (query.data.user.connectOrCreate) {
				await this.client.user.upsert(
					{
						where: { ...query.data.user.connectOrCreate.where, id: record.userId! },
						create: {
							...query.data.user.connectOrCreate.create,
							id: record.userId!
						} as Prisma.Args<Prisma.UserDelegate, 'upsert'>['create'],
						update: { id: record.userId! }
					},
					tx
				);
			}
		}
		if (query.data.splitDays) {
			if (query.data.splitDays.connect) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.splitDays.connect).map(async (connectWhere) => {
						await this.client.exerciseSplitDay.update(
							{ where: connectWhere, data: { exerciseSplitId: record.id } },
							tx
						);
					})
				);
			}
			if (query.data.splitDays.disconnect) {
				throw new Error('Cannot disconnect required relation');
			}
			if (query.data.splitDays.create) {
				const createData = Array.isArray(query.data.splitDays.create)
					? query.data.splitDays.create
					: [query.data.splitDays.create];
				for (const elem of createData) {
					await this.client.exerciseSplitDay.create(
						{
							data: { ...elem, exerciseSplitId: record.id } as Prisma.Args<
								Prisma.ExerciseSplitDayDelegate,
								'create'
							>['data']
						},
						tx
					);
				}
			}
			if (query.data.splitDays.createMany) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.splitDays.createMany.data).map(async (createData) => {
						await this.client.exerciseSplitDay.create(
							{ data: { ...createData, exerciseSplitId: record.id } },
							tx
						);
					})
				);
			}
			if (query.data.splitDays.update) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.splitDays.update).map(async (updateData) => {
						await this.client.exerciseSplitDay.update(updateData, tx);
					})
				);
			}
			if (query.data.splitDays.updateMany) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.splitDays.updateMany).map(async (updateData) => {
						await this.client.exerciseSplitDay.updateMany(updateData, tx);
					})
				);
			}
			if (query.data.splitDays.upsert) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.splitDays.upsert).map(async (upsertData) => {
						await this.client.exerciseSplitDay.upsert(
							{
								...upsertData,
								where: { ...upsertData.where, exerciseSplitId: record.id },
								create: { ...upsertData.create, exerciseSplitId: record.id } as Prisma.Args<
									Prisma.ExerciseSplitDayDelegate,
									'upsert'
								>['create']
							},
							tx
						);
					})
				);
			}
			if (query.data.splitDays.delete) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.splitDays.delete).map(async (deleteData) => {
						await this.client.exerciseSplitDay.delete(
							{ where: { ...deleteData, exerciseSplitId: record.id } },
							tx
						);
					})
				);
			}
			if (query.data.splitDays.deleteMany) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.splitDays.deleteMany).map(async (deleteData) => {
						await this.client.exerciseSplitDay.deleteMany(
							{ where: { ...deleteData, exerciseSplitId: record.id } },
							tx
						);
					})
				);
			}
			if (query.data.splitDays.set) {
				const existing = await this.client.exerciseSplitDay.findMany(
					{ where: { exerciseSplitId: record.id } },
					tx
				);
				if (existing.length > 0) {
					throw new Error('Cannot set required relation');
				}
				await Promise.all(
					IDBUtils.convertToArray(query.data.splitDays.set).map(async (setData) => {
						await this.client.exerciseSplitDay.update(
							{ where: setData, data: { exerciseSplitId: record.id } },
							tx
						);
					})
				);
			}
		}
		if (query.data.userId !== undefined) {
			const related = await this.client.user.findUnique({ where: { id: record.userId } }, tx);
			if (!related) throw new Error('Related record not found');
		}
		const endKeyPath: PrismaIDBSchema['ExerciseSplit']['key'] = [record.id];
		for (let i = 0; i < startKeyPath.length; i++) {
			if (startKeyPath[i] !== endKeyPath[i]) {
				if ((await tx.objectStore('ExerciseSplit').get(endKeyPath)) !== undefined) {
					throw new Error('Record with the same keyPath already exists');
				}
				await tx.objectStore('ExerciseSplit').delete(startKeyPath);
				break;
			}
		}
		const keyPath = await tx.objectStore('ExerciseSplit').put(record);
		this.emit('update', keyPath, startKeyPath);
		for (let i = 0; i < startKeyPath.length; i++) {
			if (startKeyPath[i] !== endKeyPath[i]) {
				await this.client.exerciseSplitDay.updateMany(
					{
						where: { exerciseSplitId: startKeyPath[0] },
						data: { exerciseSplitId: endKeyPath[0] }
					},
					tx
				);
				break;
			}
		}
		const recordWithRelations = (await this.findUnique(
			{
				where: { id: keyPath[0] }
			},
			tx
		))!;
		return recordWithRelations as Prisma.Result<Prisma.ExerciseSplitDelegate, Q, 'update'>;
	}
	async updateMany<Q extends Prisma.Args<Prisma.ExerciseSplitDelegate, 'updateMany'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.ExerciseSplitDelegate, Q, 'updateMany'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readwrite');
		const records = await this.findMany({ where: query.where }, tx);
		await Promise.all(
			records.map(async (record) => {
				await this.update({ where: { id: record.id }, data: query.data }, tx);
			})
		);
		return { count: records.length };
	}
	async upsert<Q extends Prisma.Args<Prisma.ExerciseSplitDelegate, 'upsert'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.ExerciseSplitDelegate, Q, 'upsert'>> {
		const neededStores = this._getNeededStoresForUpdate({
			...query,
			data: { ...query.update, ...query.create } as Prisma.Args<
				Prisma.ExerciseSplitDelegate,
				'update'
			>['data']
		});
		tx = tx ?? this.client._db.transaction(Array.from(neededStores), 'readwrite');
		let record = await this.findUnique({ where: query.where }, tx);
		if (!record) record = await this.create({ data: query.create }, tx);
		else record = await this.update({ where: query.where, data: query.update }, tx);
		record = await this.findUniqueOrThrow(
			{ where: { id: record.id }, select: query.select, include: query.include },
			tx
		);
		return record as Prisma.Result<Prisma.ExerciseSplitDelegate, Q, 'upsert'>;
	}
	async aggregate<Q extends Prisma.Args<Prisma.ExerciseSplitDelegate, 'aggregate'>>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.ExerciseSplitDelegate, Q, 'aggregate'>> {
		tx = tx ?? this.client._db.transaction(['ExerciseSplit'], 'readonly');
		const records = await this.findMany({ where: query?.where }, tx);
		const result: Partial<Prisma.Result<Prisma.ExerciseSplitDelegate, Q, 'aggregate'>> = {};
		if (query?._count) {
			if (query._count === true) {
				(result._count as number) = records.length;
			} else {
				for (const key of Object.keys(query._count)) {
					const typedKey = key as keyof typeof query._count;
					if (typedKey === '_all') {
						(result._count as Record<string, number>)[typedKey] = records.length;
						continue;
					}
					(result._count as Record<string, number>)[typedKey] = (
						await this.findMany({ where: { [`${typedKey}`]: { not: null } } }, tx)
					).length;
				}
			}
		}
		if (query?._min) {
			const minResult = {} as Prisma.Result<Prisma.ExerciseSplitDelegate, Q, 'aggregate'>['_min'];
			const stringFields = ['id', 'name', 'userId'] as const;
			for (const field of stringFields) {
				if (!query._min[field]) continue;
				const values = records
					.map((record) => record[field] as string)
					.filter((value) => value !== undefined);
				(minResult[field as keyof typeof minResult] as string) = values.sort()[0];
			}
			result._min = minResult;
		}
		if (query?._max) {
			const maxResult = {} as Prisma.Result<Prisma.ExerciseSplitDelegate, Q, 'aggregate'>['_max'];
			const stringFields = ['id', 'name', 'userId'] as const;
			for (const field of stringFields) {
				if (!query._max[field]) continue;
				const values = records
					.map((record) => record[field] as string)
					.filter((value) => value !== undefined);
				(maxResult[field as keyof typeof maxResult] as string) = values.sort().reverse()[0];
			}
			result._max = maxResult;
		}
		return result as unknown as Prisma.Result<Prisma.ExerciseSplitDelegate, Q, 'aggregate'>;
	}
}
class ExerciseSplitDayIDBClass extends BaseIDBModelClass<'ExerciseSplitDay'> {
	private async _applyWhereClause<
		W extends Prisma.Args<Prisma.ExerciseSplitDayDelegate, 'findFirstOrThrow'>['where'],
		R extends Prisma.Result<Prisma.ExerciseSplitDayDelegate, object, 'findFirstOrThrow'>
	>(records: R[], whereClause: W, tx: IDBUtils.TransactionType): Promise<R[]> {
		if (!whereClause) return records;
		records = await IDBUtils.applyLogicalFilters<Prisma.ExerciseSplitDayDelegate, R, W>(
			records,
			whereClause,
			tx,
			this.keyPath,
			this._applyWhereClause.bind(this)
		);
		return (
			await Promise.all(
				records.map(async (record) => {
					const stringFields = ['id', 'exerciseSplitId'] as const;
					for (const field of stringFields) {
						if (!IDBUtils.whereStringFilter(record, field, whereClause[field])) return null;
					}
					const numberFields = ['dayIndex'] as const;
					for (const field of numberFields) {
						if (!IDBUtils.whereNumberFilter(record, field, whereClause[field])) return null;
					}
					if (whereClause.exerciseSplit) {
						const { is, isNot, ...rest } = whereClause.exerciseSplit;
						if (is !== null && is !== undefined) {
							const relatedRecord = await this.client.exerciseSplit.findFirst(
								{ where: { ...is, id: record.exerciseSplitId } },
								tx
							);
							if (!relatedRecord) return null;
						}
						if (isNot !== null && isNot !== undefined) {
							const relatedRecord = await this.client.exerciseSplit.findFirst(
								{ where: { ...isNot, id: record.exerciseSplitId } },
								tx
							);
							if (relatedRecord) return null;
						}
						if (Object.keys(rest).length) {
							const relatedRecord = await this.client.exerciseSplit.findFirst(
								{ where: { ...whereClause.exerciseSplit, id: record.exerciseSplitId } },
								tx
							);
							if (!relatedRecord) return null;
						}
					}
					if (whereClause.splitDaySessions) {
						if (whereClause.splitDaySessions.every) {
							const violatingRecord = await this.client.exerciseSplitDaySession.findFirst({
								where: {
									NOT: { ...whereClause.splitDaySessions.every },
									exerciseSplitDayId: record.id
								},
								tx
							});
							if (violatingRecord !== null) return null;
						}
						if (whereClause.splitDaySessions.some) {
							const relatedRecords = await this.client.exerciseSplitDaySession.findMany({
								where: { ...whereClause.splitDaySessions.some, exerciseSplitDayId: record.id },
								tx
							});
							if (relatedRecords.length === 0) return null;
						}
						if (whereClause.splitDaySessions.none) {
							const violatingRecord = await this.client.exerciseSplitDaySession.findFirst({
								where: { ...whereClause.splitDaySessions.none, exerciseSplitDayId: record.id },
								tx
							});
							if (violatingRecord !== null) return null;
						}
					}
					return record;
				})
			)
		).filter((result) => result !== null);
	}
	private _applySelectClause<
		S extends Prisma.Args<Prisma.ExerciseSplitDayDelegate, 'findMany'>['select']
	>(
		records: Prisma.Result<Prisma.ExerciseSplitDayDelegate, object, 'findFirstOrThrow'>[],
		selectClause: S
	): Prisma.Result<Prisma.ExerciseSplitDayDelegate, { select: S }, 'findFirstOrThrow'>[] {
		if (!selectClause) {
			return records as Prisma.Result<
				Prisma.ExerciseSplitDayDelegate,
				{ select: S },
				'findFirstOrThrow'
			>[];
		}
		return records.map((record) => {
			const partialRecord: Partial<typeof record> = record;
			for (const untypedKey of [
				'id',
				'dayIndex',
				'exerciseSplit',
				'exerciseSplitId',
				'splitDaySessions'
			]) {
				const key = untypedKey as keyof typeof record & keyof S;
				if (!selectClause[key]) delete partialRecord[key];
			}
			return partialRecord;
		}) as Prisma.Result<Prisma.ExerciseSplitDayDelegate, { select: S }, 'findFirstOrThrow'>[];
	}
	private async _applyRelations<Q extends Prisma.Args<Prisma.ExerciseSplitDayDelegate, 'findMany'>>(
		records: Prisma.Result<Prisma.ExerciseSplitDayDelegate, object, 'findFirstOrThrow'>[],
		tx: IDBUtils.TransactionType,
		query?: Q
	): Promise<Prisma.Result<Prisma.ExerciseSplitDayDelegate, Q, 'findFirstOrThrow'>[]> {
		if (!query)
			return records as Prisma.Result<Prisma.ExerciseSplitDayDelegate, Q, 'findFirstOrThrow'>[];
		const recordsWithRelations = records.map(async (record) => {
			const unsafeRecord = record as Record<string, unknown>;
			const attach_exerciseSplit = query.select?.exerciseSplit || query.include?.exerciseSplit;
			if (attach_exerciseSplit) {
				unsafeRecord['exerciseSplit'] = await this.client.exerciseSplit.findUnique(
					{
						...(attach_exerciseSplit === true ? {} : attach_exerciseSplit),
						where: { id: record.exerciseSplitId! }
					},
					tx
				);
			}
			const attach_splitDaySessions =
				query.select?.splitDaySessions || query.include?.splitDaySessions;
			if (attach_splitDaySessions) {
				unsafeRecord['splitDaySessions'] = await this.client.exerciseSplitDaySession.findMany(
					{
						...(attach_splitDaySessions === true ? {} : attach_splitDaySessions),
						where: { exerciseSplitDayId: record.id! }
					},
					tx
				);
			}
			return unsafeRecord;
		});
		return (await Promise.all(recordsWithRelations)) as Prisma.Result<
			Prisma.ExerciseSplitDayDelegate,
			Q,
			'findFirstOrThrow'
		>[];
	}
	async _applyOrderByClause<
		O extends Prisma.Args<Prisma.ExerciseSplitDayDelegate, 'findMany'>['orderBy'],
		R extends Prisma.Result<Prisma.ExerciseSplitDayDelegate, object, 'findFirstOrThrow'>
	>(records: R[], orderByClause: O, tx: IDBUtils.TransactionType): Promise<void> {
		if (orderByClause === undefined) return;
		const orderByClauses = IDBUtils.convertToArray(orderByClause);
		const indexedKeys = await Promise.all(
			records.map(async (record) => {
				const keys = await Promise.all(
					orderByClauses.map(async (clause) => await this._resolveOrderByKey(record, clause, tx))
				);
				return { keys, record };
			})
		);
		indexedKeys.sort((a, b) => {
			for (let i = 0; i < orderByClauses.length; i++) {
				const clause = orderByClauses[i];
				const comparison = IDBUtils.genericComparator(
					a.keys[i],
					b.keys[i],
					this._resolveSortOrder(clause)
				);
				if (comparison !== 0) return comparison;
			}
			return 0;
		});
		for (let i = 0; i < records.length; i++) {
			records[i] = indexedKeys[i].record;
		}
	}
	async _resolveOrderByKey(
		record: Prisma.Result<Prisma.ExerciseSplitDayDelegate, object, 'findFirstOrThrow'>,
		orderByInput: Prisma.ExerciseSplitDayOrderByWithRelationInput,
		tx: IDBUtils.TransactionType
	): Promise<unknown> {
		const scalarFields = ['id', 'dayIndex', 'exerciseSplitId'] as const;
		for (const field of scalarFields) if (orderByInput[field]) return record[field];
		if (orderByInput.exerciseSplit) {
			return await this.client.exerciseSplit._resolveOrderByKey(
				await this.client.exerciseSplit.findFirstOrThrow({ where: { id: record.exerciseSplitId } }),
				orderByInput.exerciseSplit,
				tx
			);
		}
		if (orderByInput.splitDaySessions) {
			return await this.client.exerciseSplitDaySession.count(
				{ where: { exerciseSplitDayId: record.id } },
				tx
			);
		}
	}
	_resolveSortOrder(
		orderByInput: Prisma.ExerciseSplitDayOrderByWithRelationInput
	): Prisma.SortOrder | { sort: Prisma.SortOrder; nulls?: 'first' | 'last' } {
		const scalarFields = ['id', 'dayIndex', 'exerciseSplitId'] as const;
		for (const field of scalarFields) if (orderByInput[field]) return orderByInput[field];
		if (orderByInput.exerciseSplit) {
			return this.client.exerciseSplit._resolveSortOrder(orderByInput.exerciseSplit);
		}
		if (orderByInput.splitDaySessions?._count) {
			return orderByInput.splitDaySessions._count;
		}
		throw new Error('No field in orderBy clause');
	}
	private async _fillDefaults<
		D extends Prisma.Args<Prisma.ExerciseSplitDayDelegate, 'create'>['data']
	>(data: D, tx?: IDBUtils.ReadwriteTransactionType): Promise<D> {
		if (data === undefined) data = {} as NonNullable<D>;
		if (data.id === undefined) {
			data.id = uuidv4();
		}
		return data;
	}
	_getNeededStoresForWhere<
		W extends Prisma.Args<Prisma.ExerciseSplitDayDelegate, 'findMany'>['where']
	>(whereClause: W, neededStores: Set<StoreNames<PrismaIDBSchema>>) {
		if (whereClause === undefined) return;
		for (const param of IDBUtils.LogicalParams) {
			if (whereClause[param]) {
				for (const clause of IDBUtils.convertToArray(whereClause[param])) {
					this._getNeededStoresForWhere(clause, neededStores);
				}
			}
		}
		if (whereClause.exerciseSplit) {
			neededStores.add('ExerciseSplit');
			this.client.exerciseSplit._getNeededStoresForWhere(whereClause.exerciseSplit, neededStores);
		}
		if (whereClause.splitDaySessions) {
			neededStores.add('ExerciseSplitDaySession');
			this.client.exerciseSplitDaySession._getNeededStoresForWhere(
				whereClause.splitDaySessions.every,
				neededStores
			);
			this.client.exerciseSplitDaySession._getNeededStoresForWhere(
				whereClause.splitDaySessions.some,
				neededStores
			);
			this.client.exerciseSplitDaySession._getNeededStoresForWhere(
				whereClause.splitDaySessions.none,
				neededStores
			);
		}
	}
	_getNeededStoresForFind<Q extends Prisma.Args<Prisma.ExerciseSplitDayDelegate, 'findMany'>>(
		query?: Q
	): Set<StoreNames<PrismaIDBSchema>> {
		const neededStores: Set<StoreNames<PrismaIDBSchema>> = new Set();
		neededStores.add('ExerciseSplitDay');
		this._getNeededStoresForWhere(query?.where, neededStores);
		if (query?.orderBy) {
			const orderBy = IDBUtils.convertToArray(query.orderBy);
			const orderBy_exerciseSplit = orderBy.find((clause) => clause.exerciseSplit);
			if (orderBy_exerciseSplit) {
				this.client.exerciseSplit
					._getNeededStoresForFind({ orderBy: orderBy_exerciseSplit.exerciseSplit })
					.forEach((storeName) => neededStores.add(storeName));
			}
			const orderBy_splitDaySessions = orderBy.find((clause) => clause.splitDaySessions);
			if (orderBy_splitDaySessions) {
				neededStores.add('ExerciseSplitDaySession');
			}
		}
		if (query?.select?.exerciseSplit || query?.include?.exerciseSplit) {
			neededStores.add('ExerciseSplit');
			if (typeof query.select?.exerciseSplit === 'object') {
				this.client.exerciseSplit
					._getNeededStoresForFind(query.select.exerciseSplit)
					.forEach((storeName) => neededStores.add(storeName));
			}
			if (typeof query.include?.exerciseSplit === 'object') {
				this.client.exerciseSplit
					._getNeededStoresForFind(query.include.exerciseSplit)
					.forEach((storeName) => neededStores.add(storeName));
			}
		}
		if (query?.select?.splitDaySessions || query?.include?.splitDaySessions) {
			neededStores.add('ExerciseSplitDaySession');
			if (typeof query.select?.splitDaySessions === 'object') {
				this.client.exerciseSplitDaySession
					._getNeededStoresForFind(query.select.splitDaySessions)
					.forEach((storeName) => neededStores.add(storeName));
			}
			if (typeof query.include?.splitDaySessions === 'object') {
				this.client.exerciseSplitDaySession
					._getNeededStoresForFind(query.include.splitDaySessions)
					.forEach((storeName) => neededStores.add(storeName));
			}
		}
		return neededStores;
	}
	_getNeededStoresForCreate<
		D extends Partial<Prisma.Args<Prisma.ExerciseSplitDayDelegate, 'create'>['data']>
	>(data: D): Set<StoreNames<PrismaIDBSchema>> {
		const neededStores: Set<StoreNames<PrismaIDBSchema>> = new Set();
		neededStores.add('ExerciseSplitDay');
		if (data?.exerciseSplit) {
			neededStores.add('ExerciseSplit');
			if (data.exerciseSplit.create) {
				const createData = Array.isArray(data.exerciseSplit.create)
					? data.exerciseSplit.create
					: [data.exerciseSplit.create];
				createData.forEach((record) =>
					this.client.exerciseSplit
						._getNeededStoresForCreate(record)
						.forEach((storeName) => neededStores.add(storeName))
				);
			}
			if (data.exerciseSplit.connectOrCreate) {
				IDBUtils.convertToArray(data.exerciseSplit.connectOrCreate).forEach((record) =>
					this.client.exerciseSplit
						._getNeededStoresForCreate(record.create)
						.forEach((storeName) => neededStores.add(storeName))
				);
			}
		}
		if (data?.exerciseSplitId !== undefined) {
			neededStores.add('ExerciseSplit');
		}
		if (data?.splitDaySessions) {
			neededStores.add('ExerciseSplitDaySession');
			if (data.splitDaySessions.create) {
				const createData = Array.isArray(data.splitDaySessions.create)
					? data.splitDaySessions.create
					: [data.splitDaySessions.create];
				createData.forEach((record) =>
					this.client.exerciseSplitDaySession
						._getNeededStoresForCreate(record)
						.forEach((storeName) => neededStores.add(storeName))
				);
			}
			if (data.splitDaySessions.connectOrCreate) {
				IDBUtils.convertToArray(data.splitDaySessions.connectOrCreate).forEach((record) =>
					this.client.exerciseSplitDaySession
						._getNeededStoresForCreate(record.create)
						.forEach((storeName) => neededStores.add(storeName))
				);
			}
			if (data.splitDaySessions.createMany) {
				IDBUtils.convertToArray(data.splitDaySessions.createMany.data).forEach((record) =>
					this.client.exerciseSplitDaySession
						._getNeededStoresForCreate(record)
						.forEach((storeName) => neededStores.add(storeName))
				);
			}
		}
		return neededStores;
	}
	_getNeededStoresForUpdate<Q extends Prisma.Args<Prisma.ExerciseSplitDayDelegate, 'update'>>(
		query: Partial<Q>
	): Set<StoreNames<PrismaIDBSchema>> {
		const neededStores = this._getNeededStoresForFind(query).union(
			this._getNeededStoresForCreate(
				query.data as Prisma.Args<Prisma.ExerciseSplitDayDelegate, 'create'>['data']
			)
		);
		if (query.data?.exerciseSplit?.connect) {
			neededStores.add('ExerciseSplit');
			IDBUtils.convertToArray(query.data.exerciseSplit.connect).forEach((connect) => {
				this.client.exerciseSplit._getNeededStoresForWhere(connect, neededStores);
			});
		}
		if (query.data?.exerciseSplit?.update) {
			neededStores.add('ExerciseSplit');
			IDBUtils.convertToArray(query.data.exerciseSplit.update).forEach((update) => {
				this.client.exerciseSplit
					._getNeededStoresForUpdate(update as Prisma.Args<Prisma.ExerciseSplitDelegate, 'update'>)
					.forEach((store) => neededStores.add(store));
			});
		}
		if (query.data?.exerciseSplit?.upsert) {
			neededStores.add('ExerciseSplit');
			IDBUtils.convertToArray(query.data.exerciseSplit.upsert).forEach((upsert) => {
				const update = {
					where: upsert.where,
					data: { ...upsert.update, ...upsert.create }
				} as Prisma.Args<Prisma.ExerciseSplitDelegate, 'update'>;
				this.client.exerciseSplit
					._getNeededStoresForUpdate(update)
					.forEach((store) => neededStores.add(store));
			});
		}
		if (query.data?.splitDaySessions?.connect) {
			neededStores.add('ExerciseSplitDaySession');
			IDBUtils.convertToArray(query.data.splitDaySessions.connect).forEach((connect) => {
				this.client.exerciseSplitDaySession._getNeededStoresForWhere(connect, neededStores);
			});
		}
		if (query.data?.splitDaySessions?.set) {
			neededStores.add('ExerciseSplitDaySession');
			IDBUtils.convertToArray(query.data.splitDaySessions.set).forEach((setWhere) => {
				this.client.exerciseSplitDaySession._getNeededStoresForWhere(setWhere, neededStores);
			});
		}
		if (query.data?.splitDaySessions?.updateMany) {
			neededStores.add('ExerciseSplitDaySession');
			IDBUtils.convertToArray(query.data.splitDaySessions.updateMany).forEach((update) => {
				this.client.exerciseSplitDaySession
					._getNeededStoresForUpdate(
						update as Prisma.Args<Prisma.ExerciseSplitDaySessionDelegate, 'update'>
					)
					.forEach((store) => neededStores.add(store));
			});
		}
		if (query.data?.splitDaySessions?.update) {
			neededStores.add('ExerciseSplitDaySession');
			IDBUtils.convertToArray(query.data.splitDaySessions.update).forEach((update) => {
				this.client.exerciseSplitDaySession
					._getNeededStoresForUpdate(
						update as Prisma.Args<Prisma.ExerciseSplitDaySessionDelegate, 'update'>
					)
					.forEach((store) => neededStores.add(store));
			});
		}
		if (query.data?.splitDaySessions?.upsert) {
			neededStores.add('ExerciseSplitDaySession');
			IDBUtils.convertToArray(query.data.splitDaySessions.upsert).forEach((upsert) => {
				const update = {
					where: upsert.where,
					data: { ...upsert.update, ...upsert.create }
				} as Prisma.Args<Prisma.ExerciseSplitDaySessionDelegate, 'update'>;
				this.client.exerciseSplitDaySession
					._getNeededStoresForUpdate(update)
					.forEach((store) => neededStores.add(store));
			});
		}
		if (query.data?.splitDaySessions?.delete || query.data?.splitDaySessions?.deleteMany) {
			this.client.exerciseSplitDaySession._getNeededStoresForNestedDelete(neededStores);
		}
		if (query.data?.id !== undefined) {
			neededStores.add('ExerciseSplitDaySession');
		}
		return neededStores;
	}
	_getNeededStoresForNestedDelete(neededStores: Set<StoreNames<PrismaIDBSchema>>): void {
		neededStores.add('ExerciseSplitDay');
		this.client.exerciseSplitDaySession._getNeededStoresForNestedDelete(neededStores);
	}
	private _removeNestedCreateData<
		D extends Prisma.Args<Prisma.ExerciseSplitDayDelegate, 'create'>['data']
	>(data: D): Prisma.Result<Prisma.ExerciseSplitDayDelegate, object, 'findFirstOrThrow'> {
		const recordWithoutNestedCreate = structuredClone(data);
		delete recordWithoutNestedCreate?.exerciseSplit;
		delete recordWithoutNestedCreate?.splitDaySessions;
		return recordWithoutNestedCreate as Prisma.Result<
			Prisma.ExerciseSplitDayDelegate,
			object,
			'findFirstOrThrow'
		>;
	}
	private _preprocessListFields(
		records: Prisma.Result<Prisma.ExerciseSplitDayDelegate, object, 'findMany'>
	): void {}
	async findMany<Q extends Prisma.Args<Prisma.ExerciseSplitDayDelegate, 'findMany'>>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.ExerciseSplitDayDelegate, Q, 'findMany'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		const records = await this._applyWhereClause(
			await tx.objectStore('ExerciseSplitDay').getAll(),
			query?.where,
			tx
		);
		await this._applyOrderByClause(records, query?.orderBy, tx);
		const relationAppliedRecords = (await this._applyRelations(
			records,
			tx,
			query
		)) as Prisma.Result<Prisma.ExerciseSplitDayDelegate, object, 'findFirstOrThrow'>[];
		const selectClause = query?.select;
		let selectAppliedRecords = this._applySelectClause(relationAppliedRecords, selectClause);
		if (query?.distinct) {
			const distinctFields = IDBUtils.convertToArray(query.distinct);
			const seen = new Set<string>();
			selectAppliedRecords = selectAppliedRecords.filter((record) => {
				const key = distinctFields.map((field) => record[field]).join('|');
				if (seen.has(key)) return false;
				seen.add(key);
				return true;
			});
		}
		this._preprocessListFields(selectAppliedRecords);
		return selectAppliedRecords as Prisma.Result<Prisma.ExerciseSplitDayDelegate, Q, 'findMany'>;
	}
	async findFirst<Q extends Prisma.Args<Prisma.ExerciseSplitDayDelegate, 'findFirst'>>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.ExerciseSplitDayDelegate, Q, 'findFirst'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		return (await this.findMany(query, tx))[0] ?? null;
	}
	async findFirstOrThrow<
		Q extends Prisma.Args<Prisma.ExerciseSplitDayDelegate, 'findFirstOrThrow'>
	>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.ExerciseSplitDayDelegate, Q, 'findFirstOrThrow'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		const record = await this.findFirst(query, tx);
		if (!record) {
			tx.abort();
			throw new Error('Record not found');
		}
		return record;
	}
	async findUnique<Q extends Prisma.Args<Prisma.ExerciseSplitDayDelegate, 'findUnique'>>(
		query: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.ExerciseSplitDayDelegate, Q, 'findUnique'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		let record;
		if (query.where.id !== undefined) {
			record = await tx.objectStore('ExerciseSplitDay').get([query.where.id]);
		} else if (query.where.exerciseSplitId_dayIndex !== undefined) {
			record = await tx
				.objectStore('ExerciseSplitDay')
				.index('exerciseSplitId_dayIndexIndex')
				.get([
					query.where.exerciseSplitId_dayIndex.exerciseSplitId,
					query.where.exerciseSplitId_dayIndex.dayIndex
				]);
		}
		if (!record) return null;

		const recordWithRelations = this._applySelectClause(
			await this._applyRelations(
				await this._applyWhereClause([record], query.where, tx),
				tx,
				query
			),
			query.select
		)[0];
		this._preprocessListFields([recordWithRelations]);
		return recordWithRelations as Prisma.Result<Prisma.ExerciseSplitDayDelegate, Q, 'findUnique'>;
	}
	async findUniqueOrThrow<
		Q extends Prisma.Args<Prisma.ExerciseSplitDayDelegate, 'findUniqueOrThrow'>
	>(
		query: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.ExerciseSplitDayDelegate, Q, 'findUniqueOrThrow'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		const record = await this.findUnique(query, tx);
		if (!record) {
			tx.abort();
			throw new Error('Record not found');
		}
		return record;
	}
	async count<Q extends Prisma.Args<Prisma.ExerciseSplitDayDelegate, 'count'>>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.ExerciseSplitDayDelegate, Q, 'count'>> {
		tx = tx ?? this.client._db.transaction(['ExerciseSplitDay'], 'readonly');
		if (!query?.select || query.select === true) {
			const records = await this.findMany({ where: query?.where }, tx);
			return records.length as Prisma.Result<Prisma.ExerciseSplitDayDelegate, Q, 'count'>;
		}
		const result: Partial<Record<keyof Prisma.ExerciseSplitDayCountAggregateInputType, number>> =
			{};
		for (const key of Object.keys(query.select)) {
			const typedKey = key as keyof typeof query.select;
			if (typedKey === '_all') {
				result[typedKey] = (await this.findMany({ where: query.where }, tx)).length;
				continue;
			}
			result[typedKey] = (
				await this.findMany({ where: { [`${typedKey}`]: { not: null } } }, tx)
			).length;
		}
		return result as Prisma.Result<Prisma.ExerciseSplitDayDelegate, Q, 'count'>;
	}
	async create<Q extends Prisma.Args<Prisma.ExerciseSplitDayDelegate, 'create'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.ExerciseSplitDayDelegate, Q, 'create'>> {
		const storesNeeded = this._getNeededStoresForCreate(query.data);
		tx = tx ?? this.client._db.transaction(Array.from(storesNeeded), 'readwrite');
		if (query.data.exerciseSplit) {
			const fk: Partial<PrismaIDBSchema['ExerciseSplit']['key']> = [];
			if (query.data.exerciseSplit?.create) {
				const record = await this.client.exerciseSplit.create(
					{ data: query.data.exerciseSplit.create },
					tx
				);
				fk[0] = record.id;
			}
			if (query.data.exerciseSplit?.connect) {
				const record = await this.client.exerciseSplit.findUniqueOrThrow(
					{ where: query.data.exerciseSplit.connect },
					tx
				);
				delete query.data.exerciseSplit.connect;
				fk[0] = record.id;
			}
			if (query.data.exerciseSplit?.connectOrCreate) {
				const record = await this.client.exerciseSplit.upsert(
					{
						where: query.data.exerciseSplit.connectOrCreate.where,
						create: query.data.exerciseSplit.connectOrCreate.create,
						update: {}
					},
					tx
				);
				fk[0] = record.id;
			}
			const unsafeData = query.data as Record<string, unknown>;
			unsafeData.exerciseSplitId = fk[0];
			delete unsafeData.exerciseSplit;
		} else if (query.data?.exerciseSplitId !== undefined && query.data.exerciseSplitId !== null) {
			await this.client.exerciseSplit.findUniqueOrThrow(
				{
					where: { id: query.data.exerciseSplitId }
				},
				tx
			);
		}
		const record = this._removeNestedCreateData(await this._fillDefaults(query.data, tx));
		const keyPath = await tx.objectStore('ExerciseSplitDay').add(record);
		if (query.data?.splitDaySessions?.create) {
			for (const elem of IDBUtils.convertToArray(query.data.splitDaySessions.create)) {
				await this.client.exerciseSplitDaySession.create(
					{
						data: { ...elem, exerciseSplitDay: { connect: { id: keyPath[0] } } } as Prisma.Args<
							Prisma.ExerciseSplitDaySessionDelegate,
							'create'
						>['data']
					},
					tx
				);
			}
		}
		if (query.data?.splitDaySessions?.connect) {
			await Promise.all(
				IDBUtils.convertToArray(query.data.splitDaySessions.connect).map(async (connectWhere) => {
					await this.client.exerciseSplitDaySession.update(
						{ where: connectWhere, data: { exerciseSplitDayId: keyPath[0] } },
						tx
					);
				})
			);
		}
		if (query.data?.splitDaySessions?.connectOrCreate) {
			await Promise.all(
				IDBUtils.convertToArray(query.data.splitDaySessions.connectOrCreate).map(
					async (connectOrCreate) => {
						await this.client.exerciseSplitDaySession.upsert(
							{
								where: connectOrCreate.where,
								create: {
									...connectOrCreate.create,
									exerciseSplitDayId: keyPath[0]
								} as NonNullable<
									Prisma.Args<Prisma.ExerciseSplitDaySessionDelegate, 'create'>['data']
								>,
								update: { exerciseSplitDayId: keyPath[0] }
							},
							tx
						);
					}
				)
			);
		}
		if (query.data?.splitDaySessions?.createMany) {
			await this.client.exerciseSplitDaySession.createMany(
				{
					data: IDBUtils.convertToArray(query.data.splitDaySessions.createMany.data).map(
						(createData) => ({
							...createData,
							exerciseSplitDayId: keyPath[0]
						})
					)
				},
				tx
			);
		}
		const data = (await tx.objectStore('ExerciseSplitDay').get(keyPath))!;
		const recordsWithRelations = this._applySelectClause(
			await this._applyRelations<object>([data], tx, query),
			query.select
		)[0];
		this._preprocessListFields([recordsWithRelations]);
		this.emit('create', keyPath);
		return recordsWithRelations as Prisma.Result<Prisma.ExerciseSplitDayDelegate, Q, 'create'>;
	}
	async createMany<Q extends Prisma.Args<Prisma.ExerciseSplitDayDelegate, 'createMany'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.ExerciseSplitDayDelegate, Q, 'createMany'>> {
		const createManyData = IDBUtils.convertToArray(query.data);
		tx = tx ?? this.client._db.transaction(['ExerciseSplitDay'], 'readwrite');
		for (const createData of createManyData) {
			const record = this._removeNestedCreateData(await this._fillDefaults(createData, tx));
			const keyPath = await tx.objectStore('ExerciseSplitDay').add(record);
			this.emit('create', keyPath);
		}
		return { count: createManyData.length };
	}
	async createManyAndReturn<
		Q extends Prisma.Args<Prisma.ExerciseSplitDayDelegate, 'createManyAndReturn'>
	>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.ExerciseSplitDayDelegate, Q, 'createManyAndReturn'>> {
		const createManyData = IDBUtils.convertToArray(query.data);
		const records: Prisma.Result<Prisma.ExerciseSplitDayDelegate, object, 'findMany'> = [];
		tx = tx ?? this.client._db.transaction(['ExerciseSplitDay'], 'readwrite');
		for (const createData of createManyData) {
			const record = this._removeNestedCreateData(await this._fillDefaults(createData, tx));
			const keyPath = await tx.objectStore('ExerciseSplitDay').add(record);
			this.emit('create', keyPath);
			records.push(this._applySelectClause([record], query.select)[0]);
		}
		this._preprocessListFields(records);
		return records as Prisma.Result<Prisma.ExerciseSplitDayDelegate, Q, 'createManyAndReturn'>;
	}
	async delete<Q extends Prisma.Args<Prisma.ExerciseSplitDayDelegate, 'delete'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.ExerciseSplitDayDelegate, Q, 'delete'>> {
		const storesNeeded = this._getNeededStoresForFind(query);
		this._getNeededStoresForNestedDelete(storesNeeded);
		tx = tx ?? this.client._db.transaction(Array.from(storesNeeded), 'readwrite');
		const record = await this.findUnique(query, tx);
		if (!record) throw new Error('Record not found');
		const relatedExerciseSplitDaySession = await this.client.exerciseSplitDaySession.findMany(
			{ where: { exerciseSplitDayId: record.id } },
			tx
		);
		if (relatedExerciseSplitDaySession.length)
			throw new Error('Cannot delete record, other records depend on it');
		await tx.objectStore('ExerciseSplitDay').delete([record.id]);
		this.emit('delete', [record.id]);
		return record;
	}
	async deleteMany<Q extends Prisma.Args<Prisma.ExerciseSplitDayDelegate, 'deleteMany'>>(
		query?: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.ExerciseSplitDayDelegate, Q, 'deleteMany'>> {
		const storesNeeded = this._getNeededStoresForFind(query);
		this._getNeededStoresForNestedDelete(storesNeeded);
		tx = tx ?? this.client._db.transaction(Array.from(storesNeeded), 'readwrite');
		const records = await this.findMany(query, tx);
		for (const record of records) {
			await this.delete({ where: { id: record.id } }, tx);
		}
		return { count: records.length };
	}
	async update<Q extends Prisma.Args<Prisma.ExerciseSplitDayDelegate, 'update'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.ExerciseSplitDayDelegate, Q, 'update'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForUpdate(query)), 'readwrite');
		const record = await this.findUnique({ where: query.where }, tx);
		if (record === null) {
			tx.abort();
			throw new Error('Record not found');
		}
		const startKeyPath: PrismaIDBSchema['ExerciseSplitDay']['key'] = [record.id];
		const stringFields = ['id', 'exerciseSplitId'] as const;
		for (const field of stringFields) {
			IDBUtils.handleStringUpdateField(record, field, query.data[field]);
		}
		const intFields = ['dayIndex'] as const;
		for (const field of intFields) {
			IDBUtils.handleIntUpdateField(record, field, query.data[field]);
		}
		if (query.data.exerciseSplit) {
			if (query.data.exerciseSplit.connect) {
				const other = await this.client.exerciseSplit.findUniqueOrThrow(
					{ where: query.data.exerciseSplit.connect },
					tx
				);
				record.exerciseSplitId = other.id;
			}
			if (query.data.exerciseSplit.create) {
				const other = await this.client.exerciseSplit.create(
					{ data: query.data.exerciseSplit.create },
					tx
				);
				record.exerciseSplitId = other.id;
			}
			if (query.data.exerciseSplit.update) {
				const updateData = query.data.exerciseSplit.update.data ?? query.data.exerciseSplit.update;
				await this.client.exerciseSplit.update(
					{
						where: {
							...query.data.exerciseSplit.update.where,
							id: record.exerciseSplitId!
						} as Prisma.ExerciseSplitWhereUniqueInput,
						data: updateData
					},
					tx
				);
			}
			if (query.data.exerciseSplit.upsert) {
				await this.client.exerciseSplit.upsert(
					{
						where: {
							...query.data.exerciseSplit.upsert.where,
							id: record.exerciseSplitId!
						} as Prisma.ExerciseSplitWhereUniqueInput,
						create: {
							...query.data.exerciseSplit.upsert.create,
							id: record.exerciseSplitId!
						} as Prisma.Args<Prisma.ExerciseSplitDelegate, 'upsert'>['create'],
						update: query.data.exerciseSplit.upsert.update
					},
					tx
				);
			}
			if (query.data.exerciseSplit.connectOrCreate) {
				await this.client.exerciseSplit.upsert(
					{
						where: {
							...query.data.exerciseSplit.connectOrCreate.where,
							id: record.exerciseSplitId!
						},
						create: {
							...query.data.exerciseSplit.connectOrCreate.create,
							id: record.exerciseSplitId!
						} as Prisma.Args<Prisma.ExerciseSplitDelegate, 'upsert'>['create'],
						update: { id: record.exerciseSplitId! }
					},
					tx
				);
			}
		}
		if (query.data.splitDaySessions) {
			if (query.data.splitDaySessions.connect) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.splitDaySessions.connect).map(async (connectWhere) => {
						await this.client.exerciseSplitDaySession.update(
							{ where: connectWhere, data: { exerciseSplitDayId: record.id } },
							tx
						);
					})
				);
			}
			if (query.data.splitDaySessions.disconnect) {
				throw new Error('Cannot disconnect required relation');
			}
			if (query.data.splitDaySessions.create) {
				const createData = Array.isArray(query.data.splitDaySessions.create)
					? query.data.splitDaySessions.create
					: [query.data.splitDaySessions.create];
				for (const elem of createData) {
					await this.client.exerciseSplitDaySession.create(
						{
							data: { ...elem, exerciseSplitDayId: record.id } as Prisma.Args<
								Prisma.ExerciseSplitDaySessionDelegate,
								'create'
							>['data']
						},
						tx
					);
				}
			}
			if (query.data.splitDaySessions.createMany) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.splitDaySessions.createMany.data).map(
						async (createData) => {
							await this.client.exerciseSplitDaySession.create(
								{ data: { ...createData, exerciseSplitDayId: record.id } },
								tx
							);
						}
					)
				);
			}
			if (query.data.splitDaySessions.update) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.splitDaySessions.update).map(async (updateData) => {
						await this.client.exerciseSplitDaySession.update(updateData, tx);
					})
				);
			}
			if (query.data.splitDaySessions.updateMany) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.splitDaySessions.updateMany).map(
						async (updateData) => {
							await this.client.exerciseSplitDaySession.updateMany(updateData, tx);
						}
					)
				);
			}
			if (query.data.splitDaySessions.upsert) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.splitDaySessions.upsert).map(async (upsertData) => {
						await this.client.exerciseSplitDaySession.upsert(
							{
								...upsertData,
								where: { ...upsertData.where, exerciseSplitDayId: record.id },
								create: { ...upsertData.create, exerciseSplitDayId: record.id } as Prisma.Args<
									Prisma.ExerciseSplitDaySessionDelegate,
									'upsert'
								>['create']
							},
							tx
						);
					})
				);
			}
			if (query.data.splitDaySessions.delete) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.splitDaySessions.delete).map(async (deleteData) => {
						await this.client.exerciseSplitDaySession.delete(
							{ where: { ...deleteData, exerciseSplitDayId: record.id } },
							tx
						);
					})
				);
			}
			if (query.data.splitDaySessions.deleteMany) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.splitDaySessions.deleteMany).map(
						async (deleteData) => {
							await this.client.exerciseSplitDaySession.deleteMany(
								{ where: { ...deleteData, exerciseSplitDayId: record.id } },
								tx
							);
						}
					)
				);
			}
			if (query.data.splitDaySessions.set) {
				const existing = await this.client.exerciseSplitDaySession.findMany(
					{ where: { exerciseSplitDayId: record.id } },
					tx
				);
				if (existing.length > 0) {
					throw new Error('Cannot set required relation');
				}
				await Promise.all(
					IDBUtils.convertToArray(query.data.splitDaySessions.set).map(async (setData) => {
						await this.client.exerciseSplitDaySession.update(
							{ where: setData, data: { exerciseSplitDayId: record.id } },
							tx
						);
					})
				);
			}
		}
		if (query.data.exerciseSplitId !== undefined) {
			const related = await this.client.exerciseSplit.findUnique(
				{ where: { id: record.exerciseSplitId } },
				tx
			);
			if (!related) throw new Error('Related record not found');
		}
		const endKeyPath: PrismaIDBSchema['ExerciseSplitDay']['key'] = [record.id];
		for (let i = 0; i < startKeyPath.length; i++) {
			if (startKeyPath[i] !== endKeyPath[i]) {
				if ((await tx.objectStore('ExerciseSplitDay').get(endKeyPath)) !== undefined) {
					throw new Error('Record with the same keyPath already exists');
				}
				await tx.objectStore('ExerciseSplitDay').delete(startKeyPath);
				break;
			}
		}
		const keyPath = await tx.objectStore('ExerciseSplitDay').put(record);
		this.emit('update', keyPath, startKeyPath);
		for (let i = 0; i < startKeyPath.length; i++) {
			if (startKeyPath[i] !== endKeyPath[i]) {
				await this.client.exerciseSplitDaySession.updateMany(
					{
						where: { exerciseSplitDayId: startKeyPath[0] },
						data: { exerciseSplitDayId: endKeyPath[0] }
					},
					tx
				);
				break;
			}
		}
		const recordWithRelations = (await this.findUnique(
			{
				where: { id: keyPath[0] }
			},
			tx
		))!;
		return recordWithRelations as Prisma.Result<Prisma.ExerciseSplitDayDelegate, Q, 'update'>;
	}
	async updateMany<Q extends Prisma.Args<Prisma.ExerciseSplitDayDelegate, 'updateMany'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.ExerciseSplitDayDelegate, Q, 'updateMany'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readwrite');
		const records = await this.findMany({ where: query.where }, tx);
		await Promise.all(
			records.map(async (record) => {
				await this.update({ where: { id: record.id }, data: query.data }, tx);
			})
		);
		return { count: records.length };
	}
	async upsert<Q extends Prisma.Args<Prisma.ExerciseSplitDayDelegate, 'upsert'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.ExerciseSplitDayDelegate, Q, 'upsert'>> {
		const neededStores = this._getNeededStoresForUpdate({
			...query,
			data: { ...query.update, ...query.create } as Prisma.Args<
				Prisma.ExerciseSplitDayDelegate,
				'update'
			>['data']
		});
		tx = tx ?? this.client._db.transaction(Array.from(neededStores), 'readwrite');
		let record = await this.findUnique({ where: query.where }, tx);
		if (!record) record = await this.create({ data: query.create }, tx);
		else record = await this.update({ where: query.where, data: query.update }, tx);
		record = await this.findUniqueOrThrow(
			{ where: { id: record.id }, select: query.select, include: query.include },
			tx
		);
		return record as Prisma.Result<Prisma.ExerciseSplitDayDelegate, Q, 'upsert'>;
	}
	async aggregate<Q extends Prisma.Args<Prisma.ExerciseSplitDayDelegate, 'aggregate'>>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.ExerciseSplitDayDelegate, Q, 'aggregate'>> {
		tx = tx ?? this.client._db.transaction(['ExerciseSplitDay'], 'readonly');
		const records = await this.findMany({ where: query?.where }, tx);
		const result: Partial<Prisma.Result<Prisma.ExerciseSplitDayDelegate, Q, 'aggregate'>> = {};
		if (query?._count) {
			if (query._count === true) {
				(result._count as number) = records.length;
			} else {
				for (const key of Object.keys(query._count)) {
					const typedKey = key as keyof typeof query._count;
					if (typedKey === '_all') {
						(result._count as Record<string, number>)[typedKey] = records.length;
						continue;
					}
					(result._count as Record<string, number>)[typedKey] = (
						await this.findMany({ where: { [`${typedKey}`]: { not: null } } }, tx)
					).length;
				}
			}
		}
		if (query?._min) {
			const minResult = {} as Prisma.Result<
				Prisma.ExerciseSplitDayDelegate,
				Q,
				'aggregate'
			>['_min'];
			const numericFields = ['dayIndex'] as const;
			for (const field of numericFields) {
				if (!query._min[field]) continue;
				const values = records
					.map((record) => record[field] as number)
					.filter((value) => value !== undefined);
				(minResult[field as keyof typeof minResult] as number) = Math.min(...values);
			}
			const stringFields = ['id', 'exerciseSplitId'] as const;
			for (const field of stringFields) {
				if (!query._min[field]) continue;
				const values = records
					.map((record) => record[field] as string)
					.filter((value) => value !== undefined);
				(minResult[field as keyof typeof minResult] as string) = values.sort()[0];
			}
			result._min = minResult;
		}
		if (query?._max) {
			const maxResult = {} as Prisma.Result<
				Prisma.ExerciseSplitDayDelegate,
				Q,
				'aggregate'
			>['_max'];
			const numericFields = ['dayIndex'] as const;
			for (const field of numericFields) {
				if (!query._max[field]) continue;
				const values = records
					.map((record) => record[field] as number)
					.filter((value) => value !== undefined);
				(maxResult[field as keyof typeof maxResult] as number) = Math.max(...values);
			}
			const stringFields = ['id', 'exerciseSplitId'] as const;
			for (const field of stringFields) {
				if (!query._max[field]) continue;
				const values = records
					.map((record) => record[field] as string)
					.filter((value) => value !== undefined);
				(maxResult[field as keyof typeof maxResult] as string) = values.sort().reverse()[0];
			}
			result._max = maxResult;
		}
		if (query?._avg) {
			const avgResult = {} as Prisma.Result<
				Prisma.ExerciseSplitDayDelegate,
				Q,
				'aggregate'
			>['_avg'];
			for (const untypedField of Object.keys(query._avg)) {
				const field = untypedField as keyof (typeof records)[number];
				const values = records.map((record) => record[field] as number);
				(avgResult[field as keyof typeof avgResult] as number) =
					values.reduce((a, b) => a + b, 0) / values.length;
			}
			result._avg = avgResult;
		}
		if (query?._sum) {
			const sumResult = {} as Prisma.Result<
				Prisma.ExerciseSplitDayDelegate,
				Q,
				'aggregate'
			>['_sum'];
			for (const untypedField of Object.keys(query._sum)) {
				const field = untypedField as keyof (typeof records)[number];
				const values = records.map((record) => record[field] as number);
				(sumResult[field as keyof typeof sumResult] as number) = values.reduce((a, b) => a + b, 0);
			}
			result._sum = sumResult;
		}
		return result as unknown as Prisma.Result<Prisma.ExerciseSplitDayDelegate, Q, 'aggregate'>;
	}
}
class ExerciseSplitDaySessionIDBClass extends BaseIDBModelClass<'ExerciseSplitDaySession'> {
	private async _applyWhereClause<
		W extends Prisma.Args<Prisma.ExerciseSplitDaySessionDelegate, 'findFirstOrThrow'>['where'],
		R extends Prisma.Result<Prisma.ExerciseSplitDaySessionDelegate, object, 'findFirstOrThrow'>
	>(records: R[], whereClause: W, tx: IDBUtils.TransactionType): Promise<R[]> {
		if (!whereClause) return records;
		records = await IDBUtils.applyLogicalFilters<Prisma.ExerciseSplitDaySessionDelegate, R, W>(
			records,
			whereClause,
			tx,
			this.keyPath,
			this._applyWhereClause.bind(this)
		);
		return (
			await Promise.all(
				records.map(async (record) => {
					const stringFields = ['id', 'name', 'exerciseSplitDayId'] as const;
					for (const field of stringFields) {
						if (!IDBUtils.whereStringFilter(record, field, whereClause[field])) return null;
					}
					const numberFields = ['sessionIndex'] as const;
					for (const field of numberFields) {
						if (!IDBUtils.whereNumberFilter(record, field, whereClause[field])) return null;
					}
					if (whereClause.exerciseSplitDay) {
						const { is, isNot, ...rest } = whereClause.exerciseSplitDay;
						if (is !== null && is !== undefined) {
							const relatedRecord = await this.client.exerciseSplitDay.findFirst(
								{ where: { ...is, id: record.exerciseSplitDayId } },
								tx
							);
							if (!relatedRecord) return null;
						}
						if (isNot !== null && isNot !== undefined) {
							const relatedRecord = await this.client.exerciseSplitDay.findFirst(
								{ where: { ...isNot, id: record.exerciseSplitDayId } },
								tx
							);
							if (relatedRecord) return null;
						}
						if (Object.keys(rest).length) {
							const relatedRecord = await this.client.exerciseSplitDay.findFirst(
								{ where: { ...whereClause.exerciseSplitDay, id: record.exerciseSplitDayId } },
								tx
							);
							if (!relatedRecord) return null;
						}
					}
					if (whereClause.exercises) {
						if (whereClause.exercises.every) {
							const violatingRecord = await this.client.exerciseSplitDaySessionExercise.findFirst({
								where: {
									NOT: { ...whereClause.exercises.every },
									exerciseSplitDaySessionId: record.id
								},
								tx
							});
							if (violatingRecord !== null) return null;
						}
						if (whereClause.exercises.some) {
							const relatedRecords = await this.client.exerciseSplitDaySessionExercise.findMany({
								where: { ...whereClause.exercises.some, exerciseSplitDaySessionId: record.id },
								tx
							});
							if (relatedRecords.length === 0) return null;
						}
						if (whereClause.exercises.none) {
							const violatingRecord = await this.client.exerciseSplitDaySessionExercise.findFirst({
								where: { ...whereClause.exercises.none, exerciseSplitDaySessionId: record.id },
								tx
							});
							if (violatingRecord !== null) return null;
						}
					}
					return record;
				})
			)
		).filter((result) => result !== null);
	}
	private _applySelectClause<
		S extends Prisma.Args<Prisma.ExerciseSplitDaySessionDelegate, 'findMany'>['select']
	>(
		records: Prisma.Result<Prisma.ExerciseSplitDaySessionDelegate, object, 'findFirstOrThrow'>[],
		selectClause: S
	): Prisma.Result<Prisma.ExerciseSplitDaySessionDelegate, { select: S }, 'findFirstOrThrow'>[] {
		if (!selectClause) {
			return records as Prisma.Result<
				Prisma.ExerciseSplitDaySessionDelegate,
				{ select: S },
				'findFirstOrThrow'
			>[];
		}
		return records.map((record) => {
			const partialRecord: Partial<typeof record> = record;
			for (const untypedKey of [
				'id',
				'name',
				'sessionIndex',
				'exerciseSplitDay',
				'exerciseSplitDayId',
				'exercises'
			]) {
				const key = untypedKey as keyof typeof record & keyof S;
				if (!selectClause[key]) delete partialRecord[key];
			}
			return partialRecord;
		}) as Prisma.Result<
			Prisma.ExerciseSplitDaySessionDelegate,
			{ select: S },
			'findFirstOrThrow'
		>[];
	}
	private async _applyRelations<
		Q extends Prisma.Args<Prisma.ExerciseSplitDaySessionDelegate, 'findMany'>
	>(
		records: Prisma.Result<Prisma.ExerciseSplitDaySessionDelegate, object, 'findFirstOrThrow'>[],
		tx: IDBUtils.TransactionType,
		query?: Q
	): Promise<Prisma.Result<Prisma.ExerciseSplitDaySessionDelegate, Q, 'findFirstOrThrow'>[]> {
		if (!query)
			return records as Prisma.Result<
				Prisma.ExerciseSplitDaySessionDelegate,
				Q,
				'findFirstOrThrow'
			>[];
		const recordsWithRelations = records.map(async (record) => {
			const unsafeRecord = record as Record<string, unknown>;
			const attach_exerciseSplitDay =
				query.select?.exerciseSplitDay || query.include?.exerciseSplitDay;
			if (attach_exerciseSplitDay) {
				unsafeRecord['exerciseSplitDay'] = await this.client.exerciseSplitDay.findUnique(
					{
						...(attach_exerciseSplitDay === true ? {} : attach_exerciseSplitDay),
						where: { id: record.exerciseSplitDayId! }
					},
					tx
				);
			}
			const attach_exercises = query.select?.exercises || query.include?.exercises;
			if (attach_exercises) {
				unsafeRecord['exercises'] = await this.client.exerciseSplitDaySessionExercise.findMany(
					{
						...(attach_exercises === true ? {} : attach_exercises),
						where: { exerciseSplitDaySessionId: record.id! }
					},
					tx
				);
			}
			return unsafeRecord;
		});
		return (await Promise.all(recordsWithRelations)) as Prisma.Result<
			Prisma.ExerciseSplitDaySessionDelegate,
			Q,
			'findFirstOrThrow'
		>[];
	}
	async _applyOrderByClause<
		O extends Prisma.Args<Prisma.ExerciseSplitDaySessionDelegate, 'findMany'>['orderBy'],
		R extends Prisma.Result<Prisma.ExerciseSplitDaySessionDelegate, object, 'findFirstOrThrow'>
	>(records: R[], orderByClause: O, tx: IDBUtils.TransactionType): Promise<void> {
		if (orderByClause === undefined) return;
		const orderByClauses = IDBUtils.convertToArray(orderByClause);
		const indexedKeys = await Promise.all(
			records.map(async (record) => {
				const keys = await Promise.all(
					orderByClauses.map(async (clause) => await this._resolveOrderByKey(record, clause, tx))
				);
				return { keys, record };
			})
		);
		indexedKeys.sort((a, b) => {
			for (let i = 0; i < orderByClauses.length; i++) {
				const clause = orderByClauses[i];
				const comparison = IDBUtils.genericComparator(
					a.keys[i],
					b.keys[i],
					this._resolveSortOrder(clause)
				);
				if (comparison !== 0) return comparison;
			}
			return 0;
		});
		for (let i = 0; i < records.length; i++) {
			records[i] = indexedKeys[i].record;
		}
	}
	async _resolveOrderByKey(
		record: Prisma.Result<Prisma.ExerciseSplitDaySessionDelegate, object, 'findFirstOrThrow'>,
		orderByInput: Prisma.ExerciseSplitDaySessionOrderByWithRelationInput,
		tx: IDBUtils.TransactionType
	): Promise<unknown> {
		const scalarFields = ['id', 'name', 'sessionIndex', 'exerciseSplitDayId'] as const;
		for (const field of scalarFields) if (orderByInput[field]) return record[field];
		if (orderByInput.exerciseSplitDay) {
			return await this.client.exerciseSplitDay._resolveOrderByKey(
				await this.client.exerciseSplitDay.findFirstOrThrow({
					where: { id: record.exerciseSplitDayId }
				}),
				orderByInput.exerciseSplitDay,
				tx
			);
		}
		if (orderByInput.exercises) {
			return await this.client.exerciseSplitDaySessionExercise.count(
				{ where: { exerciseSplitDaySessionId: record.id } },
				tx
			);
		}
	}
	_resolveSortOrder(
		orderByInput: Prisma.ExerciseSplitDaySessionOrderByWithRelationInput
	): Prisma.SortOrder | { sort: Prisma.SortOrder; nulls?: 'first' | 'last' } {
		const scalarFields = ['id', 'name', 'sessionIndex', 'exerciseSplitDayId'] as const;
		for (const field of scalarFields) if (orderByInput[field]) return orderByInput[field];
		if (orderByInput.exerciseSplitDay) {
			return this.client.exerciseSplitDay._resolveSortOrder(orderByInput.exerciseSplitDay);
		}
		if (orderByInput.exercises?._count) {
			return orderByInput.exercises._count;
		}
		throw new Error('No field in orderBy clause');
	}
	private async _fillDefaults<
		D extends Prisma.Args<Prisma.ExerciseSplitDaySessionDelegate, 'create'>['data']
	>(data: D, tx?: IDBUtils.ReadwriteTransactionType): Promise<D> {
		if (data === undefined) data = {} as NonNullable<D>;
		if (data.id === undefined) {
			data.id = uuidv4();
		}
		return data;
	}
	_getNeededStoresForWhere<
		W extends Prisma.Args<Prisma.ExerciseSplitDaySessionDelegate, 'findMany'>['where']
	>(whereClause: W, neededStores: Set<StoreNames<PrismaIDBSchema>>) {
		if (whereClause === undefined) return;
		for (const param of IDBUtils.LogicalParams) {
			if (whereClause[param]) {
				for (const clause of IDBUtils.convertToArray(whereClause[param])) {
					this._getNeededStoresForWhere(clause, neededStores);
				}
			}
		}
		if (whereClause.exerciseSplitDay) {
			neededStores.add('ExerciseSplitDay');
			this.client.exerciseSplitDay._getNeededStoresForWhere(
				whereClause.exerciseSplitDay,
				neededStores
			);
		}
		if (whereClause.exercises) {
			neededStores.add('ExerciseSplitDaySessionExercise');
			this.client.exerciseSplitDaySessionExercise._getNeededStoresForWhere(
				whereClause.exercises.every,
				neededStores
			);
			this.client.exerciseSplitDaySessionExercise._getNeededStoresForWhere(
				whereClause.exercises.some,
				neededStores
			);
			this.client.exerciseSplitDaySessionExercise._getNeededStoresForWhere(
				whereClause.exercises.none,
				neededStores
			);
		}
	}
	_getNeededStoresForFind<
		Q extends Prisma.Args<Prisma.ExerciseSplitDaySessionDelegate, 'findMany'>
	>(query?: Q): Set<StoreNames<PrismaIDBSchema>> {
		const neededStores: Set<StoreNames<PrismaIDBSchema>> = new Set();
		neededStores.add('ExerciseSplitDaySession');
		this._getNeededStoresForWhere(query?.where, neededStores);
		if (query?.orderBy) {
			const orderBy = IDBUtils.convertToArray(query.orderBy);
			const orderBy_exerciseSplitDay = orderBy.find((clause) => clause.exerciseSplitDay);
			if (orderBy_exerciseSplitDay) {
				this.client.exerciseSplitDay
					._getNeededStoresForFind({ orderBy: orderBy_exerciseSplitDay.exerciseSplitDay })
					.forEach((storeName) => neededStores.add(storeName));
			}
			const orderBy_exercises = orderBy.find((clause) => clause.exercises);
			if (orderBy_exercises) {
				neededStores.add('ExerciseSplitDaySessionExercise');
			}
		}
		if (query?.select?.exerciseSplitDay || query?.include?.exerciseSplitDay) {
			neededStores.add('ExerciseSplitDay');
			if (typeof query.select?.exerciseSplitDay === 'object') {
				this.client.exerciseSplitDay
					._getNeededStoresForFind(query.select.exerciseSplitDay)
					.forEach((storeName) => neededStores.add(storeName));
			}
			if (typeof query.include?.exerciseSplitDay === 'object') {
				this.client.exerciseSplitDay
					._getNeededStoresForFind(query.include.exerciseSplitDay)
					.forEach((storeName) => neededStores.add(storeName));
			}
		}
		if (query?.select?.exercises || query?.include?.exercises) {
			neededStores.add('ExerciseSplitDaySessionExercise');
			if (typeof query.select?.exercises === 'object') {
				this.client.exerciseSplitDaySessionExercise
					._getNeededStoresForFind(query.select.exercises)
					.forEach((storeName) => neededStores.add(storeName));
			}
			if (typeof query.include?.exercises === 'object') {
				this.client.exerciseSplitDaySessionExercise
					._getNeededStoresForFind(query.include.exercises)
					.forEach((storeName) => neededStores.add(storeName));
			}
		}
		return neededStores;
	}
	_getNeededStoresForCreate<
		D extends Partial<Prisma.Args<Prisma.ExerciseSplitDaySessionDelegate, 'create'>['data']>
	>(data: D): Set<StoreNames<PrismaIDBSchema>> {
		const neededStores: Set<StoreNames<PrismaIDBSchema>> = new Set();
		neededStores.add('ExerciseSplitDaySession');
		if (data?.exerciseSplitDay) {
			neededStores.add('ExerciseSplitDay');
			if (data.exerciseSplitDay.create) {
				const createData = Array.isArray(data.exerciseSplitDay.create)
					? data.exerciseSplitDay.create
					: [data.exerciseSplitDay.create];
				createData.forEach((record) =>
					this.client.exerciseSplitDay
						._getNeededStoresForCreate(record)
						.forEach((storeName) => neededStores.add(storeName))
				);
			}
			if (data.exerciseSplitDay.connectOrCreate) {
				IDBUtils.convertToArray(data.exerciseSplitDay.connectOrCreate).forEach((record) =>
					this.client.exerciseSplitDay
						._getNeededStoresForCreate(record.create)
						.forEach((storeName) => neededStores.add(storeName))
				);
			}
		}
		if (data?.exerciseSplitDayId !== undefined) {
			neededStores.add('ExerciseSplitDay');
		}
		if (data?.exercises) {
			neededStores.add('ExerciseSplitDaySessionExercise');
			if (data.exercises.create) {
				const createData = Array.isArray(data.exercises.create)
					? data.exercises.create
					: [data.exercises.create];
				createData.forEach((record) =>
					this.client.exerciseSplitDaySessionExercise
						._getNeededStoresForCreate(record)
						.forEach((storeName) => neededStores.add(storeName))
				);
			}
			if (data.exercises.connectOrCreate) {
				IDBUtils.convertToArray(data.exercises.connectOrCreate).forEach((record) =>
					this.client.exerciseSplitDaySessionExercise
						._getNeededStoresForCreate(record.create)
						.forEach((storeName) => neededStores.add(storeName))
				);
			}
			if (data.exercises.createMany) {
				IDBUtils.convertToArray(data.exercises.createMany.data).forEach((record) =>
					this.client.exerciseSplitDaySessionExercise
						._getNeededStoresForCreate(record)
						.forEach((storeName) => neededStores.add(storeName))
				);
			}
		}
		return neededStores;
	}
	_getNeededStoresForUpdate<
		Q extends Prisma.Args<Prisma.ExerciseSplitDaySessionDelegate, 'update'>
	>(query: Partial<Q>): Set<StoreNames<PrismaIDBSchema>> {
		const neededStores = this._getNeededStoresForFind(query).union(
			this._getNeededStoresForCreate(
				query.data as Prisma.Args<Prisma.ExerciseSplitDaySessionDelegate, 'create'>['data']
			)
		);
		if (query.data?.exerciseSplitDay?.connect) {
			neededStores.add('ExerciseSplitDay');
			IDBUtils.convertToArray(query.data.exerciseSplitDay.connect).forEach((connect) => {
				this.client.exerciseSplitDay._getNeededStoresForWhere(connect, neededStores);
			});
		}
		if (query.data?.exerciseSplitDay?.update) {
			neededStores.add('ExerciseSplitDay');
			IDBUtils.convertToArray(query.data.exerciseSplitDay.update).forEach((update) => {
				this.client.exerciseSplitDay
					._getNeededStoresForUpdate(
						update as Prisma.Args<Prisma.ExerciseSplitDayDelegate, 'update'>
					)
					.forEach((store) => neededStores.add(store));
			});
		}
		if (query.data?.exerciseSplitDay?.upsert) {
			neededStores.add('ExerciseSplitDay');
			IDBUtils.convertToArray(query.data.exerciseSplitDay.upsert).forEach((upsert) => {
				const update = {
					where: upsert.where,
					data: { ...upsert.update, ...upsert.create }
				} as Prisma.Args<Prisma.ExerciseSplitDayDelegate, 'update'>;
				this.client.exerciseSplitDay
					._getNeededStoresForUpdate(update)
					.forEach((store) => neededStores.add(store));
			});
		}
		if (query.data?.exercises?.connect) {
			neededStores.add('ExerciseSplitDaySessionExercise');
			IDBUtils.convertToArray(query.data.exercises.connect).forEach((connect) => {
				this.client.exerciseSplitDaySessionExercise._getNeededStoresForWhere(connect, neededStores);
			});
		}
		if (query.data?.exercises?.set) {
			neededStores.add('ExerciseSplitDaySessionExercise');
			IDBUtils.convertToArray(query.data.exercises.set).forEach((setWhere) => {
				this.client.exerciseSplitDaySessionExercise._getNeededStoresForWhere(
					setWhere,
					neededStores
				);
			});
		}
		if (query.data?.exercises?.updateMany) {
			neededStores.add('ExerciseSplitDaySessionExercise');
			IDBUtils.convertToArray(query.data.exercises.updateMany).forEach((update) => {
				this.client.exerciseSplitDaySessionExercise
					._getNeededStoresForUpdate(
						update as Prisma.Args<Prisma.ExerciseSplitDaySessionExerciseDelegate, 'update'>
					)
					.forEach((store) => neededStores.add(store));
			});
		}
		if (query.data?.exercises?.update) {
			neededStores.add('ExerciseSplitDaySessionExercise');
			IDBUtils.convertToArray(query.data.exercises.update).forEach((update) => {
				this.client.exerciseSplitDaySessionExercise
					._getNeededStoresForUpdate(
						update as Prisma.Args<Prisma.ExerciseSplitDaySessionExerciseDelegate, 'update'>
					)
					.forEach((store) => neededStores.add(store));
			});
		}
		if (query.data?.exercises?.upsert) {
			neededStores.add('ExerciseSplitDaySessionExercise');
			IDBUtils.convertToArray(query.data.exercises.upsert).forEach((upsert) => {
				const update = {
					where: upsert.where,
					data: { ...upsert.update, ...upsert.create }
				} as Prisma.Args<Prisma.ExerciseSplitDaySessionExerciseDelegate, 'update'>;
				this.client.exerciseSplitDaySessionExercise
					._getNeededStoresForUpdate(update)
					.forEach((store) => neededStores.add(store));
			});
		}
		if (query.data?.exercises?.delete || query.data?.exercises?.deleteMany) {
			this.client.exerciseSplitDaySessionExercise._getNeededStoresForNestedDelete(neededStores);
		}
		if (query.data?.id !== undefined) {
			neededStores.add('ExerciseSplitDaySessionExercise');
		}
		return neededStores;
	}
	_getNeededStoresForNestedDelete(neededStores: Set<StoreNames<PrismaIDBSchema>>): void {
		neededStores.add('ExerciseSplitDaySession');
		this.client.exerciseSplitDaySessionExercise._getNeededStoresForNestedDelete(neededStores);
	}
	private _removeNestedCreateData<
		D extends Prisma.Args<Prisma.ExerciseSplitDaySessionDelegate, 'create'>['data']
	>(data: D): Prisma.Result<Prisma.ExerciseSplitDaySessionDelegate, object, 'findFirstOrThrow'> {
		const recordWithoutNestedCreate = structuredClone(data);
		delete recordWithoutNestedCreate?.exerciseSplitDay;
		delete recordWithoutNestedCreate?.exercises;
		return recordWithoutNestedCreate as Prisma.Result<
			Prisma.ExerciseSplitDaySessionDelegate,
			object,
			'findFirstOrThrow'
		>;
	}
	private _preprocessListFields(
		records: Prisma.Result<Prisma.ExerciseSplitDaySessionDelegate, object, 'findMany'>
	): void {}
	async findMany<Q extends Prisma.Args<Prisma.ExerciseSplitDaySessionDelegate, 'findMany'>>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.ExerciseSplitDaySessionDelegate, Q, 'findMany'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		const records = await this._applyWhereClause(
			await tx.objectStore('ExerciseSplitDaySession').getAll(),
			query?.where,
			tx
		);
		await this._applyOrderByClause(records, query?.orderBy, tx);
		const relationAppliedRecords = (await this._applyRelations(
			records,
			tx,
			query
		)) as Prisma.Result<Prisma.ExerciseSplitDaySessionDelegate, object, 'findFirstOrThrow'>[];
		const selectClause = query?.select;
		let selectAppliedRecords = this._applySelectClause(relationAppliedRecords, selectClause);
		if (query?.distinct) {
			const distinctFields = IDBUtils.convertToArray(query.distinct);
			const seen = new Set<string>();
			selectAppliedRecords = selectAppliedRecords.filter((record) => {
				const key = distinctFields.map((field) => record[field]).join('|');
				if (seen.has(key)) return false;
				seen.add(key);
				return true;
			});
		}
		this._preprocessListFields(selectAppliedRecords);
		return selectAppliedRecords as Prisma.Result<
			Prisma.ExerciseSplitDaySessionDelegate,
			Q,
			'findMany'
		>;
	}
	async findFirst<Q extends Prisma.Args<Prisma.ExerciseSplitDaySessionDelegate, 'findFirst'>>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.ExerciseSplitDaySessionDelegate, Q, 'findFirst'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		return (await this.findMany(query, tx))[0] ?? null;
	}
	async findFirstOrThrow<
		Q extends Prisma.Args<Prisma.ExerciseSplitDaySessionDelegate, 'findFirstOrThrow'>
	>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.ExerciseSplitDaySessionDelegate, Q, 'findFirstOrThrow'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		const record = await this.findFirst(query, tx);
		if (!record) {
			tx.abort();
			throw new Error('Record not found');
		}
		return record;
	}
	async findUnique<Q extends Prisma.Args<Prisma.ExerciseSplitDaySessionDelegate, 'findUnique'>>(
		query: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.ExerciseSplitDaySessionDelegate, Q, 'findUnique'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		let record;
		if (query.where.id !== undefined) {
			record = await tx.objectStore('ExerciseSplitDaySession').get([query.where.id]);
		} else if (query.where.exerciseSplitDayId_sessionIndex !== undefined) {
			record = await tx
				.objectStore('ExerciseSplitDaySession')
				.index('exerciseSplitDayId_sessionIndexIndex')
				.get([
					query.where.exerciseSplitDayId_sessionIndex.exerciseSplitDayId,
					query.where.exerciseSplitDayId_sessionIndex.sessionIndex
				]);
		}
		if (!record) return null;

		const recordWithRelations = this._applySelectClause(
			await this._applyRelations(
				await this._applyWhereClause([record], query.where, tx),
				tx,
				query
			),
			query.select
		)[0];
		this._preprocessListFields([recordWithRelations]);
		return recordWithRelations as Prisma.Result<
			Prisma.ExerciseSplitDaySessionDelegate,
			Q,
			'findUnique'
		>;
	}
	async findUniqueOrThrow<
		Q extends Prisma.Args<Prisma.ExerciseSplitDaySessionDelegate, 'findUniqueOrThrow'>
	>(
		query: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.ExerciseSplitDaySessionDelegate, Q, 'findUniqueOrThrow'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		const record = await this.findUnique(query, tx);
		if (!record) {
			tx.abort();
			throw new Error('Record not found');
		}
		return record;
	}
	async count<Q extends Prisma.Args<Prisma.ExerciseSplitDaySessionDelegate, 'count'>>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.ExerciseSplitDaySessionDelegate, Q, 'count'>> {
		tx = tx ?? this.client._db.transaction(['ExerciseSplitDaySession'], 'readonly');
		if (!query?.select || query.select === true) {
			const records = await this.findMany({ where: query?.where }, tx);
			return records.length as Prisma.Result<Prisma.ExerciseSplitDaySessionDelegate, Q, 'count'>;
		}
		const result: Partial<
			Record<keyof Prisma.ExerciseSplitDaySessionCountAggregateInputType, number>
		> = {};
		for (const key of Object.keys(query.select)) {
			const typedKey = key as keyof typeof query.select;
			if (typedKey === '_all') {
				result[typedKey] = (await this.findMany({ where: query.where }, tx)).length;
				continue;
			}
			result[typedKey] = (
				await this.findMany({ where: { [`${typedKey}`]: { not: null } } }, tx)
			).length;
		}
		return result as Prisma.Result<Prisma.ExerciseSplitDaySessionDelegate, Q, 'count'>;
	}
	async create<Q extends Prisma.Args<Prisma.ExerciseSplitDaySessionDelegate, 'create'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.ExerciseSplitDaySessionDelegate, Q, 'create'>> {
		const storesNeeded = this._getNeededStoresForCreate(query.data);
		tx = tx ?? this.client._db.transaction(Array.from(storesNeeded), 'readwrite');
		if (query.data.exerciseSplitDay) {
			const fk: Partial<PrismaIDBSchema['ExerciseSplitDay']['key']> = [];
			if (query.data.exerciseSplitDay?.create) {
				const record = await this.client.exerciseSplitDay.create(
					{ data: query.data.exerciseSplitDay.create },
					tx
				);
				fk[0] = record.id;
			}
			if (query.data.exerciseSplitDay?.connect) {
				const record = await this.client.exerciseSplitDay.findUniqueOrThrow(
					{ where: query.data.exerciseSplitDay.connect },
					tx
				);
				delete query.data.exerciseSplitDay.connect;
				fk[0] = record.id;
			}
			if (query.data.exerciseSplitDay?.connectOrCreate) {
				const record = await this.client.exerciseSplitDay.upsert(
					{
						where: query.data.exerciseSplitDay.connectOrCreate.where,
						create: query.data.exerciseSplitDay.connectOrCreate.create,
						update: {}
					},
					tx
				);
				fk[0] = record.id;
			}
			const unsafeData = query.data as Record<string, unknown>;
			unsafeData.exerciseSplitDayId = fk[0];
			delete unsafeData.exerciseSplitDay;
		} else if (
			query.data?.exerciseSplitDayId !== undefined &&
			query.data.exerciseSplitDayId !== null
		) {
			await this.client.exerciseSplitDay.findUniqueOrThrow(
				{
					where: { id: query.data.exerciseSplitDayId }
				},
				tx
			);
		}
		const record = this._removeNestedCreateData(await this._fillDefaults(query.data, tx));
		const keyPath = await tx.objectStore('ExerciseSplitDaySession').add(record);
		if (query.data?.exercises?.create) {
			for (const elem of IDBUtils.convertToArray(query.data.exercises.create)) {
				await this.client.exerciseSplitDaySessionExercise.create(
					{
						data: {
							...elem,
							exerciseSplitDaySession: { connect: { id: keyPath[0] } }
						} as Prisma.Args<Prisma.ExerciseSplitDaySessionExerciseDelegate, 'create'>['data']
					},
					tx
				);
			}
		}
		if (query.data?.exercises?.connect) {
			await Promise.all(
				IDBUtils.convertToArray(query.data.exercises.connect).map(async (connectWhere) => {
					await this.client.exerciseSplitDaySessionExercise.update(
						{ where: connectWhere, data: { exerciseSplitDaySessionId: keyPath[0] } },
						tx
					);
				})
			);
		}
		if (query.data?.exercises?.connectOrCreate) {
			await Promise.all(
				IDBUtils.convertToArray(query.data.exercises.connectOrCreate).map(
					async (connectOrCreate) => {
						await this.client.exerciseSplitDaySessionExercise.upsert(
							{
								where: connectOrCreate.where,
								create: {
									...connectOrCreate.create,
									exerciseSplitDaySessionId: keyPath[0]
								} as NonNullable<
									Prisma.Args<Prisma.ExerciseSplitDaySessionExerciseDelegate, 'create'>['data']
								>,
								update: { exerciseSplitDaySessionId: keyPath[0] }
							},
							tx
						);
					}
				)
			);
		}
		if (query.data?.exercises?.createMany) {
			await this.client.exerciseSplitDaySessionExercise.createMany(
				{
					data: IDBUtils.convertToArray(query.data.exercises.createMany.data).map((createData) => ({
						...createData,
						exerciseSplitDaySessionId: keyPath[0]
					}))
				},
				tx
			);
		}
		const data = (await tx.objectStore('ExerciseSplitDaySession').get(keyPath))!;
		const recordsWithRelations = this._applySelectClause(
			await this._applyRelations<object>([data], tx, query),
			query.select
		)[0];
		this._preprocessListFields([recordsWithRelations]);
		this.emit('create', keyPath);
		return recordsWithRelations as Prisma.Result<
			Prisma.ExerciseSplitDaySessionDelegate,
			Q,
			'create'
		>;
	}
	async createMany<Q extends Prisma.Args<Prisma.ExerciseSplitDaySessionDelegate, 'createMany'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.ExerciseSplitDaySessionDelegate, Q, 'createMany'>> {
		const createManyData = IDBUtils.convertToArray(query.data);
		tx = tx ?? this.client._db.transaction(['ExerciseSplitDaySession'], 'readwrite');
		for (const createData of createManyData) {
			const record = this._removeNestedCreateData(await this._fillDefaults(createData, tx));
			const keyPath = await tx.objectStore('ExerciseSplitDaySession').add(record);
			this.emit('create', keyPath);
		}
		return { count: createManyData.length };
	}
	async createManyAndReturn<
		Q extends Prisma.Args<Prisma.ExerciseSplitDaySessionDelegate, 'createManyAndReturn'>
	>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.ExerciseSplitDaySessionDelegate, Q, 'createManyAndReturn'>> {
		const createManyData = IDBUtils.convertToArray(query.data);
		const records: Prisma.Result<Prisma.ExerciseSplitDaySessionDelegate, object, 'findMany'> = [];
		tx = tx ?? this.client._db.transaction(['ExerciseSplitDaySession'], 'readwrite');
		for (const createData of createManyData) {
			const record = this._removeNestedCreateData(await this._fillDefaults(createData, tx));
			const keyPath = await tx.objectStore('ExerciseSplitDaySession').add(record);
			this.emit('create', keyPath);
			records.push(this._applySelectClause([record], query.select)[0]);
		}
		this._preprocessListFields(records);
		return records as Prisma.Result<
			Prisma.ExerciseSplitDaySessionDelegate,
			Q,
			'createManyAndReturn'
		>;
	}
	async delete<Q extends Prisma.Args<Prisma.ExerciseSplitDaySessionDelegate, 'delete'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.ExerciseSplitDaySessionDelegate, Q, 'delete'>> {
		const storesNeeded = this._getNeededStoresForFind(query);
		this._getNeededStoresForNestedDelete(storesNeeded);
		tx = tx ?? this.client._db.transaction(Array.from(storesNeeded), 'readwrite');
		const record = await this.findUnique(query, tx);
		if (!record) throw new Error('Record not found');
		const relatedExerciseSplitDaySessionExercise =
			await this.client.exerciseSplitDaySessionExercise.findMany(
				{ where: { exerciseSplitDaySessionId: record.id } },
				tx
			);
		if (relatedExerciseSplitDaySessionExercise.length)
			throw new Error('Cannot delete record, other records depend on it');
		await tx.objectStore('ExerciseSplitDaySession').delete([record.id]);
		this.emit('delete', [record.id]);
		return record;
	}
	async deleteMany<Q extends Prisma.Args<Prisma.ExerciseSplitDaySessionDelegate, 'deleteMany'>>(
		query?: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.ExerciseSplitDaySessionDelegate, Q, 'deleteMany'>> {
		const storesNeeded = this._getNeededStoresForFind(query);
		this._getNeededStoresForNestedDelete(storesNeeded);
		tx = tx ?? this.client._db.transaction(Array.from(storesNeeded), 'readwrite');
		const records = await this.findMany(query, tx);
		for (const record of records) {
			await this.delete({ where: { id: record.id } }, tx);
		}
		return { count: records.length };
	}
	async update<Q extends Prisma.Args<Prisma.ExerciseSplitDaySessionDelegate, 'update'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.ExerciseSplitDaySessionDelegate, Q, 'update'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForUpdate(query)), 'readwrite');
		const record = await this.findUnique({ where: query.where }, tx);
		if (record === null) {
			tx.abort();
			throw new Error('Record not found');
		}
		const startKeyPath: PrismaIDBSchema['ExerciseSplitDaySession']['key'] = [record.id];
		const stringFields = ['id', 'name', 'exerciseSplitDayId'] as const;
		for (const field of stringFields) {
			IDBUtils.handleStringUpdateField(record, field, query.data[field]);
		}
		const intFields = ['sessionIndex'] as const;
		for (const field of intFields) {
			IDBUtils.handleIntUpdateField(record, field, query.data[field]);
		}
		if (query.data.exerciseSplitDay) {
			if (query.data.exerciseSplitDay.connect) {
				const other = await this.client.exerciseSplitDay.findUniqueOrThrow(
					{ where: query.data.exerciseSplitDay.connect },
					tx
				);
				record.exerciseSplitDayId = other.id;
			}
			if (query.data.exerciseSplitDay.create) {
				const other = await this.client.exerciseSplitDay.create(
					{ data: query.data.exerciseSplitDay.create },
					tx
				);
				record.exerciseSplitDayId = other.id;
			}
			if (query.data.exerciseSplitDay.update) {
				const updateData =
					query.data.exerciseSplitDay.update.data ?? query.data.exerciseSplitDay.update;
				await this.client.exerciseSplitDay.update(
					{
						where: {
							...query.data.exerciseSplitDay.update.where,
							id: record.exerciseSplitDayId!
						} as Prisma.ExerciseSplitDayWhereUniqueInput,
						data: updateData
					},
					tx
				);
			}
			if (query.data.exerciseSplitDay.upsert) {
				await this.client.exerciseSplitDay.upsert(
					{
						where: {
							...query.data.exerciseSplitDay.upsert.where,
							id: record.exerciseSplitDayId!
						} as Prisma.ExerciseSplitDayWhereUniqueInput,
						create: {
							...query.data.exerciseSplitDay.upsert.create,
							id: record.exerciseSplitDayId!
						} as Prisma.Args<Prisma.ExerciseSplitDayDelegate, 'upsert'>['create'],
						update: query.data.exerciseSplitDay.upsert.update
					},
					tx
				);
			}
			if (query.data.exerciseSplitDay.connectOrCreate) {
				await this.client.exerciseSplitDay.upsert(
					{
						where: {
							...query.data.exerciseSplitDay.connectOrCreate.where,
							id: record.exerciseSplitDayId!
						},
						create: {
							...query.data.exerciseSplitDay.connectOrCreate.create,
							id: record.exerciseSplitDayId!
						} as Prisma.Args<Prisma.ExerciseSplitDayDelegate, 'upsert'>['create'],
						update: { id: record.exerciseSplitDayId! }
					},
					tx
				);
			}
		}
		if (query.data.exercises) {
			if (query.data.exercises.connect) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.exercises.connect).map(async (connectWhere) => {
						await this.client.exerciseSplitDaySessionExercise.update(
							{ where: connectWhere, data: { exerciseSplitDaySessionId: record.id } },
							tx
						);
					})
				);
			}
			if (query.data.exercises.disconnect) {
				throw new Error('Cannot disconnect required relation');
			}
			if (query.data.exercises.create) {
				const createData = Array.isArray(query.data.exercises.create)
					? query.data.exercises.create
					: [query.data.exercises.create];
				for (const elem of createData) {
					await this.client.exerciseSplitDaySessionExercise.create(
						{
							data: { ...elem, exerciseSplitDaySessionId: record.id } as Prisma.Args<
								Prisma.ExerciseSplitDaySessionExerciseDelegate,
								'create'
							>['data']
						},
						tx
					);
				}
			}
			if (query.data.exercises.createMany) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.exercises.createMany.data).map(async (createData) => {
						await this.client.exerciseSplitDaySessionExercise.create(
							{ data: { ...createData, exerciseSplitDaySessionId: record.id } },
							tx
						);
					})
				);
			}
			if (query.data.exercises.update) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.exercises.update).map(async (updateData) => {
						await this.client.exerciseSplitDaySessionExercise.update(updateData, tx);
					})
				);
			}
			if (query.data.exercises.updateMany) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.exercises.updateMany).map(async (updateData) => {
						await this.client.exerciseSplitDaySessionExercise.updateMany(updateData, tx);
					})
				);
			}
			if (query.data.exercises.upsert) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.exercises.upsert).map(async (upsertData) => {
						await this.client.exerciseSplitDaySessionExercise.upsert(
							{
								...upsertData,
								where: { ...upsertData.where, exerciseSplitDaySessionId: record.id },
								create: {
									...upsertData.create,
									exerciseSplitDaySessionId: record.id
								} as Prisma.Args<Prisma.ExerciseSplitDaySessionExerciseDelegate, 'upsert'>['create']
							},
							tx
						);
					})
				);
			}
			if (query.data.exercises.delete) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.exercises.delete).map(async (deleteData) => {
						await this.client.exerciseSplitDaySessionExercise.delete(
							{ where: { ...deleteData, exerciseSplitDaySessionId: record.id } },
							tx
						);
					})
				);
			}
			if (query.data.exercises.deleteMany) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.exercises.deleteMany).map(async (deleteData) => {
						await this.client.exerciseSplitDaySessionExercise.deleteMany(
							{ where: { ...deleteData, exerciseSplitDaySessionId: record.id } },
							tx
						);
					})
				);
			}
			if (query.data.exercises.set) {
				const existing = await this.client.exerciseSplitDaySessionExercise.findMany(
					{ where: { exerciseSplitDaySessionId: record.id } },
					tx
				);
				if (existing.length > 0) {
					throw new Error('Cannot set required relation');
				}
				await Promise.all(
					IDBUtils.convertToArray(query.data.exercises.set).map(async (setData) => {
						await this.client.exerciseSplitDaySessionExercise.update(
							{ where: setData, data: { exerciseSplitDaySessionId: record.id } },
							tx
						);
					})
				);
			}
		}
		if (query.data.exerciseSplitDayId !== undefined) {
			const related = await this.client.exerciseSplitDay.findUnique(
				{ where: { id: record.exerciseSplitDayId } },
				tx
			);
			if (!related) throw new Error('Related record not found');
		}
		const endKeyPath: PrismaIDBSchema['ExerciseSplitDaySession']['key'] = [record.id];
		for (let i = 0; i < startKeyPath.length; i++) {
			if (startKeyPath[i] !== endKeyPath[i]) {
				if ((await tx.objectStore('ExerciseSplitDaySession').get(endKeyPath)) !== undefined) {
					throw new Error('Record with the same keyPath already exists');
				}
				await tx.objectStore('ExerciseSplitDaySession').delete(startKeyPath);
				break;
			}
		}
		const keyPath = await tx.objectStore('ExerciseSplitDaySession').put(record);
		this.emit('update', keyPath, startKeyPath);
		for (let i = 0; i < startKeyPath.length; i++) {
			if (startKeyPath[i] !== endKeyPath[i]) {
				await this.client.exerciseSplitDaySessionExercise.updateMany(
					{
						where: { exerciseSplitDaySessionId: startKeyPath[0] },
						data: { exerciseSplitDaySessionId: endKeyPath[0] }
					},
					tx
				);
				break;
			}
		}
		const recordWithRelations = (await this.findUnique(
			{
				where: { id: keyPath[0] }
			},
			tx
		))!;
		return recordWithRelations as Prisma.Result<
			Prisma.ExerciseSplitDaySessionDelegate,
			Q,
			'update'
		>;
	}
	async updateMany<Q extends Prisma.Args<Prisma.ExerciseSplitDaySessionDelegate, 'updateMany'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.ExerciseSplitDaySessionDelegate, Q, 'updateMany'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readwrite');
		const records = await this.findMany({ where: query.where }, tx);
		await Promise.all(
			records.map(async (record) => {
				await this.update({ where: { id: record.id }, data: query.data }, tx);
			})
		);
		return { count: records.length };
	}
	async upsert<Q extends Prisma.Args<Prisma.ExerciseSplitDaySessionDelegate, 'upsert'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.ExerciseSplitDaySessionDelegate, Q, 'upsert'>> {
		const neededStores = this._getNeededStoresForUpdate({
			...query,
			data: { ...query.update, ...query.create } as Prisma.Args<
				Prisma.ExerciseSplitDaySessionDelegate,
				'update'
			>['data']
		});
		tx = tx ?? this.client._db.transaction(Array.from(neededStores), 'readwrite');
		let record = await this.findUnique({ where: query.where }, tx);
		if (!record) record = await this.create({ data: query.create }, tx);
		else record = await this.update({ where: query.where, data: query.update }, tx);
		record = await this.findUniqueOrThrow(
			{ where: { id: record.id }, select: query.select, include: query.include },
			tx
		);
		return record as Prisma.Result<Prisma.ExerciseSplitDaySessionDelegate, Q, 'upsert'>;
	}
	async aggregate<Q extends Prisma.Args<Prisma.ExerciseSplitDaySessionDelegate, 'aggregate'>>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.ExerciseSplitDaySessionDelegate, Q, 'aggregate'>> {
		tx = tx ?? this.client._db.transaction(['ExerciseSplitDaySession'], 'readonly');
		const records = await this.findMany({ where: query?.where }, tx);
		const result: Partial<Prisma.Result<Prisma.ExerciseSplitDaySessionDelegate, Q, 'aggregate'>> =
			{};
		if (query?._count) {
			if (query._count === true) {
				(result._count as number) = records.length;
			} else {
				for (const key of Object.keys(query._count)) {
					const typedKey = key as keyof typeof query._count;
					if (typedKey === '_all') {
						(result._count as Record<string, number>)[typedKey] = records.length;
						continue;
					}
					(result._count as Record<string, number>)[typedKey] = (
						await this.findMany({ where: { [`${typedKey}`]: { not: null } } }, tx)
					).length;
				}
			}
		}
		if (query?._min) {
			const minResult = {} as Prisma.Result<
				Prisma.ExerciseSplitDaySessionDelegate,
				Q,
				'aggregate'
			>['_min'];
			const numericFields = ['sessionIndex'] as const;
			for (const field of numericFields) {
				if (!query._min[field]) continue;
				const values = records
					.map((record) => record[field] as number)
					.filter((value) => value !== undefined);
				(minResult[field as keyof typeof minResult] as number) = Math.min(...values);
			}
			const stringFields = ['id', 'name', 'exerciseSplitDayId'] as const;
			for (const field of stringFields) {
				if (!query._min[field]) continue;
				const values = records
					.map((record) => record[field] as string)
					.filter((value) => value !== undefined);
				(minResult[field as keyof typeof minResult] as string) = values.sort()[0];
			}
			result._min = minResult;
		}
		if (query?._max) {
			const maxResult = {} as Prisma.Result<
				Prisma.ExerciseSplitDaySessionDelegate,
				Q,
				'aggregate'
			>['_max'];
			const numericFields = ['sessionIndex'] as const;
			for (const field of numericFields) {
				if (!query._max[field]) continue;
				const values = records
					.map((record) => record[field] as number)
					.filter((value) => value !== undefined);
				(maxResult[field as keyof typeof maxResult] as number) = Math.max(...values);
			}
			const stringFields = ['id', 'name', 'exerciseSplitDayId'] as const;
			for (const field of stringFields) {
				if (!query._max[field]) continue;
				const values = records
					.map((record) => record[field] as string)
					.filter((value) => value !== undefined);
				(maxResult[field as keyof typeof maxResult] as string) = values.sort().reverse()[0];
			}
			result._max = maxResult;
		}
		if (query?._avg) {
			const avgResult = {} as Prisma.Result<
				Prisma.ExerciseSplitDaySessionDelegate,
				Q,
				'aggregate'
			>['_avg'];
			for (const untypedField of Object.keys(query._avg)) {
				const field = untypedField as keyof (typeof records)[number];
				const values = records.map((record) => record[field] as number);
				(avgResult[field as keyof typeof avgResult] as number) =
					values.reduce((a, b) => a + b, 0) / values.length;
			}
			result._avg = avgResult;
		}
		if (query?._sum) {
			const sumResult = {} as Prisma.Result<
				Prisma.ExerciseSplitDaySessionDelegate,
				Q,
				'aggregate'
			>['_sum'];
			for (const untypedField of Object.keys(query._sum)) {
				const field = untypedField as keyof (typeof records)[number];
				const values = records.map((record) => record[field] as number);
				(sumResult[field as keyof typeof sumResult] as number) = values.reduce((a, b) => a + b, 0);
			}
			result._sum = sumResult;
		}
		return result as unknown as Prisma.Result<
			Prisma.ExerciseSplitDaySessionDelegate,
			Q,
			'aggregate'
		>;
	}
}
class ExerciseSplitDaySessionExerciseIDBClass extends BaseIDBModelClass<'ExerciseSplitDaySessionExercise'> {
	private async _applyWhereClause<
		W extends Prisma.Args<
			Prisma.ExerciseSplitDaySessionExerciseDelegate,
			'findFirstOrThrow'
		>['where'],
		R extends Prisma.Result<
			Prisma.ExerciseSplitDaySessionExerciseDelegate,
			object,
			'findFirstOrThrow'
		>
	>(records: R[], whereClause: W, tx: IDBUtils.TransactionType): Promise<R[]> {
		if (!whereClause) return records;
		records = await IDBUtils.applyLogicalFilters<
			Prisma.ExerciseSplitDaySessionExerciseDelegate,
			R,
			W
		>(records, whereClause, tx, this.keyPath, this._applyWhereClause.bind(this));
		return (
			await Promise.all(
				records.map(async (record) => {
					const stringFields = [
						'id',
						'name',
						'primaryMuscleGroup',
						'exerciseSplitDaySessionId'
					] as const;
					for (const field of stringFields) {
						if (!IDBUtils.whereStringFilter(record, field, whereClause[field])) return null;
					}
					const numberFields = ['exerciseIndex', 'repRangeStart', 'repRangeEnd'] as const;
					for (const field of numberFields) {
						if (!IDBUtils.whereNumberFilter(record, field, whereClause[field])) return null;
					}
					if (whereClause.exerciseSplitDaySession) {
						const { is, isNot, ...rest } = whereClause.exerciseSplitDaySession;
						if (is !== null && is !== undefined) {
							const relatedRecord = await this.client.exerciseSplitDaySession.findFirst(
								{ where: { ...is, id: record.exerciseSplitDaySessionId } },
								tx
							);
							if (!relatedRecord) return null;
						}
						if (isNot !== null && isNot !== undefined) {
							const relatedRecord = await this.client.exerciseSplitDaySession.findFirst(
								{ where: { ...isNot, id: record.exerciseSplitDaySessionId } },
								tx
							);
							if (relatedRecord) return null;
						}
						if (Object.keys(rest).length) {
							const relatedRecord = await this.client.exerciseSplitDaySession.findFirst(
								{
									where: {
										...whereClause.exerciseSplitDaySession,
										id: record.exerciseSplitDaySessionId
									}
								},
								tx
							);
							if (!relatedRecord) return null;
						}
					}
					if (whereClause.notes) {
						if (whereClause.notes.every) {
							const violatingRecord =
								await this.client.exerciseSplitDaySessionExerciseNote.findFirst({
									where: { NOT: { ...whereClause.notes.every }, exerciseId: record.id },
									tx
								});
							if (violatingRecord !== null) return null;
						}
						if (whereClause.notes.some) {
							const relatedRecords = await this.client.exerciseSplitDaySessionExerciseNote.findMany(
								{
									where: { ...whereClause.notes.some, exerciseId: record.id },
									tx
								}
							);
							if (relatedRecords.length === 0) return null;
						}
						if (whereClause.notes.none) {
							const violatingRecord =
								await this.client.exerciseSplitDaySessionExerciseNote.findFirst({
									where: { ...whereClause.notes.none, exerciseId: record.id },
									tx
								});
							if (violatingRecord !== null) return null;
						}
					}
					if (whereClause.secondaryMuscleGroups) {
						if (whereClause.secondaryMuscleGroups.every) {
							const violatingRecord =
								await this.client.exerciseSplitDaySessionExerciseSecondaryMuscleGroup.findFirst({
									where: {
										NOT: { ...whereClause.secondaryMuscleGroups.every },
										exerciseId: record.id
									},
									tx
								});
							if (violatingRecord !== null) return null;
						}
						if (whereClause.secondaryMuscleGroups.some) {
							const relatedRecords =
								await this.client.exerciseSplitDaySessionExerciseSecondaryMuscleGroup.findMany({
									where: { ...whereClause.secondaryMuscleGroups.some, exerciseId: record.id },
									tx
								});
							if (relatedRecords.length === 0) return null;
						}
						if (whereClause.secondaryMuscleGroups.none) {
							const violatingRecord =
								await this.client.exerciseSplitDaySessionExerciseSecondaryMuscleGroup.findFirst({
									where: { ...whereClause.secondaryMuscleGroups.none, exerciseId: record.id },
									tx
								});
							if (violatingRecord !== null) return null;
						}
					}
					return record;
				})
			)
		).filter((result) => result !== null);
	}
	private _applySelectClause<
		S extends Prisma.Args<Prisma.ExerciseSplitDaySessionExerciseDelegate, 'findMany'>['select']
	>(
		records: Prisma.Result<
			Prisma.ExerciseSplitDaySessionExerciseDelegate,
			object,
			'findFirstOrThrow'
		>[],
		selectClause: S
	): Prisma.Result<
		Prisma.ExerciseSplitDaySessionExerciseDelegate,
		{ select: S },
		'findFirstOrThrow'
	>[] {
		if (!selectClause) {
			return records as Prisma.Result<
				Prisma.ExerciseSplitDaySessionExerciseDelegate,
				{ select: S },
				'findFirstOrThrow'
			>[];
		}
		return records.map((record) => {
			const partialRecord: Partial<typeof record> = record;
			for (const untypedKey of [
				'id',
				'exerciseIndex',
				'name',
				'primaryMuscleGroup',
				'repRangeStart',
				'repRangeEnd',
				'setType',
				'exerciseSplitDaySession',
				'exerciseSplitDaySessionId',
				'notes',
				'secondaryMuscleGroups'
			]) {
				const key = untypedKey as keyof typeof record & keyof S;
				if (!selectClause[key]) delete partialRecord[key];
			}
			return partialRecord;
		}) as Prisma.Result<
			Prisma.ExerciseSplitDaySessionExerciseDelegate,
			{ select: S },
			'findFirstOrThrow'
		>[];
	}
	private async _applyRelations<
		Q extends Prisma.Args<Prisma.ExerciseSplitDaySessionExerciseDelegate, 'findMany'>
	>(
		records: Prisma.Result<
			Prisma.ExerciseSplitDaySessionExerciseDelegate,
			object,
			'findFirstOrThrow'
		>[],
		tx: IDBUtils.TransactionType,
		query?: Q
	): Promise<
		Prisma.Result<Prisma.ExerciseSplitDaySessionExerciseDelegate, Q, 'findFirstOrThrow'>[]
	> {
		if (!query)
			return records as Prisma.Result<
				Prisma.ExerciseSplitDaySessionExerciseDelegate,
				Q,
				'findFirstOrThrow'
			>[];
		const recordsWithRelations = records.map(async (record) => {
			const unsafeRecord = record as Record<string, unknown>;
			const attach_exerciseSplitDaySession =
				query.select?.exerciseSplitDaySession || query.include?.exerciseSplitDaySession;
			if (attach_exerciseSplitDaySession) {
				unsafeRecord['exerciseSplitDaySession'] =
					await this.client.exerciseSplitDaySession.findUnique(
						{
							...(attach_exerciseSplitDaySession === true ? {} : attach_exerciseSplitDaySession),
							where: { id: record.exerciseSplitDaySessionId! }
						},
						tx
					);
			}
			const attach_notes = query.select?.notes || query.include?.notes;
			if (attach_notes) {
				unsafeRecord['notes'] = await this.client.exerciseSplitDaySessionExerciseNote.findMany(
					{
						...(attach_notes === true ? {} : attach_notes),
						where: { exerciseId: record.id! }
					},
					tx
				);
			}
			const attach_secondaryMuscleGroups =
				query.select?.secondaryMuscleGroups || query.include?.secondaryMuscleGroups;
			if (attach_secondaryMuscleGroups) {
				unsafeRecord['secondaryMuscleGroups'] =
					await this.client.exerciseSplitDaySessionExerciseSecondaryMuscleGroup.findMany(
						{
							...(attach_secondaryMuscleGroups === true ? {} : attach_secondaryMuscleGroups),
							where: { exerciseId: record.id! }
						},
						tx
					);
			}
			return unsafeRecord;
		});
		return (await Promise.all(recordsWithRelations)) as Prisma.Result<
			Prisma.ExerciseSplitDaySessionExerciseDelegate,
			Q,
			'findFirstOrThrow'
		>[];
	}
	async _applyOrderByClause<
		O extends Prisma.Args<Prisma.ExerciseSplitDaySessionExerciseDelegate, 'findMany'>['orderBy'],
		R extends Prisma.Result<
			Prisma.ExerciseSplitDaySessionExerciseDelegate,
			object,
			'findFirstOrThrow'
		>
	>(records: R[], orderByClause: O, tx: IDBUtils.TransactionType): Promise<void> {
		if (orderByClause === undefined) return;
		const orderByClauses = IDBUtils.convertToArray(orderByClause);
		const indexedKeys = await Promise.all(
			records.map(async (record) => {
				const keys = await Promise.all(
					orderByClauses.map(async (clause) => await this._resolveOrderByKey(record, clause, tx))
				);
				return { keys, record };
			})
		);
		indexedKeys.sort((a, b) => {
			for (let i = 0; i < orderByClauses.length; i++) {
				const clause = orderByClauses[i];
				const comparison = IDBUtils.genericComparator(
					a.keys[i],
					b.keys[i],
					this._resolveSortOrder(clause)
				);
				if (comparison !== 0) return comparison;
			}
			return 0;
		});
		for (let i = 0; i < records.length; i++) {
			records[i] = indexedKeys[i].record;
		}
	}
	async _resolveOrderByKey(
		record: Prisma.Result<
			Prisma.ExerciseSplitDaySessionExerciseDelegate,
			object,
			'findFirstOrThrow'
		>,
		orderByInput: Prisma.ExerciseSplitDaySessionExerciseOrderByWithRelationInput,
		tx: IDBUtils.TransactionType
	): Promise<unknown> {
		const scalarFields = [
			'id',
			'exerciseIndex',
			'name',
			'primaryMuscleGroup',
			'repRangeStart',
			'repRangeEnd',
			'setType',
			'exerciseSplitDaySessionId'
		] as const;
		for (const field of scalarFields) if (orderByInput[field]) return record[field];
		if (orderByInput.exerciseSplitDaySession) {
			return await this.client.exerciseSplitDaySession._resolveOrderByKey(
				await this.client.exerciseSplitDaySession.findFirstOrThrow({
					where: { id: record.exerciseSplitDaySessionId }
				}),
				orderByInput.exerciseSplitDaySession,
				tx
			);
		}
		if (orderByInput.notes) {
			return await this.client.exerciseSplitDaySessionExerciseNote.count(
				{ where: { exerciseId: record.id } },
				tx
			);
		}
		if (orderByInput.secondaryMuscleGroups) {
			return await this.client.exerciseSplitDaySessionExerciseSecondaryMuscleGroup.count(
				{ where: { exerciseId: record.id } },
				tx
			);
		}
	}
	_resolveSortOrder(
		orderByInput: Prisma.ExerciseSplitDaySessionExerciseOrderByWithRelationInput
	): Prisma.SortOrder | { sort: Prisma.SortOrder; nulls?: 'first' | 'last' } {
		const scalarFields = [
			'id',
			'exerciseIndex',
			'name',
			'primaryMuscleGroup',
			'repRangeStart',
			'repRangeEnd',
			'setType',
			'exerciseSplitDaySessionId'
		] as const;
		for (const field of scalarFields) if (orderByInput[field]) return orderByInput[field];
		if (orderByInput.exerciseSplitDaySession) {
			return this.client.exerciseSplitDaySession._resolveSortOrder(
				orderByInput.exerciseSplitDaySession
			);
		}
		if (orderByInput.notes?._count) {
			return orderByInput.notes._count;
		}
		if (orderByInput.secondaryMuscleGroups?._count) {
			return orderByInput.secondaryMuscleGroups._count;
		}
		throw new Error('No field in orderBy clause');
	}
	private async _fillDefaults<
		D extends Prisma.Args<Prisma.ExerciseSplitDaySessionExerciseDelegate, 'create'>['data']
	>(data: D, tx?: IDBUtils.ReadwriteTransactionType): Promise<D> {
		if (data === undefined) data = {} as NonNullable<D>;
		if (data.id === undefined) {
			data.id = uuidv4();
		}
		return data;
	}
	_getNeededStoresForWhere<
		W extends Prisma.Args<Prisma.ExerciseSplitDaySessionExerciseDelegate, 'findMany'>['where']
	>(whereClause: W, neededStores: Set<StoreNames<PrismaIDBSchema>>) {
		if (whereClause === undefined) return;
		for (const param of IDBUtils.LogicalParams) {
			if (whereClause[param]) {
				for (const clause of IDBUtils.convertToArray(whereClause[param])) {
					this._getNeededStoresForWhere(clause, neededStores);
				}
			}
		}
		if (whereClause.exerciseSplitDaySession) {
			neededStores.add('ExerciseSplitDaySession');
			this.client.exerciseSplitDaySession._getNeededStoresForWhere(
				whereClause.exerciseSplitDaySession,
				neededStores
			);
		}
		if (whereClause.notes) {
			neededStores.add('ExerciseSplitDaySessionExerciseNote');
			this.client.exerciseSplitDaySessionExerciseNote._getNeededStoresForWhere(
				whereClause.notes.every,
				neededStores
			);
			this.client.exerciseSplitDaySessionExerciseNote._getNeededStoresForWhere(
				whereClause.notes.some,
				neededStores
			);
			this.client.exerciseSplitDaySessionExerciseNote._getNeededStoresForWhere(
				whereClause.notes.none,
				neededStores
			);
		}
		if (whereClause.secondaryMuscleGroups) {
			neededStores.add('ExerciseSplitDaySessionExerciseSecondaryMuscleGroup');
			this.client.exerciseSplitDaySessionExerciseSecondaryMuscleGroup._getNeededStoresForWhere(
				whereClause.secondaryMuscleGroups.every,
				neededStores
			);
			this.client.exerciseSplitDaySessionExerciseSecondaryMuscleGroup._getNeededStoresForWhere(
				whereClause.secondaryMuscleGroups.some,
				neededStores
			);
			this.client.exerciseSplitDaySessionExerciseSecondaryMuscleGroup._getNeededStoresForWhere(
				whereClause.secondaryMuscleGroups.none,
				neededStores
			);
		}
	}
	_getNeededStoresForFind<
		Q extends Prisma.Args<Prisma.ExerciseSplitDaySessionExerciseDelegate, 'findMany'>
	>(query?: Q): Set<StoreNames<PrismaIDBSchema>> {
		const neededStores: Set<StoreNames<PrismaIDBSchema>> = new Set();
		neededStores.add('ExerciseSplitDaySessionExercise');
		this._getNeededStoresForWhere(query?.where, neededStores);
		if (query?.orderBy) {
			const orderBy = IDBUtils.convertToArray(query.orderBy);
			const orderBy_exerciseSplitDaySession = orderBy.find(
				(clause) => clause.exerciseSplitDaySession
			);
			if (orderBy_exerciseSplitDaySession) {
				this.client.exerciseSplitDaySession
					._getNeededStoresForFind({
						orderBy: orderBy_exerciseSplitDaySession.exerciseSplitDaySession
					})
					.forEach((storeName) => neededStores.add(storeName));
			}
			const orderBy_notes = orderBy.find((clause) => clause.notes);
			if (orderBy_notes) {
				neededStores.add('ExerciseSplitDaySessionExerciseNote');
			}
			const orderBy_secondaryMuscleGroups = orderBy.find((clause) => clause.secondaryMuscleGroups);
			if (orderBy_secondaryMuscleGroups) {
				neededStores.add('ExerciseSplitDaySessionExerciseSecondaryMuscleGroup');
			}
		}
		if (query?.select?.exerciseSplitDaySession || query?.include?.exerciseSplitDaySession) {
			neededStores.add('ExerciseSplitDaySession');
			if (typeof query.select?.exerciseSplitDaySession === 'object') {
				this.client.exerciseSplitDaySession
					._getNeededStoresForFind(query.select.exerciseSplitDaySession)
					.forEach((storeName) => neededStores.add(storeName));
			}
			if (typeof query.include?.exerciseSplitDaySession === 'object') {
				this.client.exerciseSplitDaySession
					._getNeededStoresForFind(query.include.exerciseSplitDaySession)
					.forEach((storeName) => neededStores.add(storeName));
			}
		}
		if (query?.select?.notes || query?.include?.notes) {
			neededStores.add('ExerciseSplitDaySessionExerciseNote');
			if (typeof query.select?.notes === 'object') {
				this.client.exerciseSplitDaySessionExerciseNote
					._getNeededStoresForFind(query.select.notes)
					.forEach((storeName) => neededStores.add(storeName));
			}
			if (typeof query.include?.notes === 'object') {
				this.client.exerciseSplitDaySessionExerciseNote
					._getNeededStoresForFind(query.include.notes)
					.forEach((storeName) => neededStores.add(storeName));
			}
		}
		if (query?.select?.secondaryMuscleGroups || query?.include?.secondaryMuscleGroups) {
			neededStores.add('ExerciseSplitDaySessionExerciseSecondaryMuscleGroup');
			if (typeof query.select?.secondaryMuscleGroups === 'object') {
				this.client.exerciseSplitDaySessionExerciseSecondaryMuscleGroup
					._getNeededStoresForFind(query.select.secondaryMuscleGroups)
					.forEach((storeName) => neededStores.add(storeName));
			}
			if (typeof query.include?.secondaryMuscleGroups === 'object') {
				this.client.exerciseSplitDaySessionExerciseSecondaryMuscleGroup
					._getNeededStoresForFind(query.include.secondaryMuscleGroups)
					.forEach((storeName) => neededStores.add(storeName));
			}
		}
		return neededStores;
	}
	_getNeededStoresForCreate<
		D extends Partial<Prisma.Args<Prisma.ExerciseSplitDaySessionExerciseDelegate, 'create'>['data']>
	>(data: D): Set<StoreNames<PrismaIDBSchema>> {
		const neededStores: Set<StoreNames<PrismaIDBSchema>> = new Set();
		neededStores.add('ExerciseSplitDaySessionExercise');
		if (data?.exerciseSplitDaySession) {
			neededStores.add('ExerciseSplitDaySession');
			if (data.exerciseSplitDaySession.create) {
				const createData = Array.isArray(data.exerciseSplitDaySession.create)
					? data.exerciseSplitDaySession.create
					: [data.exerciseSplitDaySession.create];
				createData.forEach((record) =>
					this.client.exerciseSplitDaySession
						._getNeededStoresForCreate(record)
						.forEach((storeName) => neededStores.add(storeName))
				);
			}
			if (data.exerciseSplitDaySession.connectOrCreate) {
				IDBUtils.convertToArray(data.exerciseSplitDaySession.connectOrCreate).forEach((record) =>
					this.client.exerciseSplitDaySession
						._getNeededStoresForCreate(record.create)
						.forEach((storeName) => neededStores.add(storeName))
				);
			}
		}
		if (data?.exerciseSplitDaySessionId !== undefined) {
			neededStores.add('ExerciseSplitDaySession');
		}
		if (data?.notes) {
			neededStores.add('ExerciseSplitDaySessionExerciseNote');
			if (data.notes.create) {
				const createData = Array.isArray(data.notes.create)
					? data.notes.create
					: [data.notes.create];
				createData.forEach((record) =>
					this.client.exerciseSplitDaySessionExerciseNote
						._getNeededStoresForCreate(record)
						.forEach((storeName) => neededStores.add(storeName))
				);
			}
			if (data.notes.connectOrCreate) {
				IDBUtils.convertToArray(data.notes.connectOrCreate).forEach((record) =>
					this.client.exerciseSplitDaySessionExerciseNote
						._getNeededStoresForCreate(record.create)
						.forEach((storeName) => neededStores.add(storeName))
				);
			}
			if (data.notes.createMany) {
				IDBUtils.convertToArray(data.notes.createMany.data).forEach((record) =>
					this.client.exerciseSplitDaySessionExerciseNote
						._getNeededStoresForCreate(record)
						.forEach((storeName) => neededStores.add(storeName))
				);
			}
		}
		if (data?.secondaryMuscleGroups) {
			neededStores.add('ExerciseSplitDaySessionExerciseSecondaryMuscleGroup');
			if (data.secondaryMuscleGroups.create) {
				const createData = Array.isArray(data.secondaryMuscleGroups.create)
					? data.secondaryMuscleGroups.create
					: [data.secondaryMuscleGroups.create];
				createData.forEach((record) =>
					this.client.exerciseSplitDaySessionExerciseSecondaryMuscleGroup
						._getNeededStoresForCreate(record)
						.forEach((storeName) => neededStores.add(storeName))
				);
			}
			if (data.secondaryMuscleGroups.connectOrCreate) {
				IDBUtils.convertToArray(data.secondaryMuscleGroups.connectOrCreate).forEach((record) =>
					this.client.exerciseSplitDaySessionExerciseSecondaryMuscleGroup
						._getNeededStoresForCreate(record.create)
						.forEach((storeName) => neededStores.add(storeName))
				);
			}
			if (data.secondaryMuscleGroups.createMany) {
				IDBUtils.convertToArray(data.secondaryMuscleGroups.createMany.data).forEach((record) =>
					this.client.exerciseSplitDaySessionExerciseSecondaryMuscleGroup
						._getNeededStoresForCreate(record)
						.forEach((storeName) => neededStores.add(storeName))
				);
			}
		}
		return neededStores;
	}
	_getNeededStoresForUpdate<
		Q extends Prisma.Args<Prisma.ExerciseSplitDaySessionExerciseDelegate, 'update'>
	>(query: Partial<Q>): Set<StoreNames<PrismaIDBSchema>> {
		const neededStores = this._getNeededStoresForFind(query).union(
			this._getNeededStoresForCreate(
				query.data as Prisma.Args<Prisma.ExerciseSplitDaySessionExerciseDelegate, 'create'>['data']
			)
		);
		if (query.data?.exerciseSplitDaySession?.connect) {
			neededStores.add('ExerciseSplitDaySession');
			IDBUtils.convertToArray(query.data.exerciseSplitDaySession.connect).forEach((connect) => {
				this.client.exerciseSplitDaySession._getNeededStoresForWhere(connect, neededStores);
			});
		}
		if (query.data?.exerciseSplitDaySession?.update) {
			neededStores.add('ExerciseSplitDaySession');
			IDBUtils.convertToArray(query.data.exerciseSplitDaySession.update).forEach((update) => {
				this.client.exerciseSplitDaySession
					._getNeededStoresForUpdate(
						update as Prisma.Args<Prisma.ExerciseSplitDaySessionDelegate, 'update'>
					)
					.forEach((store) => neededStores.add(store));
			});
		}
		if (query.data?.exerciseSplitDaySession?.upsert) {
			neededStores.add('ExerciseSplitDaySession');
			IDBUtils.convertToArray(query.data.exerciseSplitDaySession.upsert).forEach((upsert) => {
				const update = {
					where: upsert.where,
					data: { ...upsert.update, ...upsert.create }
				} as Prisma.Args<Prisma.ExerciseSplitDaySessionDelegate, 'update'>;
				this.client.exerciseSplitDaySession
					._getNeededStoresForUpdate(update)
					.forEach((store) => neededStores.add(store));
			});
		}
		if (query.data?.notes?.connect) {
			neededStores.add('ExerciseSplitDaySessionExerciseNote');
			IDBUtils.convertToArray(query.data.notes.connect).forEach((connect) => {
				this.client.exerciseSplitDaySessionExerciseNote._getNeededStoresForWhere(
					connect,
					neededStores
				);
			});
		}
		if (query.data?.notes?.set) {
			neededStores.add('ExerciseSplitDaySessionExerciseNote');
			IDBUtils.convertToArray(query.data.notes.set).forEach((setWhere) => {
				this.client.exerciseSplitDaySessionExerciseNote._getNeededStoresForWhere(
					setWhere,
					neededStores
				);
			});
		}
		if (query.data?.notes?.updateMany) {
			neededStores.add('ExerciseSplitDaySessionExerciseNote');
			IDBUtils.convertToArray(query.data.notes.updateMany).forEach((update) => {
				this.client.exerciseSplitDaySessionExerciseNote
					._getNeededStoresForUpdate(
						update as Prisma.Args<Prisma.ExerciseSplitDaySessionExerciseNoteDelegate, 'update'>
					)
					.forEach((store) => neededStores.add(store));
			});
		}
		if (query.data?.notes?.update) {
			neededStores.add('ExerciseSplitDaySessionExerciseNote');
			IDBUtils.convertToArray(query.data.notes.update).forEach((update) => {
				this.client.exerciseSplitDaySessionExerciseNote
					._getNeededStoresForUpdate(
						update as Prisma.Args<Prisma.ExerciseSplitDaySessionExerciseNoteDelegate, 'update'>
					)
					.forEach((store) => neededStores.add(store));
			});
		}
		if (query.data?.notes?.upsert) {
			neededStores.add('ExerciseSplitDaySessionExerciseNote');
			IDBUtils.convertToArray(query.data.notes.upsert).forEach((upsert) => {
				const update = {
					where: upsert.where,
					data: { ...upsert.update, ...upsert.create }
				} as Prisma.Args<Prisma.ExerciseSplitDaySessionExerciseNoteDelegate, 'update'>;
				this.client.exerciseSplitDaySessionExerciseNote
					._getNeededStoresForUpdate(update)
					.forEach((store) => neededStores.add(store));
			});
		}
		if (query.data?.secondaryMuscleGroups?.connect) {
			neededStores.add('ExerciseSplitDaySessionExerciseSecondaryMuscleGroup');
			IDBUtils.convertToArray(query.data.secondaryMuscleGroups.connect).forEach((connect) => {
				this.client.exerciseSplitDaySessionExerciseSecondaryMuscleGroup._getNeededStoresForWhere(
					connect,
					neededStores
				);
			});
		}
		if (query.data?.secondaryMuscleGroups?.set) {
			neededStores.add('ExerciseSplitDaySessionExerciseSecondaryMuscleGroup');
			IDBUtils.convertToArray(query.data.secondaryMuscleGroups.set).forEach((setWhere) => {
				this.client.exerciseSplitDaySessionExerciseSecondaryMuscleGroup._getNeededStoresForWhere(
					setWhere,
					neededStores
				);
			});
		}
		if (query.data?.secondaryMuscleGroups?.updateMany) {
			neededStores.add('ExerciseSplitDaySessionExerciseSecondaryMuscleGroup');
			IDBUtils.convertToArray(query.data.secondaryMuscleGroups.updateMany).forEach((update) => {
				this.client.exerciseSplitDaySessionExerciseSecondaryMuscleGroup
					._getNeededStoresForUpdate(
						update as Prisma.Args<
							Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroupDelegate,
							'update'
						>
					)
					.forEach((store) => neededStores.add(store));
			});
		}
		if (query.data?.secondaryMuscleGroups?.update) {
			neededStores.add('ExerciseSplitDaySessionExerciseSecondaryMuscleGroup');
			IDBUtils.convertToArray(query.data.secondaryMuscleGroups.update).forEach((update) => {
				this.client.exerciseSplitDaySessionExerciseSecondaryMuscleGroup
					._getNeededStoresForUpdate(
						update as Prisma.Args<
							Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroupDelegate,
							'update'
						>
					)
					.forEach((store) => neededStores.add(store));
			});
		}
		if (query.data?.secondaryMuscleGroups?.upsert) {
			neededStores.add('ExerciseSplitDaySessionExerciseSecondaryMuscleGroup');
			IDBUtils.convertToArray(query.data.secondaryMuscleGroups.upsert).forEach((upsert) => {
				const update = {
					where: upsert.where,
					data: { ...upsert.update, ...upsert.create }
				} as Prisma.Args<
					Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroupDelegate,
					'update'
				>;
				this.client.exerciseSplitDaySessionExerciseSecondaryMuscleGroup
					._getNeededStoresForUpdate(update)
					.forEach((store) => neededStores.add(store));
			});
		}
		if (query.data?.notes?.delete || query.data?.notes?.deleteMany) {
			this.client.exerciseSplitDaySessionExerciseNote._getNeededStoresForNestedDelete(neededStores);
		}
		if (
			query.data?.secondaryMuscleGroups?.delete ||
			query.data?.secondaryMuscleGroups?.deleteMany
		) {
			this.client.exerciseSplitDaySessionExerciseSecondaryMuscleGroup._getNeededStoresForNestedDelete(
				neededStores
			);
		}
		if (query.data?.id !== undefined) {
			neededStores.add('ExerciseSplitDaySessionExerciseNote');
			neededStores.add('ExerciseSplitDaySessionExerciseSecondaryMuscleGroup');
		}
		return neededStores;
	}
	_getNeededStoresForNestedDelete(neededStores: Set<StoreNames<PrismaIDBSchema>>): void {
		neededStores.add('ExerciseSplitDaySessionExercise');
		this.client.exerciseSplitDaySessionExerciseNote._getNeededStoresForNestedDelete(neededStores);
		this.client.exerciseSplitDaySessionExerciseSecondaryMuscleGroup._getNeededStoresForNestedDelete(
			neededStores
		);
	}
	private _removeNestedCreateData<
		D extends Prisma.Args<Prisma.ExerciseSplitDaySessionExerciseDelegate, 'create'>['data']
	>(
		data: D
	): Prisma.Result<Prisma.ExerciseSplitDaySessionExerciseDelegate, object, 'findFirstOrThrow'> {
		const recordWithoutNestedCreate = structuredClone(data);
		delete recordWithoutNestedCreate?.exerciseSplitDaySession;
		delete recordWithoutNestedCreate?.notes;
		delete recordWithoutNestedCreate?.secondaryMuscleGroups;
		return recordWithoutNestedCreate as Prisma.Result<
			Prisma.ExerciseSplitDaySessionExerciseDelegate,
			object,
			'findFirstOrThrow'
		>;
	}
	private _preprocessListFields(
		records: Prisma.Result<Prisma.ExerciseSplitDaySessionExerciseDelegate, object, 'findMany'>
	): void {}
	async findMany<Q extends Prisma.Args<Prisma.ExerciseSplitDaySessionExerciseDelegate, 'findMany'>>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.ExerciseSplitDaySessionExerciseDelegate, Q, 'findMany'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		const records = await this._applyWhereClause(
			await tx.objectStore('ExerciseSplitDaySessionExercise').getAll(),
			query?.where,
			tx
		);
		await this._applyOrderByClause(records, query?.orderBy, tx);
		const relationAppliedRecords = (await this._applyRelations(
			records,
			tx,
			query
		)) as Prisma.Result<
			Prisma.ExerciseSplitDaySessionExerciseDelegate,
			object,
			'findFirstOrThrow'
		>[];
		const selectClause = query?.select;
		let selectAppliedRecords = this._applySelectClause(relationAppliedRecords, selectClause);
		if (query?.distinct) {
			const distinctFields = IDBUtils.convertToArray(query.distinct);
			const seen = new Set<string>();
			selectAppliedRecords = selectAppliedRecords.filter((record) => {
				const key = distinctFields.map((field) => record[field]).join('|');
				if (seen.has(key)) return false;
				seen.add(key);
				return true;
			});
		}
		this._preprocessListFields(selectAppliedRecords);
		return selectAppliedRecords as Prisma.Result<
			Prisma.ExerciseSplitDaySessionExerciseDelegate,
			Q,
			'findMany'
		>;
	}
	async findFirst<
		Q extends Prisma.Args<Prisma.ExerciseSplitDaySessionExerciseDelegate, 'findFirst'>
	>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.ExerciseSplitDaySessionExerciseDelegate, Q, 'findFirst'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		return (await this.findMany(query, tx))[0] ?? null;
	}
	async findFirstOrThrow<
		Q extends Prisma.Args<Prisma.ExerciseSplitDaySessionExerciseDelegate, 'findFirstOrThrow'>
	>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.ExerciseSplitDaySessionExerciseDelegate, Q, 'findFirstOrThrow'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		const record = await this.findFirst(query, tx);
		if (!record) {
			tx.abort();
			throw new Error('Record not found');
		}
		return record;
	}
	async findUnique<
		Q extends Prisma.Args<Prisma.ExerciseSplitDaySessionExerciseDelegate, 'findUnique'>
	>(
		query: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.ExerciseSplitDaySessionExerciseDelegate, Q, 'findUnique'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		let record;
		if (query.where.id !== undefined) {
			record = await tx.objectStore('ExerciseSplitDaySessionExercise').get([query.where.id]);
		} else if (query.where.exerciseSplitDaySessionId_exerciseIndex !== undefined) {
			record = await tx
				.objectStore('ExerciseSplitDaySessionExercise')
				.index('exerciseSplitDaySessionId_exerciseIndexIndex')
				.get([
					query.where.exerciseSplitDaySessionId_exerciseIndex.exerciseSplitDaySessionId,
					query.where.exerciseSplitDaySessionId_exerciseIndex.exerciseIndex
				]);
		}
		if (!record) return null;

		const recordWithRelations = this._applySelectClause(
			await this._applyRelations(
				await this._applyWhereClause([record], query.where, tx),
				tx,
				query
			),
			query.select
		)[0];
		this._preprocessListFields([recordWithRelations]);
		return recordWithRelations as Prisma.Result<
			Prisma.ExerciseSplitDaySessionExerciseDelegate,
			Q,
			'findUnique'
		>;
	}
	async findUniqueOrThrow<
		Q extends Prisma.Args<Prisma.ExerciseSplitDaySessionExerciseDelegate, 'findUniqueOrThrow'>
	>(
		query: Q,
		tx?: IDBUtils.TransactionType
	): Promise<
		Prisma.Result<Prisma.ExerciseSplitDaySessionExerciseDelegate, Q, 'findUniqueOrThrow'>
	> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		const record = await this.findUnique(query, tx);
		if (!record) {
			tx.abort();
			throw new Error('Record not found');
		}
		return record;
	}
	async count<Q extends Prisma.Args<Prisma.ExerciseSplitDaySessionExerciseDelegate, 'count'>>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.ExerciseSplitDaySessionExerciseDelegate, Q, 'count'>> {
		tx = tx ?? this.client._db.transaction(['ExerciseSplitDaySessionExercise'], 'readonly');
		if (!query?.select || query.select === true) {
			const records = await this.findMany({ where: query?.where }, tx);
			return records.length as Prisma.Result<
				Prisma.ExerciseSplitDaySessionExerciseDelegate,
				Q,
				'count'
			>;
		}
		const result: Partial<
			Record<keyof Prisma.ExerciseSplitDaySessionExerciseCountAggregateInputType, number>
		> = {};
		for (const key of Object.keys(query.select)) {
			const typedKey = key as keyof typeof query.select;
			if (typedKey === '_all') {
				result[typedKey] = (await this.findMany({ where: query.where }, tx)).length;
				continue;
			}
			result[typedKey] = (
				await this.findMany({ where: { [`${typedKey}`]: { not: null } } }, tx)
			).length;
		}
		return result as Prisma.Result<Prisma.ExerciseSplitDaySessionExerciseDelegate, Q, 'count'>;
	}
	async create<Q extends Prisma.Args<Prisma.ExerciseSplitDaySessionExerciseDelegate, 'create'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.ExerciseSplitDaySessionExerciseDelegate, Q, 'create'>> {
		const storesNeeded = this._getNeededStoresForCreate(query.data);
		tx = tx ?? this.client._db.transaction(Array.from(storesNeeded), 'readwrite');
		if (query.data.exerciseSplitDaySession) {
			const fk: Partial<PrismaIDBSchema['ExerciseSplitDaySession']['key']> = [];
			if (query.data.exerciseSplitDaySession?.create) {
				const record = await this.client.exerciseSplitDaySession.create(
					{ data: query.data.exerciseSplitDaySession.create },
					tx
				);
				fk[0] = record.id;
			}
			if (query.data.exerciseSplitDaySession?.connect) {
				const record = await this.client.exerciseSplitDaySession.findUniqueOrThrow(
					{ where: query.data.exerciseSplitDaySession.connect },
					tx
				);
				delete query.data.exerciseSplitDaySession.connect;
				fk[0] = record.id;
			}
			if (query.data.exerciseSplitDaySession?.connectOrCreate) {
				const record = await this.client.exerciseSplitDaySession.upsert(
					{
						where: query.data.exerciseSplitDaySession.connectOrCreate.where,
						create: query.data.exerciseSplitDaySession.connectOrCreate.create,
						update: {}
					},
					tx
				);
				fk[0] = record.id;
			}
			const unsafeData = query.data as Record<string, unknown>;
			unsafeData.exerciseSplitDaySessionId = fk[0];
			delete unsafeData.exerciseSplitDaySession;
		} else if (
			query.data?.exerciseSplitDaySessionId !== undefined &&
			query.data.exerciseSplitDaySessionId !== null
		) {
			await this.client.exerciseSplitDaySession.findUniqueOrThrow(
				{
					where: { id: query.data.exerciseSplitDaySessionId }
				},
				tx
			);
		}
		const record = this._removeNestedCreateData(await this._fillDefaults(query.data, tx));
		const keyPath = await tx.objectStore('ExerciseSplitDaySessionExercise').add(record);
		if (query.data?.notes?.create) {
			for (const elem of IDBUtils.convertToArray(query.data.notes.create)) {
				await this.client.exerciseSplitDaySessionExerciseNote.create(
					{
						data: { ...elem, exercise: { connect: { id: keyPath[0] } } } as Prisma.Args<
							Prisma.ExerciseSplitDaySessionExerciseNoteDelegate,
							'create'
						>['data']
					},
					tx
				);
			}
		}
		if (query.data?.notes?.connect) {
			await Promise.all(
				IDBUtils.convertToArray(query.data.notes.connect).map(async (connectWhere) => {
					await this.client.exerciseSplitDaySessionExerciseNote.update(
						{ where: connectWhere, data: { exerciseId: keyPath[0] } },
						tx
					);
				})
			);
		}
		if (query.data?.notes?.connectOrCreate) {
			await Promise.all(
				IDBUtils.convertToArray(query.data.notes.connectOrCreate).map(async (connectOrCreate) => {
					await this.client.exerciseSplitDaySessionExerciseNote.upsert(
						{
							where: connectOrCreate.where,
							create: { ...connectOrCreate.create, exerciseId: keyPath[0] } as NonNullable<
								Prisma.Args<Prisma.ExerciseSplitDaySessionExerciseNoteDelegate, 'create'>['data']
							>,
							update: { exerciseId: keyPath[0] }
						},
						tx
					);
				})
			);
		}
		if (query.data?.notes?.createMany) {
			await this.client.exerciseSplitDaySessionExerciseNote.createMany(
				{
					data: IDBUtils.convertToArray(query.data.notes.createMany.data).map((createData) => ({
						...createData,
						exerciseId: keyPath[0]
					}))
				},
				tx
			);
		}
		if (query.data?.secondaryMuscleGroups?.create) {
			for (const elem of IDBUtils.convertToArray(query.data.secondaryMuscleGroups.create)) {
				await this.client.exerciseSplitDaySessionExerciseSecondaryMuscleGroup.create(
					{
						data: { ...elem, exercise: { connect: { id: keyPath[0] } } } as Prisma.Args<
							Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroupDelegate,
							'create'
						>['data']
					},
					tx
				);
			}
		}
		if (query.data?.secondaryMuscleGroups?.connect) {
			await Promise.all(
				IDBUtils.convertToArray(query.data.secondaryMuscleGroups.connect).map(
					async (connectWhere) => {
						await this.client.exerciseSplitDaySessionExerciseSecondaryMuscleGroup.update(
							{ where: connectWhere, data: { exerciseId: keyPath[0] } },
							tx
						);
					}
				)
			);
		}
		if (query.data?.secondaryMuscleGroups?.connectOrCreate) {
			await Promise.all(
				IDBUtils.convertToArray(query.data.secondaryMuscleGroups.connectOrCreate).map(
					async (connectOrCreate) => {
						await this.client.exerciseSplitDaySessionExerciseSecondaryMuscleGroup.upsert(
							{
								where: connectOrCreate.where,
								create: { ...connectOrCreate.create, exerciseId: keyPath[0] } as NonNullable<
									Prisma.Args<
										Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroupDelegate,
										'create'
									>['data']
								>,
								update: { exerciseId: keyPath[0] }
							},
							tx
						);
					}
				)
			);
		}
		if (query.data?.secondaryMuscleGroups?.createMany) {
			await this.client.exerciseSplitDaySessionExerciseSecondaryMuscleGroup.createMany(
				{
					data: IDBUtils.convertToArray(query.data.secondaryMuscleGroups.createMany.data).map(
						(createData) => ({
							...createData,
							exerciseId: keyPath[0]
						})
					)
				},
				tx
			);
		}
		const data = (await tx.objectStore('ExerciseSplitDaySessionExercise').get(keyPath))!;
		const recordsWithRelations = this._applySelectClause(
			await this._applyRelations<object>([data], tx, query),
			query.select
		)[0];
		this._preprocessListFields([recordsWithRelations]);
		this.emit('create', keyPath);
		return recordsWithRelations as Prisma.Result<
			Prisma.ExerciseSplitDaySessionExerciseDelegate,
			Q,
			'create'
		>;
	}
	async createMany<
		Q extends Prisma.Args<Prisma.ExerciseSplitDaySessionExerciseDelegate, 'createMany'>
	>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.ExerciseSplitDaySessionExerciseDelegate, Q, 'createMany'>> {
		const createManyData = IDBUtils.convertToArray(query.data);
		tx = tx ?? this.client._db.transaction(['ExerciseSplitDaySessionExercise'], 'readwrite');
		for (const createData of createManyData) {
			const record = this._removeNestedCreateData(await this._fillDefaults(createData, tx));
			const keyPath = await tx.objectStore('ExerciseSplitDaySessionExercise').add(record);
			this.emit('create', keyPath);
		}
		return { count: createManyData.length };
	}
	async createManyAndReturn<
		Q extends Prisma.Args<Prisma.ExerciseSplitDaySessionExerciseDelegate, 'createManyAndReturn'>
	>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<
		Prisma.Result<Prisma.ExerciseSplitDaySessionExerciseDelegate, Q, 'createManyAndReturn'>
	> {
		const createManyData = IDBUtils.convertToArray(query.data);
		const records: Prisma.Result<
			Prisma.ExerciseSplitDaySessionExerciseDelegate,
			object,
			'findMany'
		> = [];
		tx = tx ?? this.client._db.transaction(['ExerciseSplitDaySessionExercise'], 'readwrite');
		for (const createData of createManyData) {
			const record = this._removeNestedCreateData(await this._fillDefaults(createData, tx));
			const keyPath = await tx.objectStore('ExerciseSplitDaySessionExercise').add(record);
			this.emit('create', keyPath);
			records.push(this._applySelectClause([record], query.select)[0]);
		}
		this._preprocessListFields(records);
		return records as Prisma.Result<
			Prisma.ExerciseSplitDaySessionExerciseDelegate,
			Q,
			'createManyAndReturn'
		>;
	}
	async delete<Q extends Prisma.Args<Prisma.ExerciseSplitDaySessionExerciseDelegate, 'delete'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.ExerciseSplitDaySessionExerciseDelegate, Q, 'delete'>> {
		const storesNeeded = this._getNeededStoresForFind(query);
		this._getNeededStoresForNestedDelete(storesNeeded);
		tx = tx ?? this.client._db.transaction(Array.from(storesNeeded), 'readwrite');
		const record = await this.findUnique(query, tx);
		if (!record) throw new Error('Record not found');
		await this.client.exerciseSplitDaySessionExerciseNote.deleteMany(
			{
				where: { exerciseId: record.id }
			},
			tx
		);
		await this.client.exerciseSplitDaySessionExerciseSecondaryMuscleGroup.deleteMany(
			{
				where: { exerciseId: record.id }
			},
			tx
		);
		await tx.objectStore('ExerciseSplitDaySessionExercise').delete([record.id]);
		this.emit('delete', [record.id]);
		return record;
	}
	async deleteMany<
		Q extends Prisma.Args<Prisma.ExerciseSplitDaySessionExerciseDelegate, 'deleteMany'>
	>(
		query?: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.ExerciseSplitDaySessionExerciseDelegate, Q, 'deleteMany'>> {
		const storesNeeded = this._getNeededStoresForFind(query);
		this._getNeededStoresForNestedDelete(storesNeeded);
		tx = tx ?? this.client._db.transaction(Array.from(storesNeeded), 'readwrite');
		const records = await this.findMany(query, tx);
		for (const record of records) {
			await this.delete({ where: { id: record.id } }, tx);
		}
		return { count: records.length };
	}
	async update<Q extends Prisma.Args<Prisma.ExerciseSplitDaySessionExerciseDelegate, 'update'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.ExerciseSplitDaySessionExerciseDelegate, Q, 'update'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForUpdate(query)), 'readwrite');
		const record = await this.findUnique({ where: query.where }, tx);
		if (record === null) {
			tx.abort();
			throw new Error('Record not found');
		}
		const startKeyPath: PrismaIDBSchema['ExerciseSplitDaySessionExercise']['key'] = [record.id];
		const stringFields = ['id', 'name', 'primaryMuscleGroup', 'exerciseSplitDaySessionId'] as const;
		for (const field of stringFields) {
			IDBUtils.handleStringUpdateField(record, field, query.data[field]);
		}
		const intFields = ['exerciseIndex', 'repRangeStart', 'repRangeEnd'] as const;
		for (const field of intFields) {
			IDBUtils.handleIntUpdateField(record, field, query.data[field]);
		}
		const enumFields = ['setType'] as const;
		for (const field of enumFields) {
			IDBUtils.handleEnumUpdateField(record, field, query.data[field]);
		}
		if (query.data.exerciseSplitDaySession) {
			if (query.data.exerciseSplitDaySession.connect) {
				const other = await this.client.exerciseSplitDaySession.findUniqueOrThrow(
					{ where: query.data.exerciseSplitDaySession.connect },
					tx
				);
				record.exerciseSplitDaySessionId = other.id;
			}
			if (query.data.exerciseSplitDaySession.create) {
				const other = await this.client.exerciseSplitDaySession.create(
					{ data: query.data.exerciseSplitDaySession.create },
					tx
				);
				record.exerciseSplitDaySessionId = other.id;
			}
			if (query.data.exerciseSplitDaySession.update) {
				const updateData =
					query.data.exerciseSplitDaySession.update.data ??
					query.data.exerciseSplitDaySession.update;
				await this.client.exerciseSplitDaySession.update(
					{
						where: {
							...query.data.exerciseSplitDaySession.update.where,
							id: record.exerciseSplitDaySessionId!
						} as Prisma.ExerciseSplitDaySessionWhereUniqueInput,
						data: updateData
					},
					tx
				);
			}
			if (query.data.exerciseSplitDaySession.upsert) {
				await this.client.exerciseSplitDaySession.upsert(
					{
						where: {
							...query.data.exerciseSplitDaySession.upsert.where,
							id: record.exerciseSplitDaySessionId!
						} as Prisma.ExerciseSplitDaySessionWhereUniqueInput,
						create: {
							...query.data.exerciseSplitDaySession.upsert.create,
							id: record.exerciseSplitDaySessionId!
						} as Prisma.Args<Prisma.ExerciseSplitDaySessionDelegate, 'upsert'>['create'],
						update: query.data.exerciseSplitDaySession.upsert.update
					},
					tx
				);
			}
			if (query.data.exerciseSplitDaySession.connectOrCreate) {
				await this.client.exerciseSplitDaySession.upsert(
					{
						where: {
							...query.data.exerciseSplitDaySession.connectOrCreate.where,
							id: record.exerciseSplitDaySessionId!
						},
						create: {
							...query.data.exerciseSplitDaySession.connectOrCreate.create,
							id: record.exerciseSplitDaySessionId!
						} as Prisma.Args<Prisma.ExerciseSplitDaySessionDelegate, 'upsert'>['create'],
						update: { id: record.exerciseSplitDaySessionId! }
					},
					tx
				);
			}
		}
		if (query.data.notes) {
			if (query.data.notes.connect) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.notes.connect).map(async (connectWhere) => {
						await this.client.exerciseSplitDaySessionExerciseNote.update(
							{ where: connectWhere, data: { exerciseId: record.id } },
							tx
						);
					})
				);
			}
			if (query.data.notes.disconnect) {
				throw new Error('Cannot disconnect required relation');
			}
			if (query.data.notes.create) {
				const createData = Array.isArray(query.data.notes.create)
					? query.data.notes.create
					: [query.data.notes.create];
				for (const elem of createData) {
					await this.client.exerciseSplitDaySessionExerciseNote.create(
						{
							data: { ...elem, exerciseId: record.id } as Prisma.Args<
								Prisma.ExerciseSplitDaySessionExerciseNoteDelegate,
								'create'
							>['data']
						},
						tx
					);
				}
			}
			if (query.data.notes.createMany) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.notes.createMany.data).map(async (createData) => {
						await this.client.exerciseSplitDaySessionExerciseNote.create(
							{ data: { ...createData, exerciseId: record.id } },
							tx
						);
					})
				);
			}
			if (query.data.notes.update) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.notes.update).map(async (updateData) => {
						await this.client.exerciseSplitDaySessionExerciseNote.update(updateData, tx);
					})
				);
			}
			if (query.data.notes.updateMany) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.notes.updateMany).map(async (updateData) => {
						await this.client.exerciseSplitDaySessionExerciseNote.updateMany(updateData, tx);
					})
				);
			}
			if (query.data.notes.upsert) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.notes.upsert).map(async (upsertData) => {
						await this.client.exerciseSplitDaySessionExerciseNote.upsert(
							{
								...upsertData,
								where: { ...upsertData.where, exerciseId: record.id },
								create: { ...upsertData.create, exerciseId: record.id } as Prisma.Args<
									Prisma.ExerciseSplitDaySessionExerciseNoteDelegate,
									'upsert'
								>['create']
							},
							tx
						);
					})
				);
			}
			if (query.data.notes.delete) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.notes.delete).map(async (deleteData) => {
						await this.client.exerciseSplitDaySessionExerciseNote.delete(
							{ where: { ...deleteData, exerciseId: record.id } },
							tx
						);
					})
				);
			}
			if (query.data.notes.deleteMany) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.notes.deleteMany).map(async (deleteData) => {
						await this.client.exerciseSplitDaySessionExerciseNote.deleteMany(
							{ where: { ...deleteData, exerciseId: record.id } },
							tx
						);
					})
				);
			}
			if (query.data.notes.set) {
				const existing = await this.client.exerciseSplitDaySessionExerciseNote.findMany(
					{ where: { exerciseId: record.id } },
					tx
				);
				if (existing.length > 0) {
					throw new Error('Cannot set required relation');
				}
				await Promise.all(
					IDBUtils.convertToArray(query.data.notes.set).map(async (setData) => {
						await this.client.exerciseSplitDaySessionExerciseNote.update(
							{ where: setData, data: { exerciseId: record.id } },
							tx
						);
					})
				);
			}
		}
		if (query.data.secondaryMuscleGroups) {
			if (query.data.secondaryMuscleGroups.connect) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.secondaryMuscleGroups.connect).map(
						async (connectWhere) => {
							await this.client.exerciseSplitDaySessionExerciseSecondaryMuscleGroup.update(
								{ where: connectWhere, data: { exerciseId: record.id } },
								tx
							);
						}
					)
				);
			}
			if (query.data.secondaryMuscleGroups.disconnect) {
				throw new Error('Cannot disconnect required relation');
			}
			if (query.data.secondaryMuscleGroups.create) {
				const createData = Array.isArray(query.data.secondaryMuscleGroups.create)
					? query.data.secondaryMuscleGroups.create
					: [query.data.secondaryMuscleGroups.create];
				for (const elem of createData) {
					await this.client.exerciseSplitDaySessionExerciseSecondaryMuscleGroup.create(
						{
							data: { ...elem, exerciseId: record.id } as Prisma.Args<
								Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroupDelegate,
								'create'
							>['data']
						},
						tx
					);
				}
			}
			if (query.data.secondaryMuscleGroups.createMany) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.secondaryMuscleGroups.createMany.data).map(
						async (createData) => {
							await this.client.exerciseSplitDaySessionExerciseSecondaryMuscleGroup.create(
								{ data: { ...createData, exerciseId: record.id } },
								tx
							);
						}
					)
				);
			}
			if (query.data.secondaryMuscleGroups.update) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.secondaryMuscleGroups.update).map(
						async (updateData) => {
							await this.client.exerciseSplitDaySessionExerciseSecondaryMuscleGroup.update(
								updateData,
								tx
							);
						}
					)
				);
			}
			if (query.data.secondaryMuscleGroups.updateMany) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.secondaryMuscleGroups.updateMany).map(
						async (updateData) => {
							await this.client.exerciseSplitDaySessionExerciseSecondaryMuscleGroup.updateMany(
								updateData,
								tx
							);
						}
					)
				);
			}
			if (query.data.secondaryMuscleGroups.upsert) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.secondaryMuscleGroups.upsert).map(
						async (upsertData) => {
							await this.client.exerciseSplitDaySessionExerciseSecondaryMuscleGroup.upsert(
								{
									...upsertData,
									where: { ...upsertData.where, exerciseId: record.id },
									create: { ...upsertData.create, exerciseId: record.id } as Prisma.Args<
										Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroupDelegate,
										'upsert'
									>['create']
								},
								tx
							);
						}
					)
				);
			}
			if (query.data.secondaryMuscleGroups.delete) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.secondaryMuscleGroups.delete).map(
						async (deleteData) => {
							await this.client.exerciseSplitDaySessionExerciseSecondaryMuscleGroup.delete(
								{ where: { ...deleteData, exerciseId: record.id } },
								tx
							);
						}
					)
				);
			}
			if (query.data.secondaryMuscleGroups.deleteMany) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.secondaryMuscleGroups.deleteMany).map(
						async (deleteData) => {
							await this.client.exerciseSplitDaySessionExerciseSecondaryMuscleGroup.deleteMany(
								{ where: { ...deleteData, exerciseId: record.id } },
								tx
							);
						}
					)
				);
			}
			if (query.data.secondaryMuscleGroups.set) {
				const existing =
					await this.client.exerciseSplitDaySessionExerciseSecondaryMuscleGroup.findMany(
						{ where: { exerciseId: record.id } },
						tx
					);
				if (existing.length > 0) {
					throw new Error('Cannot set required relation');
				}
				await Promise.all(
					IDBUtils.convertToArray(query.data.secondaryMuscleGroups.set).map(async (setData) => {
						await this.client.exerciseSplitDaySessionExerciseSecondaryMuscleGroup.update(
							{ where: setData, data: { exerciseId: record.id } },
							tx
						);
					})
				);
			}
		}
		if (query.data.exerciseSplitDaySessionId !== undefined) {
			const related = await this.client.exerciseSplitDaySession.findUnique(
				{ where: { id: record.exerciseSplitDaySessionId } },
				tx
			);
			if (!related) throw new Error('Related record not found');
		}
		const endKeyPath: PrismaIDBSchema['ExerciseSplitDaySessionExercise']['key'] = [record.id];
		for (let i = 0; i < startKeyPath.length; i++) {
			if (startKeyPath[i] !== endKeyPath[i]) {
				if (
					(await tx.objectStore('ExerciseSplitDaySessionExercise').get(endKeyPath)) !== undefined
				) {
					throw new Error('Record with the same keyPath already exists');
				}
				await tx.objectStore('ExerciseSplitDaySessionExercise').delete(startKeyPath);
				break;
			}
		}
		const keyPath = await tx.objectStore('ExerciseSplitDaySessionExercise').put(record);
		this.emit('update', keyPath, startKeyPath);
		for (let i = 0; i < startKeyPath.length; i++) {
			if (startKeyPath[i] !== endKeyPath[i]) {
				await this.client.exerciseSplitDaySessionExerciseNote.updateMany(
					{
						where: { exerciseId: startKeyPath[0] },
						data: { exerciseId: endKeyPath[0] }
					},
					tx
				);
				await this.client.exerciseSplitDaySessionExerciseSecondaryMuscleGroup.updateMany(
					{
						where: { exerciseId: startKeyPath[0] },
						data: { exerciseId: endKeyPath[0] }
					},
					tx
				);
				break;
			}
		}
		const recordWithRelations = (await this.findUnique(
			{
				where: { id: keyPath[0] }
			},
			tx
		))!;
		return recordWithRelations as Prisma.Result<
			Prisma.ExerciseSplitDaySessionExerciseDelegate,
			Q,
			'update'
		>;
	}
	async updateMany<
		Q extends Prisma.Args<Prisma.ExerciseSplitDaySessionExerciseDelegate, 'updateMany'>
	>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.ExerciseSplitDaySessionExerciseDelegate, Q, 'updateMany'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readwrite');
		const records = await this.findMany({ where: query.where }, tx);
		await Promise.all(
			records.map(async (record) => {
				await this.update({ where: { id: record.id }, data: query.data }, tx);
			})
		);
		return { count: records.length };
	}
	async upsert<Q extends Prisma.Args<Prisma.ExerciseSplitDaySessionExerciseDelegate, 'upsert'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.ExerciseSplitDaySessionExerciseDelegate, Q, 'upsert'>> {
		const neededStores = this._getNeededStoresForUpdate({
			...query,
			data: { ...query.update, ...query.create } as Prisma.Args<
				Prisma.ExerciseSplitDaySessionExerciseDelegate,
				'update'
			>['data']
		});
		tx = tx ?? this.client._db.transaction(Array.from(neededStores), 'readwrite');
		let record = await this.findUnique({ where: query.where }, tx);
		if (!record) record = await this.create({ data: query.create }, tx);
		else record = await this.update({ where: query.where, data: query.update }, tx);
		record = await this.findUniqueOrThrow(
			{ where: { id: record.id }, select: query.select, include: query.include },
			tx
		);
		return record as Prisma.Result<Prisma.ExerciseSplitDaySessionExerciseDelegate, Q, 'upsert'>;
	}
	async aggregate<
		Q extends Prisma.Args<Prisma.ExerciseSplitDaySessionExerciseDelegate, 'aggregate'>
	>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.ExerciseSplitDaySessionExerciseDelegate, Q, 'aggregate'>> {
		tx = tx ?? this.client._db.transaction(['ExerciseSplitDaySessionExercise'], 'readonly');
		const records = await this.findMany({ where: query?.where }, tx);
		const result: Partial<
			Prisma.Result<Prisma.ExerciseSplitDaySessionExerciseDelegate, Q, 'aggregate'>
		> = {};
		if (query?._count) {
			if (query._count === true) {
				(result._count as number) = records.length;
			} else {
				for (const key of Object.keys(query._count)) {
					const typedKey = key as keyof typeof query._count;
					if (typedKey === '_all') {
						(result._count as Record<string, number>)[typedKey] = records.length;
						continue;
					}
					(result._count as Record<string, number>)[typedKey] = (
						await this.findMany({ where: { [`${typedKey}`]: { not: null } } }, tx)
					).length;
				}
			}
		}
		if (query?._min) {
			const minResult = {} as Prisma.Result<
				Prisma.ExerciseSplitDaySessionExerciseDelegate,
				Q,
				'aggregate'
			>['_min'];
			const numericFields = ['exerciseIndex', 'repRangeStart', 'repRangeEnd'] as const;
			for (const field of numericFields) {
				if (!query._min[field]) continue;
				const values = records
					.map((record) => record[field] as number)
					.filter((value) => value !== undefined);
				(minResult[field as keyof typeof minResult] as number) = Math.min(...values);
			}
			const stringFields = [
				'id',
				'name',
				'primaryMuscleGroup',
				'exerciseSplitDaySessionId'
			] as const;
			for (const field of stringFields) {
				if (!query._min[field]) continue;
				const values = records
					.map((record) => record[field] as string)
					.filter((value) => value !== undefined);
				(minResult[field as keyof typeof minResult] as string) = values.sort()[0];
			}
			result._min = minResult;
		}
		if (query?._max) {
			const maxResult = {} as Prisma.Result<
				Prisma.ExerciseSplitDaySessionExerciseDelegate,
				Q,
				'aggregate'
			>['_max'];
			const numericFields = ['exerciseIndex', 'repRangeStart', 'repRangeEnd'] as const;
			for (const field of numericFields) {
				if (!query._max[field]) continue;
				const values = records
					.map((record) => record[field] as number)
					.filter((value) => value !== undefined);
				(maxResult[field as keyof typeof maxResult] as number) = Math.max(...values);
			}
			const stringFields = [
				'id',
				'name',
				'primaryMuscleGroup',
				'exerciseSplitDaySessionId'
			] as const;
			for (const field of stringFields) {
				if (!query._max[field]) continue;
				const values = records
					.map((record) => record[field] as string)
					.filter((value) => value !== undefined);
				(maxResult[field as keyof typeof maxResult] as string) = values.sort().reverse()[0];
			}
			result._max = maxResult;
		}
		if (query?._avg) {
			const avgResult = {} as Prisma.Result<
				Prisma.ExerciseSplitDaySessionExerciseDelegate,
				Q,
				'aggregate'
			>['_avg'];
			for (const untypedField of Object.keys(query._avg)) {
				const field = untypedField as keyof (typeof records)[number];
				const values = records.map((record) => record[field] as number);
				(avgResult[field as keyof typeof avgResult] as number) =
					values.reduce((a, b) => a + b, 0) / values.length;
			}
			result._avg = avgResult;
		}
		if (query?._sum) {
			const sumResult = {} as Prisma.Result<
				Prisma.ExerciseSplitDaySessionExerciseDelegate,
				Q,
				'aggregate'
			>['_sum'];
			for (const untypedField of Object.keys(query._sum)) {
				const field = untypedField as keyof (typeof records)[number];
				const values = records.map((record) => record[field] as number);
				(sumResult[field as keyof typeof sumResult] as number) = values.reduce((a, b) => a + b, 0);
			}
			result._sum = sumResult;
		}
		return result as unknown as Prisma.Result<
			Prisma.ExerciseSplitDaySessionExerciseDelegate,
			Q,
			'aggregate'
		>;
	}
}
class ExerciseSplitDaySessionExerciseNoteIDBClass extends BaseIDBModelClass<'ExerciseSplitDaySessionExerciseNote'> {
	private async _applyWhereClause<
		W extends Prisma.Args<
			Prisma.ExerciseSplitDaySessionExerciseNoteDelegate,
			'findFirstOrThrow'
		>['where'],
		R extends Prisma.Result<
			Prisma.ExerciseSplitDaySessionExerciseNoteDelegate,
			object,
			'findFirstOrThrow'
		>
	>(records: R[], whereClause: W, tx: IDBUtils.TransactionType): Promise<R[]> {
		if (!whereClause) return records;
		records = await IDBUtils.applyLogicalFilters<
			Prisma.ExerciseSplitDaySessionExerciseNoteDelegate,
			R,
			W
		>(records, whereClause, tx, this.keyPath, this._applyWhereClause.bind(this));
		return (
			await Promise.all(
				records.map(async (record) => {
					const stringFields = ['id', 'exerciseId', 'note'] as const;
					for (const field of stringFields) {
						if (!IDBUtils.whereStringFilter(record, field, whereClause[field])) return null;
					}
					const numberFields = ['noteIndex'] as const;
					for (const field of numberFields) {
						if (!IDBUtils.whereNumberFilter(record, field, whereClause[field])) return null;
					}
					if (whereClause.exercise) {
						const { is, isNot, ...rest } = whereClause.exercise;
						if (is !== null && is !== undefined) {
							const relatedRecord = await this.client.exerciseSplitDaySessionExercise.findFirst(
								{ where: { ...is, id: record.exerciseId } },
								tx
							);
							if (!relatedRecord) return null;
						}
						if (isNot !== null && isNot !== undefined) {
							const relatedRecord = await this.client.exerciseSplitDaySessionExercise.findFirst(
								{ where: { ...isNot, id: record.exerciseId } },
								tx
							);
							if (relatedRecord) return null;
						}
						if (Object.keys(rest).length) {
							const relatedRecord = await this.client.exerciseSplitDaySessionExercise.findFirst(
								{ where: { ...whereClause.exercise, id: record.exerciseId } },
								tx
							);
							if (!relatedRecord) return null;
						}
					}
					return record;
				})
			)
		).filter((result) => result !== null);
	}
	private _applySelectClause<
		S extends Prisma.Args<Prisma.ExerciseSplitDaySessionExerciseNoteDelegate, 'findMany'>['select']
	>(
		records: Prisma.Result<
			Prisma.ExerciseSplitDaySessionExerciseNoteDelegate,
			object,
			'findFirstOrThrow'
		>[],
		selectClause: S
	): Prisma.Result<
		Prisma.ExerciseSplitDaySessionExerciseNoteDelegate,
		{ select: S },
		'findFirstOrThrow'
	>[] {
		if (!selectClause) {
			return records as Prisma.Result<
				Prisma.ExerciseSplitDaySessionExerciseNoteDelegate,
				{ select: S },
				'findFirstOrThrow'
			>[];
		}
		return records.map((record) => {
			const partialRecord: Partial<typeof record> = record;
			for (const untypedKey of ['id', 'exercise', 'exerciseId', 'note', 'noteIndex']) {
				const key = untypedKey as keyof typeof record & keyof S;
				if (!selectClause[key]) delete partialRecord[key];
			}
			return partialRecord;
		}) as Prisma.Result<
			Prisma.ExerciseSplitDaySessionExerciseNoteDelegate,
			{ select: S },
			'findFirstOrThrow'
		>[];
	}
	private async _applyRelations<
		Q extends Prisma.Args<Prisma.ExerciseSplitDaySessionExerciseNoteDelegate, 'findMany'>
	>(
		records: Prisma.Result<
			Prisma.ExerciseSplitDaySessionExerciseNoteDelegate,
			object,
			'findFirstOrThrow'
		>[],
		tx: IDBUtils.TransactionType,
		query?: Q
	): Promise<
		Prisma.Result<Prisma.ExerciseSplitDaySessionExerciseNoteDelegate, Q, 'findFirstOrThrow'>[]
	> {
		if (!query)
			return records as Prisma.Result<
				Prisma.ExerciseSplitDaySessionExerciseNoteDelegate,
				Q,
				'findFirstOrThrow'
			>[];
		const recordsWithRelations = records.map(async (record) => {
			const unsafeRecord = record as Record<string, unknown>;
			const attach_exercise = query.select?.exercise || query.include?.exercise;
			if (attach_exercise) {
				unsafeRecord['exercise'] = await this.client.exerciseSplitDaySessionExercise.findUnique(
					{
						...(attach_exercise === true ? {} : attach_exercise),
						where: { id: record.exerciseId! }
					},
					tx
				);
			}
			return unsafeRecord;
		});
		return (await Promise.all(recordsWithRelations)) as Prisma.Result<
			Prisma.ExerciseSplitDaySessionExerciseNoteDelegate,
			Q,
			'findFirstOrThrow'
		>[];
	}
	async _applyOrderByClause<
		O extends Prisma.Args<
			Prisma.ExerciseSplitDaySessionExerciseNoteDelegate,
			'findMany'
		>['orderBy'],
		R extends Prisma.Result<
			Prisma.ExerciseSplitDaySessionExerciseNoteDelegate,
			object,
			'findFirstOrThrow'
		>
	>(records: R[], orderByClause: O, tx: IDBUtils.TransactionType): Promise<void> {
		if (orderByClause === undefined) return;
		const orderByClauses = IDBUtils.convertToArray(orderByClause);
		const indexedKeys = await Promise.all(
			records.map(async (record) => {
				const keys = await Promise.all(
					orderByClauses.map(async (clause) => await this._resolveOrderByKey(record, clause, tx))
				);
				return { keys, record };
			})
		);
		indexedKeys.sort((a, b) => {
			for (let i = 0; i < orderByClauses.length; i++) {
				const clause = orderByClauses[i];
				const comparison = IDBUtils.genericComparator(
					a.keys[i],
					b.keys[i],
					this._resolveSortOrder(clause)
				);
				if (comparison !== 0) return comparison;
			}
			return 0;
		});
		for (let i = 0; i < records.length; i++) {
			records[i] = indexedKeys[i].record;
		}
	}
	async _resolveOrderByKey(
		record: Prisma.Result<
			Prisma.ExerciseSplitDaySessionExerciseNoteDelegate,
			object,
			'findFirstOrThrow'
		>,
		orderByInput: Prisma.ExerciseSplitDaySessionExerciseNoteOrderByWithRelationInput,
		tx: IDBUtils.TransactionType
	): Promise<unknown> {
		const scalarFields = ['id', 'exerciseId', 'note', 'noteIndex'] as const;
		for (const field of scalarFields) if (orderByInput[field]) return record[field];
		if (orderByInput.exercise) {
			return await this.client.exerciseSplitDaySessionExercise._resolveOrderByKey(
				await this.client.exerciseSplitDaySessionExercise.findFirstOrThrow({
					where: { id: record.exerciseId }
				}),
				orderByInput.exercise,
				tx
			);
		}
	}
	_resolveSortOrder(
		orderByInput: Prisma.ExerciseSplitDaySessionExerciseNoteOrderByWithRelationInput
	): Prisma.SortOrder | { sort: Prisma.SortOrder; nulls?: 'first' | 'last' } {
		const scalarFields = ['id', 'exerciseId', 'note', 'noteIndex'] as const;
		for (const field of scalarFields) if (orderByInput[field]) return orderByInput[field];
		if (orderByInput.exercise) {
			return this.client.exerciseSplitDaySessionExercise._resolveSortOrder(orderByInput.exercise);
		}
		throw new Error('No field in orderBy clause');
	}
	private async _fillDefaults<
		D extends Prisma.Args<Prisma.ExerciseSplitDaySessionExerciseNoteDelegate, 'create'>['data']
	>(data: D, tx?: IDBUtils.ReadwriteTransactionType): Promise<D> {
		if (data === undefined) data = {} as NonNullable<D>;
		if (data.id === undefined) {
			data.id = uuidv4();
		}
		return data;
	}
	_getNeededStoresForWhere<
		W extends Prisma.Args<Prisma.ExerciseSplitDaySessionExerciseNoteDelegate, 'findMany'>['where']
	>(whereClause: W, neededStores: Set<StoreNames<PrismaIDBSchema>>) {
		if (whereClause === undefined) return;
		for (const param of IDBUtils.LogicalParams) {
			if (whereClause[param]) {
				for (const clause of IDBUtils.convertToArray(whereClause[param])) {
					this._getNeededStoresForWhere(clause, neededStores);
				}
			}
		}
		if (whereClause.exercise) {
			neededStores.add('ExerciseSplitDaySessionExercise');
			this.client.exerciseSplitDaySessionExercise._getNeededStoresForWhere(
				whereClause.exercise,
				neededStores
			);
		}
	}
	_getNeededStoresForFind<
		Q extends Prisma.Args<Prisma.ExerciseSplitDaySessionExerciseNoteDelegate, 'findMany'>
	>(query?: Q): Set<StoreNames<PrismaIDBSchema>> {
		const neededStores: Set<StoreNames<PrismaIDBSchema>> = new Set();
		neededStores.add('ExerciseSplitDaySessionExerciseNote');
		this._getNeededStoresForWhere(query?.where, neededStores);
		if (query?.orderBy) {
			const orderBy = IDBUtils.convertToArray(query.orderBy);
			const orderBy_exercise = orderBy.find((clause) => clause.exercise);
			if (orderBy_exercise) {
				this.client.exerciseSplitDaySessionExercise
					._getNeededStoresForFind({ orderBy: orderBy_exercise.exercise })
					.forEach((storeName) => neededStores.add(storeName));
			}
		}
		if (query?.select?.exercise || query?.include?.exercise) {
			neededStores.add('ExerciseSplitDaySessionExercise');
			if (typeof query.select?.exercise === 'object') {
				this.client.exerciseSplitDaySessionExercise
					._getNeededStoresForFind(query.select.exercise)
					.forEach((storeName) => neededStores.add(storeName));
			}
			if (typeof query.include?.exercise === 'object') {
				this.client.exerciseSplitDaySessionExercise
					._getNeededStoresForFind(query.include.exercise)
					.forEach((storeName) => neededStores.add(storeName));
			}
		}
		return neededStores;
	}
	_getNeededStoresForCreate<
		D extends Partial<
			Prisma.Args<Prisma.ExerciseSplitDaySessionExerciseNoteDelegate, 'create'>['data']
		>
	>(data: D): Set<StoreNames<PrismaIDBSchema>> {
		const neededStores: Set<StoreNames<PrismaIDBSchema>> = new Set();
		neededStores.add('ExerciseSplitDaySessionExerciseNote');
		if (data?.exercise) {
			neededStores.add('ExerciseSplitDaySessionExercise');
			if (data.exercise.create) {
				const createData = Array.isArray(data.exercise.create)
					? data.exercise.create
					: [data.exercise.create];
				createData.forEach((record) =>
					this.client.exerciseSplitDaySessionExercise
						._getNeededStoresForCreate(record)
						.forEach((storeName) => neededStores.add(storeName))
				);
			}
			if (data.exercise.connectOrCreate) {
				IDBUtils.convertToArray(data.exercise.connectOrCreate).forEach((record) =>
					this.client.exerciseSplitDaySessionExercise
						._getNeededStoresForCreate(record.create)
						.forEach((storeName) => neededStores.add(storeName))
				);
			}
		}
		if (data?.exerciseId !== undefined) {
			neededStores.add('ExerciseSplitDaySessionExercise');
		}
		return neededStores;
	}
	_getNeededStoresForUpdate<
		Q extends Prisma.Args<Prisma.ExerciseSplitDaySessionExerciseNoteDelegate, 'update'>
	>(query: Partial<Q>): Set<StoreNames<PrismaIDBSchema>> {
		const neededStores = this._getNeededStoresForFind(query).union(
			this._getNeededStoresForCreate(
				query.data as Prisma.Args<
					Prisma.ExerciseSplitDaySessionExerciseNoteDelegate,
					'create'
				>['data']
			)
		);
		if (query.data?.exercise?.connect) {
			neededStores.add('ExerciseSplitDaySessionExercise');
			IDBUtils.convertToArray(query.data.exercise.connect).forEach((connect) => {
				this.client.exerciseSplitDaySessionExercise._getNeededStoresForWhere(connect, neededStores);
			});
		}
		if (query.data?.exercise?.update) {
			neededStores.add('ExerciseSplitDaySessionExercise');
			IDBUtils.convertToArray(query.data.exercise.update).forEach((update) => {
				this.client.exerciseSplitDaySessionExercise
					._getNeededStoresForUpdate(
						update as Prisma.Args<Prisma.ExerciseSplitDaySessionExerciseDelegate, 'update'>
					)
					.forEach((store) => neededStores.add(store));
			});
		}
		if (query.data?.exercise?.upsert) {
			neededStores.add('ExerciseSplitDaySessionExercise');
			IDBUtils.convertToArray(query.data.exercise.upsert).forEach((upsert) => {
				const update = {
					where: upsert.where,
					data: { ...upsert.update, ...upsert.create }
				} as Prisma.Args<Prisma.ExerciseSplitDaySessionExerciseDelegate, 'update'>;
				this.client.exerciseSplitDaySessionExercise
					._getNeededStoresForUpdate(update)
					.forEach((store) => neededStores.add(store));
			});
		}
		return neededStores;
	}
	_getNeededStoresForNestedDelete(neededStores: Set<StoreNames<PrismaIDBSchema>>): void {
		neededStores.add('ExerciseSplitDaySessionExerciseNote');
	}
	private _removeNestedCreateData<
		D extends Prisma.Args<Prisma.ExerciseSplitDaySessionExerciseNoteDelegate, 'create'>['data']
	>(
		data: D
	): Prisma.Result<Prisma.ExerciseSplitDaySessionExerciseNoteDelegate, object, 'findFirstOrThrow'> {
		const recordWithoutNestedCreate = structuredClone(data);
		delete recordWithoutNestedCreate?.exercise;
		return recordWithoutNestedCreate as Prisma.Result<
			Prisma.ExerciseSplitDaySessionExerciseNoteDelegate,
			object,
			'findFirstOrThrow'
		>;
	}
	private _preprocessListFields(
		records: Prisma.Result<Prisma.ExerciseSplitDaySessionExerciseNoteDelegate, object, 'findMany'>
	): void {}
	async findMany<
		Q extends Prisma.Args<Prisma.ExerciseSplitDaySessionExerciseNoteDelegate, 'findMany'>
	>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.ExerciseSplitDaySessionExerciseNoteDelegate, Q, 'findMany'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		const records = await this._applyWhereClause(
			await tx.objectStore('ExerciseSplitDaySessionExerciseNote').getAll(),
			query?.where,
			tx
		);
		await this._applyOrderByClause(records, query?.orderBy, tx);
		const relationAppliedRecords = (await this._applyRelations(
			records,
			tx,
			query
		)) as Prisma.Result<
			Prisma.ExerciseSplitDaySessionExerciseNoteDelegate,
			object,
			'findFirstOrThrow'
		>[];
		const selectClause = query?.select;
		let selectAppliedRecords = this._applySelectClause(relationAppliedRecords, selectClause);
		if (query?.distinct) {
			const distinctFields = IDBUtils.convertToArray(query.distinct);
			const seen = new Set<string>();
			selectAppliedRecords = selectAppliedRecords.filter((record) => {
				const key = distinctFields.map((field) => record[field]).join('|');
				if (seen.has(key)) return false;
				seen.add(key);
				return true;
			});
		}
		this._preprocessListFields(selectAppliedRecords);
		return selectAppliedRecords as Prisma.Result<
			Prisma.ExerciseSplitDaySessionExerciseNoteDelegate,
			Q,
			'findMany'
		>;
	}
	async findFirst<
		Q extends Prisma.Args<Prisma.ExerciseSplitDaySessionExerciseNoteDelegate, 'findFirst'>
	>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.ExerciseSplitDaySessionExerciseNoteDelegate, Q, 'findFirst'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		return (await this.findMany(query, tx))[0] ?? null;
	}
	async findFirstOrThrow<
		Q extends Prisma.Args<Prisma.ExerciseSplitDaySessionExerciseNoteDelegate, 'findFirstOrThrow'>
	>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<
		Prisma.Result<Prisma.ExerciseSplitDaySessionExerciseNoteDelegate, Q, 'findFirstOrThrow'>
	> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		const record = await this.findFirst(query, tx);
		if (!record) {
			tx.abort();
			throw new Error('Record not found');
		}
		return record;
	}
	async findUnique<
		Q extends Prisma.Args<Prisma.ExerciseSplitDaySessionExerciseNoteDelegate, 'findUnique'>
	>(
		query: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.ExerciseSplitDaySessionExerciseNoteDelegate, Q, 'findUnique'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		let record;
		if (query.where.id !== undefined) {
			record = await tx.objectStore('ExerciseSplitDaySessionExerciseNote').get([query.where.id]);
		}
		if (!record) return null;

		const recordWithRelations = this._applySelectClause(
			await this._applyRelations(
				await this._applyWhereClause([record], query.where, tx),
				tx,
				query
			),
			query.select
		)[0];
		this._preprocessListFields([recordWithRelations]);
		return recordWithRelations as Prisma.Result<
			Prisma.ExerciseSplitDaySessionExerciseNoteDelegate,
			Q,
			'findUnique'
		>;
	}
	async findUniqueOrThrow<
		Q extends Prisma.Args<Prisma.ExerciseSplitDaySessionExerciseNoteDelegate, 'findUniqueOrThrow'>
	>(
		query: Q,
		tx?: IDBUtils.TransactionType
	): Promise<
		Prisma.Result<Prisma.ExerciseSplitDaySessionExerciseNoteDelegate, Q, 'findUniqueOrThrow'>
	> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		const record = await this.findUnique(query, tx);
		if (!record) {
			tx.abort();
			throw new Error('Record not found');
		}
		return record;
	}
	async count<Q extends Prisma.Args<Prisma.ExerciseSplitDaySessionExerciseNoteDelegate, 'count'>>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.ExerciseSplitDaySessionExerciseNoteDelegate, Q, 'count'>> {
		tx = tx ?? this.client._db.transaction(['ExerciseSplitDaySessionExerciseNote'], 'readonly');
		if (!query?.select || query.select === true) {
			const records = await this.findMany({ where: query?.where }, tx);
			return records.length as Prisma.Result<
				Prisma.ExerciseSplitDaySessionExerciseNoteDelegate,
				Q,
				'count'
			>;
		}
		const result: Partial<
			Record<keyof Prisma.ExerciseSplitDaySessionExerciseNoteCountAggregateInputType, number>
		> = {};
		for (const key of Object.keys(query.select)) {
			const typedKey = key as keyof typeof query.select;
			if (typedKey === '_all') {
				result[typedKey] = (await this.findMany({ where: query.where }, tx)).length;
				continue;
			}
			result[typedKey] = (
				await this.findMany({ where: { [`${typedKey}`]: { not: null } } }, tx)
			).length;
		}
		return result as Prisma.Result<Prisma.ExerciseSplitDaySessionExerciseNoteDelegate, Q, 'count'>;
	}
	async create<Q extends Prisma.Args<Prisma.ExerciseSplitDaySessionExerciseNoteDelegate, 'create'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.ExerciseSplitDaySessionExerciseNoteDelegate, Q, 'create'>> {
		const storesNeeded = this._getNeededStoresForCreate(query.data);
		tx = tx ?? this.client._db.transaction(Array.from(storesNeeded), 'readwrite');
		if (query.data.exercise) {
			const fk: Partial<PrismaIDBSchema['ExerciseSplitDaySessionExercise']['key']> = [];
			if (query.data.exercise?.create) {
				const record = await this.client.exerciseSplitDaySessionExercise.create(
					{ data: query.data.exercise.create },
					tx
				);
				fk[0] = record.id;
			}
			if (query.data.exercise?.connect) {
				const record = await this.client.exerciseSplitDaySessionExercise.findUniqueOrThrow(
					{ where: query.data.exercise.connect },
					tx
				);
				delete query.data.exercise.connect;
				fk[0] = record.id;
			}
			if (query.data.exercise?.connectOrCreate) {
				const record = await this.client.exerciseSplitDaySessionExercise.upsert(
					{
						where: query.data.exercise.connectOrCreate.where,
						create: query.data.exercise.connectOrCreate.create,
						update: {}
					},
					tx
				);
				fk[0] = record.id;
			}
			const unsafeData = query.data as Record<string, unknown>;
			unsafeData.exerciseId = fk[0];
			delete unsafeData.exercise;
		} else if (query.data?.exerciseId !== undefined && query.data.exerciseId !== null) {
			await this.client.exerciseSplitDaySessionExercise.findUniqueOrThrow(
				{
					where: { id: query.data.exerciseId }
				},
				tx
			);
		}
		const record = this._removeNestedCreateData(await this._fillDefaults(query.data, tx));
		const keyPath = await tx.objectStore('ExerciseSplitDaySessionExerciseNote').add(record);
		const data = (await tx.objectStore('ExerciseSplitDaySessionExerciseNote').get(keyPath))!;
		const recordsWithRelations = this._applySelectClause(
			await this._applyRelations<object>([data], tx, query),
			query.select
		)[0];
		this._preprocessListFields([recordsWithRelations]);
		this.emit('create', keyPath);
		return recordsWithRelations as Prisma.Result<
			Prisma.ExerciseSplitDaySessionExerciseNoteDelegate,
			Q,
			'create'
		>;
	}
	async createMany<
		Q extends Prisma.Args<Prisma.ExerciseSplitDaySessionExerciseNoteDelegate, 'createMany'>
	>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.ExerciseSplitDaySessionExerciseNoteDelegate, Q, 'createMany'>> {
		const createManyData = IDBUtils.convertToArray(query.data);
		tx = tx ?? this.client._db.transaction(['ExerciseSplitDaySessionExerciseNote'], 'readwrite');
		for (const createData of createManyData) {
			const record = this._removeNestedCreateData(await this._fillDefaults(createData, tx));
			const keyPath = await tx.objectStore('ExerciseSplitDaySessionExerciseNote').add(record);
			this.emit('create', keyPath);
		}
		return { count: createManyData.length };
	}
	async createManyAndReturn<
		Q extends Prisma.Args<Prisma.ExerciseSplitDaySessionExerciseNoteDelegate, 'createManyAndReturn'>
	>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<
		Prisma.Result<Prisma.ExerciseSplitDaySessionExerciseNoteDelegate, Q, 'createManyAndReturn'>
	> {
		const createManyData = IDBUtils.convertToArray(query.data);
		const records: Prisma.Result<
			Prisma.ExerciseSplitDaySessionExerciseNoteDelegate,
			object,
			'findMany'
		> = [];
		tx = tx ?? this.client._db.transaction(['ExerciseSplitDaySessionExerciseNote'], 'readwrite');
		for (const createData of createManyData) {
			const record = this._removeNestedCreateData(await this._fillDefaults(createData, tx));
			const keyPath = await tx.objectStore('ExerciseSplitDaySessionExerciseNote').add(record);
			this.emit('create', keyPath);
			records.push(this._applySelectClause([record], query.select)[0]);
		}
		this._preprocessListFields(records);
		return records as Prisma.Result<
			Prisma.ExerciseSplitDaySessionExerciseNoteDelegate,
			Q,
			'createManyAndReturn'
		>;
	}
	async delete<Q extends Prisma.Args<Prisma.ExerciseSplitDaySessionExerciseNoteDelegate, 'delete'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.ExerciseSplitDaySessionExerciseNoteDelegate, Q, 'delete'>> {
		const storesNeeded = this._getNeededStoresForFind(query);
		this._getNeededStoresForNestedDelete(storesNeeded);
		tx = tx ?? this.client._db.transaction(Array.from(storesNeeded), 'readwrite');
		const record = await this.findUnique(query, tx);
		if (!record) throw new Error('Record not found');
		await tx.objectStore('ExerciseSplitDaySessionExerciseNote').delete([record.id]);
		this.emit('delete', [record.id]);
		return record;
	}
	async deleteMany<
		Q extends Prisma.Args<Prisma.ExerciseSplitDaySessionExerciseNoteDelegate, 'deleteMany'>
	>(
		query?: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.ExerciseSplitDaySessionExerciseNoteDelegate, Q, 'deleteMany'>> {
		const storesNeeded = this._getNeededStoresForFind(query);
		this._getNeededStoresForNestedDelete(storesNeeded);
		tx = tx ?? this.client._db.transaction(Array.from(storesNeeded), 'readwrite');
		const records = await this.findMany(query, tx);
		for (const record of records) {
			await this.delete({ where: { id: record.id } }, tx);
		}
		return { count: records.length };
	}
	async update<Q extends Prisma.Args<Prisma.ExerciseSplitDaySessionExerciseNoteDelegate, 'update'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.ExerciseSplitDaySessionExerciseNoteDelegate, Q, 'update'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForUpdate(query)), 'readwrite');
		const record = await this.findUnique({ where: query.where }, tx);
		if (record === null) {
			tx.abort();
			throw new Error('Record not found');
		}
		const startKeyPath: PrismaIDBSchema['ExerciseSplitDaySessionExerciseNote']['key'] = [record.id];
		const stringFields = ['id', 'exerciseId', 'note'] as const;
		for (const field of stringFields) {
			IDBUtils.handleStringUpdateField(record, field, query.data[field]);
		}
		const intFields = ['noteIndex'] as const;
		for (const field of intFields) {
			IDBUtils.handleIntUpdateField(record, field, query.data[field]);
		}
		if (query.data.exercise) {
			if (query.data.exercise.connect) {
				const other = await this.client.exerciseSplitDaySessionExercise.findUniqueOrThrow(
					{ where: query.data.exercise.connect },
					tx
				);
				record.exerciseId = other.id;
			}
			if (query.data.exercise.create) {
				const other = await this.client.exerciseSplitDaySessionExercise.create(
					{ data: query.data.exercise.create },
					tx
				);
				record.exerciseId = other.id;
			}
			if (query.data.exercise.update) {
				const updateData = query.data.exercise.update.data ?? query.data.exercise.update;
				await this.client.exerciseSplitDaySessionExercise.update(
					{
						where: {
							...query.data.exercise.update.where,
							id: record.exerciseId!
						} as Prisma.ExerciseSplitDaySessionExerciseWhereUniqueInput,
						data: updateData
					},
					tx
				);
			}
			if (query.data.exercise.upsert) {
				await this.client.exerciseSplitDaySessionExercise.upsert(
					{
						where: {
							...query.data.exercise.upsert.where,
							id: record.exerciseId!
						} as Prisma.ExerciseSplitDaySessionExerciseWhereUniqueInput,
						create: { ...query.data.exercise.upsert.create, id: record.exerciseId! } as Prisma.Args<
							Prisma.ExerciseSplitDaySessionExerciseDelegate,
							'upsert'
						>['create'],
						update: query.data.exercise.upsert.update
					},
					tx
				);
			}
			if (query.data.exercise.connectOrCreate) {
				await this.client.exerciseSplitDaySessionExercise.upsert(
					{
						where: { ...query.data.exercise.connectOrCreate.where, id: record.exerciseId! },
						create: {
							...query.data.exercise.connectOrCreate.create,
							id: record.exerciseId!
						} as Prisma.Args<Prisma.ExerciseSplitDaySessionExerciseDelegate, 'upsert'>['create'],
						update: { id: record.exerciseId! }
					},
					tx
				);
			}
		}
		if (query.data.exerciseId !== undefined) {
			const related = await this.client.exerciseSplitDaySessionExercise.findUnique(
				{ where: { id: record.exerciseId } },
				tx
			);
			if (!related) throw new Error('Related record not found');
		}
		const endKeyPath: PrismaIDBSchema['ExerciseSplitDaySessionExerciseNote']['key'] = [record.id];
		for (let i = 0; i < startKeyPath.length; i++) {
			if (startKeyPath[i] !== endKeyPath[i]) {
				if (
					(await tx.objectStore('ExerciseSplitDaySessionExerciseNote').get(endKeyPath)) !==
					undefined
				) {
					throw new Error('Record with the same keyPath already exists');
				}
				await tx.objectStore('ExerciseSplitDaySessionExerciseNote').delete(startKeyPath);
				break;
			}
		}
		const keyPath = await tx.objectStore('ExerciseSplitDaySessionExerciseNote').put(record);
		this.emit('update', keyPath, startKeyPath);
		for (let i = 0; i < startKeyPath.length; i++) {
			if (startKeyPath[i] !== endKeyPath[i]) {
				break;
			}
		}
		const recordWithRelations = (await this.findUnique(
			{
				where: { id: keyPath[0] }
			},
			tx
		))!;
		return recordWithRelations as Prisma.Result<
			Prisma.ExerciseSplitDaySessionExerciseNoteDelegate,
			Q,
			'update'
		>;
	}
	async updateMany<
		Q extends Prisma.Args<Prisma.ExerciseSplitDaySessionExerciseNoteDelegate, 'updateMany'>
	>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.ExerciseSplitDaySessionExerciseNoteDelegate, Q, 'updateMany'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readwrite');
		const records = await this.findMany({ where: query.where }, tx);
		await Promise.all(
			records.map(async (record) => {
				await this.update({ where: { id: record.id }, data: query.data }, tx);
			})
		);
		return { count: records.length };
	}
	async upsert<Q extends Prisma.Args<Prisma.ExerciseSplitDaySessionExerciseNoteDelegate, 'upsert'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.ExerciseSplitDaySessionExerciseNoteDelegate, Q, 'upsert'>> {
		const neededStores = this._getNeededStoresForUpdate({
			...query,
			data: { ...query.update, ...query.create } as Prisma.Args<
				Prisma.ExerciseSplitDaySessionExerciseNoteDelegate,
				'update'
			>['data']
		});
		tx = tx ?? this.client._db.transaction(Array.from(neededStores), 'readwrite');
		let record = await this.findUnique({ where: query.where }, tx);
		if (!record) record = await this.create({ data: query.create }, tx);
		else record = await this.update({ where: query.where, data: query.update }, tx);
		record = await this.findUniqueOrThrow(
			{ where: { id: record.id }, select: query.select, include: query.include },
			tx
		);
		return record as Prisma.Result<Prisma.ExerciseSplitDaySessionExerciseNoteDelegate, Q, 'upsert'>;
	}
	async aggregate<
		Q extends Prisma.Args<Prisma.ExerciseSplitDaySessionExerciseNoteDelegate, 'aggregate'>
	>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.ExerciseSplitDaySessionExerciseNoteDelegate, Q, 'aggregate'>> {
		tx = tx ?? this.client._db.transaction(['ExerciseSplitDaySessionExerciseNote'], 'readonly');
		const records = await this.findMany({ where: query?.where }, tx);
		const result: Partial<
			Prisma.Result<Prisma.ExerciseSplitDaySessionExerciseNoteDelegate, Q, 'aggregate'>
		> = {};
		if (query?._count) {
			if (query._count === true) {
				(result._count as number) = records.length;
			} else {
				for (const key of Object.keys(query._count)) {
					const typedKey = key as keyof typeof query._count;
					if (typedKey === '_all') {
						(result._count as Record<string, number>)[typedKey] = records.length;
						continue;
					}
					(result._count as Record<string, number>)[typedKey] = (
						await this.findMany({ where: { [`${typedKey}`]: { not: null } } }, tx)
					).length;
				}
			}
		}
		if (query?._min) {
			const minResult = {} as Prisma.Result<
				Prisma.ExerciseSplitDaySessionExerciseNoteDelegate,
				Q,
				'aggregate'
			>['_min'];
			const numericFields = ['noteIndex'] as const;
			for (const field of numericFields) {
				if (!query._min[field]) continue;
				const values = records
					.map((record) => record[field] as number)
					.filter((value) => value !== undefined);
				(minResult[field as keyof typeof minResult] as number) = Math.min(...values);
			}
			const stringFields = ['id', 'exerciseId', 'note'] as const;
			for (const field of stringFields) {
				if (!query._min[field]) continue;
				const values = records
					.map((record) => record[field] as string)
					.filter((value) => value !== undefined);
				(minResult[field as keyof typeof minResult] as string) = values.sort()[0];
			}
			result._min = minResult;
		}
		if (query?._max) {
			const maxResult = {} as Prisma.Result<
				Prisma.ExerciseSplitDaySessionExerciseNoteDelegate,
				Q,
				'aggregate'
			>['_max'];
			const numericFields = ['noteIndex'] as const;
			for (const field of numericFields) {
				if (!query._max[field]) continue;
				const values = records
					.map((record) => record[field] as number)
					.filter((value) => value !== undefined);
				(maxResult[field as keyof typeof maxResult] as number) = Math.max(...values);
			}
			const stringFields = ['id', 'exerciseId', 'note'] as const;
			for (const field of stringFields) {
				if (!query._max[field]) continue;
				const values = records
					.map((record) => record[field] as string)
					.filter((value) => value !== undefined);
				(maxResult[field as keyof typeof maxResult] as string) = values.sort().reverse()[0];
			}
			result._max = maxResult;
		}
		if (query?._avg) {
			const avgResult = {} as Prisma.Result<
				Prisma.ExerciseSplitDaySessionExerciseNoteDelegate,
				Q,
				'aggregate'
			>['_avg'];
			for (const untypedField of Object.keys(query._avg)) {
				const field = untypedField as keyof (typeof records)[number];
				const values = records.map((record) => record[field] as number);
				(avgResult[field as keyof typeof avgResult] as number) =
					values.reduce((a, b) => a + b, 0) / values.length;
			}
			result._avg = avgResult;
		}
		if (query?._sum) {
			const sumResult = {} as Prisma.Result<
				Prisma.ExerciseSplitDaySessionExerciseNoteDelegate,
				Q,
				'aggregate'
			>['_sum'];
			for (const untypedField of Object.keys(query._sum)) {
				const field = untypedField as keyof (typeof records)[number];
				const values = records.map((record) => record[field] as number);
				(sumResult[field as keyof typeof sumResult] as number) = values.reduce((a, b) => a + b, 0);
			}
			result._sum = sumResult;
		}
		return result as unknown as Prisma.Result<
			Prisma.ExerciseSplitDaySessionExerciseNoteDelegate,
			Q,
			'aggregate'
		>;
	}
}
class ExerciseSplitDaySessionExerciseSecondaryMuscleGroupIDBClass extends BaseIDBModelClass<'ExerciseSplitDaySessionExerciseSecondaryMuscleGroup'> {
	private async _applyWhereClause<
		W extends Prisma.Args<
			Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroupDelegate,
			'findFirstOrThrow'
		>['where'],
		R extends Prisma.Result<
			Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroupDelegate,
			object,
			'findFirstOrThrow'
		>
	>(records: R[], whereClause: W, tx: IDBUtils.TransactionType): Promise<R[]> {
		if (!whereClause) return records;
		records = await IDBUtils.applyLogicalFilters<
			Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroupDelegate,
			R,
			W
		>(records, whereClause, tx, this.keyPath, this._applyWhereClause.bind(this));
		return (
			await Promise.all(
				records.map(async (record) => {
					const stringFields = ['id', 'exerciseId', 'muscleGroup'] as const;
					for (const field of stringFields) {
						if (!IDBUtils.whereStringFilter(record, field, whereClause[field])) return null;
					}
					if (whereClause.exercise) {
						const { is, isNot, ...rest } = whereClause.exercise;
						if (is !== null && is !== undefined) {
							const relatedRecord = await this.client.exerciseSplitDaySessionExercise.findFirst(
								{ where: { ...is, id: record.exerciseId } },
								tx
							);
							if (!relatedRecord) return null;
						}
						if (isNot !== null && isNot !== undefined) {
							const relatedRecord = await this.client.exerciseSplitDaySessionExercise.findFirst(
								{ where: { ...isNot, id: record.exerciseId } },
								tx
							);
							if (relatedRecord) return null;
						}
						if (Object.keys(rest).length) {
							const relatedRecord = await this.client.exerciseSplitDaySessionExercise.findFirst(
								{ where: { ...whereClause.exercise, id: record.exerciseId } },
								tx
							);
							if (!relatedRecord) return null;
						}
					}
					return record;
				})
			)
		).filter((result) => result !== null);
	}
	private _applySelectClause<
		S extends Prisma.Args<
			Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroupDelegate,
			'findMany'
		>['select']
	>(
		records: Prisma.Result<
			Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroupDelegate,
			object,
			'findFirstOrThrow'
		>[],
		selectClause: S
	): Prisma.Result<
		Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroupDelegate,
		{ select: S },
		'findFirstOrThrow'
	>[] {
		if (!selectClause) {
			return records as Prisma.Result<
				Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroupDelegate,
				{ select: S },
				'findFirstOrThrow'
			>[];
		}
		return records.map((record) => {
			const partialRecord: Partial<typeof record> = record;
			for (const untypedKey of ['id', 'exercise', 'exerciseId', 'muscleGroup']) {
				const key = untypedKey as keyof typeof record & keyof S;
				if (!selectClause[key]) delete partialRecord[key];
			}
			return partialRecord;
		}) as Prisma.Result<
			Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroupDelegate,
			{ select: S },
			'findFirstOrThrow'
		>[];
	}
	private async _applyRelations<
		Q extends Prisma.Args<
			Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroupDelegate,
			'findMany'
		>
	>(
		records: Prisma.Result<
			Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroupDelegate,
			object,
			'findFirstOrThrow'
		>[],
		tx: IDBUtils.TransactionType,
		query?: Q
	): Promise<
		Prisma.Result<
			Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroupDelegate,
			Q,
			'findFirstOrThrow'
		>[]
	> {
		if (!query)
			return records as Prisma.Result<
				Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroupDelegate,
				Q,
				'findFirstOrThrow'
			>[];
		const recordsWithRelations = records.map(async (record) => {
			const unsafeRecord = record as Record<string, unknown>;
			const attach_exercise = query.select?.exercise || query.include?.exercise;
			if (attach_exercise) {
				unsafeRecord['exercise'] = await this.client.exerciseSplitDaySessionExercise.findUnique(
					{
						...(attach_exercise === true ? {} : attach_exercise),
						where: { id: record.exerciseId! }
					},
					tx
				);
			}
			return unsafeRecord;
		});
		return (await Promise.all(recordsWithRelations)) as Prisma.Result<
			Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroupDelegate,
			Q,
			'findFirstOrThrow'
		>[];
	}
	async _applyOrderByClause<
		O extends Prisma.Args<
			Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroupDelegate,
			'findMany'
		>['orderBy'],
		R extends Prisma.Result<
			Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroupDelegate,
			object,
			'findFirstOrThrow'
		>
	>(records: R[], orderByClause: O, tx: IDBUtils.TransactionType): Promise<void> {
		if (orderByClause === undefined) return;
		const orderByClauses = IDBUtils.convertToArray(orderByClause);
		const indexedKeys = await Promise.all(
			records.map(async (record) => {
				const keys = await Promise.all(
					orderByClauses.map(async (clause) => await this._resolveOrderByKey(record, clause, tx))
				);
				return { keys, record };
			})
		);
		indexedKeys.sort((a, b) => {
			for (let i = 0; i < orderByClauses.length; i++) {
				const clause = orderByClauses[i];
				const comparison = IDBUtils.genericComparator(
					a.keys[i],
					b.keys[i],
					this._resolveSortOrder(clause)
				);
				if (comparison !== 0) return comparison;
			}
			return 0;
		});
		for (let i = 0; i < records.length; i++) {
			records[i] = indexedKeys[i].record;
		}
	}
	async _resolveOrderByKey(
		record: Prisma.Result<
			Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroupDelegate,
			object,
			'findFirstOrThrow'
		>,
		orderByInput: Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroupOrderByWithRelationInput,
		tx: IDBUtils.TransactionType
	): Promise<unknown> {
		const scalarFields = ['id', 'exerciseId', 'muscleGroup'] as const;
		for (const field of scalarFields) if (orderByInput[field]) return record[field];
		if (orderByInput.exercise) {
			return await this.client.exerciseSplitDaySessionExercise._resolveOrderByKey(
				await this.client.exerciseSplitDaySessionExercise.findFirstOrThrow({
					where: { id: record.exerciseId }
				}),
				orderByInput.exercise,
				tx
			);
		}
	}
	_resolveSortOrder(
		orderByInput: Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroupOrderByWithRelationInput
	): Prisma.SortOrder | { sort: Prisma.SortOrder; nulls?: 'first' | 'last' } {
		const scalarFields = ['id', 'exerciseId', 'muscleGroup'] as const;
		for (const field of scalarFields) if (orderByInput[field]) return orderByInput[field];
		if (orderByInput.exercise) {
			return this.client.exerciseSplitDaySessionExercise._resolveSortOrder(orderByInput.exercise);
		}
		throw new Error('No field in orderBy clause');
	}
	private async _fillDefaults<
		D extends Prisma.Args<
			Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroupDelegate,
			'create'
		>['data']
	>(data: D, tx?: IDBUtils.ReadwriteTransactionType): Promise<D> {
		if (data === undefined) data = {} as NonNullable<D>;
		if (data.id === undefined) {
			data.id = uuidv4();
		}
		return data;
	}
	_getNeededStoresForWhere<
		W extends Prisma.Args<
			Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroupDelegate,
			'findMany'
		>['where']
	>(whereClause: W, neededStores: Set<StoreNames<PrismaIDBSchema>>) {
		if (whereClause === undefined) return;
		for (const param of IDBUtils.LogicalParams) {
			if (whereClause[param]) {
				for (const clause of IDBUtils.convertToArray(whereClause[param])) {
					this._getNeededStoresForWhere(clause, neededStores);
				}
			}
		}
		if (whereClause.exercise) {
			neededStores.add('ExerciseSplitDaySessionExercise');
			this.client.exerciseSplitDaySessionExercise._getNeededStoresForWhere(
				whereClause.exercise,
				neededStores
			);
		}
	}
	_getNeededStoresForFind<
		Q extends Prisma.Args<
			Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroupDelegate,
			'findMany'
		>
	>(query?: Q): Set<StoreNames<PrismaIDBSchema>> {
		const neededStores: Set<StoreNames<PrismaIDBSchema>> = new Set();
		neededStores.add('ExerciseSplitDaySessionExerciseSecondaryMuscleGroup');
		this._getNeededStoresForWhere(query?.where, neededStores);
		if (query?.orderBy) {
			const orderBy = IDBUtils.convertToArray(query.orderBy);
			const orderBy_exercise = orderBy.find((clause) => clause.exercise);
			if (orderBy_exercise) {
				this.client.exerciseSplitDaySessionExercise
					._getNeededStoresForFind({ orderBy: orderBy_exercise.exercise })
					.forEach((storeName) => neededStores.add(storeName));
			}
		}
		if (query?.select?.exercise || query?.include?.exercise) {
			neededStores.add('ExerciseSplitDaySessionExercise');
			if (typeof query.select?.exercise === 'object') {
				this.client.exerciseSplitDaySessionExercise
					._getNeededStoresForFind(query.select.exercise)
					.forEach((storeName) => neededStores.add(storeName));
			}
			if (typeof query.include?.exercise === 'object') {
				this.client.exerciseSplitDaySessionExercise
					._getNeededStoresForFind(query.include.exercise)
					.forEach((storeName) => neededStores.add(storeName));
			}
		}
		return neededStores;
	}
	_getNeededStoresForCreate<
		D extends Partial<
			Prisma.Args<
				Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroupDelegate,
				'create'
			>['data']
		>
	>(data: D): Set<StoreNames<PrismaIDBSchema>> {
		const neededStores: Set<StoreNames<PrismaIDBSchema>> = new Set();
		neededStores.add('ExerciseSplitDaySessionExerciseSecondaryMuscleGroup');
		if (data?.exercise) {
			neededStores.add('ExerciseSplitDaySessionExercise');
			if (data.exercise.create) {
				const createData = Array.isArray(data.exercise.create)
					? data.exercise.create
					: [data.exercise.create];
				createData.forEach((record) =>
					this.client.exerciseSplitDaySessionExercise
						._getNeededStoresForCreate(record)
						.forEach((storeName) => neededStores.add(storeName))
				);
			}
			if (data.exercise.connectOrCreate) {
				IDBUtils.convertToArray(data.exercise.connectOrCreate).forEach((record) =>
					this.client.exerciseSplitDaySessionExercise
						._getNeededStoresForCreate(record.create)
						.forEach((storeName) => neededStores.add(storeName))
				);
			}
		}
		if (data?.exerciseId !== undefined) {
			neededStores.add('ExerciseSplitDaySessionExercise');
		}
		return neededStores;
	}
	_getNeededStoresForUpdate<
		Q extends Prisma.Args<
			Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroupDelegate,
			'update'
		>
	>(query: Partial<Q>): Set<StoreNames<PrismaIDBSchema>> {
		const neededStores = this._getNeededStoresForFind(query).union(
			this._getNeededStoresForCreate(
				query.data as Prisma.Args<
					Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroupDelegate,
					'create'
				>['data']
			)
		);
		if (query.data?.exercise?.connect) {
			neededStores.add('ExerciseSplitDaySessionExercise');
			IDBUtils.convertToArray(query.data.exercise.connect).forEach((connect) => {
				this.client.exerciseSplitDaySessionExercise._getNeededStoresForWhere(connect, neededStores);
			});
		}
		if (query.data?.exercise?.update) {
			neededStores.add('ExerciseSplitDaySessionExercise');
			IDBUtils.convertToArray(query.data.exercise.update).forEach((update) => {
				this.client.exerciseSplitDaySessionExercise
					._getNeededStoresForUpdate(
						update as Prisma.Args<Prisma.ExerciseSplitDaySessionExerciseDelegate, 'update'>
					)
					.forEach((store) => neededStores.add(store));
			});
		}
		if (query.data?.exercise?.upsert) {
			neededStores.add('ExerciseSplitDaySessionExercise');
			IDBUtils.convertToArray(query.data.exercise.upsert).forEach((upsert) => {
				const update = {
					where: upsert.where,
					data: { ...upsert.update, ...upsert.create }
				} as Prisma.Args<Prisma.ExerciseSplitDaySessionExerciseDelegate, 'update'>;
				this.client.exerciseSplitDaySessionExercise
					._getNeededStoresForUpdate(update)
					.forEach((store) => neededStores.add(store));
			});
		}
		return neededStores;
	}
	_getNeededStoresForNestedDelete(neededStores: Set<StoreNames<PrismaIDBSchema>>): void {
		neededStores.add('ExerciseSplitDaySessionExerciseSecondaryMuscleGroup');
	}
	private _removeNestedCreateData<
		D extends Prisma.Args<
			Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroupDelegate,
			'create'
		>['data']
	>(
		data: D
	): Prisma.Result<
		Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroupDelegate,
		object,
		'findFirstOrThrow'
	> {
		const recordWithoutNestedCreate = structuredClone(data);
		delete recordWithoutNestedCreate?.exercise;
		return recordWithoutNestedCreate as Prisma.Result<
			Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroupDelegate,
			object,
			'findFirstOrThrow'
		>;
	}
	private _preprocessListFields(
		records: Prisma.Result<
			Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroupDelegate,
			object,
			'findMany'
		>
	): void {}
	async findMany<
		Q extends Prisma.Args<
			Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroupDelegate,
			'findMany'
		>
	>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<
		Prisma.Result<Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroupDelegate, Q, 'findMany'>
	> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		const records = await this._applyWhereClause(
			await tx.objectStore('ExerciseSplitDaySessionExerciseSecondaryMuscleGroup').getAll(),
			query?.where,
			tx
		);
		await this._applyOrderByClause(records, query?.orderBy, tx);
		const relationAppliedRecords = (await this._applyRelations(
			records,
			tx,
			query
		)) as Prisma.Result<
			Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroupDelegate,
			object,
			'findFirstOrThrow'
		>[];
		const selectClause = query?.select;
		let selectAppliedRecords = this._applySelectClause(relationAppliedRecords, selectClause);
		if (query?.distinct) {
			const distinctFields = IDBUtils.convertToArray(query.distinct);
			const seen = new Set<string>();
			selectAppliedRecords = selectAppliedRecords.filter((record) => {
				const key = distinctFields.map((field) => record[field]).join('|');
				if (seen.has(key)) return false;
				seen.add(key);
				return true;
			});
		}
		this._preprocessListFields(selectAppliedRecords);
		return selectAppliedRecords as Prisma.Result<
			Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroupDelegate,
			Q,
			'findMany'
		>;
	}
	async findFirst<
		Q extends Prisma.Args<
			Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroupDelegate,
			'findFirst'
		>
	>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<
		Prisma.Result<
			Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroupDelegate,
			Q,
			'findFirst'
		>
	> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		return (await this.findMany(query, tx))[0] ?? null;
	}
	async findFirstOrThrow<
		Q extends Prisma.Args<
			Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroupDelegate,
			'findFirstOrThrow'
		>
	>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<
		Prisma.Result<
			Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroupDelegate,
			Q,
			'findFirstOrThrow'
		>
	> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		const record = await this.findFirst(query, tx);
		if (!record) {
			tx.abort();
			throw new Error('Record not found');
		}
		return record;
	}
	async findUnique<
		Q extends Prisma.Args<
			Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroupDelegate,
			'findUnique'
		>
	>(
		query: Q,
		tx?: IDBUtils.TransactionType
	): Promise<
		Prisma.Result<
			Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroupDelegate,
			Q,
			'findUnique'
		>
	> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		let record;
		if (query.where.id !== undefined) {
			record = await tx
				.objectStore('ExerciseSplitDaySessionExerciseSecondaryMuscleGroup')
				.get([query.where.id]);
		} else if (query.where.exerciseId_muscleGroup !== undefined) {
			record = await tx
				.objectStore('ExerciseSplitDaySessionExerciseSecondaryMuscleGroup')
				.index('exerciseId_muscleGroupIndex')
				.get([
					query.where.exerciseId_muscleGroup.exerciseId,
					query.where.exerciseId_muscleGroup.muscleGroup
				]);
		}
		if (!record) return null;

		const recordWithRelations = this._applySelectClause(
			await this._applyRelations(
				await this._applyWhereClause([record], query.where, tx),
				tx,
				query
			),
			query.select
		)[0];
		this._preprocessListFields([recordWithRelations]);
		return recordWithRelations as Prisma.Result<
			Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroupDelegate,
			Q,
			'findUnique'
		>;
	}
	async findUniqueOrThrow<
		Q extends Prisma.Args<
			Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroupDelegate,
			'findUniqueOrThrow'
		>
	>(
		query: Q,
		tx?: IDBUtils.TransactionType
	): Promise<
		Prisma.Result<
			Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroupDelegate,
			Q,
			'findUniqueOrThrow'
		>
	> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		const record = await this.findUnique(query, tx);
		if (!record) {
			tx.abort();
			throw new Error('Record not found');
		}
		return record;
	}
	async count<
		Q extends Prisma.Args<
			Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroupDelegate,
			'count'
		>
	>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<
		Prisma.Result<Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroupDelegate, Q, 'count'>
	> {
		tx =
			tx ??
			this.client._db.transaction(
				['ExerciseSplitDaySessionExerciseSecondaryMuscleGroup'],
				'readonly'
			);
		if (!query?.select || query.select === true) {
			const records = await this.findMany({ where: query?.where }, tx);
			return records.length as Prisma.Result<
				Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroupDelegate,
				Q,
				'count'
			>;
		}
		const result: Partial<
			Record<
				keyof Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroupCountAggregateInputType,
				number
			>
		> = {};
		for (const key of Object.keys(query.select)) {
			const typedKey = key as keyof typeof query.select;
			if (typedKey === '_all') {
				result[typedKey] = (await this.findMany({ where: query.where }, tx)).length;
				continue;
			}
			result[typedKey] = (
				await this.findMany({ where: { [`${typedKey}`]: { not: null } } }, tx)
			).length;
		}
		return result as Prisma.Result<
			Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroupDelegate,
			Q,
			'count'
		>;
	}
	async create<
		Q extends Prisma.Args<
			Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroupDelegate,
			'create'
		>
	>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<
		Prisma.Result<Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroupDelegate, Q, 'create'>
	> {
		const storesNeeded = this._getNeededStoresForCreate(query.data);
		tx = tx ?? this.client._db.transaction(Array.from(storesNeeded), 'readwrite');
		if (query.data.exercise) {
			const fk: Partial<PrismaIDBSchema['ExerciseSplitDaySessionExercise']['key']> = [];
			if (query.data.exercise?.create) {
				const record = await this.client.exerciseSplitDaySessionExercise.create(
					{ data: query.data.exercise.create },
					tx
				);
				fk[0] = record.id;
			}
			if (query.data.exercise?.connect) {
				const record = await this.client.exerciseSplitDaySessionExercise.findUniqueOrThrow(
					{ where: query.data.exercise.connect },
					tx
				);
				delete query.data.exercise.connect;
				fk[0] = record.id;
			}
			if (query.data.exercise?.connectOrCreate) {
				const record = await this.client.exerciseSplitDaySessionExercise.upsert(
					{
						where: query.data.exercise.connectOrCreate.where,
						create: query.data.exercise.connectOrCreate.create,
						update: {}
					},
					tx
				);
				fk[0] = record.id;
			}
			const unsafeData = query.data as Record<string, unknown>;
			unsafeData.exerciseId = fk[0];
			delete unsafeData.exercise;
		} else if (query.data?.exerciseId !== undefined && query.data.exerciseId !== null) {
			await this.client.exerciseSplitDaySessionExercise.findUniqueOrThrow(
				{
					where: { id: query.data.exerciseId }
				},
				tx
			);
		}
		const record = this._removeNestedCreateData(await this._fillDefaults(query.data, tx));
		const keyPath = await tx
			.objectStore('ExerciseSplitDaySessionExerciseSecondaryMuscleGroup')
			.add(record);
		const data = (await tx
			.objectStore('ExerciseSplitDaySessionExerciseSecondaryMuscleGroup')
			.get(keyPath))!;
		const recordsWithRelations = this._applySelectClause(
			await this._applyRelations<object>([data], tx, query),
			query.select
		)[0];
		this._preprocessListFields([recordsWithRelations]);
		this.emit('create', keyPath);
		return recordsWithRelations as Prisma.Result<
			Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroupDelegate,
			Q,
			'create'
		>;
	}
	async createMany<
		Q extends Prisma.Args<
			Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroupDelegate,
			'createMany'
		>
	>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<
		Prisma.Result<
			Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroupDelegate,
			Q,
			'createMany'
		>
	> {
		const createManyData = IDBUtils.convertToArray(query.data);
		tx =
			tx ??
			this.client._db.transaction(
				['ExerciseSplitDaySessionExerciseSecondaryMuscleGroup'],
				'readwrite'
			);
		for (const createData of createManyData) {
			const record = this._removeNestedCreateData(await this._fillDefaults(createData, tx));
			const keyPath = await tx
				.objectStore('ExerciseSplitDaySessionExerciseSecondaryMuscleGroup')
				.add(record);
			this.emit('create', keyPath);
		}
		return { count: createManyData.length };
	}
	async createManyAndReturn<
		Q extends Prisma.Args<
			Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroupDelegate,
			'createManyAndReturn'
		>
	>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<
		Prisma.Result<
			Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroupDelegate,
			Q,
			'createManyAndReturn'
		>
	> {
		const createManyData = IDBUtils.convertToArray(query.data);
		const records: Prisma.Result<
			Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroupDelegate,
			object,
			'findMany'
		> = [];
		tx =
			tx ??
			this.client._db.transaction(
				['ExerciseSplitDaySessionExerciseSecondaryMuscleGroup'],
				'readwrite'
			);
		for (const createData of createManyData) {
			const record = this._removeNestedCreateData(await this._fillDefaults(createData, tx));
			const keyPath = await tx
				.objectStore('ExerciseSplitDaySessionExerciseSecondaryMuscleGroup')
				.add(record);
			this.emit('create', keyPath);
			records.push(this._applySelectClause([record], query.select)[0]);
		}
		this._preprocessListFields(records);
		return records as Prisma.Result<
			Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroupDelegate,
			Q,
			'createManyAndReturn'
		>;
	}
	async delete<
		Q extends Prisma.Args<
			Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroupDelegate,
			'delete'
		>
	>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<
		Prisma.Result<Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroupDelegate, Q, 'delete'>
	> {
		const storesNeeded = this._getNeededStoresForFind(query);
		this._getNeededStoresForNestedDelete(storesNeeded);
		tx = tx ?? this.client._db.transaction(Array.from(storesNeeded), 'readwrite');
		const record = await this.findUnique(query, tx);
		if (!record) throw new Error('Record not found');
		await tx.objectStore('ExerciseSplitDaySessionExerciseSecondaryMuscleGroup').delete([record.id]);
		this.emit('delete', [record.id]);
		return record;
	}
	async deleteMany<
		Q extends Prisma.Args<
			Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroupDelegate,
			'deleteMany'
		>
	>(
		query?: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<
		Prisma.Result<
			Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroupDelegate,
			Q,
			'deleteMany'
		>
	> {
		const storesNeeded = this._getNeededStoresForFind(query);
		this._getNeededStoresForNestedDelete(storesNeeded);
		tx = tx ?? this.client._db.transaction(Array.from(storesNeeded), 'readwrite');
		const records = await this.findMany(query, tx);
		for (const record of records) {
			await this.delete({ where: { id: record.id } }, tx);
		}
		return { count: records.length };
	}
	async update<
		Q extends Prisma.Args<
			Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroupDelegate,
			'update'
		>
	>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<
		Prisma.Result<Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroupDelegate, Q, 'update'>
	> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForUpdate(query)), 'readwrite');
		const record = await this.findUnique({ where: query.where }, tx);
		if (record === null) {
			tx.abort();
			throw new Error('Record not found');
		}
		const startKeyPath: PrismaIDBSchema['ExerciseSplitDaySessionExerciseSecondaryMuscleGroup']['key'] =
			[record.id];
		const stringFields = ['id', 'exerciseId', 'muscleGroup'] as const;
		for (const field of stringFields) {
			IDBUtils.handleStringUpdateField(record, field, query.data[field]);
		}
		if (query.data.exercise) {
			if (query.data.exercise.connect) {
				const other = await this.client.exerciseSplitDaySessionExercise.findUniqueOrThrow(
					{ where: query.data.exercise.connect },
					tx
				);
				record.exerciseId = other.id;
			}
			if (query.data.exercise.create) {
				const other = await this.client.exerciseSplitDaySessionExercise.create(
					{ data: query.data.exercise.create },
					tx
				);
				record.exerciseId = other.id;
			}
			if (query.data.exercise.update) {
				const updateData = query.data.exercise.update.data ?? query.data.exercise.update;
				await this.client.exerciseSplitDaySessionExercise.update(
					{
						where: {
							...query.data.exercise.update.where,
							id: record.exerciseId!
						} as Prisma.ExerciseSplitDaySessionExerciseWhereUniqueInput,
						data: updateData
					},
					tx
				);
			}
			if (query.data.exercise.upsert) {
				await this.client.exerciseSplitDaySessionExercise.upsert(
					{
						where: {
							...query.data.exercise.upsert.where,
							id: record.exerciseId!
						} as Prisma.ExerciseSplitDaySessionExerciseWhereUniqueInput,
						create: { ...query.data.exercise.upsert.create, id: record.exerciseId! } as Prisma.Args<
							Prisma.ExerciseSplitDaySessionExerciseDelegate,
							'upsert'
						>['create'],
						update: query.data.exercise.upsert.update
					},
					tx
				);
			}
			if (query.data.exercise.connectOrCreate) {
				await this.client.exerciseSplitDaySessionExercise.upsert(
					{
						where: { ...query.data.exercise.connectOrCreate.where, id: record.exerciseId! },
						create: {
							...query.data.exercise.connectOrCreate.create,
							id: record.exerciseId!
						} as Prisma.Args<Prisma.ExerciseSplitDaySessionExerciseDelegate, 'upsert'>['create'],
						update: { id: record.exerciseId! }
					},
					tx
				);
			}
		}
		if (query.data.exerciseId !== undefined) {
			const related = await this.client.exerciseSplitDaySessionExercise.findUnique(
				{ where: { id: record.exerciseId } },
				tx
			);
			if (!related) throw new Error('Related record not found');
		}
		const endKeyPath: PrismaIDBSchema['ExerciseSplitDaySessionExerciseSecondaryMuscleGroup']['key'] =
			[record.id];
		for (let i = 0; i < startKeyPath.length; i++) {
			if (startKeyPath[i] !== endKeyPath[i]) {
				if (
					(await tx
						.objectStore('ExerciseSplitDaySessionExerciseSecondaryMuscleGroup')
						.get(endKeyPath)) !== undefined
				) {
					throw new Error('Record with the same keyPath already exists');
				}
				await tx
					.objectStore('ExerciseSplitDaySessionExerciseSecondaryMuscleGroup')
					.delete(startKeyPath);
				break;
			}
		}
		const keyPath = await tx
			.objectStore('ExerciseSplitDaySessionExerciseSecondaryMuscleGroup')
			.put(record);
		this.emit('update', keyPath, startKeyPath);
		for (let i = 0; i < startKeyPath.length; i++) {
			if (startKeyPath[i] !== endKeyPath[i]) {
				break;
			}
		}
		const recordWithRelations = (await this.findUnique(
			{
				where: { id: keyPath[0] }
			},
			tx
		))!;
		return recordWithRelations as Prisma.Result<
			Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroupDelegate,
			Q,
			'update'
		>;
	}
	async updateMany<
		Q extends Prisma.Args<
			Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroupDelegate,
			'updateMany'
		>
	>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<
		Prisma.Result<
			Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroupDelegate,
			Q,
			'updateMany'
		>
	> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readwrite');
		const records = await this.findMany({ where: query.where }, tx);
		await Promise.all(
			records.map(async (record) => {
				await this.update({ where: { id: record.id }, data: query.data }, tx);
			})
		);
		return { count: records.length };
	}
	async upsert<
		Q extends Prisma.Args<
			Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroupDelegate,
			'upsert'
		>
	>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<
		Prisma.Result<Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroupDelegate, Q, 'upsert'>
	> {
		const neededStores = this._getNeededStoresForUpdate({
			...query,
			data: { ...query.update, ...query.create } as Prisma.Args<
				Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroupDelegate,
				'update'
			>['data']
		});
		tx = tx ?? this.client._db.transaction(Array.from(neededStores), 'readwrite');
		let record = await this.findUnique({ where: query.where }, tx);
		if (!record) record = await this.create({ data: query.create }, tx);
		else record = await this.update({ where: query.where, data: query.update }, tx);
		record = await this.findUniqueOrThrow(
			{ where: { id: record.id }, select: query.select, include: query.include },
			tx
		);
		return record as Prisma.Result<
			Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroupDelegate,
			Q,
			'upsert'
		>;
	}
	async aggregate<
		Q extends Prisma.Args<
			Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroupDelegate,
			'aggregate'
		>
	>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<
		Prisma.Result<
			Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroupDelegate,
			Q,
			'aggregate'
		>
	> {
		tx =
			tx ??
			this.client._db.transaction(
				['ExerciseSplitDaySessionExerciseSecondaryMuscleGroup'],
				'readonly'
			);
		const records = await this.findMany({ where: query?.where }, tx);
		const result: Partial<
			Prisma.Result<
				Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroupDelegate,
				Q,
				'aggregate'
			>
		> = {};
		if (query?._count) {
			if (query._count === true) {
				(result._count as number) = records.length;
			} else {
				for (const key of Object.keys(query._count)) {
					const typedKey = key as keyof typeof query._count;
					if (typedKey === '_all') {
						(result._count as Record<string, number>)[typedKey] = records.length;
						continue;
					}
					(result._count as Record<string, number>)[typedKey] = (
						await this.findMany({ where: { [`${typedKey}`]: { not: null } } }, tx)
					).length;
				}
			}
		}
		if (query?._min) {
			const minResult = {} as Prisma.Result<
				Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroupDelegate,
				Q,
				'aggregate'
			>['_min'];
			const stringFields = ['id', 'exerciseId', 'muscleGroup'] as const;
			for (const field of stringFields) {
				if (!query._min[field]) continue;
				const values = records
					.map((record) => record[field] as string)
					.filter((value) => value !== undefined);
				(minResult[field as keyof typeof minResult] as string) = values.sort()[0];
			}
			result._min = minResult;
		}
		if (query?._max) {
			const maxResult = {} as Prisma.Result<
				Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroupDelegate,
				Q,
				'aggregate'
			>['_max'];
			const stringFields = ['id', 'exerciseId', 'muscleGroup'] as const;
			for (const field of stringFields) {
				if (!query._max[field]) continue;
				const values = records
					.map((record) => record[field] as string)
					.filter((value) => value !== undefined);
				(maxResult[field as keyof typeof maxResult] as string) = values.sort().reverse()[0];
			}
			result._max = maxResult;
		}
		return result as unknown as Prisma.Result<
			Prisma.ExerciseSplitDaySessionExerciseSecondaryMuscleGroupDelegate,
			Q,
			'aggregate'
		>;
	}
}
class MacroTargetsIDBClass extends BaseIDBModelClass<'MacroTargets'> {
	private async _applyWhereClause<
		W extends Prisma.Args<Prisma.MacroTargetsDelegate, 'findFirstOrThrow'>['where'],
		R extends Prisma.Result<Prisma.MacroTargetsDelegate, object, 'findFirstOrThrow'>
	>(records: R[], whereClause: W, tx: IDBUtils.TransactionType): Promise<R[]> {
		if (!whereClause) return records;
		records = await IDBUtils.applyLogicalFilters<Prisma.MacroTargetsDelegate, R, W>(
			records,
			whereClause,
			tx,
			this.keyPath,
			this._applyWhereClause.bind(this)
		);
		return (
			await Promise.all(
				records.map(async (record) => {
					const stringFields = ['id', 'userId'] as const;
					for (const field of stringFields) {
						if (!IDBUtils.whereStringFilter(record, field, whereClause[field])) return null;
					}
					const numberFields = ['proteins', 'carbs', 'fats', 'caloricChange'] as const;
					for (const field of numberFields) {
						if (!IDBUtils.whereNumberFilter(record, field, whereClause[field])) return null;
					}
					const dateTimeFields = ['createdAt'] as const;
					for (const field of dateTimeFields) {
						if (!IDBUtils.whereDateTimeFilter(record, field, whereClause[field])) return null;
					}
					if (whereClause.user) {
						const { is, isNot, ...rest } = whereClause.user;
						if (is !== null && is !== undefined) {
							const relatedRecord = await this.client.user.findFirst(
								{ where: { ...is, id: record.userId } },
								tx
							);
							if (!relatedRecord) return null;
						}
						if (isNot !== null && isNot !== undefined) {
							const relatedRecord = await this.client.user.findFirst(
								{ where: { ...isNot, id: record.userId } },
								tx
							);
							if (relatedRecord) return null;
						}
						if (Object.keys(rest).length) {
							const relatedRecord = await this.client.user.findFirst(
								{ where: { ...whereClause.user, id: record.userId } },
								tx
							);
							if (!relatedRecord) return null;
						}
					}
					return record;
				})
			)
		).filter((result) => result !== null);
	}
	private _applySelectClause<
		S extends Prisma.Args<Prisma.MacroTargetsDelegate, 'findMany'>['select']
	>(
		records: Prisma.Result<Prisma.MacroTargetsDelegate, object, 'findFirstOrThrow'>[],
		selectClause: S
	): Prisma.Result<Prisma.MacroTargetsDelegate, { select: S }, 'findFirstOrThrow'>[] {
		if (!selectClause) {
			return records as Prisma.Result<
				Prisma.MacroTargetsDelegate,
				{ select: S },
				'findFirstOrThrow'
			>[];
		}
		return records.map((record) => {
			const partialRecord: Partial<typeof record> = record;
			for (const untypedKey of [
				'id',
				'createdAt',
				'proteins',
				'carbs',
				'fats',
				'quantifier',
				'caloricChange',
				'user',
				'userId'
			]) {
				const key = untypedKey as keyof typeof record & keyof S;
				if (!selectClause[key]) delete partialRecord[key];
			}
			return partialRecord;
		}) as Prisma.Result<Prisma.MacroTargetsDelegate, { select: S }, 'findFirstOrThrow'>[];
	}
	private async _applyRelations<Q extends Prisma.Args<Prisma.MacroTargetsDelegate, 'findMany'>>(
		records: Prisma.Result<Prisma.MacroTargetsDelegate, object, 'findFirstOrThrow'>[],
		tx: IDBUtils.TransactionType,
		query?: Q
	): Promise<Prisma.Result<Prisma.MacroTargetsDelegate, Q, 'findFirstOrThrow'>[]> {
		if (!query)
			return records as Prisma.Result<Prisma.MacroTargetsDelegate, Q, 'findFirstOrThrow'>[];
		const recordsWithRelations = records.map(async (record) => {
			const unsafeRecord = record as Record<string, unknown>;
			const attach_user = query.select?.user || query.include?.user;
			if (attach_user) {
				unsafeRecord['user'] = await this.client.user.findUnique(
					{
						...(attach_user === true ? {} : attach_user),
						where: { id: record.userId! }
					},
					tx
				);
			}
			return unsafeRecord;
		});
		return (await Promise.all(recordsWithRelations)) as Prisma.Result<
			Prisma.MacroTargetsDelegate,
			Q,
			'findFirstOrThrow'
		>[];
	}
	async _applyOrderByClause<
		O extends Prisma.Args<Prisma.MacroTargetsDelegate, 'findMany'>['orderBy'],
		R extends Prisma.Result<Prisma.MacroTargetsDelegate, object, 'findFirstOrThrow'>
	>(records: R[], orderByClause: O, tx: IDBUtils.TransactionType): Promise<void> {
		if (orderByClause === undefined) return;
		const orderByClauses = IDBUtils.convertToArray(orderByClause);
		const indexedKeys = await Promise.all(
			records.map(async (record) => {
				const keys = await Promise.all(
					orderByClauses.map(async (clause) => await this._resolveOrderByKey(record, clause, tx))
				);
				return { keys, record };
			})
		);
		indexedKeys.sort((a, b) => {
			for (let i = 0; i < orderByClauses.length; i++) {
				const clause = orderByClauses[i];
				const comparison = IDBUtils.genericComparator(
					a.keys[i],
					b.keys[i],
					this._resolveSortOrder(clause)
				);
				if (comparison !== 0) return comparison;
			}
			return 0;
		});
		for (let i = 0; i < records.length; i++) {
			records[i] = indexedKeys[i].record;
		}
	}
	async _resolveOrderByKey(
		record: Prisma.Result<Prisma.MacroTargetsDelegate, object, 'findFirstOrThrow'>,
		orderByInput: Prisma.MacroTargetsOrderByWithRelationInput,
		tx: IDBUtils.TransactionType
	): Promise<unknown> {
		const scalarFields = [
			'id',
			'createdAt',
			'proteins',
			'carbs',
			'fats',
			'quantifier',
			'caloricChange',
			'userId'
		] as const;
		for (const field of scalarFields) if (orderByInput[field]) return record[field];
		if (orderByInput.user) {
			return await this.client.user._resolveOrderByKey(
				await this.client.user.findFirstOrThrow({ where: { id: record.userId } }),
				orderByInput.user,
				tx
			);
		}
	}
	_resolveSortOrder(
		orderByInput: Prisma.MacroTargetsOrderByWithRelationInput
	): Prisma.SortOrder | { sort: Prisma.SortOrder; nulls?: 'first' | 'last' } {
		const scalarFields = [
			'id',
			'createdAt',
			'proteins',
			'carbs',
			'fats',
			'quantifier',
			'caloricChange',
			'userId'
		] as const;
		for (const field of scalarFields) if (orderByInput[field]) return orderByInput[field];
		if (orderByInput.user) {
			return this.client.user._resolveSortOrder(orderByInput.user);
		}
		throw new Error('No field in orderBy clause');
	}
	private async _fillDefaults<D extends Prisma.Args<Prisma.MacroTargetsDelegate, 'create'>['data']>(
		data: D,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<D> {
		if (data === undefined) data = {} as NonNullable<D>;
		if (data.id === undefined) {
			data.id = uuidv4();
		}
		if (data.createdAt === undefined) {
			data.createdAt = new Date();
		}
		if (data.proteins === undefined) {
			data.proteins = null;
		}
		if (data.carbs === undefined) {
			data.carbs = null;
		}
		if (data.fats === undefined) {
			data.fats = null;
		}
		if (typeof data.createdAt === 'string') {
			data.createdAt = new Date(data.createdAt);
		}
		return data;
	}
	_getNeededStoresForWhere<W extends Prisma.Args<Prisma.MacroTargetsDelegate, 'findMany'>['where']>(
		whereClause: W,
		neededStores: Set<StoreNames<PrismaIDBSchema>>
	) {
		if (whereClause === undefined) return;
		for (const param of IDBUtils.LogicalParams) {
			if (whereClause[param]) {
				for (const clause of IDBUtils.convertToArray(whereClause[param])) {
					this._getNeededStoresForWhere(clause, neededStores);
				}
			}
		}
		if (whereClause.user) {
			neededStores.add('User');
			this.client.user._getNeededStoresForWhere(whereClause.user, neededStores);
		}
	}
	_getNeededStoresForFind<Q extends Prisma.Args<Prisma.MacroTargetsDelegate, 'findMany'>>(
		query?: Q
	): Set<StoreNames<PrismaIDBSchema>> {
		const neededStores: Set<StoreNames<PrismaIDBSchema>> = new Set();
		neededStores.add('MacroTargets');
		this._getNeededStoresForWhere(query?.where, neededStores);
		if (query?.orderBy) {
			const orderBy = IDBUtils.convertToArray(query.orderBy);
			const orderBy_user = orderBy.find((clause) => clause.user);
			if (orderBy_user) {
				this.client.user
					._getNeededStoresForFind({ orderBy: orderBy_user.user })
					.forEach((storeName) => neededStores.add(storeName));
			}
		}
		if (query?.select?.user || query?.include?.user) {
			neededStores.add('User');
			if (typeof query.select?.user === 'object') {
				this.client.user
					._getNeededStoresForFind(query.select.user)
					.forEach((storeName) => neededStores.add(storeName));
			}
			if (typeof query.include?.user === 'object') {
				this.client.user
					._getNeededStoresForFind(query.include.user)
					.forEach((storeName) => neededStores.add(storeName));
			}
		}
		return neededStores;
	}
	_getNeededStoresForCreate<
		D extends Partial<Prisma.Args<Prisma.MacroTargetsDelegate, 'create'>['data']>
	>(data: D): Set<StoreNames<PrismaIDBSchema>> {
		const neededStores: Set<StoreNames<PrismaIDBSchema>> = new Set();
		neededStores.add('MacroTargets');
		if (data?.user) {
			neededStores.add('User');
			if (data.user.create) {
				const createData = Array.isArray(data.user.create) ? data.user.create : [data.user.create];
				createData.forEach((record) =>
					this.client.user
						._getNeededStoresForCreate(record)
						.forEach((storeName) => neededStores.add(storeName))
				);
			}
			if (data.user.connectOrCreate) {
				IDBUtils.convertToArray(data.user.connectOrCreate).forEach((record) =>
					this.client.user
						._getNeededStoresForCreate(record.create)
						.forEach((storeName) => neededStores.add(storeName))
				);
			}
		}
		if (data?.userId !== undefined) {
			neededStores.add('User');
		}
		return neededStores;
	}
	_getNeededStoresForUpdate<Q extends Prisma.Args<Prisma.MacroTargetsDelegate, 'update'>>(
		query: Partial<Q>
	): Set<StoreNames<PrismaIDBSchema>> {
		const neededStores = this._getNeededStoresForFind(query).union(
			this._getNeededStoresForCreate(
				query.data as Prisma.Args<Prisma.MacroTargetsDelegate, 'create'>['data']
			)
		);
		if (query.data?.user?.connect) {
			neededStores.add('User');
			IDBUtils.convertToArray(query.data.user.connect).forEach((connect) => {
				this.client.user._getNeededStoresForWhere(connect, neededStores);
			});
		}
		if (query.data?.user?.update) {
			neededStores.add('User');
			IDBUtils.convertToArray(query.data.user.update).forEach((update) => {
				this.client.user
					._getNeededStoresForUpdate(update as Prisma.Args<Prisma.UserDelegate, 'update'>)
					.forEach((store) => neededStores.add(store));
			});
		}
		if (query.data?.user?.upsert) {
			neededStores.add('User');
			IDBUtils.convertToArray(query.data.user.upsert).forEach((upsert) => {
				const update = {
					where: upsert.where,
					data: { ...upsert.update, ...upsert.create }
				} as Prisma.Args<Prisma.UserDelegate, 'update'>;
				this.client.user
					._getNeededStoresForUpdate(update)
					.forEach((store) => neededStores.add(store));
			});
		}
		return neededStores;
	}
	_getNeededStoresForNestedDelete(neededStores: Set<StoreNames<PrismaIDBSchema>>): void {
		neededStores.add('MacroTargets');
	}
	private _removeNestedCreateData<
		D extends Prisma.Args<Prisma.MacroTargetsDelegate, 'create'>['data']
	>(data: D): Prisma.Result<Prisma.MacroTargetsDelegate, object, 'findFirstOrThrow'> {
		const recordWithoutNestedCreate = structuredClone(data);
		delete recordWithoutNestedCreate?.user;
		return recordWithoutNestedCreate as Prisma.Result<
			Prisma.MacroTargetsDelegate,
			object,
			'findFirstOrThrow'
		>;
	}
	private _preprocessListFields(
		records: Prisma.Result<Prisma.MacroTargetsDelegate, object, 'findMany'>
	): void {}
	async findMany<Q extends Prisma.Args<Prisma.MacroTargetsDelegate, 'findMany'>>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.MacroTargetsDelegate, Q, 'findMany'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		const records = await this._applyWhereClause(
			await tx.objectStore('MacroTargets').getAll(),
			query?.where,
			tx
		);
		await this._applyOrderByClause(records, query?.orderBy, tx);
		const relationAppliedRecords = (await this._applyRelations(
			records,
			tx,
			query
		)) as Prisma.Result<Prisma.MacroTargetsDelegate, object, 'findFirstOrThrow'>[];
		const selectClause = query?.select;
		let selectAppliedRecords = this._applySelectClause(relationAppliedRecords, selectClause);
		if (query?.distinct) {
			const distinctFields = IDBUtils.convertToArray(query.distinct);
			const seen = new Set<string>();
			selectAppliedRecords = selectAppliedRecords.filter((record) => {
				const key = distinctFields.map((field) => record[field]).join('|');
				if (seen.has(key)) return false;
				seen.add(key);
				return true;
			});
		}
		this._preprocessListFields(selectAppliedRecords);
		return selectAppliedRecords as Prisma.Result<Prisma.MacroTargetsDelegate, Q, 'findMany'>;
	}
	async findFirst<Q extends Prisma.Args<Prisma.MacroTargetsDelegate, 'findFirst'>>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.MacroTargetsDelegate, Q, 'findFirst'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		return (await this.findMany(query, tx))[0] ?? null;
	}
	async findFirstOrThrow<Q extends Prisma.Args<Prisma.MacroTargetsDelegate, 'findFirstOrThrow'>>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.MacroTargetsDelegate, Q, 'findFirstOrThrow'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		const record = await this.findFirst(query, tx);
		if (!record) {
			tx.abort();
			throw new Error('Record not found');
		}
		return record;
	}
	async findUnique<Q extends Prisma.Args<Prisma.MacroTargetsDelegate, 'findUnique'>>(
		query: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.MacroTargetsDelegate, Q, 'findUnique'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		let record;
		if (query.where.id !== undefined) {
			record = await tx.objectStore('MacroTargets').get([query.where.id]);
		} else if (query.where.userId !== undefined) {
			record = await tx.objectStore('MacroTargets').index('userIdIndex').get([query.where.userId]);
		}
		if (!record) return null;

		const recordWithRelations = this._applySelectClause(
			await this._applyRelations(
				await this._applyWhereClause([record], query.where, tx),
				tx,
				query
			),
			query.select
		)[0];
		this._preprocessListFields([recordWithRelations]);
		return recordWithRelations as Prisma.Result<Prisma.MacroTargetsDelegate, Q, 'findUnique'>;
	}
	async findUniqueOrThrow<Q extends Prisma.Args<Prisma.MacroTargetsDelegate, 'findUniqueOrThrow'>>(
		query: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.MacroTargetsDelegate, Q, 'findUniqueOrThrow'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		const record = await this.findUnique(query, tx);
		if (!record) {
			tx.abort();
			throw new Error('Record not found');
		}
		return record;
	}
	async count<Q extends Prisma.Args<Prisma.MacroTargetsDelegate, 'count'>>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.MacroTargetsDelegate, Q, 'count'>> {
		tx = tx ?? this.client._db.transaction(['MacroTargets'], 'readonly');
		if (!query?.select || query.select === true) {
			const records = await this.findMany({ where: query?.where }, tx);
			return records.length as Prisma.Result<Prisma.MacroTargetsDelegate, Q, 'count'>;
		}
		const result: Partial<Record<keyof Prisma.MacroTargetsCountAggregateInputType, number>> = {};
		for (const key of Object.keys(query.select)) {
			const typedKey = key as keyof typeof query.select;
			if (typedKey === '_all') {
				result[typedKey] = (await this.findMany({ where: query.where }, tx)).length;
				continue;
			}
			result[typedKey] = (
				await this.findMany({ where: { [`${typedKey}`]: { not: null } } }, tx)
			).length;
		}
		return result as Prisma.Result<Prisma.MacroTargetsDelegate, Q, 'count'>;
	}
	async create<Q extends Prisma.Args<Prisma.MacroTargetsDelegate, 'create'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.MacroTargetsDelegate, Q, 'create'>> {
		const storesNeeded = this._getNeededStoresForCreate(query.data);
		tx = tx ?? this.client._db.transaction(Array.from(storesNeeded), 'readwrite');
		if (query.data.user) {
			const fk: Partial<PrismaIDBSchema['User']['key']> = [];
			if (query.data.user?.create) {
				const record = await this.client.user.create({ data: query.data.user.create }, tx);
				fk[0] = record.id;
			}
			if (query.data.user?.connect) {
				const record = await this.client.user.findUniqueOrThrow(
					{ where: query.data.user.connect },
					tx
				);
				delete query.data.user.connect;
				fk[0] = record.id;
			}
			if (query.data.user?.connectOrCreate) {
				const record = await this.client.user.upsert(
					{
						where: query.data.user.connectOrCreate.where,
						create: query.data.user.connectOrCreate.create,
						update: {}
					},
					tx
				);
				fk[0] = record.id;
			}
			const unsafeData = query.data as Record<string, unknown>;
			unsafeData.userId = fk[0];
			delete unsafeData.user;
		} else if (query.data?.userId !== undefined && query.data.userId !== null) {
			await this.client.user.findUniqueOrThrow(
				{
					where: { id: query.data.userId }
				},
				tx
			);
		}
		const record = this._removeNestedCreateData(await this._fillDefaults(query.data, tx));
		const keyPath = await tx.objectStore('MacroTargets').add(record);
		const data = (await tx.objectStore('MacroTargets').get(keyPath))!;
		const recordsWithRelations = this._applySelectClause(
			await this._applyRelations<object>([data], tx, query),
			query.select
		)[0];
		this._preprocessListFields([recordsWithRelations]);
		this.emit('create', keyPath);
		return recordsWithRelations as Prisma.Result<Prisma.MacroTargetsDelegate, Q, 'create'>;
	}
	async createMany<Q extends Prisma.Args<Prisma.MacroTargetsDelegate, 'createMany'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.MacroTargetsDelegate, Q, 'createMany'>> {
		const createManyData = IDBUtils.convertToArray(query.data);
		tx = tx ?? this.client._db.transaction(['MacroTargets'], 'readwrite');
		for (const createData of createManyData) {
			const record = this._removeNestedCreateData(await this._fillDefaults(createData, tx));
			const keyPath = await tx.objectStore('MacroTargets').add(record);
			this.emit('create', keyPath);
		}
		return { count: createManyData.length };
	}
	async createManyAndReturn<
		Q extends Prisma.Args<Prisma.MacroTargetsDelegate, 'createManyAndReturn'>
	>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.MacroTargetsDelegate, Q, 'createManyAndReturn'>> {
		const createManyData = IDBUtils.convertToArray(query.data);
		const records: Prisma.Result<Prisma.MacroTargetsDelegate, object, 'findMany'> = [];
		tx = tx ?? this.client._db.transaction(['MacroTargets'], 'readwrite');
		for (const createData of createManyData) {
			const record = this._removeNestedCreateData(await this._fillDefaults(createData, tx));
			const keyPath = await tx.objectStore('MacroTargets').add(record);
			this.emit('create', keyPath);
			records.push(this._applySelectClause([record], query.select)[0]);
		}
		this._preprocessListFields(records);
		return records as Prisma.Result<Prisma.MacroTargetsDelegate, Q, 'createManyAndReturn'>;
	}
	async delete<Q extends Prisma.Args<Prisma.MacroTargetsDelegate, 'delete'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.MacroTargetsDelegate, Q, 'delete'>> {
		const storesNeeded = this._getNeededStoresForFind(query);
		this._getNeededStoresForNestedDelete(storesNeeded);
		tx = tx ?? this.client._db.transaction(Array.from(storesNeeded), 'readwrite');
		const record = await this.findUnique(query, tx);
		if (!record) throw new Error('Record not found');
		await tx.objectStore('MacroTargets').delete([record.id]);
		this.emit('delete', [record.id]);
		return record;
	}
	async deleteMany<Q extends Prisma.Args<Prisma.MacroTargetsDelegate, 'deleteMany'>>(
		query?: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.MacroTargetsDelegate, Q, 'deleteMany'>> {
		const storesNeeded = this._getNeededStoresForFind(query);
		this._getNeededStoresForNestedDelete(storesNeeded);
		tx = tx ?? this.client._db.transaction(Array.from(storesNeeded), 'readwrite');
		const records = await this.findMany(query, tx);
		for (const record of records) {
			await this.delete({ where: { id: record.id } }, tx);
		}
		return { count: records.length };
	}
	async update<Q extends Prisma.Args<Prisma.MacroTargetsDelegate, 'update'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.MacroTargetsDelegate, Q, 'update'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForUpdate(query)), 'readwrite');
		const record = await this.findUnique({ where: query.where }, tx);
		if (record === null) {
			tx.abort();
			throw new Error('Record not found');
		}
		const startKeyPath: PrismaIDBSchema['MacroTargets']['key'] = [record.id];
		const stringFields = ['id', 'userId'] as const;
		for (const field of stringFields) {
			IDBUtils.handleStringUpdateField(record, field, query.data[field]);
		}
		const dateTimeFields = ['createdAt'] as const;
		for (const field of dateTimeFields) {
			IDBUtils.handleDateTimeUpdateField(record, field, query.data[field]);
		}
		const intFields = ['caloricChange'] as const;
		for (const field of intFields) {
			IDBUtils.handleIntUpdateField(record, field, query.data[field]);
		}
		const floatFields = ['proteins', 'carbs', 'fats'] as const;
		for (const field of floatFields) {
			IDBUtils.handleFloatUpdateField(record, field, query.data[field]);
		}
		const enumFields = ['quantifier'] as const;
		for (const field of enumFields) {
			IDBUtils.handleEnumUpdateField(record, field, query.data[field]);
		}
		if (query.data.user) {
			if (query.data.user.connect) {
				const other = await this.client.user.findUniqueOrThrow(
					{ where: query.data.user.connect },
					tx
				);
				record.userId = other.id;
			}
			if (query.data.user.create) {
				const other = await this.client.user.create({ data: query.data.user.create }, tx);
				record.userId = other.id;
			}
			if (query.data.user.update) {
				const updateData = query.data.user.update.data ?? query.data.user.update;
				await this.client.user.update(
					{
						where: {
							...query.data.user.update.where,
							id: record.userId!
						} as Prisma.UserWhereUniqueInput,
						data: updateData
					},
					tx
				);
			}
			if (query.data.user.upsert) {
				await this.client.user.upsert(
					{
						where: {
							...query.data.user.upsert.where,
							id: record.userId!
						} as Prisma.UserWhereUniqueInput,
						create: { ...query.data.user.upsert.create, id: record.userId! } as Prisma.Args<
							Prisma.UserDelegate,
							'upsert'
						>['create'],
						update: query.data.user.upsert.update
					},
					tx
				);
			}
			if (query.data.user.connectOrCreate) {
				await this.client.user.upsert(
					{
						where: { ...query.data.user.connectOrCreate.where, id: record.userId! },
						create: {
							...query.data.user.connectOrCreate.create,
							id: record.userId!
						} as Prisma.Args<Prisma.UserDelegate, 'upsert'>['create'],
						update: { id: record.userId! }
					},
					tx
				);
			}
		}
		if (query.data.userId !== undefined) {
			const related = await this.client.user.findUnique({ where: { id: record.userId } }, tx);
			if (!related) throw new Error('Related record not found');
		}
		const endKeyPath: PrismaIDBSchema['MacroTargets']['key'] = [record.id];
		for (let i = 0; i < startKeyPath.length; i++) {
			if (startKeyPath[i] !== endKeyPath[i]) {
				if ((await tx.objectStore('MacroTargets').get(endKeyPath)) !== undefined) {
					throw new Error('Record with the same keyPath already exists');
				}
				await tx.objectStore('MacroTargets').delete(startKeyPath);
				break;
			}
		}
		const keyPath = await tx.objectStore('MacroTargets').put(record);
		this.emit('update', keyPath, startKeyPath);
		for (let i = 0; i < startKeyPath.length; i++) {
			if (startKeyPath[i] !== endKeyPath[i]) {
				break;
			}
		}
		const recordWithRelations = (await this.findUnique(
			{
				where: { id: keyPath[0] }
			},
			tx
		))!;
		return recordWithRelations as Prisma.Result<Prisma.MacroTargetsDelegate, Q, 'update'>;
	}
	async updateMany<Q extends Prisma.Args<Prisma.MacroTargetsDelegate, 'updateMany'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.MacroTargetsDelegate, Q, 'updateMany'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readwrite');
		const records = await this.findMany({ where: query.where }, tx);
		await Promise.all(
			records.map(async (record) => {
				await this.update({ where: { id: record.id }, data: query.data }, tx);
			})
		);
		return { count: records.length };
	}
	async upsert<Q extends Prisma.Args<Prisma.MacroTargetsDelegate, 'upsert'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.MacroTargetsDelegate, Q, 'upsert'>> {
		const neededStores = this._getNeededStoresForUpdate({
			...query,
			data: { ...query.update, ...query.create } as Prisma.Args<
				Prisma.MacroTargetsDelegate,
				'update'
			>['data']
		});
		tx = tx ?? this.client._db.transaction(Array.from(neededStores), 'readwrite');
		let record = await this.findUnique({ where: query.where }, tx);
		if (!record) record = await this.create({ data: query.create }, tx);
		else record = await this.update({ where: query.where, data: query.update }, tx);
		record = await this.findUniqueOrThrow(
			{ where: { id: record.id }, select: query.select, include: query.include },
			tx
		);
		return record as Prisma.Result<Prisma.MacroTargetsDelegate, Q, 'upsert'>;
	}
	async aggregate<Q extends Prisma.Args<Prisma.MacroTargetsDelegate, 'aggregate'>>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.MacroTargetsDelegate, Q, 'aggregate'>> {
		tx = tx ?? this.client._db.transaction(['MacroTargets'], 'readonly');
		const records = await this.findMany({ where: query?.where }, tx);
		const result: Partial<Prisma.Result<Prisma.MacroTargetsDelegate, Q, 'aggregate'>> = {};
		if (query?._count) {
			if (query._count === true) {
				(result._count as number) = records.length;
			} else {
				for (const key of Object.keys(query._count)) {
					const typedKey = key as keyof typeof query._count;
					if (typedKey === '_all') {
						(result._count as Record<string, number>)[typedKey] = records.length;
						continue;
					}
					(result._count as Record<string, number>)[typedKey] = (
						await this.findMany({ where: { [`${typedKey}`]: { not: null } } }, tx)
					).length;
				}
			}
		}
		if (query?._min) {
			const minResult = {} as Prisma.Result<Prisma.MacroTargetsDelegate, Q, 'aggregate'>['_min'];
			const numericFields = ['proteins', 'carbs', 'fats', 'caloricChange'] as const;
			for (const field of numericFields) {
				if (!query._min[field]) continue;
				const values = records
					.map((record) => record[field] as number)
					.filter((value) => value !== undefined);
				(minResult[field as keyof typeof minResult] as number) = Math.min(...values);
			}
			const dateTimeFields = ['createdAt'] as const;
			for (const field of dateTimeFields) {
				if (!query._min[field]) continue;
				const values = records
					.map((record) => record[field]?.getTime())
					.filter((value) => value !== undefined);
				(minResult[field as keyof typeof minResult] as Date) = new Date(Math.min(...values));
			}
			const stringFields = ['id', 'userId'] as const;
			for (const field of stringFields) {
				if (!query._min[field]) continue;
				const values = records
					.map((record) => record[field] as string)
					.filter((value) => value !== undefined);
				(minResult[field as keyof typeof minResult] as string) = values.sort()[0];
			}
			result._min = minResult;
		}
		if (query?._max) {
			const maxResult = {} as Prisma.Result<Prisma.MacroTargetsDelegate, Q, 'aggregate'>['_max'];
			const numericFields = ['proteins', 'carbs', 'fats', 'caloricChange'] as const;
			for (const field of numericFields) {
				if (!query._max[field]) continue;
				const values = records
					.map((record) => record[field] as number)
					.filter((value) => value !== undefined);
				(maxResult[field as keyof typeof maxResult] as number) = Math.max(...values);
			}
			const dateTimeFields = ['createdAt'] as const;
			for (const field of dateTimeFields) {
				if (!query._max[field]) continue;
				const values = records
					.map((record) => record[field]?.getTime())
					.filter((value) => value !== undefined);
				(maxResult[field as keyof typeof maxResult] as Date) = new Date(Math.max(...values));
			}
			const stringFields = ['id', 'userId'] as const;
			for (const field of stringFields) {
				if (!query._max[field]) continue;
				const values = records
					.map((record) => record[field] as string)
					.filter((value) => value !== undefined);
				(maxResult[field as keyof typeof maxResult] as string) = values.sort().reverse()[0];
			}
			result._max = maxResult;
		}
		if (query?._avg) {
			const avgResult = {} as Prisma.Result<Prisma.MacroTargetsDelegate, Q, 'aggregate'>['_avg'];
			for (const untypedField of Object.keys(query._avg)) {
				const field = untypedField as keyof (typeof records)[number];
				const values = records.map((record) => record[field] as number);
				(avgResult[field as keyof typeof avgResult] as number) =
					values.reduce((a, b) => a + b, 0) / values.length;
			}
			result._avg = avgResult;
		}
		if (query?._sum) {
			const sumResult = {} as Prisma.Result<Prisma.MacroTargetsDelegate, Q, 'aggregate'>['_sum'];
			for (const untypedField of Object.keys(query._sum)) {
				const field = untypedField as keyof (typeof records)[number];
				const values = records.map((record) => record[field] as number);
				(sumResult[field as keyof typeof sumResult] as number) = values.reduce((a, b) => a + b, 0);
			}
			result._sum = sumResult;
		}
		return result as unknown as Prisma.Result<Prisma.MacroTargetsDelegate, Q, 'aggregate'>;
	}
}
class MacroMetricsIDBClass extends BaseIDBModelClass<'MacroMetrics'> {
	private async _applyWhereClause<
		W extends Prisma.Args<Prisma.MacroMetricsDelegate, 'findFirstOrThrow'>['where'],
		R extends Prisma.Result<Prisma.MacroMetricsDelegate, object, 'findFirstOrThrow'>
	>(records: R[], whereClause: W, tx: IDBUtils.TransactionType): Promise<R[]> {
		if (!whereClause) return records;
		records = await IDBUtils.applyLogicalFilters<Prisma.MacroMetricsDelegate, R, W>(
			records,
			whereClause,
			tx,
			this.keyPath,
			this._applyWhereClause.bind(this)
		);
		return (
			await Promise.all(
				records.map(async (record) => {
					const stringFields = ['id', 'userId'] as const;
					for (const field of stringFields) {
						if (!IDBUtils.whereStringFilter(record, field, whereClause[field])) return null;
					}
					const numberFields = ['bodyweight', 'height', 'bodyFatPercentage', 'age'] as const;
					for (const field of numberFields) {
						if (!IDBUtils.whereNumberFilter(record, field, whereClause[field])) return null;
					}
					const dateTimeFields = ['createdAt'] as const;
					for (const field of dateTimeFields) {
						if (!IDBUtils.whereDateTimeFilter(record, field, whereClause[field])) return null;
					}
					if (whereClause.user) {
						const { is, isNot, ...rest } = whereClause.user;
						if (is !== null && is !== undefined) {
							const relatedRecord = await this.client.user.findFirst(
								{ where: { ...is, id: record.userId } },
								tx
							);
							if (!relatedRecord) return null;
						}
						if (isNot !== null && isNot !== undefined) {
							const relatedRecord = await this.client.user.findFirst(
								{ where: { ...isNot, id: record.userId } },
								tx
							);
							if (relatedRecord) return null;
						}
						if (Object.keys(rest).length) {
							const relatedRecord = await this.client.user.findFirst(
								{ where: { ...whereClause.user, id: record.userId } },
								tx
							);
							if (!relatedRecord) return null;
						}
					}
					return record;
				})
			)
		).filter((result) => result !== null);
	}
	private _applySelectClause<
		S extends Prisma.Args<Prisma.MacroMetricsDelegate, 'findMany'>['select']
	>(
		records: Prisma.Result<Prisma.MacroMetricsDelegate, object, 'findFirstOrThrow'>[],
		selectClause: S
	): Prisma.Result<Prisma.MacroMetricsDelegate, { select: S }, 'findFirstOrThrow'>[] {
		if (!selectClause) {
			return records as Prisma.Result<
				Prisma.MacroMetricsDelegate,
				{ select: S },
				'findFirstOrThrow'
			>[];
		}
		return records.map((record) => {
			const partialRecord: Partial<typeof record> = record;
			for (const untypedKey of [
				'id',
				'createdAt',
				'bodyweight',
				'bodyweightUnit',
				'height',
				'heightUnit',
				'bodyFatPercentage',
				'age',
				'gender',
				'user',
				'userId'
			]) {
				const key = untypedKey as keyof typeof record & keyof S;
				if (!selectClause[key]) delete partialRecord[key];
			}
			return partialRecord;
		}) as Prisma.Result<Prisma.MacroMetricsDelegate, { select: S }, 'findFirstOrThrow'>[];
	}
	private async _applyRelations<Q extends Prisma.Args<Prisma.MacroMetricsDelegate, 'findMany'>>(
		records: Prisma.Result<Prisma.MacroMetricsDelegate, object, 'findFirstOrThrow'>[],
		tx: IDBUtils.TransactionType,
		query?: Q
	): Promise<Prisma.Result<Prisma.MacroMetricsDelegate, Q, 'findFirstOrThrow'>[]> {
		if (!query)
			return records as Prisma.Result<Prisma.MacroMetricsDelegate, Q, 'findFirstOrThrow'>[];
		const recordsWithRelations = records.map(async (record) => {
			const unsafeRecord = record as Record<string, unknown>;
			const attach_user = query.select?.user || query.include?.user;
			if (attach_user) {
				unsafeRecord['user'] = await this.client.user.findUnique(
					{
						...(attach_user === true ? {} : attach_user),
						where: { id: record.userId! }
					},
					tx
				);
			}
			return unsafeRecord;
		});
		return (await Promise.all(recordsWithRelations)) as Prisma.Result<
			Prisma.MacroMetricsDelegate,
			Q,
			'findFirstOrThrow'
		>[];
	}
	async _applyOrderByClause<
		O extends Prisma.Args<Prisma.MacroMetricsDelegate, 'findMany'>['orderBy'],
		R extends Prisma.Result<Prisma.MacroMetricsDelegate, object, 'findFirstOrThrow'>
	>(records: R[], orderByClause: O, tx: IDBUtils.TransactionType): Promise<void> {
		if (orderByClause === undefined) return;
		const orderByClauses = IDBUtils.convertToArray(orderByClause);
		const indexedKeys = await Promise.all(
			records.map(async (record) => {
				const keys = await Promise.all(
					orderByClauses.map(async (clause) => await this._resolveOrderByKey(record, clause, tx))
				);
				return { keys, record };
			})
		);
		indexedKeys.sort((a, b) => {
			for (let i = 0; i < orderByClauses.length; i++) {
				const clause = orderByClauses[i];
				const comparison = IDBUtils.genericComparator(
					a.keys[i],
					b.keys[i],
					this._resolveSortOrder(clause)
				);
				if (comparison !== 0) return comparison;
			}
			return 0;
		});
		for (let i = 0; i < records.length; i++) {
			records[i] = indexedKeys[i].record;
		}
	}
	async _resolveOrderByKey(
		record: Prisma.Result<Prisma.MacroMetricsDelegate, object, 'findFirstOrThrow'>,
		orderByInput: Prisma.MacroMetricsOrderByWithRelationInput,
		tx: IDBUtils.TransactionType
	): Promise<unknown> {
		const scalarFields = [
			'id',
			'createdAt',
			'bodyweight',
			'bodyweightUnit',
			'height',
			'heightUnit',
			'bodyFatPercentage',
			'age',
			'gender',
			'userId'
		] as const;
		for (const field of scalarFields) if (orderByInput[field]) return record[field];
		if (orderByInput.user) {
			return await this.client.user._resolveOrderByKey(
				await this.client.user.findFirstOrThrow({ where: { id: record.userId } }),
				orderByInput.user,
				tx
			);
		}
	}
	_resolveSortOrder(
		orderByInput: Prisma.MacroMetricsOrderByWithRelationInput
	): Prisma.SortOrder | { sort: Prisma.SortOrder; nulls?: 'first' | 'last' } {
		const scalarFields = [
			'id',
			'createdAt',
			'bodyweight',
			'bodyweightUnit',
			'height',
			'heightUnit',
			'bodyFatPercentage',
			'age',
			'gender',
			'userId'
		] as const;
		for (const field of scalarFields) if (orderByInput[field]) return orderByInput[field];
		if (orderByInput.user) {
			return this.client.user._resolveSortOrder(orderByInput.user);
		}
		throw new Error('No field in orderBy clause');
	}
	private async _fillDefaults<D extends Prisma.Args<Prisma.MacroMetricsDelegate, 'create'>['data']>(
		data: D,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<D> {
		if (data === undefined) data = {} as NonNullable<D>;
		if (data.id === undefined) {
			data.id = uuidv4();
		}
		if (data.createdAt === undefined) {
			data.createdAt = new Date();
		}
		if (typeof data.createdAt === 'string') {
			data.createdAt = new Date(data.createdAt);
		}
		return data;
	}
	_getNeededStoresForWhere<W extends Prisma.Args<Prisma.MacroMetricsDelegate, 'findMany'>['where']>(
		whereClause: W,
		neededStores: Set<StoreNames<PrismaIDBSchema>>
	) {
		if (whereClause === undefined) return;
		for (const param of IDBUtils.LogicalParams) {
			if (whereClause[param]) {
				for (const clause of IDBUtils.convertToArray(whereClause[param])) {
					this._getNeededStoresForWhere(clause, neededStores);
				}
			}
		}
		if (whereClause.user) {
			neededStores.add('User');
			this.client.user._getNeededStoresForWhere(whereClause.user, neededStores);
		}
	}
	_getNeededStoresForFind<Q extends Prisma.Args<Prisma.MacroMetricsDelegate, 'findMany'>>(
		query?: Q
	): Set<StoreNames<PrismaIDBSchema>> {
		const neededStores: Set<StoreNames<PrismaIDBSchema>> = new Set();
		neededStores.add('MacroMetrics');
		this._getNeededStoresForWhere(query?.where, neededStores);
		if (query?.orderBy) {
			const orderBy = IDBUtils.convertToArray(query.orderBy);
			const orderBy_user = orderBy.find((clause) => clause.user);
			if (orderBy_user) {
				this.client.user
					._getNeededStoresForFind({ orderBy: orderBy_user.user })
					.forEach((storeName) => neededStores.add(storeName));
			}
		}
		if (query?.select?.user || query?.include?.user) {
			neededStores.add('User');
			if (typeof query.select?.user === 'object') {
				this.client.user
					._getNeededStoresForFind(query.select.user)
					.forEach((storeName) => neededStores.add(storeName));
			}
			if (typeof query.include?.user === 'object') {
				this.client.user
					._getNeededStoresForFind(query.include.user)
					.forEach((storeName) => neededStores.add(storeName));
			}
		}
		return neededStores;
	}
	_getNeededStoresForCreate<
		D extends Partial<Prisma.Args<Prisma.MacroMetricsDelegate, 'create'>['data']>
	>(data: D): Set<StoreNames<PrismaIDBSchema>> {
		const neededStores: Set<StoreNames<PrismaIDBSchema>> = new Set();
		neededStores.add('MacroMetrics');
		if (data?.user) {
			neededStores.add('User');
			if (data.user.create) {
				const createData = Array.isArray(data.user.create) ? data.user.create : [data.user.create];
				createData.forEach((record) =>
					this.client.user
						._getNeededStoresForCreate(record)
						.forEach((storeName) => neededStores.add(storeName))
				);
			}
			if (data.user.connectOrCreate) {
				IDBUtils.convertToArray(data.user.connectOrCreate).forEach((record) =>
					this.client.user
						._getNeededStoresForCreate(record.create)
						.forEach((storeName) => neededStores.add(storeName))
				);
			}
		}
		if (data?.userId !== undefined) {
			neededStores.add('User');
		}
		return neededStores;
	}
	_getNeededStoresForUpdate<Q extends Prisma.Args<Prisma.MacroMetricsDelegate, 'update'>>(
		query: Partial<Q>
	): Set<StoreNames<PrismaIDBSchema>> {
		const neededStores = this._getNeededStoresForFind(query).union(
			this._getNeededStoresForCreate(
				query.data as Prisma.Args<Prisma.MacroMetricsDelegate, 'create'>['data']
			)
		);
		if (query.data?.user?.connect) {
			neededStores.add('User');
			IDBUtils.convertToArray(query.data.user.connect).forEach((connect) => {
				this.client.user._getNeededStoresForWhere(connect, neededStores);
			});
		}
		if (query.data?.user?.update) {
			neededStores.add('User');
			IDBUtils.convertToArray(query.data.user.update).forEach((update) => {
				this.client.user
					._getNeededStoresForUpdate(update as Prisma.Args<Prisma.UserDelegate, 'update'>)
					.forEach((store) => neededStores.add(store));
			});
		}
		if (query.data?.user?.upsert) {
			neededStores.add('User');
			IDBUtils.convertToArray(query.data.user.upsert).forEach((upsert) => {
				const update = {
					where: upsert.where,
					data: { ...upsert.update, ...upsert.create }
				} as Prisma.Args<Prisma.UserDelegate, 'update'>;
				this.client.user
					._getNeededStoresForUpdate(update)
					.forEach((store) => neededStores.add(store));
			});
		}
		return neededStores;
	}
	_getNeededStoresForNestedDelete(neededStores: Set<StoreNames<PrismaIDBSchema>>): void {
		neededStores.add('MacroMetrics');
	}
	private _removeNestedCreateData<
		D extends Prisma.Args<Prisma.MacroMetricsDelegate, 'create'>['data']
	>(data: D): Prisma.Result<Prisma.MacroMetricsDelegate, object, 'findFirstOrThrow'> {
		const recordWithoutNestedCreate = structuredClone(data);
		delete recordWithoutNestedCreate?.user;
		return recordWithoutNestedCreate as Prisma.Result<
			Prisma.MacroMetricsDelegate,
			object,
			'findFirstOrThrow'
		>;
	}
	private _preprocessListFields(
		records: Prisma.Result<Prisma.MacroMetricsDelegate, object, 'findMany'>
	): void {}
	async findMany<Q extends Prisma.Args<Prisma.MacroMetricsDelegate, 'findMany'>>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.MacroMetricsDelegate, Q, 'findMany'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		const records = await this._applyWhereClause(
			await tx.objectStore('MacroMetrics').getAll(),
			query?.where,
			tx
		);
		await this._applyOrderByClause(records, query?.orderBy, tx);
		const relationAppliedRecords = (await this._applyRelations(
			records,
			tx,
			query
		)) as Prisma.Result<Prisma.MacroMetricsDelegate, object, 'findFirstOrThrow'>[];
		const selectClause = query?.select;
		let selectAppliedRecords = this._applySelectClause(relationAppliedRecords, selectClause);
		if (query?.distinct) {
			const distinctFields = IDBUtils.convertToArray(query.distinct);
			const seen = new Set<string>();
			selectAppliedRecords = selectAppliedRecords.filter((record) => {
				const key = distinctFields.map((field) => record[field]).join('|');
				if (seen.has(key)) return false;
				seen.add(key);
				return true;
			});
		}
		this._preprocessListFields(selectAppliedRecords);
		return selectAppliedRecords as Prisma.Result<Prisma.MacroMetricsDelegate, Q, 'findMany'>;
	}
	async findFirst<Q extends Prisma.Args<Prisma.MacroMetricsDelegate, 'findFirst'>>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.MacroMetricsDelegate, Q, 'findFirst'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		return (await this.findMany(query, tx))[0] ?? null;
	}
	async findFirstOrThrow<Q extends Prisma.Args<Prisma.MacroMetricsDelegate, 'findFirstOrThrow'>>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.MacroMetricsDelegate, Q, 'findFirstOrThrow'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		const record = await this.findFirst(query, tx);
		if (!record) {
			tx.abort();
			throw new Error('Record not found');
		}
		return record;
	}
	async findUnique<Q extends Prisma.Args<Prisma.MacroMetricsDelegate, 'findUnique'>>(
		query: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.MacroMetricsDelegate, Q, 'findUnique'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		let record;
		if (query.where.id !== undefined) {
			record = await tx.objectStore('MacroMetrics').get([query.where.id]);
		}
		if (!record) return null;

		const recordWithRelations = this._applySelectClause(
			await this._applyRelations(
				await this._applyWhereClause([record], query.where, tx),
				tx,
				query
			),
			query.select
		)[0];
		this._preprocessListFields([recordWithRelations]);
		return recordWithRelations as Prisma.Result<Prisma.MacroMetricsDelegate, Q, 'findUnique'>;
	}
	async findUniqueOrThrow<Q extends Prisma.Args<Prisma.MacroMetricsDelegate, 'findUniqueOrThrow'>>(
		query: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.MacroMetricsDelegate, Q, 'findUniqueOrThrow'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		const record = await this.findUnique(query, tx);
		if (!record) {
			tx.abort();
			throw new Error('Record not found');
		}
		return record;
	}
	async count<Q extends Prisma.Args<Prisma.MacroMetricsDelegate, 'count'>>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.MacroMetricsDelegate, Q, 'count'>> {
		tx = tx ?? this.client._db.transaction(['MacroMetrics'], 'readonly');
		if (!query?.select || query.select === true) {
			const records = await this.findMany({ where: query?.where }, tx);
			return records.length as Prisma.Result<Prisma.MacroMetricsDelegate, Q, 'count'>;
		}
		const result: Partial<Record<keyof Prisma.MacroMetricsCountAggregateInputType, number>> = {};
		for (const key of Object.keys(query.select)) {
			const typedKey = key as keyof typeof query.select;
			if (typedKey === '_all') {
				result[typedKey] = (await this.findMany({ where: query.where }, tx)).length;
				continue;
			}
			result[typedKey] = (
				await this.findMany({ where: { [`${typedKey}`]: { not: null } } }, tx)
			).length;
		}
		return result as Prisma.Result<Prisma.MacroMetricsDelegate, Q, 'count'>;
	}
	async create<Q extends Prisma.Args<Prisma.MacroMetricsDelegate, 'create'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.MacroMetricsDelegate, Q, 'create'>> {
		const storesNeeded = this._getNeededStoresForCreate(query.data);
		tx = tx ?? this.client._db.transaction(Array.from(storesNeeded), 'readwrite');
		if (query.data.user) {
			const fk: Partial<PrismaIDBSchema['User']['key']> = [];
			if (query.data.user?.create) {
				const record = await this.client.user.create({ data: query.data.user.create }, tx);
				fk[0] = record.id;
			}
			if (query.data.user?.connect) {
				const record = await this.client.user.findUniqueOrThrow(
					{ where: query.data.user.connect },
					tx
				);
				delete query.data.user.connect;
				fk[0] = record.id;
			}
			if (query.data.user?.connectOrCreate) {
				const record = await this.client.user.upsert(
					{
						where: query.data.user.connectOrCreate.where,
						create: query.data.user.connectOrCreate.create,
						update: {}
					},
					tx
				);
				fk[0] = record.id;
			}
			const unsafeData = query.data as Record<string, unknown>;
			unsafeData.userId = fk[0];
			delete unsafeData.user;
		} else if (query.data?.userId !== undefined && query.data.userId !== null) {
			await this.client.user.findUniqueOrThrow(
				{
					where: { id: query.data.userId }
				},
				tx
			);
		}
		const record = this._removeNestedCreateData(await this._fillDefaults(query.data, tx));
		const keyPath = await tx.objectStore('MacroMetrics').add(record);
		const data = (await tx.objectStore('MacroMetrics').get(keyPath))!;
		const recordsWithRelations = this._applySelectClause(
			await this._applyRelations<object>([data], tx, query),
			query.select
		)[0];
		this._preprocessListFields([recordsWithRelations]);
		this.emit('create', keyPath);
		return recordsWithRelations as Prisma.Result<Prisma.MacroMetricsDelegate, Q, 'create'>;
	}
	async createMany<Q extends Prisma.Args<Prisma.MacroMetricsDelegate, 'createMany'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.MacroMetricsDelegate, Q, 'createMany'>> {
		const createManyData = IDBUtils.convertToArray(query.data);
		tx = tx ?? this.client._db.transaction(['MacroMetrics'], 'readwrite');
		for (const createData of createManyData) {
			const record = this._removeNestedCreateData(await this._fillDefaults(createData, tx));
			const keyPath = await tx.objectStore('MacroMetrics').add(record);
			this.emit('create', keyPath);
		}
		return { count: createManyData.length };
	}
	async createManyAndReturn<
		Q extends Prisma.Args<Prisma.MacroMetricsDelegate, 'createManyAndReturn'>
	>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.MacroMetricsDelegate, Q, 'createManyAndReturn'>> {
		const createManyData = IDBUtils.convertToArray(query.data);
		const records: Prisma.Result<Prisma.MacroMetricsDelegate, object, 'findMany'> = [];
		tx = tx ?? this.client._db.transaction(['MacroMetrics'], 'readwrite');
		for (const createData of createManyData) {
			const record = this._removeNestedCreateData(await this._fillDefaults(createData, tx));
			const keyPath = await tx.objectStore('MacroMetrics').add(record);
			this.emit('create', keyPath);
			records.push(this._applySelectClause([record], query.select)[0]);
		}
		this._preprocessListFields(records);
		return records as Prisma.Result<Prisma.MacroMetricsDelegate, Q, 'createManyAndReturn'>;
	}
	async delete<Q extends Prisma.Args<Prisma.MacroMetricsDelegate, 'delete'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.MacroMetricsDelegate, Q, 'delete'>> {
		const storesNeeded = this._getNeededStoresForFind(query);
		this._getNeededStoresForNestedDelete(storesNeeded);
		tx = tx ?? this.client._db.transaction(Array.from(storesNeeded), 'readwrite');
		const record = await this.findUnique(query, tx);
		if (!record) throw new Error('Record not found');
		await tx.objectStore('MacroMetrics').delete([record.id]);
		this.emit('delete', [record.id]);
		return record;
	}
	async deleteMany<Q extends Prisma.Args<Prisma.MacroMetricsDelegate, 'deleteMany'>>(
		query?: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.MacroMetricsDelegate, Q, 'deleteMany'>> {
		const storesNeeded = this._getNeededStoresForFind(query);
		this._getNeededStoresForNestedDelete(storesNeeded);
		tx = tx ?? this.client._db.transaction(Array.from(storesNeeded), 'readwrite');
		const records = await this.findMany(query, tx);
		for (const record of records) {
			await this.delete({ where: { id: record.id } }, tx);
		}
		return { count: records.length };
	}
	async update<Q extends Prisma.Args<Prisma.MacroMetricsDelegate, 'update'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.MacroMetricsDelegate, Q, 'update'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForUpdate(query)), 'readwrite');
		const record = await this.findUnique({ where: query.where }, tx);
		if (record === null) {
			tx.abort();
			throw new Error('Record not found');
		}
		const startKeyPath: PrismaIDBSchema['MacroMetrics']['key'] = [record.id];
		const stringFields = ['id', 'userId'] as const;
		for (const field of stringFields) {
			IDBUtils.handleStringUpdateField(record, field, query.data[field]);
		}
		const dateTimeFields = ['createdAt'] as const;
		for (const field of dateTimeFields) {
			IDBUtils.handleDateTimeUpdateField(record, field, query.data[field]);
		}
		const intFields = ['age'] as const;
		for (const field of intFields) {
			IDBUtils.handleIntUpdateField(record, field, query.data[field]);
		}
		const floatFields = ['bodyweight', 'height', 'bodyFatPercentage'] as const;
		for (const field of floatFields) {
			IDBUtils.handleFloatUpdateField(record, field, query.data[field]);
		}
		const enumFields = ['bodyweightUnit', 'heightUnit', 'gender'] as const;
		for (const field of enumFields) {
			IDBUtils.handleEnumUpdateField(record, field, query.data[field]);
		}
		if (query.data.user) {
			if (query.data.user.connect) {
				const other = await this.client.user.findUniqueOrThrow(
					{ where: query.data.user.connect },
					tx
				);
				record.userId = other.id;
			}
			if (query.data.user.create) {
				const other = await this.client.user.create({ data: query.data.user.create }, tx);
				record.userId = other.id;
			}
			if (query.data.user.update) {
				const updateData = query.data.user.update.data ?? query.data.user.update;
				await this.client.user.update(
					{
						where: {
							...query.data.user.update.where,
							id: record.userId!
						} as Prisma.UserWhereUniqueInput,
						data: updateData
					},
					tx
				);
			}
			if (query.data.user.upsert) {
				await this.client.user.upsert(
					{
						where: {
							...query.data.user.upsert.where,
							id: record.userId!
						} as Prisma.UserWhereUniqueInput,
						create: { ...query.data.user.upsert.create, id: record.userId! } as Prisma.Args<
							Prisma.UserDelegate,
							'upsert'
						>['create'],
						update: query.data.user.upsert.update
					},
					tx
				);
			}
			if (query.data.user.connectOrCreate) {
				await this.client.user.upsert(
					{
						where: { ...query.data.user.connectOrCreate.where, id: record.userId! },
						create: {
							...query.data.user.connectOrCreate.create,
							id: record.userId!
						} as Prisma.Args<Prisma.UserDelegate, 'upsert'>['create'],
						update: { id: record.userId! }
					},
					tx
				);
			}
		}
		if (query.data.userId !== undefined) {
			const related = await this.client.user.findUnique({ where: { id: record.userId } }, tx);
			if (!related) throw new Error('Related record not found');
		}
		const endKeyPath: PrismaIDBSchema['MacroMetrics']['key'] = [record.id];
		for (let i = 0; i < startKeyPath.length; i++) {
			if (startKeyPath[i] !== endKeyPath[i]) {
				if ((await tx.objectStore('MacroMetrics').get(endKeyPath)) !== undefined) {
					throw new Error('Record with the same keyPath already exists');
				}
				await tx.objectStore('MacroMetrics').delete(startKeyPath);
				break;
			}
		}
		const keyPath = await tx.objectStore('MacroMetrics').put(record);
		this.emit('update', keyPath, startKeyPath);
		for (let i = 0; i < startKeyPath.length; i++) {
			if (startKeyPath[i] !== endKeyPath[i]) {
				break;
			}
		}
		const recordWithRelations = (await this.findUnique(
			{
				where: { id: keyPath[0] }
			},
			tx
		))!;
		return recordWithRelations as Prisma.Result<Prisma.MacroMetricsDelegate, Q, 'update'>;
	}
	async updateMany<Q extends Prisma.Args<Prisma.MacroMetricsDelegate, 'updateMany'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.MacroMetricsDelegate, Q, 'updateMany'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readwrite');
		const records = await this.findMany({ where: query.where }, tx);
		await Promise.all(
			records.map(async (record) => {
				await this.update({ where: { id: record.id }, data: query.data }, tx);
			})
		);
		return { count: records.length };
	}
	async upsert<Q extends Prisma.Args<Prisma.MacroMetricsDelegate, 'upsert'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.MacroMetricsDelegate, Q, 'upsert'>> {
		const neededStores = this._getNeededStoresForUpdate({
			...query,
			data: { ...query.update, ...query.create } as Prisma.Args<
				Prisma.MacroMetricsDelegate,
				'update'
			>['data']
		});
		tx = tx ?? this.client._db.transaction(Array.from(neededStores), 'readwrite');
		let record = await this.findUnique({ where: query.where }, tx);
		if (!record) record = await this.create({ data: query.create }, tx);
		else record = await this.update({ where: query.where, data: query.update }, tx);
		record = await this.findUniqueOrThrow(
			{ where: { id: record.id }, select: query.select, include: query.include },
			tx
		);
		return record as Prisma.Result<Prisma.MacroMetricsDelegate, Q, 'upsert'>;
	}
	async aggregate<Q extends Prisma.Args<Prisma.MacroMetricsDelegate, 'aggregate'>>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.MacroMetricsDelegate, Q, 'aggregate'>> {
		tx = tx ?? this.client._db.transaction(['MacroMetrics'], 'readonly');
		const records = await this.findMany({ where: query?.where }, tx);
		const result: Partial<Prisma.Result<Prisma.MacroMetricsDelegate, Q, 'aggregate'>> = {};
		if (query?._count) {
			if (query._count === true) {
				(result._count as number) = records.length;
			} else {
				for (const key of Object.keys(query._count)) {
					const typedKey = key as keyof typeof query._count;
					if (typedKey === '_all') {
						(result._count as Record<string, number>)[typedKey] = records.length;
						continue;
					}
					(result._count as Record<string, number>)[typedKey] = (
						await this.findMany({ where: { [`${typedKey}`]: { not: null } } }, tx)
					).length;
				}
			}
		}
		if (query?._min) {
			const minResult = {} as Prisma.Result<Prisma.MacroMetricsDelegate, Q, 'aggregate'>['_min'];
			const numericFields = ['bodyweight', 'height', 'bodyFatPercentage', 'age'] as const;
			for (const field of numericFields) {
				if (!query._min[field]) continue;
				const values = records
					.map((record) => record[field] as number)
					.filter((value) => value !== undefined);
				(minResult[field as keyof typeof minResult] as number) = Math.min(...values);
			}
			const dateTimeFields = ['createdAt'] as const;
			for (const field of dateTimeFields) {
				if (!query._min[field]) continue;
				const values = records
					.map((record) => record[field]?.getTime())
					.filter((value) => value !== undefined);
				(minResult[field as keyof typeof minResult] as Date) = new Date(Math.min(...values));
			}
			const stringFields = ['id', 'userId'] as const;
			for (const field of stringFields) {
				if (!query._min[field]) continue;
				const values = records
					.map((record) => record[field] as string)
					.filter((value) => value !== undefined);
				(minResult[field as keyof typeof minResult] as string) = values.sort()[0];
			}
			result._min = minResult;
		}
		if (query?._max) {
			const maxResult = {} as Prisma.Result<Prisma.MacroMetricsDelegate, Q, 'aggregate'>['_max'];
			const numericFields = ['bodyweight', 'height', 'bodyFatPercentage', 'age'] as const;
			for (const field of numericFields) {
				if (!query._max[field]) continue;
				const values = records
					.map((record) => record[field] as number)
					.filter((value) => value !== undefined);
				(maxResult[field as keyof typeof maxResult] as number) = Math.max(...values);
			}
			const dateTimeFields = ['createdAt'] as const;
			for (const field of dateTimeFields) {
				if (!query._max[field]) continue;
				const values = records
					.map((record) => record[field]?.getTime())
					.filter((value) => value !== undefined);
				(maxResult[field as keyof typeof maxResult] as Date) = new Date(Math.max(...values));
			}
			const stringFields = ['id', 'userId'] as const;
			for (const field of stringFields) {
				if (!query._max[field]) continue;
				const values = records
					.map((record) => record[field] as string)
					.filter((value) => value !== undefined);
				(maxResult[field as keyof typeof maxResult] as string) = values.sort().reverse()[0];
			}
			result._max = maxResult;
		}
		if (query?._avg) {
			const avgResult = {} as Prisma.Result<Prisma.MacroMetricsDelegate, Q, 'aggregate'>['_avg'];
			for (const untypedField of Object.keys(query._avg)) {
				const field = untypedField as keyof (typeof records)[number];
				const values = records.map((record) => record[field] as number);
				(avgResult[field as keyof typeof avgResult] as number) =
					values.reduce((a, b) => a + b, 0) / values.length;
			}
			result._avg = avgResult;
		}
		if (query?._sum) {
			const sumResult = {} as Prisma.Result<Prisma.MacroMetricsDelegate, Q, 'aggregate'>['_sum'];
			for (const untypedField of Object.keys(query._sum)) {
				const field = untypedField as keyof (typeof records)[number];
				const values = records.map((record) => record[field] as number);
				(sumResult[field as keyof typeof sumResult] as number) = values.reduce((a, b) => a + b, 0);
			}
			result._sum = sumResult;
		}
		return result as unknown as Prisma.Result<Prisma.MacroMetricsDelegate, Q, 'aggregate'>;
	}
}
class MacroActivityTrackingPreferencesIDBClass extends BaseIDBModelClass<'MacroActivityTrackingPreferences'> {
	private async _applyWhereClause<
		W extends Prisma.Args<
			Prisma.MacroActivityTrackingPreferencesDelegate,
			'findFirstOrThrow'
		>['where'],
		R extends Prisma.Result<
			Prisma.MacroActivityTrackingPreferencesDelegate,
			object,
			'findFirstOrThrow'
		>
	>(records: R[], whereClause: W, tx: IDBUtils.TransactionType): Promise<R[]> {
		if (!whereClause) return records;
		records = await IDBUtils.applyLogicalFilters<
			Prisma.MacroActivityTrackingPreferencesDelegate,
			R,
			W
		>(records, whereClause, tx, this.keyPath, this._applyWhereClause.bind(this));
		return (
			await Promise.all(
				records.map(async (record) => {
					const stringFields = ['id', 'userId'] as const;
					for (const field of stringFields) {
						if (!IDBUtils.whereStringFilter(record, field, whereClause[field])) return null;
					}
					const numberFields = ['staticCalories'] as const;
					for (const field of numberFields) {
						if (!IDBUtils.whereNumberFilter(record, field, whereClause[field])) return null;
					}
					if (whereClause.user) {
						const { is, isNot, ...rest } = whereClause.user;
						if (is !== null && is !== undefined) {
							const relatedRecord = await this.client.user.findFirst(
								{ where: { ...is, id: record.userId } },
								tx
							);
							if (!relatedRecord) return null;
						}
						if (isNot !== null && isNot !== undefined) {
							const relatedRecord = await this.client.user.findFirst(
								{ where: { ...isNot, id: record.userId } },
								tx
							);
							if (relatedRecord) return null;
						}
						if (Object.keys(rest).length) {
							const relatedRecord = await this.client.user.findFirst(
								{ where: { ...whereClause.user, id: record.userId } },
								tx
							);
							if (!relatedRecord) return null;
						}
					}
					return record;
				})
			)
		).filter((result) => result !== null);
	}
	private _applySelectClause<
		S extends Prisma.Args<Prisma.MacroActivityTrackingPreferencesDelegate, 'findMany'>['select']
	>(
		records: Prisma.Result<
			Prisma.MacroActivityTrackingPreferencesDelegate,
			object,
			'findFirstOrThrow'
		>[],
		selectClause: S
	): Prisma.Result<
		Prisma.MacroActivityTrackingPreferencesDelegate,
		{ select: S },
		'findFirstOrThrow'
	>[] {
		if (!selectClause) {
			return records as Prisma.Result<
				Prisma.MacroActivityTrackingPreferencesDelegate,
				{ select: S },
				'findFirstOrThrow'
			>[];
		}
		return records.map((record) => {
			const partialRecord: Partial<typeof record> = record;
			for (const untypedKey of ['id', 'userId', 'adjustmentType', 'staticCalories', 'user']) {
				const key = untypedKey as keyof typeof record & keyof S;
				if (!selectClause[key]) delete partialRecord[key];
			}
			return partialRecord;
		}) as Prisma.Result<
			Prisma.MacroActivityTrackingPreferencesDelegate,
			{ select: S },
			'findFirstOrThrow'
		>[];
	}
	private async _applyRelations<
		Q extends Prisma.Args<Prisma.MacroActivityTrackingPreferencesDelegate, 'findMany'>
	>(
		records: Prisma.Result<
			Prisma.MacroActivityTrackingPreferencesDelegate,
			object,
			'findFirstOrThrow'
		>[],
		tx: IDBUtils.TransactionType,
		query?: Q
	): Promise<
		Prisma.Result<Prisma.MacroActivityTrackingPreferencesDelegate, Q, 'findFirstOrThrow'>[]
	> {
		if (!query)
			return records as Prisma.Result<
				Prisma.MacroActivityTrackingPreferencesDelegate,
				Q,
				'findFirstOrThrow'
			>[];
		const recordsWithRelations = records.map(async (record) => {
			const unsafeRecord = record as Record<string, unknown>;
			const attach_user = query.select?.user || query.include?.user;
			if (attach_user) {
				unsafeRecord['user'] = await this.client.user.findUnique(
					{
						...(attach_user === true ? {} : attach_user),
						where: { id: record.userId! }
					},
					tx
				);
			}
			return unsafeRecord;
		});
		return (await Promise.all(recordsWithRelations)) as Prisma.Result<
			Prisma.MacroActivityTrackingPreferencesDelegate,
			Q,
			'findFirstOrThrow'
		>[];
	}
	async _applyOrderByClause<
		O extends Prisma.Args<Prisma.MacroActivityTrackingPreferencesDelegate, 'findMany'>['orderBy'],
		R extends Prisma.Result<
			Prisma.MacroActivityTrackingPreferencesDelegate,
			object,
			'findFirstOrThrow'
		>
	>(records: R[], orderByClause: O, tx: IDBUtils.TransactionType): Promise<void> {
		if (orderByClause === undefined) return;
		const orderByClauses = IDBUtils.convertToArray(orderByClause);
		const indexedKeys = await Promise.all(
			records.map(async (record) => {
				const keys = await Promise.all(
					orderByClauses.map(async (clause) => await this._resolveOrderByKey(record, clause, tx))
				);
				return { keys, record };
			})
		);
		indexedKeys.sort((a, b) => {
			for (let i = 0; i < orderByClauses.length; i++) {
				const clause = orderByClauses[i];
				const comparison = IDBUtils.genericComparator(
					a.keys[i],
					b.keys[i],
					this._resolveSortOrder(clause)
				);
				if (comparison !== 0) return comparison;
			}
			return 0;
		});
		for (let i = 0; i < records.length; i++) {
			records[i] = indexedKeys[i].record;
		}
	}
	async _resolveOrderByKey(
		record: Prisma.Result<
			Prisma.MacroActivityTrackingPreferencesDelegate,
			object,
			'findFirstOrThrow'
		>,
		orderByInput: Prisma.MacroActivityTrackingPreferencesOrderByWithRelationInput,
		tx: IDBUtils.TransactionType
	): Promise<unknown> {
		const scalarFields = ['id', 'userId', 'adjustmentType', 'staticCalories'] as const;
		for (const field of scalarFields) if (orderByInput[field]) return record[field];
		if (orderByInput.user) {
			return await this.client.user._resolveOrderByKey(
				await this.client.user.findFirstOrThrow({ where: { id: record.userId } }),
				orderByInput.user,
				tx
			);
		}
	}
	_resolveSortOrder(
		orderByInput: Prisma.MacroActivityTrackingPreferencesOrderByWithRelationInput
	): Prisma.SortOrder | { sort: Prisma.SortOrder; nulls?: 'first' | 'last' } {
		const scalarFields = ['id', 'userId', 'adjustmentType', 'staticCalories'] as const;
		for (const field of scalarFields) if (orderByInput[field]) return orderByInput[field];
		if (orderByInput.user) {
			return this.client.user._resolveSortOrder(orderByInput.user);
		}
		throw new Error('No field in orderBy clause');
	}
	private async _fillDefaults<
		D extends Prisma.Args<Prisma.MacroActivityTrackingPreferencesDelegate, 'create'>['data']
	>(data: D, tx?: IDBUtils.ReadwriteTransactionType): Promise<D> {
		if (data === undefined) data = {} as NonNullable<D>;
		if (data.id === undefined) {
			data.id = uuidv4();
		}
		if (data.staticCalories === undefined) {
			data.staticCalories = null;
		}
		return data;
	}
	_getNeededStoresForWhere<
		W extends Prisma.Args<Prisma.MacroActivityTrackingPreferencesDelegate, 'findMany'>['where']
	>(whereClause: W, neededStores: Set<StoreNames<PrismaIDBSchema>>) {
		if (whereClause === undefined) return;
		for (const param of IDBUtils.LogicalParams) {
			if (whereClause[param]) {
				for (const clause of IDBUtils.convertToArray(whereClause[param])) {
					this._getNeededStoresForWhere(clause, neededStores);
				}
			}
		}
		if (whereClause.user) {
			neededStores.add('User');
			this.client.user._getNeededStoresForWhere(whereClause.user, neededStores);
		}
	}
	_getNeededStoresForFind<
		Q extends Prisma.Args<Prisma.MacroActivityTrackingPreferencesDelegate, 'findMany'>
	>(query?: Q): Set<StoreNames<PrismaIDBSchema>> {
		const neededStores: Set<StoreNames<PrismaIDBSchema>> = new Set();
		neededStores.add('MacroActivityTrackingPreferences');
		this._getNeededStoresForWhere(query?.where, neededStores);
		if (query?.orderBy) {
			const orderBy = IDBUtils.convertToArray(query.orderBy);
			const orderBy_user = orderBy.find((clause) => clause.user);
			if (orderBy_user) {
				this.client.user
					._getNeededStoresForFind({ orderBy: orderBy_user.user })
					.forEach((storeName) => neededStores.add(storeName));
			}
		}
		if (query?.select?.user || query?.include?.user) {
			neededStores.add('User');
			if (typeof query.select?.user === 'object') {
				this.client.user
					._getNeededStoresForFind(query.select.user)
					.forEach((storeName) => neededStores.add(storeName));
			}
			if (typeof query.include?.user === 'object') {
				this.client.user
					._getNeededStoresForFind(query.include.user)
					.forEach((storeName) => neededStores.add(storeName));
			}
		}
		return neededStores;
	}
	_getNeededStoresForCreate<
		D extends Partial<
			Prisma.Args<Prisma.MacroActivityTrackingPreferencesDelegate, 'create'>['data']
		>
	>(data: D): Set<StoreNames<PrismaIDBSchema>> {
		const neededStores: Set<StoreNames<PrismaIDBSchema>> = new Set();
		neededStores.add('MacroActivityTrackingPreferences');
		if (data?.user) {
			neededStores.add('User');
			if (data.user.create) {
				const createData = Array.isArray(data.user.create) ? data.user.create : [data.user.create];
				createData.forEach((record) =>
					this.client.user
						._getNeededStoresForCreate(record)
						.forEach((storeName) => neededStores.add(storeName))
				);
			}
			if (data.user.connectOrCreate) {
				IDBUtils.convertToArray(data.user.connectOrCreate).forEach((record) =>
					this.client.user
						._getNeededStoresForCreate(record.create)
						.forEach((storeName) => neededStores.add(storeName))
				);
			}
		}
		if (data?.userId !== undefined) {
			neededStores.add('User');
		}
		return neededStores;
	}
	_getNeededStoresForUpdate<
		Q extends Prisma.Args<Prisma.MacroActivityTrackingPreferencesDelegate, 'update'>
	>(query: Partial<Q>): Set<StoreNames<PrismaIDBSchema>> {
		const neededStores = this._getNeededStoresForFind(query).union(
			this._getNeededStoresForCreate(
				query.data as Prisma.Args<Prisma.MacroActivityTrackingPreferencesDelegate, 'create'>['data']
			)
		);
		if (query.data?.user?.connect) {
			neededStores.add('User');
			IDBUtils.convertToArray(query.data.user.connect).forEach((connect) => {
				this.client.user._getNeededStoresForWhere(connect, neededStores);
			});
		}
		if (query.data?.user?.update) {
			neededStores.add('User');
			IDBUtils.convertToArray(query.data.user.update).forEach((update) => {
				this.client.user
					._getNeededStoresForUpdate(update as Prisma.Args<Prisma.UserDelegate, 'update'>)
					.forEach((store) => neededStores.add(store));
			});
		}
		if (query.data?.user?.upsert) {
			neededStores.add('User');
			IDBUtils.convertToArray(query.data.user.upsert).forEach((upsert) => {
				const update = {
					where: upsert.where,
					data: { ...upsert.update, ...upsert.create }
				} as Prisma.Args<Prisma.UserDelegate, 'update'>;
				this.client.user
					._getNeededStoresForUpdate(update)
					.forEach((store) => neededStores.add(store));
			});
		}
		return neededStores;
	}
	_getNeededStoresForNestedDelete(neededStores: Set<StoreNames<PrismaIDBSchema>>): void {
		neededStores.add('MacroActivityTrackingPreferences');
	}
	private _removeNestedCreateData<
		D extends Prisma.Args<Prisma.MacroActivityTrackingPreferencesDelegate, 'create'>['data']
	>(
		data: D
	): Prisma.Result<Prisma.MacroActivityTrackingPreferencesDelegate, object, 'findFirstOrThrow'> {
		const recordWithoutNestedCreate = structuredClone(data);
		delete recordWithoutNestedCreate?.user;
		return recordWithoutNestedCreate as Prisma.Result<
			Prisma.MacroActivityTrackingPreferencesDelegate,
			object,
			'findFirstOrThrow'
		>;
	}
	private _preprocessListFields(
		records: Prisma.Result<Prisma.MacroActivityTrackingPreferencesDelegate, object, 'findMany'>
	): void {}
	async findMany<
		Q extends Prisma.Args<Prisma.MacroActivityTrackingPreferencesDelegate, 'findMany'>
	>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.MacroActivityTrackingPreferencesDelegate, Q, 'findMany'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		const records = await this._applyWhereClause(
			await tx.objectStore('MacroActivityTrackingPreferences').getAll(),
			query?.where,
			tx
		);
		await this._applyOrderByClause(records, query?.orderBy, tx);
		const relationAppliedRecords = (await this._applyRelations(
			records,
			tx,
			query
		)) as Prisma.Result<
			Prisma.MacroActivityTrackingPreferencesDelegate,
			object,
			'findFirstOrThrow'
		>[];
		const selectClause = query?.select;
		let selectAppliedRecords = this._applySelectClause(relationAppliedRecords, selectClause);
		if (query?.distinct) {
			const distinctFields = IDBUtils.convertToArray(query.distinct);
			const seen = new Set<string>();
			selectAppliedRecords = selectAppliedRecords.filter((record) => {
				const key = distinctFields.map((field) => record[field]).join('|');
				if (seen.has(key)) return false;
				seen.add(key);
				return true;
			});
		}
		this._preprocessListFields(selectAppliedRecords);
		return selectAppliedRecords as Prisma.Result<
			Prisma.MacroActivityTrackingPreferencesDelegate,
			Q,
			'findMany'
		>;
	}
	async findFirst<
		Q extends Prisma.Args<Prisma.MacroActivityTrackingPreferencesDelegate, 'findFirst'>
	>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.MacroActivityTrackingPreferencesDelegate, Q, 'findFirst'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		return (await this.findMany(query, tx))[0] ?? null;
	}
	async findFirstOrThrow<
		Q extends Prisma.Args<Prisma.MacroActivityTrackingPreferencesDelegate, 'findFirstOrThrow'>
	>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<
		Prisma.Result<Prisma.MacroActivityTrackingPreferencesDelegate, Q, 'findFirstOrThrow'>
	> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		const record = await this.findFirst(query, tx);
		if (!record) {
			tx.abort();
			throw new Error('Record not found');
		}
		return record;
	}
	async findUnique<
		Q extends Prisma.Args<Prisma.MacroActivityTrackingPreferencesDelegate, 'findUnique'>
	>(
		query: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.MacroActivityTrackingPreferencesDelegate, Q, 'findUnique'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		let record;
		if (query.where.id !== undefined) {
			record = await tx.objectStore('MacroActivityTrackingPreferences').get([query.where.id]);
		} else if (query.where.userId !== undefined) {
			record = await tx
				.objectStore('MacroActivityTrackingPreferences')
				.index('userIdIndex')
				.get([query.where.userId]);
		}
		if (!record) return null;

		const recordWithRelations = this._applySelectClause(
			await this._applyRelations(
				await this._applyWhereClause([record], query.where, tx),
				tx,
				query
			),
			query.select
		)[0];
		this._preprocessListFields([recordWithRelations]);
		return recordWithRelations as Prisma.Result<
			Prisma.MacroActivityTrackingPreferencesDelegate,
			Q,
			'findUnique'
		>;
	}
	async findUniqueOrThrow<
		Q extends Prisma.Args<Prisma.MacroActivityTrackingPreferencesDelegate, 'findUniqueOrThrow'>
	>(
		query: Q,
		tx?: IDBUtils.TransactionType
	): Promise<
		Prisma.Result<Prisma.MacroActivityTrackingPreferencesDelegate, Q, 'findUniqueOrThrow'>
	> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		const record = await this.findUnique(query, tx);
		if (!record) {
			tx.abort();
			throw new Error('Record not found');
		}
		return record;
	}
	async count<Q extends Prisma.Args<Prisma.MacroActivityTrackingPreferencesDelegate, 'count'>>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.MacroActivityTrackingPreferencesDelegate, Q, 'count'>> {
		tx = tx ?? this.client._db.transaction(['MacroActivityTrackingPreferences'], 'readonly');
		if (!query?.select || query.select === true) {
			const records = await this.findMany({ where: query?.where }, tx);
			return records.length as Prisma.Result<
				Prisma.MacroActivityTrackingPreferencesDelegate,
				Q,
				'count'
			>;
		}
		const result: Partial<
			Record<keyof Prisma.MacroActivityTrackingPreferencesCountAggregateInputType, number>
		> = {};
		for (const key of Object.keys(query.select)) {
			const typedKey = key as keyof typeof query.select;
			if (typedKey === '_all') {
				result[typedKey] = (await this.findMany({ where: query.where }, tx)).length;
				continue;
			}
			result[typedKey] = (
				await this.findMany({ where: { [`${typedKey}`]: { not: null } } }, tx)
			).length;
		}
		return result as Prisma.Result<Prisma.MacroActivityTrackingPreferencesDelegate, Q, 'count'>;
	}
	async create<Q extends Prisma.Args<Prisma.MacroActivityTrackingPreferencesDelegate, 'create'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.MacroActivityTrackingPreferencesDelegate, Q, 'create'>> {
		const storesNeeded = this._getNeededStoresForCreate(query.data);
		tx = tx ?? this.client._db.transaction(Array.from(storesNeeded), 'readwrite');
		if (query.data.user) {
			const fk: Partial<PrismaIDBSchema['User']['key']> = [];
			if (query.data.user?.create) {
				const record = await this.client.user.create({ data: query.data.user.create }, tx);
				fk[0] = record.id;
			}
			if (query.data.user?.connect) {
				const record = await this.client.user.findUniqueOrThrow(
					{ where: query.data.user.connect },
					tx
				);
				delete query.data.user.connect;
				fk[0] = record.id;
			}
			if (query.data.user?.connectOrCreate) {
				const record = await this.client.user.upsert(
					{
						where: query.data.user.connectOrCreate.where,
						create: query.data.user.connectOrCreate.create,
						update: {}
					},
					tx
				);
				fk[0] = record.id;
			}
			const unsafeData = query.data as Record<string, unknown>;
			unsafeData.userId = fk[0];
			delete unsafeData.user;
		} else if (query.data?.userId !== undefined && query.data.userId !== null) {
			await this.client.user.findUniqueOrThrow(
				{
					where: { id: query.data.userId }
				},
				tx
			);
		}
		const record = this._removeNestedCreateData(await this._fillDefaults(query.data, tx));
		const keyPath = await tx.objectStore('MacroActivityTrackingPreferences').add(record);
		const data = (await tx.objectStore('MacroActivityTrackingPreferences').get(keyPath))!;
		const recordsWithRelations = this._applySelectClause(
			await this._applyRelations<object>([data], tx, query),
			query.select
		)[0];
		this._preprocessListFields([recordsWithRelations]);
		this.emit('create', keyPath);
		return recordsWithRelations as Prisma.Result<
			Prisma.MacroActivityTrackingPreferencesDelegate,
			Q,
			'create'
		>;
	}
	async createMany<
		Q extends Prisma.Args<Prisma.MacroActivityTrackingPreferencesDelegate, 'createMany'>
	>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.MacroActivityTrackingPreferencesDelegate, Q, 'createMany'>> {
		const createManyData = IDBUtils.convertToArray(query.data);
		tx = tx ?? this.client._db.transaction(['MacroActivityTrackingPreferences'], 'readwrite');
		for (const createData of createManyData) {
			const record = this._removeNestedCreateData(await this._fillDefaults(createData, tx));
			const keyPath = await tx.objectStore('MacroActivityTrackingPreferences').add(record);
			this.emit('create', keyPath);
		}
		return { count: createManyData.length };
	}
	async createManyAndReturn<
		Q extends Prisma.Args<Prisma.MacroActivityTrackingPreferencesDelegate, 'createManyAndReturn'>
	>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<
		Prisma.Result<Prisma.MacroActivityTrackingPreferencesDelegate, Q, 'createManyAndReturn'>
	> {
		const createManyData = IDBUtils.convertToArray(query.data);
		const records: Prisma.Result<
			Prisma.MacroActivityTrackingPreferencesDelegate,
			object,
			'findMany'
		> = [];
		tx = tx ?? this.client._db.transaction(['MacroActivityTrackingPreferences'], 'readwrite');
		for (const createData of createManyData) {
			const record = this._removeNestedCreateData(await this._fillDefaults(createData, tx));
			const keyPath = await tx.objectStore('MacroActivityTrackingPreferences').add(record);
			this.emit('create', keyPath);
			records.push(this._applySelectClause([record], query.select)[0]);
		}
		this._preprocessListFields(records);
		return records as Prisma.Result<
			Prisma.MacroActivityTrackingPreferencesDelegate,
			Q,
			'createManyAndReturn'
		>;
	}
	async delete<Q extends Prisma.Args<Prisma.MacroActivityTrackingPreferencesDelegate, 'delete'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.MacroActivityTrackingPreferencesDelegate, Q, 'delete'>> {
		const storesNeeded = this._getNeededStoresForFind(query);
		this._getNeededStoresForNestedDelete(storesNeeded);
		tx = tx ?? this.client._db.transaction(Array.from(storesNeeded), 'readwrite');
		const record = await this.findUnique(query, tx);
		if (!record) throw new Error('Record not found');
		await tx.objectStore('MacroActivityTrackingPreferences').delete([record.id]);
		this.emit('delete', [record.id]);
		return record;
	}
	async deleteMany<
		Q extends Prisma.Args<Prisma.MacroActivityTrackingPreferencesDelegate, 'deleteMany'>
	>(
		query?: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.MacroActivityTrackingPreferencesDelegate, Q, 'deleteMany'>> {
		const storesNeeded = this._getNeededStoresForFind(query);
		this._getNeededStoresForNestedDelete(storesNeeded);
		tx = tx ?? this.client._db.transaction(Array.from(storesNeeded), 'readwrite');
		const records = await this.findMany(query, tx);
		for (const record of records) {
			await this.delete({ where: { id: record.id } }, tx);
		}
		return { count: records.length };
	}
	async update<Q extends Prisma.Args<Prisma.MacroActivityTrackingPreferencesDelegate, 'update'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.MacroActivityTrackingPreferencesDelegate, Q, 'update'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForUpdate(query)), 'readwrite');
		const record = await this.findUnique({ where: query.where }, tx);
		if (record === null) {
			tx.abort();
			throw new Error('Record not found');
		}
		const startKeyPath: PrismaIDBSchema['MacroActivityTrackingPreferences']['key'] = [record.id];
		const stringFields = ['id', 'userId'] as const;
		for (const field of stringFields) {
			IDBUtils.handleStringUpdateField(record, field, query.data[field]);
		}
		const intFields = ['staticCalories'] as const;
		for (const field of intFields) {
			IDBUtils.handleIntUpdateField(record, field, query.data[field]);
		}
		const enumFields = ['adjustmentType'] as const;
		for (const field of enumFields) {
			IDBUtils.handleEnumUpdateField(record, field, query.data[field]);
		}
		if (query.data.user) {
			if (query.data.user.connect) {
				const other = await this.client.user.findUniqueOrThrow(
					{ where: query.data.user.connect },
					tx
				);
				record.userId = other.id;
			}
			if (query.data.user.create) {
				const other = await this.client.user.create({ data: query.data.user.create }, tx);
				record.userId = other.id;
			}
			if (query.data.user.update) {
				const updateData = query.data.user.update.data ?? query.data.user.update;
				await this.client.user.update(
					{
						where: {
							...query.data.user.update.where,
							id: record.userId!
						} as Prisma.UserWhereUniqueInput,
						data: updateData
					},
					tx
				);
			}
			if (query.data.user.upsert) {
				await this.client.user.upsert(
					{
						where: {
							...query.data.user.upsert.where,
							id: record.userId!
						} as Prisma.UserWhereUniqueInput,
						create: { ...query.data.user.upsert.create, id: record.userId! } as Prisma.Args<
							Prisma.UserDelegate,
							'upsert'
						>['create'],
						update: query.data.user.upsert.update
					},
					tx
				);
			}
			if (query.data.user.connectOrCreate) {
				await this.client.user.upsert(
					{
						where: { ...query.data.user.connectOrCreate.where, id: record.userId! },
						create: {
							...query.data.user.connectOrCreate.create,
							id: record.userId!
						} as Prisma.Args<Prisma.UserDelegate, 'upsert'>['create'],
						update: { id: record.userId! }
					},
					tx
				);
			}
		}
		if (query.data.userId !== undefined) {
			const related = await this.client.user.findUnique({ where: { id: record.userId } }, tx);
			if (!related) throw new Error('Related record not found');
		}
		const endKeyPath: PrismaIDBSchema['MacroActivityTrackingPreferences']['key'] = [record.id];
		for (let i = 0; i < startKeyPath.length; i++) {
			if (startKeyPath[i] !== endKeyPath[i]) {
				if (
					(await tx.objectStore('MacroActivityTrackingPreferences').get(endKeyPath)) !== undefined
				) {
					throw new Error('Record with the same keyPath already exists');
				}
				await tx.objectStore('MacroActivityTrackingPreferences').delete(startKeyPath);
				break;
			}
		}
		const keyPath = await tx.objectStore('MacroActivityTrackingPreferences').put(record);
		this.emit('update', keyPath, startKeyPath);
		for (let i = 0; i < startKeyPath.length; i++) {
			if (startKeyPath[i] !== endKeyPath[i]) {
				break;
			}
		}
		const recordWithRelations = (await this.findUnique(
			{
				where: { id: keyPath[0] }
			},
			tx
		))!;
		return recordWithRelations as Prisma.Result<
			Prisma.MacroActivityTrackingPreferencesDelegate,
			Q,
			'update'
		>;
	}
	async updateMany<
		Q extends Prisma.Args<Prisma.MacroActivityTrackingPreferencesDelegate, 'updateMany'>
	>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.MacroActivityTrackingPreferencesDelegate, Q, 'updateMany'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readwrite');
		const records = await this.findMany({ where: query.where }, tx);
		await Promise.all(
			records.map(async (record) => {
				await this.update({ where: { id: record.id }, data: query.data }, tx);
			})
		);
		return { count: records.length };
	}
	async upsert<Q extends Prisma.Args<Prisma.MacroActivityTrackingPreferencesDelegate, 'upsert'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.MacroActivityTrackingPreferencesDelegate, Q, 'upsert'>> {
		const neededStores = this._getNeededStoresForUpdate({
			...query,
			data: { ...query.update, ...query.create } as Prisma.Args<
				Prisma.MacroActivityTrackingPreferencesDelegate,
				'update'
			>['data']
		});
		tx = tx ?? this.client._db.transaction(Array.from(neededStores), 'readwrite');
		let record = await this.findUnique({ where: query.where }, tx);
		if (!record) record = await this.create({ data: query.create }, tx);
		else record = await this.update({ where: query.where, data: query.update }, tx);
		record = await this.findUniqueOrThrow(
			{ where: { id: record.id }, select: query.select, include: query.include },
			tx
		);
		return record as Prisma.Result<Prisma.MacroActivityTrackingPreferencesDelegate, Q, 'upsert'>;
	}
	async aggregate<
		Q extends Prisma.Args<Prisma.MacroActivityTrackingPreferencesDelegate, 'aggregate'>
	>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.MacroActivityTrackingPreferencesDelegate, Q, 'aggregate'>> {
		tx = tx ?? this.client._db.transaction(['MacroActivityTrackingPreferences'], 'readonly');
		const records = await this.findMany({ where: query?.where }, tx);
		const result: Partial<
			Prisma.Result<Prisma.MacroActivityTrackingPreferencesDelegate, Q, 'aggregate'>
		> = {};
		if (query?._count) {
			if (query._count === true) {
				(result._count as number) = records.length;
			} else {
				for (const key of Object.keys(query._count)) {
					const typedKey = key as keyof typeof query._count;
					if (typedKey === '_all') {
						(result._count as Record<string, number>)[typedKey] = records.length;
						continue;
					}
					(result._count as Record<string, number>)[typedKey] = (
						await this.findMany({ where: { [`${typedKey}`]: { not: null } } }, tx)
					).length;
				}
			}
		}
		if (query?._min) {
			const minResult = {} as Prisma.Result<
				Prisma.MacroActivityTrackingPreferencesDelegate,
				Q,
				'aggregate'
			>['_min'];
			const numericFields = ['staticCalories'] as const;
			for (const field of numericFields) {
				if (!query._min[field]) continue;
				const values = records
					.map((record) => record[field] as number)
					.filter((value) => value !== undefined);
				(minResult[field as keyof typeof minResult] as number) = Math.min(...values);
			}
			const stringFields = ['id', 'userId'] as const;
			for (const field of stringFields) {
				if (!query._min[field]) continue;
				const values = records
					.map((record) => record[field] as string)
					.filter((value) => value !== undefined);
				(minResult[field as keyof typeof minResult] as string) = values.sort()[0];
			}
			result._min = minResult;
		}
		if (query?._max) {
			const maxResult = {} as Prisma.Result<
				Prisma.MacroActivityTrackingPreferencesDelegate,
				Q,
				'aggregate'
			>['_max'];
			const numericFields = ['staticCalories'] as const;
			for (const field of numericFields) {
				if (!query._max[field]) continue;
				const values = records
					.map((record) => record[field] as number)
					.filter((value) => value !== undefined);
				(maxResult[field as keyof typeof maxResult] as number) = Math.max(...values);
			}
			const stringFields = ['id', 'userId'] as const;
			for (const field of stringFields) {
				if (!query._max[field]) continue;
				const values = records
					.map((record) => record[field] as string)
					.filter((value) => value !== undefined);
				(maxResult[field as keyof typeof maxResult] as string) = values.sort().reverse()[0];
			}
			result._max = maxResult;
		}
		if (query?._avg) {
			const avgResult = {} as Prisma.Result<
				Prisma.MacroActivityTrackingPreferencesDelegate,
				Q,
				'aggregate'
			>['_avg'];
			for (const untypedField of Object.keys(query._avg)) {
				const field = untypedField as keyof (typeof records)[number];
				const values = records.map((record) => record[field] as number);
				(avgResult[field as keyof typeof avgResult] as number) =
					values.reduce((a, b) => a + b, 0) / values.length;
			}
			result._avg = avgResult;
		}
		if (query?._sum) {
			const sumResult = {} as Prisma.Result<
				Prisma.MacroActivityTrackingPreferencesDelegate,
				Q,
				'aggregate'
			>['_sum'];
			for (const untypedField of Object.keys(query._sum)) {
				const field = untypedField as keyof (typeof records)[number];
				const values = records.map((record) => record[field] as number);
				(sumResult[field as keyof typeof sumResult] as number) = values.reduce((a, b) => a + b, 0);
			}
			result._sum = sumResult;
		}
		return result as unknown as Prisma.Result<
			Prisma.MacroActivityTrackingPreferencesDelegate,
			Q,
			'aggregate'
		>;
	}
}
class FoodEntryIDBClass extends BaseIDBModelClass<'FoodEntry'> {
	private async _applyWhereClause<
		W extends Prisma.Args<Prisma.FoodEntryDelegate, 'findFirstOrThrow'>['where'],
		R extends Prisma.Result<Prisma.FoodEntryDelegate, object, 'findFirstOrThrow'>
	>(records: R[], whereClause: W, tx: IDBUtils.TransactionType): Promise<R[]> {
		if (!whereClause) return records;
		records = await IDBUtils.applyLogicalFilters<Prisma.FoodEntryDelegate, R, W>(
			records,
			whereClause,
			tx,
			this.keyPath,
			this._applyWhereClause.bind(this)
		);
		return (
			await Promise.all(
				records.map(async (record) => {
					const stringFields = ['id', 'quantityUnit', 'userId'] as const;
					for (const field of stringFields) {
						if (!IDBUtils.whereStringFilter(record, field, whereClause[field])) return null;
					}
					const numberFields = ['quantity', 'nutritionDataId'] as const;
					for (const field of numberFields) {
						if (!IDBUtils.whereNumberFilter(record, field, whereClause[field])) return null;
					}
					const dateTimeFields = ['eatenAt'] as const;
					for (const field of dateTimeFields) {
						if (!IDBUtils.whereDateTimeFilter(record, field, whereClause[field])) return null;
					}
					if (whereClause.nutritionData === null) {
						if (record.nutritionDataId !== null) return null;
					}
					if (whereClause.nutritionData) {
						const { is, isNot, ...rest } = whereClause.nutritionData;
						if (is === null) {
							if (record.nutritionDataId !== null) return null;
						}
						if (is !== null && is !== undefined) {
							if (record.nutritionDataId === null) return null;
							const relatedRecord = await this.client.nutritionData.findFirst(
								{ where: { ...is, id: record.nutritionDataId } },
								tx
							);
							if (!relatedRecord) return null;
						}
						if (isNot === null) {
							if (record.nutritionDataId === null) return null;
						}
						if (isNot !== null && isNot !== undefined) {
							if (record.nutritionDataId === null) return null;
							const relatedRecord = await this.client.nutritionData.findFirst(
								{ where: { ...isNot, id: record.nutritionDataId } },
								tx
							);
							if (relatedRecord) return null;
						}
						if (Object.keys(rest).length) {
							if (record.nutritionDataId === null) return null;
							const relatedRecord = await this.client.nutritionData.findFirst(
								{ where: { ...whereClause.nutritionData, id: record.nutritionDataId } },
								tx
							);
							if (!relatedRecord) return null;
						}
					}
					if (whereClause.user) {
						const { is, isNot, ...rest } = whereClause.user;
						if (is !== null && is !== undefined) {
							const relatedRecord = await this.client.user.findFirst(
								{ where: { ...is, id: record.userId } },
								tx
							);
							if (!relatedRecord) return null;
						}
						if (isNot !== null && isNot !== undefined) {
							const relatedRecord = await this.client.user.findFirst(
								{ where: { ...isNot, id: record.userId } },
								tx
							);
							if (relatedRecord) return null;
						}
						if (Object.keys(rest).length) {
							const relatedRecord = await this.client.user.findFirst(
								{ where: { ...whereClause.user, id: record.userId } },
								tx
							);
							if (!relatedRecord) return null;
						}
					}
					return record;
				})
			)
		).filter((result) => result !== null);
	}
	private _applySelectClause<S extends Prisma.Args<Prisma.FoodEntryDelegate, 'findMany'>['select']>(
		records: Prisma.Result<Prisma.FoodEntryDelegate, object, 'findFirstOrThrow'>[],
		selectClause: S
	): Prisma.Result<Prisma.FoodEntryDelegate, { select: S }, 'findFirstOrThrow'>[] {
		if (!selectClause) {
			return records as Prisma.Result<
				Prisma.FoodEntryDelegate,
				{ select: S },
				'findFirstOrThrow'
			>[];
		}
		return records.map((record) => {
			const partialRecord: Partial<typeof record> = record;
			for (const untypedKey of [
				'id',
				'eatenAt',
				'quantity',
				'quantityUnit',
				'nutritionData',
				'nutritionDataId',
				'user',
				'userId'
			]) {
				const key = untypedKey as keyof typeof record & keyof S;
				if (!selectClause[key]) delete partialRecord[key];
			}
			return partialRecord;
		}) as Prisma.Result<Prisma.FoodEntryDelegate, { select: S }, 'findFirstOrThrow'>[];
	}
	private async _applyRelations<Q extends Prisma.Args<Prisma.FoodEntryDelegate, 'findMany'>>(
		records: Prisma.Result<Prisma.FoodEntryDelegate, object, 'findFirstOrThrow'>[],
		tx: IDBUtils.TransactionType,
		query?: Q
	): Promise<Prisma.Result<Prisma.FoodEntryDelegate, Q, 'findFirstOrThrow'>[]> {
		if (!query) return records as Prisma.Result<Prisma.FoodEntryDelegate, Q, 'findFirstOrThrow'>[];
		const recordsWithRelations = records.map(async (record) => {
			const unsafeRecord = record as Record<string, unknown>;
			const attach_nutritionData = query.select?.nutritionData || query.include?.nutritionData;
			if (attach_nutritionData) {
				unsafeRecord['nutritionData'] =
					record.nutritionDataId === null
						? null
						: await this.client.nutritionData.findUnique(
								{
									...(attach_nutritionData === true ? {} : attach_nutritionData),
									where: { id: record.nutritionDataId! }
								},
								tx
							);
			}
			const attach_user = query.select?.user || query.include?.user;
			if (attach_user) {
				unsafeRecord['user'] = await this.client.user.findUnique(
					{
						...(attach_user === true ? {} : attach_user),
						where: { id: record.userId! }
					},
					tx
				);
			}
			return unsafeRecord;
		});
		return (await Promise.all(recordsWithRelations)) as Prisma.Result<
			Prisma.FoodEntryDelegate,
			Q,
			'findFirstOrThrow'
		>[];
	}
	async _applyOrderByClause<
		O extends Prisma.Args<Prisma.FoodEntryDelegate, 'findMany'>['orderBy'],
		R extends Prisma.Result<Prisma.FoodEntryDelegate, object, 'findFirstOrThrow'>
	>(records: R[], orderByClause: O, tx: IDBUtils.TransactionType): Promise<void> {
		if (orderByClause === undefined) return;
		const orderByClauses = IDBUtils.convertToArray(orderByClause);
		const indexedKeys = await Promise.all(
			records.map(async (record) => {
				const keys = await Promise.all(
					orderByClauses.map(async (clause) => await this._resolveOrderByKey(record, clause, tx))
				);
				return { keys, record };
			})
		);
		indexedKeys.sort((a, b) => {
			for (let i = 0; i < orderByClauses.length; i++) {
				const clause = orderByClauses[i];
				const comparison = IDBUtils.genericComparator(
					a.keys[i],
					b.keys[i],
					this._resolveSortOrder(clause)
				);
				if (comparison !== 0) return comparison;
			}
			return 0;
		});
		for (let i = 0; i < records.length; i++) {
			records[i] = indexedKeys[i].record;
		}
	}
	async _resolveOrderByKey(
		record: Prisma.Result<Prisma.FoodEntryDelegate, object, 'findFirstOrThrow'>,
		orderByInput: Prisma.FoodEntryOrderByWithRelationInput,
		tx: IDBUtils.TransactionType
	): Promise<unknown> {
		const scalarFields = [
			'id',
			'eatenAt',
			'quantity',
			'quantityUnit',
			'nutritionDataId',
			'userId'
		] as const;
		for (const field of scalarFields) if (orderByInput[field]) return record[field];
		if (orderByInput.nutritionData) {
			return record.nutritionDataId === null
				? null
				: await this.client.nutritionData._resolveOrderByKey(
						await this.client.nutritionData.findFirstOrThrow({
							where: { id: record.nutritionDataId }
						}),
						orderByInput.nutritionData,
						tx
					);
		}
		if (orderByInput.user) {
			return await this.client.user._resolveOrderByKey(
				await this.client.user.findFirstOrThrow({ where: { id: record.userId } }),
				orderByInput.user,
				tx
			);
		}
	}
	_resolveSortOrder(
		orderByInput: Prisma.FoodEntryOrderByWithRelationInput
	): Prisma.SortOrder | { sort: Prisma.SortOrder; nulls?: 'first' | 'last' } {
		const scalarFields = [
			'id',
			'eatenAt',
			'quantity',
			'quantityUnit',
			'nutritionDataId',
			'userId'
		] as const;
		for (const field of scalarFields) if (orderByInput[field]) return orderByInput[field];
		if (orderByInput.nutritionData) {
			return this.client.nutritionData._resolveSortOrder(orderByInput.nutritionData);
		}
		if (orderByInput.user) {
			return this.client.user._resolveSortOrder(orderByInput.user);
		}
		throw new Error('No field in orderBy clause');
	}
	private async _fillDefaults<D extends Prisma.Args<Prisma.FoodEntryDelegate, 'create'>['data']>(
		data: D,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<D> {
		if (data === undefined) data = {} as NonNullable<D>;
		if (data.id === undefined) {
			data.id = uuidv4();
		}
		if (data.quantityUnit === undefined) {
			data.quantityUnit = 'g';
		}
		if (data.nutritionDataId === undefined) {
			data.nutritionDataId = null;
		}
		if (typeof data.eatenAt === 'string') {
			data.eatenAt = new Date(data.eatenAt);
		}
		return data;
	}
	_getNeededStoresForWhere<W extends Prisma.Args<Prisma.FoodEntryDelegate, 'findMany'>['where']>(
		whereClause: W,
		neededStores: Set<StoreNames<PrismaIDBSchema>>
	) {
		if (whereClause === undefined) return;
		for (const param of IDBUtils.LogicalParams) {
			if (whereClause[param]) {
				for (const clause of IDBUtils.convertToArray(whereClause[param])) {
					this._getNeededStoresForWhere(clause, neededStores);
				}
			}
		}
		if (whereClause.nutritionData) {
			neededStores.add('NutritionData');
			this.client.nutritionData._getNeededStoresForWhere(whereClause.nutritionData, neededStores);
		}
		if (whereClause.user) {
			neededStores.add('User');
			this.client.user._getNeededStoresForWhere(whereClause.user, neededStores);
		}
	}
	_getNeededStoresForFind<Q extends Prisma.Args<Prisma.FoodEntryDelegate, 'findMany'>>(
		query?: Q
	): Set<StoreNames<PrismaIDBSchema>> {
		const neededStores: Set<StoreNames<PrismaIDBSchema>> = new Set();
		neededStores.add('FoodEntry');
		this._getNeededStoresForWhere(query?.where, neededStores);
		if (query?.orderBy) {
			const orderBy = IDBUtils.convertToArray(query.orderBy);
			const orderBy_nutritionData = orderBy.find((clause) => clause.nutritionData);
			if (orderBy_nutritionData) {
				this.client.nutritionData
					._getNeededStoresForFind({ orderBy: orderBy_nutritionData.nutritionData })
					.forEach((storeName) => neededStores.add(storeName));
			}
			const orderBy_user = orderBy.find((clause) => clause.user);
			if (orderBy_user) {
				this.client.user
					._getNeededStoresForFind({ orderBy: orderBy_user.user })
					.forEach((storeName) => neededStores.add(storeName));
			}
		}
		if (query?.select?.nutritionData || query?.include?.nutritionData) {
			neededStores.add('NutritionData');
			if (typeof query.select?.nutritionData === 'object') {
				this.client.nutritionData
					._getNeededStoresForFind(query.select.nutritionData)
					.forEach((storeName) => neededStores.add(storeName));
			}
			if (typeof query.include?.nutritionData === 'object') {
				this.client.nutritionData
					._getNeededStoresForFind(query.include.nutritionData)
					.forEach((storeName) => neededStores.add(storeName));
			}
		}
		if (query?.select?.user || query?.include?.user) {
			neededStores.add('User');
			if (typeof query.select?.user === 'object') {
				this.client.user
					._getNeededStoresForFind(query.select.user)
					.forEach((storeName) => neededStores.add(storeName));
			}
			if (typeof query.include?.user === 'object') {
				this.client.user
					._getNeededStoresForFind(query.include.user)
					.forEach((storeName) => neededStores.add(storeName));
			}
		}
		return neededStores;
	}
	_getNeededStoresForCreate<
		D extends Partial<Prisma.Args<Prisma.FoodEntryDelegate, 'create'>['data']>
	>(data: D): Set<StoreNames<PrismaIDBSchema>> {
		const neededStores: Set<StoreNames<PrismaIDBSchema>> = new Set();
		neededStores.add('FoodEntry');
		if (data?.nutritionData) {
			neededStores.add('NutritionData');
			if (data.nutritionData.create) {
				const createData = Array.isArray(data.nutritionData.create)
					? data.nutritionData.create
					: [data.nutritionData.create];
				createData.forEach((record) =>
					this.client.nutritionData
						._getNeededStoresForCreate(record)
						.forEach((storeName) => neededStores.add(storeName))
				);
			}
			if (data.nutritionData.connectOrCreate) {
				IDBUtils.convertToArray(data.nutritionData.connectOrCreate).forEach((record) =>
					this.client.nutritionData
						._getNeededStoresForCreate(record.create)
						.forEach((storeName) => neededStores.add(storeName))
				);
			}
		}
		if (data?.nutritionDataId !== undefined) {
			neededStores.add('NutritionData');
		}
		if (data?.user) {
			neededStores.add('User');
			if (data.user.create) {
				const createData = Array.isArray(data.user.create) ? data.user.create : [data.user.create];
				createData.forEach((record) =>
					this.client.user
						._getNeededStoresForCreate(record)
						.forEach((storeName) => neededStores.add(storeName))
				);
			}
			if (data.user.connectOrCreate) {
				IDBUtils.convertToArray(data.user.connectOrCreate).forEach((record) =>
					this.client.user
						._getNeededStoresForCreate(record.create)
						.forEach((storeName) => neededStores.add(storeName))
				);
			}
		}
		if (data?.userId !== undefined) {
			neededStores.add('User');
		}
		return neededStores;
	}
	_getNeededStoresForUpdate<Q extends Prisma.Args<Prisma.FoodEntryDelegate, 'update'>>(
		query: Partial<Q>
	): Set<StoreNames<PrismaIDBSchema>> {
		const neededStores = this._getNeededStoresForFind(query).union(
			this._getNeededStoresForCreate(
				query.data as Prisma.Args<Prisma.FoodEntryDelegate, 'create'>['data']
			)
		);
		if (query.data?.nutritionData?.connect) {
			neededStores.add('NutritionData');
			IDBUtils.convertToArray(query.data.nutritionData.connect).forEach((connect) => {
				this.client.nutritionData._getNeededStoresForWhere(connect, neededStores);
			});
		}
		if (query.data?.nutritionData?.disconnect) {
			neededStores.add('NutritionData');
			if (query.data?.nutritionData?.disconnect !== true) {
				IDBUtils.convertToArray(query.data.nutritionData.disconnect).forEach((disconnect) => {
					this.client.nutritionData._getNeededStoresForWhere(disconnect, neededStores);
				});
			}
		}
		if (query.data?.nutritionData?.update) {
			neededStores.add('NutritionData');
			IDBUtils.convertToArray(query.data.nutritionData.update).forEach((update) => {
				this.client.nutritionData
					._getNeededStoresForUpdate(update as Prisma.Args<Prisma.NutritionDataDelegate, 'update'>)
					.forEach((store) => neededStores.add(store));
			});
		}
		if (query.data?.nutritionData?.upsert) {
			neededStores.add('NutritionData');
			IDBUtils.convertToArray(query.data.nutritionData.upsert).forEach((upsert) => {
				const update = {
					where: upsert.where,
					data: { ...upsert.update, ...upsert.create }
				} as Prisma.Args<Prisma.NutritionDataDelegate, 'update'>;
				this.client.nutritionData
					._getNeededStoresForUpdate(update)
					.forEach((store) => neededStores.add(store));
			});
		}
		if (query.data?.user?.connect) {
			neededStores.add('User');
			IDBUtils.convertToArray(query.data.user.connect).forEach((connect) => {
				this.client.user._getNeededStoresForWhere(connect, neededStores);
			});
		}
		if (query.data?.user?.update) {
			neededStores.add('User');
			IDBUtils.convertToArray(query.data.user.update).forEach((update) => {
				this.client.user
					._getNeededStoresForUpdate(update as Prisma.Args<Prisma.UserDelegate, 'update'>)
					.forEach((store) => neededStores.add(store));
			});
		}
		if (query.data?.user?.upsert) {
			neededStores.add('User');
			IDBUtils.convertToArray(query.data.user.upsert).forEach((upsert) => {
				const update = {
					where: upsert.where,
					data: { ...upsert.update, ...upsert.create }
				} as Prisma.Args<Prisma.UserDelegate, 'update'>;
				this.client.user
					._getNeededStoresForUpdate(update)
					.forEach((store) => neededStores.add(store));
			});
		}
		if (query.data?.nutritionData?.delete) {
			this.client.nutritionData._getNeededStoresForNestedDelete(neededStores);
		}
		return neededStores;
	}
	_getNeededStoresForNestedDelete(neededStores: Set<StoreNames<PrismaIDBSchema>>): void {
		neededStores.add('FoodEntry');
	}
	private _removeNestedCreateData<
		D extends Prisma.Args<Prisma.FoodEntryDelegate, 'create'>['data']
	>(data: D): Prisma.Result<Prisma.FoodEntryDelegate, object, 'findFirstOrThrow'> {
		const recordWithoutNestedCreate = structuredClone(data);
		delete recordWithoutNestedCreate?.nutritionData;
		delete recordWithoutNestedCreate?.user;
		return recordWithoutNestedCreate as Prisma.Result<
			Prisma.FoodEntryDelegate,
			object,
			'findFirstOrThrow'
		>;
	}
	private _preprocessListFields(
		records: Prisma.Result<Prisma.FoodEntryDelegate, object, 'findMany'>
	): void {}
	async findMany<Q extends Prisma.Args<Prisma.FoodEntryDelegate, 'findMany'>>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.FoodEntryDelegate, Q, 'findMany'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		const records = await this._applyWhereClause(
			await tx.objectStore('FoodEntry').getAll(),
			query?.where,
			tx
		);
		await this._applyOrderByClause(records, query?.orderBy, tx);
		const relationAppliedRecords = (await this._applyRelations(
			records,
			tx,
			query
		)) as Prisma.Result<Prisma.FoodEntryDelegate, object, 'findFirstOrThrow'>[];
		const selectClause = query?.select;
		let selectAppliedRecords = this._applySelectClause(relationAppliedRecords, selectClause);
		if (query?.distinct) {
			const distinctFields = IDBUtils.convertToArray(query.distinct);
			const seen = new Set<string>();
			selectAppliedRecords = selectAppliedRecords.filter((record) => {
				const key = distinctFields.map((field) => record[field]).join('|');
				if (seen.has(key)) return false;
				seen.add(key);
				return true;
			});
		}
		this._preprocessListFields(selectAppliedRecords);
		return selectAppliedRecords as Prisma.Result<Prisma.FoodEntryDelegate, Q, 'findMany'>;
	}
	async findFirst<Q extends Prisma.Args<Prisma.FoodEntryDelegate, 'findFirst'>>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.FoodEntryDelegate, Q, 'findFirst'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		return (await this.findMany(query, tx))[0] ?? null;
	}
	async findFirstOrThrow<Q extends Prisma.Args<Prisma.FoodEntryDelegate, 'findFirstOrThrow'>>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.FoodEntryDelegate, Q, 'findFirstOrThrow'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		const record = await this.findFirst(query, tx);
		if (!record) {
			tx.abort();
			throw new Error('Record not found');
		}
		return record;
	}
	async findUnique<Q extends Prisma.Args<Prisma.FoodEntryDelegate, 'findUnique'>>(
		query: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.FoodEntryDelegate, Q, 'findUnique'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		let record;
		if (query.where.id !== undefined) {
			record = await tx.objectStore('FoodEntry').get([query.where.id]);
		}
		if (!record) return null;

		const recordWithRelations = this._applySelectClause(
			await this._applyRelations(
				await this._applyWhereClause([record], query.where, tx),
				tx,
				query
			),
			query.select
		)[0];
		this._preprocessListFields([recordWithRelations]);
		return recordWithRelations as Prisma.Result<Prisma.FoodEntryDelegate, Q, 'findUnique'>;
	}
	async findUniqueOrThrow<Q extends Prisma.Args<Prisma.FoodEntryDelegate, 'findUniqueOrThrow'>>(
		query: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.FoodEntryDelegate, Q, 'findUniqueOrThrow'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		const record = await this.findUnique(query, tx);
		if (!record) {
			tx.abort();
			throw new Error('Record not found');
		}
		return record;
	}
	async count<Q extends Prisma.Args<Prisma.FoodEntryDelegate, 'count'>>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.FoodEntryDelegate, Q, 'count'>> {
		tx = tx ?? this.client._db.transaction(['FoodEntry'], 'readonly');
		if (!query?.select || query.select === true) {
			const records = await this.findMany({ where: query?.where }, tx);
			return records.length as Prisma.Result<Prisma.FoodEntryDelegate, Q, 'count'>;
		}
		const result: Partial<Record<keyof Prisma.FoodEntryCountAggregateInputType, number>> = {};
		for (const key of Object.keys(query.select)) {
			const typedKey = key as keyof typeof query.select;
			if (typedKey === '_all') {
				result[typedKey] = (await this.findMany({ where: query.where }, tx)).length;
				continue;
			}
			result[typedKey] = (
				await this.findMany({ where: { [`${typedKey}`]: { not: null } } }, tx)
			).length;
		}
		return result as Prisma.Result<Prisma.FoodEntryDelegate, Q, 'count'>;
	}
	async create<Q extends Prisma.Args<Prisma.FoodEntryDelegate, 'create'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.FoodEntryDelegate, Q, 'create'>> {
		const storesNeeded = this._getNeededStoresForCreate(query.data);
		tx = tx ?? this.client._db.transaction(Array.from(storesNeeded), 'readwrite');
		if (query.data.nutritionData) {
			const fk: Partial<PrismaIDBSchema['NutritionData']['key']> = [];
			if (query.data.nutritionData?.create) {
				const record = await this.client.nutritionData.create(
					{ data: query.data.nutritionData.create },
					tx
				);
				fk[0] = record.id;
			}
			if (query.data.nutritionData?.connect) {
				const record = await this.client.nutritionData.findUniqueOrThrow(
					{ where: query.data.nutritionData.connect },
					tx
				);
				delete query.data.nutritionData.connect;
				fk[0] = record.id;
			}
			if (query.data.nutritionData?.connectOrCreate) {
				const record = await this.client.nutritionData.upsert(
					{
						where: query.data.nutritionData.connectOrCreate.where,
						create: query.data.nutritionData.connectOrCreate.create,
						update: {}
					},
					tx
				);
				fk[0] = record.id;
			}
			const unsafeData = query.data as Record<string, unknown>;
			unsafeData.nutritionDataId = fk[0];
			delete unsafeData.nutritionData;
		} else if (query.data?.nutritionDataId !== undefined && query.data.nutritionDataId !== null) {
			await this.client.nutritionData.findUniqueOrThrow(
				{
					where: { id: query.data.nutritionDataId }
				},
				tx
			);
		}
		if (query.data.user) {
			const fk: Partial<PrismaIDBSchema['User']['key']> = [];
			if (query.data.user?.create) {
				const record = await this.client.user.create({ data: query.data.user.create }, tx);
				fk[0] = record.id;
			}
			if (query.data.user?.connect) {
				const record = await this.client.user.findUniqueOrThrow(
					{ where: query.data.user.connect },
					tx
				);
				delete query.data.user.connect;
				fk[0] = record.id;
			}
			if (query.data.user?.connectOrCreate) {
				const record = await this.client.user.upsert(
					{
						where: query.data.user.connectOrCreate.where,
						create: query.data.user.connectOrCreate.create,
						update: {}
					},
					tx
				);
				fk[0] = record.id;
			}
			const unsafeData = query.data as Record<string, unknown>;
			unsafeData.userId = fk[0];
			delete unsafeData.user;
		} else if (query.data?.userId !== undefined && query.data.userId !== null) {
			await this.client.user.findUniqueOrThrow(
				{
					where: { id: query.data.userId }
				},
				tx
			);
		}
		const record = this._removeNestedCreateData(await this._fillDefaults(query.data, tx));
		const keyPath = await tx.objectStore('FoodEntry').add(record);
		const data = (await tx.objectStore('FoodEntry').get(keyPath))!;
		const recordsWithRelations = this._applySelectClause(
			await this._applyRelations<object>([data], tx, query),
			query.select
		)[0];
		this._preprocessListFields([recordsWithRelations]);
		this.emit('create', keyPath);
		return recordsWithRelations as Prisma.Result<Prisma.FoodEntryDelegate, Q, 'create'>;
	}
	async createMany<Q extends Prisma.Args<Prisma.FoodEntryDelegate, 'createMany'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.FoodEntryDelegate, Q, 'createMany'>> {
		const createManyData = IDBUtils.convertToArray(query.data);
		tx = tx ?? this.client._db.transaction(['FoodEntry'], 'readwrite');
		for (const createData of createManyData) {
			const record = this._removeNestedCreateData(await this._fillDefaults(createData, tx));
			const keyPath = await tx.objectStore('FoodEntry').add(record);
			this.emit('create', keyPath);
		}
		return { count: createManyData.length };
	}
	async createManyAndReturn<Q extends Prisma.Args<Prisma.FoodEntryDelegate, 'createManyAndReturn'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.FoodEntryDelegate, Q, 'createManyAndReturn'>> {
		const createManyData = IDBUtils.convertToArray(query.data);
		const records: Prisma.Result<Prisma.FoodEntryDelegate, object, 'findMany'> = [];
		tx = tx ?? this.client._db.transaction(['FoodEntry'], 'readwrite');
		for (const createData of createManyData) {
			const record = this._removeNestedCreateData(await this._fillDefaults(createData, tx));
			const keyPath = await tx.objectStore('FoodEntry').add(record);
			this.emit('create', keyPath);
			records.push(this._applySelectClause([record], query.select)[0]);
		}
		this._preprocessListFields(records);
		return records as Prisma.Result<Prisma.FoodEntryDelegate, Q, 'createManyAndReturn'>;
	}
	async delete<Q extends Prisma.Args<Prisma.FoodEntryDelegate, 'delete'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.FoodEntryDelegate, Q, 'delete'>> {
		const storesNeeded = this._getNeededStoresForFind(query);
		this._getNeededStoresForNestedDelete(storesNeeded);
		tx = tx ?? this.client._db.transaction(Array.from(storesNeeded), 'readwrite');
		const record = await this.findUnique(query, tx);
		if (!record) throw new Error('Record not found');
		await tx.objectStore('FoodEntry').delete([record.id]);
		this.emit('delete', [record.id]);
		return record;
	}
	async deleteMany<Q extends Prisma.Args<Prisma.FoodEntryDelegate, 'deleteMany'>>(
		query?: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.FoodEntryDelegate, Q, 'deleteMany'>> {
		const storesNeeded = this._getNeededStoresForFind(query);
		this._getNeededStoresForNestedDelete(storesNeeded);
		tx = tx ?? this.client._db.transaction(Array.from(storesNeeded), 'readwrite');
		const records = await this.findMany(query, tx);
		for (const record of records) {
			await this.delete({ where: { id: record.id } }, tx);
		}
		return { count: records.length };
	}
	async update<Q extends Prisma.Args<Prisma.FoodEntryDelegate, 'update'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.FoodEntryDelegate, Q, 'update'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForUpdate(query)), 'readwrite');
		const record = await this.findUnique({ where: query.where }, tx);
		if (record === null) {
			tx.abort();
			throw new Error('Record not found');
		}
		const startKeyPath: PrismaIDBSchema['FoodEntry']['key'] = [record.id];
		const stringFields = ['id', 'quantityUnit', 'userId'] as const;
		for (const field of stringFields) {
			IDBUtils.handleStringUpdateField(record, field, query.data[field]);
		}
		const dateTimeFields = ['eatenAt'] as const;
		for (const field of dateTimeFields) {
			IDBUtils.handleDateTimeUpdateField(record, field, query.data[field]);
		}
		const intFields = ['nutritionDataId'] as const;
		for (const field of intFields) {
			IDBUtils.handleIntUpdateField(record, field, query.data[field]);
		}
		const floatFields = ['quantity'] as const;
		for (const field of floatFields) {
			IDBUtils.handleFloatUpdateField(record, field, query.data[field]);
		}
		if (query.data.nutritionData) {
			if (query.data.nutritionData.connect) {
				const other = await this.client.nutritionData.findUniqueOrThrow(
					{ where: query.data.nutritionData.connect },
					tx
				);
				record.nutritionDataId = other.id;
			}
			if (query.data.nutritionData.create) {
				const other = await this.client.nutritionData.create(
					{ data: query.data.nutritionData.create },
					tx
				);
				record.nutritionDataId = other.id;
			}
			if (query.data.nutritionData.update) {
				const updateData = query.data.nutritionData.update.data ?? query.data.nutritionData.update;
				await this.client.nutritionData.update(
					{
						where: {
							...query.data.nutritionData.update.where,
							id: record.nutritionDataId!
						} as Prisma.NutritionDataWhereUniqueInput,
						data: updateData
					},
					tx
				);
			}
			if (query.data.nutritionData.upsert) {
				await this.client.nutritionData.upsert(
					{
						where: {
							...query.data.nutritionData.upsert.where,
							id: record.nutritionDataId!
						} as Prisma.NutritionDataWhereUniqueInput,
						create: {
							...query.data.nutritionData.upsert.create,
							id: record.nutritionDataId!
						} as Prisma.Args<Prisma.NutritionDataDelegate, 'upsert'>['create'],
						update: query.data.nutritionData.upsert.update
					},
					tx
				);
			}
			if (query.data.nutritionData.connectOrCreate) {
				await this.client.nutritionData.upsert(
					{
						where: {
							...query.data.nutritionData.connectOrCreate.where,
							id: record.nutritionDataId!
						},
						create: {
							...query.data.nutritionData.connectOrCreate.create,
							id: record.nutritionDataId!
						} as Prisma.Args<Prisma.NutritionDataDelegate, 'upsert'>['create'],
						update: { id: record.nutritionDataId! }
					},
					tx
				);
			}
			if (query.data.nutritionData.disconnect) {
				record.nutritionDataId = null;
			}
			if (query.data.nutritionData.delete) {
				const deleteWhere =
					query.data.nutritionData.delete === true ? {} : query.data.nutritionData.delete;
				await this.client.nutritionData.delete(
					{
						where: { ...deleteWhere, id: record.nutritionDataId! }
					} as Prisma.NutritionDataDeleteArgs,
					tx
				);
				record.nutritionDataId = null;
			}
		}
		if (query.data.user) {
			if (query.data.user.connect) {
				const other = await this.client.user.findUniqueOrThrow(
					{ where: query.data.user.connect },
					tx
				);
				record.userId = other.id;
			}
			if (query.data.user.create) {
				const other = await this.client.user.create({ data: query.data.user.create }, tx);
				record.userId = other.id;
			}
			if (query.data.user.update) {
				const updateData = query.data.user.update.data ?? query.data.user.update;
				await this.client.user.update(
					{
						where: {
							...query.data.user.update.where,
							id: record.userId!
						} as Prisma.UserWhereUniqueInput,
						data: updateData
					},
					tx
				);
			}
			if (query.data.user.upsert) {
				await this.client.user.upsert(
					{
						where: {
							...query.data.user.upsert.where,
							id: record.userId!
						} as Prisma.UserWhereUniqueInput,
						create: { ...query.data.user.upsert.create, id: record.userId! } as Prisma.Args<
							Prisma.UserDelegate,
							'upsert'
						>['create'],
						update: query.data.user.upsert.update
					},
					tx
				);
			}
			if (query.data.user.connectOrCreate) {
				await this.client.user.upsert(
					{
						where: { ...query.data.user.connectOrCreate.where, id: record.userId! },
						create: {
							...query.data.user.connectOrCreate.create,
							id: record.userId!
						} as Prisma.Args<Prisma.UserDelegate, 'upsert'>['create'],
						update: { id: record.userId! }
					},
					tx
				);
			}
		}
		if (query.data.nutritionDataId !== undefined && record.nutritionDataId !== null) {
			const related = await this.client.nutritionData.findUnique(
				{ where: { id: record.nutritionDataId } },
				tx
			);
			if (!related) throw new Error('Related record not found');
		}
		if (query.data.userId !== undefined) {
			const related = await this.client.user.findUnique({ where: { id: record.userId } }, tx);
			if (!related) throw new Error('Related record not found');
		}
		const endKeyPath: PrismaIDBSchema['FoodEntry']['key'] = [record.id];
		for (let i = 0; i < startKeyPath.length; i++) {
			if (startKeyPath[i] !== endKeyPath[i]) {
				if ((await tx.objectStore('FoodEntry').get(endKeyPath)) !== undefined) {
					throw new Error('Record with the same keyPath already exists');
				}
				await tx.objectStore('FoodEntry').delete(startKeyPath);
				break;
			}
		}
		const keyPath = await tx.objectStore('FoodEntry').put(record);
		this.emit('update', keyPath, startKeyPath);
		for (let i = 0; i < startKeyPath.length; i++) {
			if (startKeyPath[i] !== endKeyPath[i]) {
				break;
			}
		}
		const recordWithRelations = (await this.findUnique(
			{
				where: { id: keyPath[0] }
			},
			tx
		))!;
		return recordWithRelations as Prisma.Result<Prisma.FoodEntryDelegate, Q, 'update'>;
	}
	async updateMany<Q extends Prisma.Args<Prisma.FoodEntryDelegate, 'updateMany'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.FoodEntryDelegate, Q, 'updateMany'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readwrite');
		const records = await this.findMany({ where: query.where }, tx);
		await Promise.all(
			records.map(async (record) => {
				await this.update({ where: { id: record.id }, data: query.data }, tx);
			})
		);
		return { count: records.length };
	}
	async upsert<Q extends Prisma.Args<Prisma.FoodEntryDelegate, 'upsert'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.FoodEntryDelegate, Q, 'upsert'>> {
		const neededStores = this._getNeededStoresForUpdate({
			...query,
			data: { ...query.update, ...query.create } as Prisma.Args<
				Prisma.FoodEntryDelegate,
				'update'
			>['data']
		});
		tx = tx ?? this.client._db.transaction(Array.from(neededStores), 'readwrite');
		let record = await this.findUnique({ where: query.where }, tx);
		if (!record) record = await this.create({ data: query.create }, tx);
		else record = await this.update({ where: query.where, data: query.update }, tx);
		record = await this.findUniqueOrThrow(
			{ where: { id: record.id }, select: query.select, include: query.include },
			tx
		);
		return record as Prisma.Result<Prisma.FoodEntryDelegate, Q, 'upsert'>;
	}
	async aggregate<Q extends Prisma.Args<Prisma.FoodEntryDelegate, 'aggregate'>>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.FoodEntryDelegate, Q, 'aggregate'>> {
		tx = tx ?? this.client._db.transaction(['FoodEntry'], 'readonly');
		const records = await this.findMany({ where: query?.where }, tx);
		const result: Partial<Prisma.Result<Prisma.FoodEntryDelegate, Q, 'aggregate'>> = {};
		if (query?._count) {
			if (query._count === true) {
				(result._count as number) = records.length;
			} else {
				for (const key of Object.keys(query._count)) {
					const typedKey = key as keyof typeof query._count;
					if (typedKey === '_all') {
						(result._count as Record<string, number>)[typedKey] = records.length;
						continue;
					}
					(result._count as Record<string, number>)[typedKey] = (
						await this.findMany({ where: { [`${typedKey}`]: { not: null } } }, tx)
					).length;
				}
			}
		}
		if (query?._min) {
			const minResult = {} as Prisma.Result<Prisma.FoodEntryDelegate, Q, 'aggregate'>['_min'];
			const numericFields = ['quantity', 'nutritionDataId'] as const;
			for (const field of numericFields) {
				if (!query._min[field]) continue;
				const values = records
					.map((record) => record[field] as number)
					.filter((value) => value !== undefined);
				(minResult[field as keyof typeof minResult] as number) = Math.min(...values);
			}
			const dateTimeFields = ['eatenAt'] as const;
			for (const field of dateTimeFields) {
				if (!query._min[field]) continue;
				const values = records
					.map((record) => record[field]?.getTime())
					.filter((value) => value !== undefined);
				(minResult[field as keyof typeof minResult] as Date) = new Date(Math.min(...values));
			}
			const stringFields = ['id', 'quantityUnit', 'userId'] as const;
			for (const field of stringFields) {
				if (!query._min[field]) continue;
				const values = records
					.map((record) => record[field] as string)
					.filter((value) => value !== undefined);
				(minResult[field as keyof typeof minResult] as string) = values.sort()[0];
			}
			result._min = minResult;
		}
		if (query?._max) {
			const maxResult = {} as Prisma.Result<Prisma.FoodEntryDelegate, Q, 'aggregate'>['_max'];
			const numericFields = ['quantity', 'nutritionDataId'] as const;
			for (const field of numericFields) {
				if (!query._max[field]) continue;
				const values = records
					.map((record) => record[field] as number)
					.filter((value) => value !== undefined);
				(maxResult[field as keyof typeof maxResult] as number) = Math.max(...values);
			}
			const dateTimeFields = ['eatenAt'] as const;
			for (const field of dateTimeFields) {
				if (!query._max[field]) continue;
				const values = records
					.map((record) => record[field]?.getTime())
					.filter((value) => value !== undefined);
				(maxResult[field as keyof typeof maxResult] as Date) = new Date(Math.max(...values));
			}
			const stringFields = ['id', 'quantityUnit', 'userId'] as const;
			for (const field of stringFields) {
				if (!query._max[field]) continue;
				const values = records
					.map((record) => record[field] as string)
					.filter((value) => value !== undefined);
				(maxResult[field as keyof typeof maxResult] as string) = values.sort().reverse()[0];
			}
			result._max = maxResult;
		}
		if (query?._avg) {
			const avgResult = {} as Prisma.Result<Prisma.FoodEntryDelegate, Q, 'aggregate'>['_avg'];
			for (const untypedField of Object.keys(query._avg)) {
				const field = untypedField as keyof (typeof records)[number];
				const values = records.map((record) => record[field] as number);
				(avgResult[field as keyof typeof avgResult] as number) =
					values.reduce((a, b) => a + b, 0) / values.length;
			}
			result._avg = avgResult;
		}
		if (query?._sum) {
			const sumResult = {} as Prisma.Result<Prisma.FoodEntryDelegate, Q, 'aggregate'>['_sum'];
			for (const untypedField of Object.keys(query._sum)) {
				const field = untypedField as keyof (typeof records)[number];
				const values = records.map((record) => record[field] as number);
				(sumResult[field as keyof typeof sumResult] as number) = values.reduce((a, b) => a + b, 0);
			}
			result._sum = sumResult;
		}
		return result as unknown as Prisma.Result<Prisma.FoodEntryDelegate, Q, 'aggregate'>;
	}
}
class ActivityEntryIDBClass extends BaseIDBModelClass<'ActivityEntry'> {
	private async _applyWhereClause<
		W extends Prisma.Args<Prisma.ActivityEntryDelegate, 'findFirstOrThrow'>['where'],
		R extends Prisma.Result<Prisma.ActivityEntryDelegate, object, 'findFirstOrThrow'>
	>(records: R[], whereClause: W, tx: IDBUtils.TransactionType): Promise<R[]> {
		if (!whereClause) return records;
		records = await IDBUtils.applyLogicalFilters<Prisma.ActivityEntryDelegate, R, W>(
			records,
			whereClause,
			tx,
			this.keyPath,
			this._applyWhereClause.bind(this)
		);
		return (
			await Promise.all(
				records.map(async (record) => {
					const stringFields = ['id', 'quantityUnit', 'userId'] as const;
					for (const field of stringFields) {
						if (!IDBUtils.whereStringFilter(record, field, whereClause[field])) return null;
					}
					const numberFields = ['calories', 'quantity'] as const;
					for (const field of numberFields) {
						if (!IDBUtils.whereNumberFilter(record, field, whereClause[field])) return null;
					}
					const booleanFields = ['systemGenerated'] as const;
					for (const field of booleanFields) {
						if (!IDBUtils.whereBoolFilter(record, field, whereClause[field])) return null;
					}
					const dateTimeFields = ['performedAt'] as const;
					for (const field of dateTimeFields) {
						if (!IDBUtils.whereDateTimeFilter(record, field, whereClause[field])) return null;
					}
					if (whereClause.user) {
						const { is, isNot, ...rest } = whereClause.user;
						if (is !== null && is !== undefined) {
							const relatedRecord = await this.client.user.findFirst(
								{ where: { ...is, id: record.userId } },
								tx
							);
							if (!relatedRecord) return null;
						}
						if (isNot !== null && isNot !== undefined) {
							const relatedRecord = await this.client.user.findFirst(
								{ where: { ...isNot, id: record.userId } },
								tx
							);
							if (relatedRecord) return null;
						}
						if (Object.keys(rest).length) {
							const relatedRecord = await this.client.user.findFirst(
								{ where: { ...whereClause.user, id: record.userId } },
								tx
							);
							if (!relatedRecord) return null;
						}
					}
					return record;
				})
			)
		).filter((result) => result !== null);
	}
	private _applySelectClause<
		S extends Prisma.Args<Prisma.ActivityEntryDelegate, 'findMany'>['select']
	>(
		records: Prisma.Result<Prisma.ActivityEntryDelegate, object, 'findFirstOrThrow'>[],
		selectClause: S
	): Prisma.Result<Prisma.ActivityEntryDelegate, { select: S }, 'findFirstOrThrow'>[] {
		if (!selectClause) {
			return records as Prisma.Result<
				Prisma.ActivityEntryDelegate,
				{ select: S },
				'findFirstOrThrow'
			>[];
		}
		return records.map((record) => {
			const partialRecord: Partial<typeof record> = record;
			for (const untypedKey of [
				'id',
				'performedAt',
				'calories',
				'quantity',
				'quantityUnit',
				'systemGenerated',
				'user',
				'userId'
			]) {
				const key = untypedKey as keyof typeof record & keyof S;
				if (!selectClause[key]) delete partialRecord[key];
			}
			return partialRecord;
		}) as Prisma.Result<Prisma.ActivityEntryDelegate, { select: S }, 'findFirstOrThrow'>[];
	}
	private async _applyRelations<Q extends Prisma.Args<Prisma.ActivityEntryDelegate, 'findMany'>>(
		records: Prisma.Result<Prisma.ActivityEntryDelegate, object, 'findFirstOrThrow'>[],
		tx: IDBUtils.TransactionType,
		query?: Q
	): Promise<Prisma.Result<Prisma.ActivityEntryDelegate, Q, 'findFirstOrThrow'>[]> {
		if (!query)
			return records as Prisma.Result<Prisma.ActivityEntryDelegate, Q, 'findFirstOrThrow'>[];
		const recordsWithRelations = records.map(async (record) => {
			const unsafeRecord = record as Record<string, unknown>;
			const attach_user = query.select?.user || query.include?.user;
			if (attach_user) {
				unsafeRecord['user'] = await this.client.user.findUnique(
					{
						...(attach_user === true ? {} : attach_user),
						where: { id: record.userId! }
					},
					tx
				);
			}
			return unsafeRecord;
		});
		return (await Promise.all(recordsWithRelations)) as Prisma.Result<
			Prisma.ActivityEntryDelegate,
			Q,
			'findFirstOrThrow'
		>[];
	}
	async _applyOrderByClause<
		O extends Prisma.Args<Prisma.ActivityEntryDelegate, 'findMany'>['orderBy'],
		R extends Prisma.Result<Prisma.ActivityEntryDelegate, object, 'findFirstOrThrow'>
	>(records: R[], orderByClause: O, tx: IDBUtils.TransactionType): Promise<void> {
		if (orderByClause === undefined) return;
		const orderByClauses = IDBUtils.convertToArray(orderByClause);
		const indexedKeys = await Promise.all(
			records.map(async (record) => {
				const keys = await Promise.all(
					orderByClauses.map(async (clause) => await this._resolveOrderByKey(record, clause, tx))
				);
				return { keys, record };
			})
		);
		indexedKeys.sort((a, b) => {
			for (let i = 0; i < orderByClauses.length; i++) {
				const clause = orderByClauses[i];
				const comparison = IDBUtils.genericComparator(
					a.keys[i],
					b.keys[i],
					this._resolveSortOrder(clause)
				);
				if (comparison !== 0) return comparison;
			}
			return 0;
		});
		for (let i = 0; i < records.length; i++) {
			records[i] = indexedKeys[i].record;
		}
	}
	async _resolveOrderByKey(
		record: Prisma.Result<Prisma.ActivityEntryDelegate, object, 'findFirstOrThrow'>,
		orderByInput: Prisma.ActivityEntryOrderByWithRelationInput,
		tx: IDBUtils.TransactionType
	): Promise<unknown> {
		const scalarFields = [
			'id',
			'performedAt',
			'calories',
			'quantity',
			'quantityUnit',
			'systemGenerated',
			'userId'
		] as const;
		for (const field of scalarFields) if (orderByInput[field]) return record[field];
		if (orderByInput.user) {
			return await this.client.user._resolveOrderByKey(
				await this.client.user.findFirstOrThrow({ where: { id: record.userId } }),
				orderByInput.user,
				tx
			);
		}
	}
	_resolveSortOrder(
		orderByInput: Prisma.ActivityEntryOrderByWithRelationInput
	): Prisma.SortOrder | { sort: Prisma.SortOrder; nulls?: 'first' | 'last' } {
		const scalarFields = [
			'id',
			'performedAt',
			'calories',
			'quantity',
			'quantityUnit',
			'systemGenerated',
			'userId'
		] as const;
		for (const field of scalarFields) if (orderByInput[field]) return orderByInput[field];
		if (orderByInput.user) {
			return this.client.user._resolveSortOrder(orderByInput.user);
		}
		throw new Error('No field in orderBy clause');
	}
	private async _fillDefaults<
		D extends Prisma.Args<Prisma.ActivityEntryDelegate, 'create'>['data']
	>(data: D, tx?: IDBUtils.ReadwriteTransactionType): Promise<D> {
		if (data === undefined) data = {} as NonNullable<D>;
		if (data.id === undefined) {
			data.id = uuidv4();
		}
		if (data.systemGenerated === undefined) {
			data.systemGenerated = false;
		}
		if (typeof data.performedAt === 'string') {
			data.performedAt = new Date(data.performedAt);
		}
		return data;
	}
	_getNeededStoresForWhere<
		W extends Prisma.Args<Prisma.ActivityEntryDelegate, 'findMany'>['where']
	>(whereClause: W, neededStores: Set<StoreNames<PrismaIDBSchema>>) {
		if (whereClause === undefined) return;
		for (const param of IDBUtils.LogicalParams) {
			if (whereClause[param]) {
				for (const clause of IDBUtils.convertToArray(whereClause[param])) {
					this._getNeededStoresForWhere(clause, neededStores);
				}
			}
		}
		if (whereClause.user) {
			neededStores.add('User');
			this.client.user._getNeededStoresForWhere(whereClause.user, neededStores);
		}
	}
	_getNeededStoresForFind<Q extends Prisma.Args<Prisma.ActivityEntryDelegate, 'findMany'>>(
		query?: Q
	): Set<StoreNames<PrismaIDBSchema>> {
		const neededStores: Set<StoreNames<PrismaIDBSchema>> = new Set();
		neededStores.add('ActivityEntry');
		this._getNeededStoresForWhere(query?.where, neededStores);
		if (query?.orderBy) {
			const orderBy = IDBUtils.convertToArray(query.orderBy);
			const orderBy_user = orderBy.find((clause) => clause.user);
			if (orderBy_user) {
				this.client.user
					._getNeededStoresForFind({ orderBy: orderBy_user.user })
					.forEach((storeName) => neededStores.add(storeName));
			}
		}
		if (query?.select?.user || query?.include?.user) {
			neededStores.add('User');
			if (typeof query.select?.user === 'object') {
				this.client.user
					._getNeededStoresForFind(query.select.user)
					.forEach((storeName) => neededStores.add(storeName));
			}
			if (typeof query.include?.user === 'object') {
				this.client.user
					._getNeededStoresForFind(query.include.user)
					.forEach((storeName) => neededStores.add(storeName));
			}
		}
		return neededStores;
	}
	_getNeededStoresForCreate<
		D extends Partial<Prisma.Args<Prisma.ActivityEntryDelegate, 'create'>['data']>
	>(data: D): Set<StoreNames<PrismaIDBSchema>> {
		const neededStores: Set<StoreNames<PrismaIDBSchema>> = new Set();
		neededStores.add('ActivityEntry');
		if (data?.user) {
			neededStores.add('User');
			if (data.user.create) {
				const createData = Array.isArray(data.user.create) ? data.user.create : [data.user.create];
				createData.forEach((record) =>
					this.client.user
						._getNeededStoresForCreate(record)
						.forEach((storeName) => neededStores.add(storeName))
				);
			}
			if (data.user.connectOrCreate) {
				IDBUtils.convertToArray(data.user.connectOrCreate).forEach((record) =>
					this.client.user
						._getNeededStoresForCreate(record.create)
						.forEach((storeName) => neededStores.add(storeName))
				);
			}
		}
		if (data?.userId !== undefined) {
			neededStores.add('User');
		}
		return neededStores;
	}
	_getNeededStoresForUpdate<Q extends Prisma.Args<Prisma.ActivityEntryDelegate, 'update'>>(
		query: Partial<Q>
	): Set<StoreNames<PrismaIDBSchema>> {
		const neededStores = this._getNeededStoresForFind(query).union(
			this._getNeededStoresForCreate(
				query.data as Prisma.Args<Prisma.ActivityEntryDelegate, 'create'>['data']
			)
		);
		if (query.data?.user?.connect) {
			neededStores.add('User');
			IDBUtils.convertToArray(query.data.user.connect).forEach((connect) => {
				this.client.user._getNeededStoresForWhere(connect, neededStores);
			});
		}
		if (query.data?.user?.update) {
			neededStores.add('User');
			IDBUtils.convertToArray(query.data.user.update).forEach((update) => {
				this.client.user
					._getNeededStoresForUpdate(update as Prisma.Args<Prisma.UserDelegate, 'update'>)
					.forEach((store) => neededStores.add(store));
			});
		}
		if (query.data?.user?.upsert) {
			neededStores.add('User');
			IDBUtils.convertToArray(query.data.user.upsert).forEach((upsert) => {
				const update = {
					where: upsert.where,
					data: { ...upsert.update, ...upsert.create }
				} as Prisma.Args<Prisma.UserDelegate, 'update'>;
				this.client.user
					._getNeededStoresForUpdate(update)
					.forEach((store) => neededStores.add(store));
			});
		}
		return neededStores;
	}
	_getNeededStoresForNestedDelete(neededStores: Set<StoreNames<PrismaIDBSchema>>): void {
		neededStores.add('ActivityEntry');
	}
	private _removeNestedCreateData<
		D extends Prisma.Args<Prisma.ActivityEntryDelegate, 'create'>['data']
	>(data: D): Prisma.Result<Prisma.ActivityEntryDelegate, object, 'findFirstOrThrow'> {
		const recordWithoutNestedCreate = structuredClone(data);
		delete recordWithoutNestedCreate?.user;
		return recordWithoutNestedCreate as Prisma.Result<
			Prisma.ActivityEntryDelegate,
			object,
			'findFirstOrThrow'
		>;
	}
	private _preprocessListFields(
		records: Prisma.Result<Prisma.ActivityEntryDelegate, object, 'findMany'>
	): void {}
	async findMany<Q extends Prisma.Args<Prisma.ActivityEntryDelegate, 'findMany'>>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.ActivityEntryDelegate, Q, 'findMany'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		const records = await this._applyWhereClause(
			await tx.objectStore('ActivityEntry').getAll(),
			query?.where,
			tx
		);
		await this._applyOrderByClause(records, query?.orderBy, tx);
		const relationAppliedRecords = (await this._applyRelations(
			records,
			tx,
			query
		)) as Prisma.Result<Prisma.ActivityEntryDelegate, object, 'findFirstOrThrow'>[];
		const selectClause = query?.select;
		let selectAppliedRecords = this._applySelectClause(relationAppliedRecords, selectClause);
		if (query?.distinct) {
			const distinctFields = IDBUtils.convertToArray(query.distinct);
			const seen = new Set<string>();
			selectAppliedRecords = selectAppliedRecords.filter((record) => {
				const key = distinctFields.map((field) => record[field]).join('|');
				if (seen.has(key)) return false;
				seen.add(key);
				return true;
			});
		}
		this._preprocessListFields(selectAppliedRecords);
		return selectAppliedRecords as Prisma.Result<Prisma.ActivityEntryDelegate, Q, 'findMany'>;
	}
	async findFirst<Q extends Prisma.Args<Prisma.ActivityEntryDelegate, 'findFirst'>>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.ActivityEntryDelegate, Q, 'findFirst'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		return (await this.findMany(query, tx))[0] ?? null;
	}
	async findFirstOrThrow<Q extends Prisma.Args<Prisma.ActivityEntryDelegate, 'findFirstOrThrow'>>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.ActivityEntryDelegate, Q, 'findFirstOrThrow'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		const record = await this.findFirst(query, tx);
		if (!record) {
			tx.abort();
			throw new Error('Record not found');
		}
		return record;
	}
	async findUnique<Q extends Prisma.Args<Prisma.ActivityEntryDelegate, 'findUnique'>>(
		query: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.ActivityEntryDelegate, Q, 'findUnique'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		let record;
		if (query.where.id !== undefined) {
			record = await tx.objectStore('ActivityEntry').get([query.where.id]);
		}
		if (!record) return null;

		const recordWithRelations = this._applySelectClause(
			await this._applyRelations(
				await this._applyWhereClause([record], query.where, tx),
				tx,
				query
			),
			query.select
		)[0];
		this._preprocessListFields([recordWithRelations]);
		return recordWithRelations as Prisma.Result<Prisma.ActivityEntryDelegate, Q, 'findUnique'>;
	}
	async findUniqueOrThrow<Q extends Prisma.Args<Prisma.ActivityEntryDelegate, 'findUniqueOrThrow'>>(
		query: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.ActivityEntryDelegate, Q, 'findUniqueOrThrow'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		const record = await this.findUnique(query, tx);
		if (!record) {
			tx.abort();
			throw new Error('Record not found');
		}
		return record;
	}
	async count<Q extends Prisma.Args<Prisma.ActivityEntryDelegate, 'count'>>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.ActivityEntryDelegate, Q, 'count'>> {
		tx = tx ?? this.client._db.transaction(['ActivityEntry'], 'readonly');
		if (!query?.select || query.select === true) {
			const records = await this.findMany({ where: query?.where }, tx);
			return records.length as Prisma.Result<Prisma.ActivityEntryDelegate, Q, 'count'>;
		}
		const result: Partial<Record<keyof Prisma.ActivityEntryCountAggregateInputType, number>> = {};
		for (const key of Object.keys(query.select)) {
			const typedKey = key as keyof typeof query.select;
			if (typedKey === '_all') {
				result[typedKey] = (await this.findMany({ where: query.where }, tx)).length;
				continue;
			}
			result[typedKey] = (
				await this.findMany({ where: { [`${typedKey}`]: { not: null } } }, tx)
			).length;
		}
		return result as Prisma.Result<Prisma.ActivityEntryDelegate, Q, 'count'>;
	}
	async create<Q extends Prisma.Args<Prisma.ActivityEntryDelegate, 'create'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.ActivityEntryDelegate, Q, 'create'>> {
		const storesNeeded = this._getNeededStoresForCreate(query.data);
		tx = tx ?? this.client._db.transaction(Array.from(storesNeeded), 'readwrite');
		if (query.data.user) {
			const fk: Partial<PrismaIDBSchema['User']['key']> = [];
			if (query.data.user?.create) {
				const record = await this.client.user.create({ data: query.data.user.create }, tx);
				fk[0] = record.id;
			}
			if (query.data.user?.connect) {
				const record = await this.client.user.findUniqueOrThrow(
					{ where: query.data.user.connect },
					tx
				);
				delete query.data.user.connect;
				fk[0] = record.id;
			}
			if (query.data.user?.connectOrCreate) {
				const record = await this.client.user.upsert(
					{
						where: query.data.user.connectOrCreate.where,
						create: query.data.user.connectOrCreate.create,
						update: {}
					},
					tx
				);
				fk[0] = record.id;
			}
			const unsafeData = query.data as Record<string, unknown>;
			unsafeData.userId = fk[0];
			delete unsafeData.user;
		} else if (query.data?.userId !== undefined && query.data.userId !== null) {
			await this.client.user.findUniqueOrThrow(
				{
					where: { id: query.data.userId }
				},
				tx
			);
		}
		const record = this._removeNestedCreateData(await this._fillDefaults(query.data, tx));
		const keyPath = await tx.objectStore('ActivityEntry').add(record);
		const data = (await tx.objectStore('ActivityEntry').get(keyPath))!;
		const recordsWithRelations = this._applySelectClause(
			await this._applyRelations<object>([data], tx, query),
			query.select
		)[0];
		this._preprocessListFields([recordsWithRelations]);
		this.emit('create', keyPath);
		return recordsWithRelations as Prisma.Result<Prisma.ActivityEntryDelegate, Q, 'create'>;
	}
	async createMany<Q extends Prisma.Args<Prisma.ActivityEntryDelegate, 'createMany'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.ActivityEntryDelegate, Q, 'createMany'>> {
		const createManyData = IDBUtils.convertToArray(query.data);
		tx = tx ?? this.client._db.transaction(['ActivityEntry'], 'readwrite');
		for (const createData of createManyData) {
			const record = this._removeNestedCreateData(await this._fillDefaults(createData, tx));
			const keyPath = await tx.objectStore('ActivityEntry').add(record);
			this.emit('create', keyPath);
		}
		return { count: createManyData.length };
	}
	async createManyAndReturn<
		Q extends Prisma.Args<Prisma.ActivityEntryDelegate, 'createManyAndReturn'>
	>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.ActivityEntryDelegate, Q, 'createManyAndReturn'>> {
		const createManyData = IDBUtils.convertToArray(query.data);
		const records: Prisma.Result<Prisma.ActivityEntryDelegate, object, 'findMany'> = [];
		tx = tx ?? this.client._db.transaction(['ActivityEntry'], 'readwrite');
		for (const createData of createManyData) {
			const record = this._removeNestedCreateData(await this._fillDefaults(createData, tx));
			const keyPath = await tx.objectStore('ActivityEntry').add(record);
			this.emit('create', keyPath);
			records.push(this._applySelectClause([record], query.select)[0]);
		}
		this._preprocessListFields(records);
		return records as Prisma.Result<Prisma.ActivityEntryDelegate, Q, 'createManyAndReturn'>;
	}
	async delete<Q extends Prisma.Args<Prisma.ActivityEntryDelegate, 'delete'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.ActivityEntryDelegate, Q, 'delete'>> {
		const storesNeeded = this._getNeededStoresForFind(query);
		this._getNeededStoresForNestedDelete(storesNeeded);
		tx = tx ?? this.client._db.transaction(Array.from(storesNeeded), 'readwrite');
		const record = await this.findUnique(query, tx);
		if (!record) throw new Error('Record not found');
		await tx.objectStore('ActivityEntry').delete([record.id]);
		this.emit('delete', [record.id]);
		return record;
	}
	async deleteMany<Q extends Prisma.Args<Prisma.ActivityEntryDelegate, 'deleteMany'>>(
		query?: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.ActivityEntryDelegate, Q, 'deleteMany'>> {
		const storesNeeded = this._getNeededStoresForFind(query);
		this._getNeededStoresForNestedDelete(storesNeeded);
		tx = tx ?? this.client._db.transaction(Array.from(storesNeeded), 'readwrite');
		const records = await this.findMany(query, tx);
		for (const record of records) {
			await this.delete({ where: { id: record.id } }, tx);
		}
		return { count: records.length };
	}
	async update<Q extends Prisma.Args<Prisma.ActivityEntryDelegate, 'update'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.ActivityEntryDelegate, Q, 'update'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForUpdate(query)), 'readwrite');
		const record = await this.findUnique({ where: query.where }, tx);
		if (record === null) {
			tx.abort();
			throw new Error('Record not found');
		}
		const startKeyPath: PrismaIDBSchema['ActivityEntry']['key'] = [record.id];
		const stringFields = ['id', 'quantityUnit', 'userId'] as const;
		for (const field of stringFields) {
			IDBUtils.handleStringUpdateField(record, field, query.data[field]);
		}
		const dateTimeFields = ['performedAt'] as const;
		for (const field of dateTimeFields) {
			IDBUtils.handleDateTimeUpdateField(record, field, query.data[field]);
		}
		const booleanFields = ['systemGenerated'] as const;
		for (const field of booleanFields) {
			IDBUtils.handleBooleanUpdateField(record, field, query.data[field]);
		}
		const intFields = ['calories', 'quantity'] as const;
		for (const field of intFields) {
			IDBUtils.handleIntUpdateField(record, field, query.data[field]);
		}
		if (query.data.user) {
			if (query.data.user.connect) {
				const other = await this.client.user.findUniqueOrThrow(
					{ where: query.data.user.connect },
					tx
				);
				record.userId = other.id;
			}
			if (query.data.user.create) {
				const other = await this.client.user.create({ data: query.data.user.create }, tx);
				record.userId = other.id;
			}
			if (query.data.user.update) {
				const updateData = query.data.user.update.data ?? query.data.user.update;
				await this.client.user.update(
					{
						where: {
							...query.data.user.update.where,
							id: record.userId!
						} as Prisma.UserWhereUniqueInput,
						data: updateData
					},
					tx
				);
			}
			if (query.data.user.upsert) {
				await this.client.user.upsert(
					{
						where: {
							...query.data.user.upsert.where,
							id: record.userId!
						} as Prisma.UserWhereUniqueInput,
						create: { ...query.data.user.upsert.create, id: record.userId! } as Prisma.Args<
							Prisma.UserDelegate,
							'upsert'
						>['create'],
						update: query.data.user.upsert.update
					},
					tx
				);
			}
			if (query.data.user.connectOrCreate) {
				await this.client.user.upsert(
					{
						where: { ...query.data.user.connectOrCreate.where, id: record.userId! },
						create: {
							...query.data.user.connectOrCreate.create,
							id: record.userId!
						} as Prisma.Args<Prisma.UserDelegate, 'upsert'>['create'],
						update: { id: record.userId! }
					},
					tx
				);
			}
		}
		if (query.data.userId !== undefined) {
			const related = await this.client.user.findUnique({ where: { id: record.userId } }, tx);
			if (!related) throw new Error('Related record not found');
		}
		const endKeyPath: PrismaIDBSchema['ActivityEntry']['key'] = [record.id];
		for (let i = 0; i < startKeyPath.length; i++) {
			if (startKeyPath[i] !== endKeyPath[i]) {
				if ((await tx.objectStore('ActivityEntry').get(endKeyPath)) !== undefined) {
					throw new Error('Record with the same keyPath already exists');
				}
				await tx.objectStore('ActivityEntry').delete(startKeyPath);
				break;
			}
		}
		const keyPath = await tx.objectStore('ActivityEntry').put(record);
		this.emit('update', keyPath, startKeyPath);
		for (let i = 0; i < startKeyPath.length; i++) {
			if (startKeyPath[i] !== endKeyPath[i]) {
				break;
			}
		}
		const recordWithRelations = (await this.findUnique(
			{
				where: { id: keyPath[0] }
			},
			tx
		))!;
		return recordWithRelations as Prisma.Result<Prisma.ActivityEntryDelegate, Q, 'update'>;
	}
	async updateMany<Q extends Prisma.Args<Prisma.ActivityEntryDelegate, 'updateMany'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.ActivityEntryDelegate, Q, 'updateMany'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readwrite');
		const records = await this.findMany({ where: query.where }, tx);
		await Promise.all(
			records.map(async (record) => {
				await this.update({ where: { id: record.id }, data: query.data }, tx);
			})
		);
		return { count: records.length };
	}
	async upsert<Q extends Prisma.Args<Prisma.ActivityEntryDelegate, 'upsert'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.ActivityEntryDelegate, Q, 'upsert'>> {
		const neededStores = this._getNeededStoresForUpdate({
			...query,
			data: { ...query.update, ...query.create } as Prisma.Args<
				Prisma.ActivityEntryDelegate,
				'update'
			>['data']
		});
		tx = tx ?? this.client._db.transaction(Array.from(neededStores), 'readwrite');
		let record = await this.findUnique({ where: query.where }, tx);
		if (!record) record = await this.create({ data: query.create }, tx);
		else record = await this.update({ where: query.where, data: query.update }, tx);
		record = await this.findUniqueOrThrow(
			{ where: { id: record.id }, select: query.select, include: query.include },
			tx
		);
		return record as Prisma.Result<Prisma.ActivityEntryDelegate, Q, 'upsert'>;
	}
	async aggregate<Q extends Prisma.Args<Prisma.ActivityEntryDelegate, 'aggregate'>>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.ActivityEntryDelegate, Q, 'aggregate'>> {
		tx = tx ?? this.client._db.transaction(['ActivityEntry'], 'readonly');
		const records = await this.findMany({ where: query?.where }, tx);
		const result: Partial<Prisma.Result<Prisma.ActivityEntryDelegate, Q, 'aggregate'>> = {};
		if (query?._count) {
			if (query._count === true) {
				(result._count as number) = records.length;
			} else {
				for (const key of Object.keys(query._count)) {
					const typedKey = key as keyof typeof query._count;
					if (typedKey === '_all') {
						(result._count as Record<string, number>)[typedKey] = records.length;
						continue;
					}
					(result._count as Record<string, number>)[typedKey] = (
						await this.findMany({ where: { [`${typedKey}`]: { not: null } } }, tx)
					).length;
				}
			}
		}
		if (query?._min) {
			const minResult = {} as Prisma.Result<Prisma.ActivityEntryDelegate, Q, 'aggregate'>['_min'];
			const numericFields = ['calories', 'quantity'] as const;
			for (const field of numericFields) {
				if (!query._min[field]) continue;
				const values = records
					.map((record) => record[field] as number)
					.filter((value) => value !== undefined);
				(minResult[field as keyof typeof minResult] as number) = Math.min(...values);
			}
			const dateTimeFields = ['performedAt'] as const;
			for (const field of dateTimeFields) {
				if (!query._min[field]) continue;
				const values = records
					.map((record) => record[field]?.getTime())
					.filter((value) => value !== undefined);
				(minResult[field as keyof typeof minResult] as Date) = new Date(Math.min(...values));
			}
			const stringFields = ['id', 'quantityUnit', 'userId'] as const;
			for (const field of stringFields) {
				if (!query._min[field]) continue;
				const values = records
					.map((record) => record[field] as string)
					.filter((value) => value !== undefined);
				(minResult[field as keyof typeof minResult] as string) = values.sort()[0];
			}
			const booleanFields = ['systemGenerated'] as const;
			for (const field of booleanFields) {
				if (!query._min[field]) continue;
				const values = records
					.map((record) => record[field] as boolean)
					.filter((value) => value !== undefined);
				(minResult[field as keyof typeof minResult] as boolean) = values.includes(true);
			}
			result._min = minResult;
		}
		if (query?._max) {
			const maxResult = {} as Prisma.Result<Prisma.ActivityEntryDelegate, Q, 'aggregate'>['_max'];
			const numericFields = ['calories', 'quantity'] as const;
			for (const field of numericFields) {
				if (!query._max[field]) continue;
				const values = records
					.map((record) => record[field] as number)
					.filter((value) => value !== undefined);
				(maxResult[field as keyof typeof maxResult] as number) = Math.max(...values);
			}
			const dateTimeFields = ['performedAt'] as const;
			for (const field of dateTimeFields) {
				if (!query._max[field]) continue;
				const values = records
					.map((record) => record[field]?.getTime())
					.filter((value) => value !== undefined);
				(maxResult[field as keyof typeof maxResult] as Date) = new Date(Math.max(...values));
			}
			const stringFields = ['id', 'quantityUnit', 'userId'] as const;
			for (const field of stringFields) {
				if (!query._max[field]) continue;
				const values = records
					.map((record) => record[field] as string)
					.filter((value) => value !== undefined);
				(maxResult[field as keyof typeof maxResult] as string) = values.sort().reverse()[0];
			}
			const booleanFields = ['systemGenerated'] as const;
			for (const field of booleanFields) {
				if (!query._max[field]) continue;
				const values = records
					.map((record) => record[field] as boolean)
					.filter((value) => value !== undefined);
				(maxResult[field as keyof typeof maxResult] as boolean) = values.includes(true);
			}
			result._max = maxResult;
			result._max = maxResult;
		}
		if (query?._avg) {
			const avgResult = {} as Prisma.Result<Prisma.ActivityEntryDelegate, Q, 'aggregate'>['_avg'];
			for (const untypedField of Object.keys(query._avg)) {
				const field = untypedField as keyof (typeof records)[number];
				const values = records.map((record) => record[field] as number);
				(avgResult[field as keyof typeof avgResult] as number) =
					values.reduce((a, b) => a + b, 0) / values.length;
			}
			result._avg = avgResult;
		}
		if (query?._sum) {
			const sumResult = {} as Prisma.Result<Prisma.ActivityEntryDelegate, Q, 'aggregate'>['_sum'];
			for (const untypedField of Object.keys(query._sum)) {
				const field = untypedField as keyof (typeof records)[number];
				const values = records.map((record) => record[field] as number);
				(sumResult[field as keyof typeof sumResult] as number) = values.reduce((a, b) => a + b, 0);
			}
			result._sum = sumResult;
		}
		return result as unknown as Prisma.Result<Prisma.ActivityEntryDelegate, Q, 'aggregate'>;
	}
}
class NutritionDataIDBClass extends BaseIDBModelClass<'NutritionData'> {
	private async _applyWhereClause<
		W extends Prisma.Args<Prisma.NutritionDataDelegate, 'findFirstOrThrow'>['where'],
		R extends Prisma.Result<Prisma.NutritionDataDelegate, object, 'findFirstOrThrow'>
	>(records: R[], whereClause: W, tx: IDBUtils.TransactionType): Promise<R[]> {
		if (!whereClause) return records;
		records = await IDBUtils.applyLogicalFilters<Prisma.NutritionDataDelegate, R, W>(
			records,
			whereClause,
			tx,
			this.keyPath,
			this._applyWhereClause.bind(this)
		);
		return (
			await Promise.all(
				records.map(async (record) => {
					const stringFields = ['code', 'product_name', 'brands'] as const;
					for (const field of stringFields) {
						if (!IDBUtils.whereStringFilter(record, field, whereClause[field])) return null;
					}
					const numberFields = [
						'id',
						'energy_kcal_100g',
						'proteins_100g',
						'fat_100g',
						'carbohydrates_100g',
						'saturated_fat_100g',
						'unsaturated_fat_100g',
						'monounsaturated_fat_100g',
						'polyunsaturated_fat_100g',
						'trans_fat_100g',
						'cholesterol_100g',
						'sugars_100g',
						'polyols_100g',
						'fiber_100g',
						'salt_100g',
						'sodium_100g',
						'alcohol_100g',
						'vitamin_a_100g',
						'vitamin_d_100g',
						'vitamin_e_100g',
						'vitamin_k_100g',
						'vitamin_c_100g',
						'vitamin_b1_100g',
						'vitamin_b2_100g',
						'vitamin_b6_100g',
						'vitamin_b9_100g',
						'folates_100g',
						'vitamin_b12_100g',
						'potassium_100g',
						'calcium_100g',
						'phosphorus_100g',
						'iron_100g',
						'magnesium_100g',
						'zinc_100g',
						'copper_100g',
						'manganese_100g',
						'caffeine_100g'
					] as const;
					for (const field of numberFields) {
						if (!IDBUtils.whereNumberFilter(record, field, whereClause[field])) return null;
					}
					if (whereClause.foodEntries) {
						if (whereClause.foodEntries.every) {
							const violatingRecord = await this.client.foodEntry.findFirst({
								where: { NOT: { ...whereClause.foodEntries.every }, nutritionDataId: record.id },
								tx
							});
							if (violatingRecord !== null) return null;
						}
						if (whereClause.foodEntries.some) {
							const relatedRecords = await this.client.foodEntry.findMany({
								where: { ...whereClause.foodEntries.some, nutritionDataId: record.id },
								tx
							});
							if (relatedRecords.length === 0) return null;
						}
						if (whereClause.foodEntries.none) {
							const violatingRecord = await this.client.foodEntry.findFirst({
								where: { ...whereClause.foodEntries.none, nutritionDataId: record.id },
								tx
							});
							if (violatingRecord !== null) return null;
						}
					}
					return record;
				})
			)
		).filter((result) => result !== null);
	}
	private _applySelectClause<
		S extends Prisma.Args<Prisma.NutritionDataDelegate, 'findMany'>['select']
	>(
		records: Prisma.Result<Prisma.NutritionDataDelegate, object, 'findFirstOrThrow'>[],
		selectClause: S
	): Prisma.Result<Prisma.NutritionDataDelegate, { select: S }, 'findFirstOrThrow'>[] {
		if (!selectClause) {
			return records as Prisma.Result<
				Prisma.NutritionDataDelegate,
				{ select: S },
				'findFirstOrThrow'
			>[];
		}
		return records.map((record) => {
			const partialRecord: Partial<typeof record> = record;
			for (const untypedKey of [
				'id',
				'code',
				'product_name',
				'brands',
				'foodEntries',
				'energy_kcal_100g',
				'proteins_100g',
				'fat_100g',
				'carbohydrates_100g',
				'saturated_fat_100g',
				'unsaturated_fat_100g',
				'monounsaturated_fat_100g',
				'polyunsaturated_fat_100g',
				'trans_fat_100g',
				'cholesterol_100g',
				'sugars_100g',
				'polyols_100g',
				'fiber_100g',
				'salt_100g',
				'sodium_100g',
				'alcohol_100g',
				'vitamin_a_100g',
				'vitamin_d_100g',
				'vitamin_e_100g',
				'vitamin_k_100g',
				'vitamin_c_100g',
				'vitamin_b1_100g',
				'vitamin_b2_100g',
				'vitamin_b6_100g',
				'vitamin_b9_100g',
				'folates_100g',
				'vitamin_b12_100g',
				'potassium_100g',
				'calcium_100g',
				'phosphorus_100g',
				'iron_100g',
				'magnesium_100g',
				'zinc_100g',
				'copper_100g',
				'manganese_100g',
				'caffeine_100g'
			]) {
				const key = untypedKey as keyof typeof record & keyof S;
				if (!selectClause[key]) delete partialRecord[key];
			}
			return partialRecord;
		}) as Prisma.Result<Prisma.NutritionDataDelegate, { select: S }, 'findFirstOrThrow'>[];
	}
	private async _applyRelations<Q extends Prisma.Args<Prisma.NutritionDataDelegate, 'findMany'>>(
		records: Prisma.Result<Prisma.NutritionDataDelegate, object, 'findFirstOrThrow'>[],
		tx: IDBUtils.TransactionType,
		query?: Q
	): Promise<Prisma.Result<Prisma.NutritionDataDelegate, Q, 'findFirstOrThrow'>[]> {
		if (!query)
			return records as Prisma.Result<Prisma.NutritionDataDelegate, Q, 'findFirstOrThrow'>[];
		const recordsWithRelations = records.map(async (record) => {
			const unsafeRecord = record as Record<string, unknown>;
			const attach_foodEntries = query.select?.foodEntries || query.include?.foodEntries;
			if (attach_foodEntries) {
				unsafeRecord['foodEntries'] = await this.client.foodEntry.findMany(
					{
						...(attach_foodEntries === true ? {} : attach_foodEntries),
						where: { nutritionDataId: record.id! }
					},
					tx
				);
			}
			return unsafeRecord;
		});
		return (await Promise.all(recordsWithRelations)) as Prisma.Result<
			Prisma.NutritionDataDelegate,
			Q,
			'findFirstOrThrow'
		>[];
	}
	async _applyOrderByClause<
		O extends Prisma.Args<Prisma.NutritionDataDelegate, 'findMany'>['orderBy'],
		R extends Prisma.Result<Prisma.NutritionDataDelegate, object, 'findFirstOrThrow'>
	>(records: R[], orderByClause: O, tx: IDBUtils.TransactionType): Promise<void> {
		if (orderByClause === undefined) return;
		const orderByClauses = IDBUtils.convertToArray(orderByClause);
		const indexedKeys = await Promise.all(
			records.map(async (record) => {
				const keys = await Promise.all(
					orderByClauses.map(async (clause) => await this._resolveOrderByKey(record, clause, tx))
				);
				return { keys, record };
			})
		);
		indexedKeys.sort((a, b) => {
			for (let i = 0; i < orderByClauses.length; i++) {
				const clause = orderByClauses[i];
				const comparison = IDBUtils.genericComparator(
					a.keys[i],
					b.keys[i],
					this._resolveSortOrder(clause)
				);
				if (comparison !== 0) return comparison;
			}
			return 0;
		});
		for (let i = 0; i < records.length; i++) {
			records[i] = indexedKeys[i].record;
		}
	}
	async _resolveOrderByKey(
		record: Prisma.Result<Prisma.NutritionDataDelegate, object, 'findFirstOrThrow'>,
		orderByInput: Prisma.NutritionDataOrderByWithRelationInput,
		tx: IDBUtils.TransactionType
	): Promise<unknown> {
		const scalarFields = [
			'id',
			'code',
			'product_name',
			'brands',
			'energy_kcal_100g',
			'proteins_100g',
			'fat_100g',
			'carbohydrates_100g',
			'saturated_fat_100g',
			'unsaturated_fat_100g',
			'monounsaturated_fat_100g',
			'polyunsaturated_fat_100g',
			'trans_fat_100g',
			'cholesterol_100g',
			'sugars_100g',
			'polyols_100g',
			'fiber_100g',
			'salt_100g',
			'sodium_100g',
			'alcohol_100g',
			'vitamin_a_100g',
			'vitamin_d_100g',
			'vitamin_e_100g',
			'vitamin_k_100g',
			'vitamin_c_100g',
			'vitamin_b1_100g',
			'vitamin_b2_100g',
			'vitamin_b6_100g',
			'vitamin_b9_100g',
			'folates_100g',
			'vitamin_b12_100g',
			'potassium_100g',
			'calcium_100g',
			'phosphorus_100g',
			'iron_100g',
			'magnesium_100g',
			'zinc_100g',
			'copper_100g',
			'manganese_100g',
			'caffeine_100g'
		] as const;
		for (const field of scalarFields) if (orderByInput[field]) return record[field];
		if (orderByInput.foodEntries) {
			return await this.client.foodEntry.count({ where: { nutritionDataId: record.id } }, tx);
		}
	}
	_resolveSortOrder(
		orderByInput: Prisma.NutritionDataOrderByWithRelationInput
	): Prisma.SortOrder | { sort: Prisma.SortOrder; nulls?: 'first' | 'last' } {
		const scalarFields = [
			'id',
			'code',
			'product_name',
			'brands',
			'energy_kcal_100g',
			'proteins_100g',
			'fat_100g',
			'carbohydrates_100g',
			'saturated_fat_100g',
			'unsaturated_fat_100g',
			'monounsaturated_fat_100g',
			'polyunsaturated_fat_100g',
			'trans_fat_100g',
			'cholesterol_100g',
			'sugars_100g',
			'polyols_100g',
			'fiber_100g',
			'salt_100g',
			'sodium_100g',
			'alcohol_100g',
			'vitamin_a_100g',
			'vitamin_d_100g',
			'vitamin_e_100g',
			'vitamin_k_100g',
			'vitamin_c_100g',
			'vitamin_b1_100g',
			'vitamin_b2_100g',
			'vitamin_b6_100g',
			'vitamin_b9_100g',
			'folates_100g',
			'vitamin_b12_100g',
			'potassium_100g',
			'calcium_100g',
			'phosphorus_100g',
			'iron_100g',
			'magnesium_100g',
			'zinc_100g',
			'copper_100g',
			'manganese_100g',
			'caffeine_100g'
		] as const;
		for (const field of scalarFields) if (orderByInput[field]) return orderByInput[field];
		if (orderByInput.foodEntries?._count) {
			return orderByInput.foodEntries._count;
		}
		throw new Error('No field in orderBy clause');
	}
	private async _fillDefaults<
		D extends Prisma.Args<Prisma.NutritionDataDelegate, 'create'>['data']
	>(data: D, tx?: IDBUtils.ReadwriteTransactionType): Promise<D> {
		if (data === undefined) data = {} as NonNullable<D>;
		if (data.id === undefined) {
			const transaction = tx ?? this.client._db.transaction(['NutritionData'], 'readwrite');
			const store = transaction.objectStore('NutritionData');
			const cursor = await store.openCursor(null, 'prev');
			data.id = cursor ? Number(cursor.key) + 1 : 1;
		}
		if (data.brands === undefined) {
			data.brands = null;
		}
		if (data.saturated_fat_100g === undefined) {
			data.saturated_fat_100g = null;
		}
		if (data.unsaturated_fat_100g === undefined) {
			data.unsaturated_fat_100g = null;
		}
		if (data.monounsaturated_fat_100g === undefined) {
			data.monounsaturated_fat_100g = null;
		}
		if (data.polyunsaturated_fat_100g === undefined) {
			data.polyunsaturated_fat_100g = null;
		}
		if (data.trans_fat_100g === undefined) {
			data.trans_fat_100g = null;
		}
		if (data.cholesterol_100g === undefined) {
			data.cholesterol_100g = null;
		}
		if (data.sugars_100g === undefined) {
			data.sugars_100g = null;
		}
		if (data.polyols_100g === undefined) {
			data.polyols_100g = null;
		}
		if (data.fiber_100g === undefined) {
			data.fiber_100g = null;
		}
		if (data.salt_100g === undefined) {
			data.salt_100g = null;
		}
		if (data.sodium_100g === undefined) {
			data.sodium_100g = null;
		}
		if (data.alcohol_100g === undefined) {
			data.alcohol_100g = null;
		}
		if (data.vitamin_a_100g === undefined) {
			data.vitamin_a_100g = null;
		}
		if (data.vitamin_d_100g === undefined) {
			data.vitamin_d_100g = null;
		}
		if (data.vitamin_e_100g === undefined) {
			data.vitamin_e_100g = null;
		}
		if (data.vitamin_k_100g === undefined) {
			data.vitamin_k_100g = null;
		}
		if (data.vitamin_c_100g === undefined) {
			data.vitamin_c_100g = null;
		}
		if (data.vitamin_b1_100g === undefined) {
			data.vitamin_b1_100g = null;
		}
		if (data.vitamin_b2_100g === undefined) {
			data.vitamin_b2_100g = null;
		}
		if (data.vitamin_b6_100g === undefined) {
			data.vitamin_b6_100g = null;
		}
		if (data.vitamin_b9_100g === undefined) {
			data.vitamin_b9_100g = null;
		}
		if (data.folates_100g === undefined) {
			data.folates_100g = null;
		}
		if (data.vitamin_b12_100g === undefined) {
			data.vitamin_b12_100g = null;
		}
		if (data.potassium_100g === undefined) {
			data.potassium_100g = null;
		}
		if (data.calcium_100g === undefined) {
			data.calcium_100g = null;
		}
		if (data.phosphorus_100g === undefined) {
			data.phosphorus_100g = null;
		}
		if (data.iron_100g === undefined) {
			data.iron_100g = null;
		}
		if (data.magnesium_100g === undefined) {
			data.magnesium_100g = null;
		}
		if (data.zinc_100g === undefined) {
			data.zinc_100g = null;
		}
		if (data.copper_100g === undefined) {
			data.copper_100g = null;
		}
		if (data.manganese_100g === undefined) {
			data.manganese_100g = null;
		}
		if (data.caffeine_100g === undefined) {
			data.caffeine_100g = null;
		}
		return data;
	}
	_getNeededStoresForWhere<
		W extends Prisma.Args<Prisma.NutritionDataDelegate, 'findMany'>['where']
	>(whereClause: W, neededStores: Set<StoreNames<PrismaIDBSchema>>) {
		if (whereClause === undefined) return;
		for (const param of IDBUtils.LogicalParams) {
			if (whereClause[param]) {
				for (const clause of IDBUtils.convertToArray(whereClause[param])) {
					this._getNeededStoresForWhere(clause, neededStores);
				}
			}
		}
		if (whereClause.foodEntries) {
			neededStores.add('FoodEntry');
			this.client.foodEntry._getNeededStoresForWhere(whereClause.foodEntries.every, neededStores);
			this.client.foodEntry._getNeededStoresForWhere(whereClause.foodEntries.some, neededStores);
			this.client.foodEntry._getNeededStoresForWhere(whereClause.foodEntries.none, neededStores);
		}
	}
	_getNeededStoresForFind<Q extends Prisma.Args<Prisma.NutritionDataDelegate, 'findMany'>>(
		query?: Q
	): Set<StoreNames<PrismaIDBSchema>> {
		const neededStores: Set<StoreNames<PrismaIDBSchema>> = new Set();
		neededStores.add('NutritionData');
		this._getNeededStoresForWhere(query?.where, neededStores);
		if (query?.orderBy) {
			const orderBy = IDBUtils.convertToArray(query.orderBy);
			const orderBy_foodEntries = orderBy.find((clause) => clause.foodEntries);
			if (orderBy_foodEntries) {
				neededStores.add('FoodEntry');
			}
		}
		if (query?.select?.foodEntries || query?.include?.foodEntries) {
			neededStores.add('FoodEntry');
			if (typeof query.select?.foodEntries === 'object') {
				this.client.foodEntry
					._getNeededStoresForFind(query.select.foodEntries)
					.forEach((storeName) => neededStores.add(storeName));
			}
			if (typeof query.include?.foodEntries === 'object') {
				this.client.foodEntry
					._getNeededStoresForFind(query.include.foodEntries)
					.forEach((storeName) => neededStores.add(storeName));
			}
		}
		return neededStores;
	}
	_getNeededStoresForCreate<
		D extends Partial<Prisma.Args<Prisma.NutritionDataDelegate, 'create'>['data']>
	>(data: D): Set<StoreNames<PrismaIDBSchema>> {
		const neededStores: Set<StoreNames<PrismaIDBSchema>> = new Set();
		neededStores.add('NutritionData');
		if (data?.foodEntries) {
			neededStores.add('FoodEntry');
			if (data.foodEntries.create) {
				const createData = Array.isArray(data.foodEntries.create)
					? data.foodEntries.create
					: [data.foodEntries.create];
				createData.forEach((record) =>
					this.client.foodEntry
						._getNeededStoresForCreate(record)
						.forEach((storeName) => neededStores.add(storeName))
				);
			}
			if (data.foodEntries.connectOrCreate) {
				IDBUtils.convertToArray(data.foodEntries.connectOrCreate).forEach((record) =>
					this.client.foodEntry
						._getNeededStoresForCreate(record.create)
						.forEach((storeName) => neededStores.add(storeName))
				);
			}
			if (data.foodEntries.createMany) {
				IDBUtils.convertToArray(data.foodEntries.createMany.data).forEach((record) =>
					this.client.foodEntry
						._getNeededStoresForCreate(record)
						.forEach((storeName) => neededStores.add(storeName))
				);
			}
		}
		return neededStores;
	}
	_getNeededStoresForUpdate<Q extends Prisma.Args<Prisma.NutritionDataDelegate, 'update'>>(
		query: Partial<Q>
	): Set<StoreNames<PrismaIDBSchema>> {
		const neededStores = this._getNeededStoresForFind(query).union(
			this._getNeededStoresForCreate(
				query.data as Prisma.Args<Prisma.NutritionDataDelegate, 'create'>['data']
			)
		);
		if (query.data?.foodEntries?.connect) {
			neededStores.add('FoodEntry');
			IDBUtils.convertToArray(query.data.foodEntries.connect).forEach((connect) => {
				this.client.foodEntry._getNeededStoresForWhere(connect, neededStores);
			});
		}
		if (query.data?.foodEntries?.set) {
			neededStores.add('FoodEntry');
			IDBUtils.convertToArray(query.data.foodEntries.set).forEach((setWhere) => {
				this.client.foodEntry._getNeededStoresForWhere(setWhere, neededStores);
			});
		}
		if (query.data?.foodEntries?.updateMany) {
			neededStores.add('FoodEntry');
			IDBUtils.convertToArray(query.data.foodEntries.updateMany).forEach((update) => {
				this.client.foodEntry
					._getNeededStoresForUpdate(update as Prisma.Args<Prisma.FoodEntryDelegate, 'update'>)
					.forEach((store) => neededStores.add(store));
			});
		}
		if (query.data?.foodEntries?.update) {
			neededStores.add('FoodEntry');
			IDBUtils.convertToArray(query.data.foodEntries.update).forEach((update) => {
				this.client.foodEntry
					._getNeededStoresForUpdate(update as Prisma.Args<Prisma.FoodEntryDelegate, 'update'>)
					.forEach((store) => neededStores.add(store));
			});
		}
		if (query.data?.foodEntries?.upsert) {
			neededStores.add('FoodEntry');
			IDBUtils.convertToArray(query.data.foodEntries.upsert).forEach((upsert) => {
				const update = {
					where: upsert.where,
					data: { ...upsert.update, ...upsert.create }
				} as Prisma.Args<Prisma.FoodEntryDelegate, 'update'>;
				this.client.foodEntry
					._getNeededStoresForUpdate(update)
					.forEach((store) => neededStores.add(store));
			});
		}
		if (query.data?.foodEntries?.delete || query.data?.foodEntries?.deleteMany) {
			this.client.foodEntry._getNeededStoresForNestedDelete(neededStores);
		}
		if (query.data?.id !== undefined) {
			neededStores.add('FoodEntry');
		}
		return neededStores;
	}
	_getNeededStoresForNestedDelete(neededStores: Set<StoreNames<PrismaIDBSchema>>): void {
		neededStores.add('NutritionData');
		this.client.foodEntry._getNeededStoresForNestedDelete(neededStores);
	}
	private _removeNestedCreateData<
		D extends Prisma.Args<Prisma.NutritionDataDelegate, 'create'>['data']
	>(data: D): Prisma.Result<Prisma.NutritionDataDelegate, object, 'findFirstOrThrow'> {
		const recordWithoutNestedCreate = structuredClone(data);
		delete recordWithoutNestedCreate?.foodEntries;
		return recordWithoutNestedCreate as Prisma.Result<
			Prisma.NutritionDataDelegate,
			object,
			'findFirstOrThrow'
		>;
	}
	private _preprocessListFields(
		records: Prisma.Result<Prisma.NutritionDataDelegate, object, 'findMany'>
	): void {}
	async findMany<Q extends Prisma.Args<Prisma.NutritionDataDelegate, 'findMany'>>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.NutritionDataDelegate, Q, 'findMany'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		const records = await this._applyWhereClause(
			await tx.objectStore('NutritionData').getAll(),
			query?.where,
			tx
		);
		await this._applyOrderByClause(records, query?.orderBy, tx);
		const relationAppliedRecords = (await this._applyRelations(
			records,
			tx,
			query
		)) as Prisma.Result<Prisma.NutritionDataDelegate, object, 'findFirstOrThrow'>[];
		const selectClause = query?.select;
		let selectAppliedRecords = this._applySelectClause(relationAppliedRecords, selectClause);
		if (query?.distinct) {
			const distinctFields = IDBUtils.convertToArray(query.distinct);
			const seen = new Set<string>();
			selectAppliedRecords = selectAppliedRecords.filter((record) => {
				const key = distinctFields.map((field) => record[field]).join('|');
				if (seen.has(key)) return false;
				seen.add(key);
				return true;
			});
		}
		this._preprocessListFields(selectAppliedRecords);
		return selectAppliedRecords as Prisma.Result<Prisma.NutritionDataDelegate, Q, 'findMany'>;
	}
	async findFirst<Q extends Prisma.Args<Prisma.NutritionDataDelegate, 'findFirst'>>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.NutritionDataDelegate, Q, 'findFirst'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		return (await this.findMany(query, tx))[0] ?? null;
	}
	async findFirstOrThrow<Q extends Prisma.Args<Prisma.NutritionDataDelegate, 'findFirstOrThrow'>>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.NutritionDataDelegate, Q, 'findFirstOrThrow'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		const record = await this.findFirst(query, tx);
		if (!record) {
			tx.abort();
			throw new Error('Record not found');
		}
		return record;
	}
	async findUnique<Q extends Prisma.Args<Prisma.NutritionDataDelegate, 'findUnique'>>(
		query: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.NutritionDataDelegate, Q, 'findUnique'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		let record;
		if (query.where.id !== undefined) {
			record = await tx.objectStore('NutritionData').get([query.where.id]);
		} else if (query.where.code !== undefined) {
			record = await tx.objectStore('NutritionData').index('codeIndex').get([query.where.code]);
		}
		if (!record) return null;

		const recordWithRelations = this._applySelectClause(
			await this._applyRelations(
				await this._applyWhereClause([record], query.where, tx),
				tx,
				query
			),
			query.select
		)[0];
		this._preprocessListFields([recordWithRelations]);
		return recordWithRelations as Prisma.Result<Prisma.NutritionDataDelegate, Q, 'findUnique'>;
	}
	async findUniqueOrThrow<Q extends Prisma.Args<Prisma.NutritionDataDelegate, 'findUniqueOrThrow'>>(
		query: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.NutritionDataDelegate, Q, 'findUniqueOrThrow'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		const record = await this.findUnique(query, tx);
		if (!record) {
			tx.abort();
			throw new Error('Record not found');
		}
		return record;
	}
	async count<Q extends Prisma.Args<Prisma.NutritionDataDelegate, 'count'>>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.NutritionDataDelegate, Q, 'count'>> {
		tx = tx ?? this.client._db.transaction(['NutritionData'], 'readonly');
		if (!query?.select || query.select === true) {
			const records = await this.findMany({ where: query?.where }, tx);
			return records.length as Prisma.Result<Prisma.NutritionDataDelegate, Q, 'count'>;
		}
		const result: Partial<Record<keyof Prisma.NutritionDataCountAggregateInputType, number>> = {};
		for (const key of Object.keys(query.select)) {
			const typedKey = key as keyof typeof query.select;
			if (typedKey === '_all') {
				result[typedKey] = (await this.findMany({ where: query.where }, tx)).length;
				continue;
			}
			result[typedKey] = (
				await this.findMany({ where: { [`${typedKey}`]: { not: null } } }, tx)
			).length;
		}
		return result as Prisma.Result<Prisma.NutritionDataDelegate, Q, 'count'>;
	}
	async create<Q extends Prisma.Args<Prisma.NutritionDataDelegate, 'create'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.NutritionDataDelegate, Q, 'create'>> {
		const storesNeeded = this._getNeededStoresForCreate(query.data);
		tx = tx ?? this.client._db.transaction(Array.from(storesNeeded), 'readwrite');
		const record = this._removeNestedCreateData(await this._fillDefaults(query.data, tx));
		const keyPath = await tx.objectStore('NutritionData').add(record);
		if (query.data?.foodEntries?.create) {
			const createData = Array.isArray(query.data.foodEntries.create)
				? query.data.foodEntries.create
				: [query.data.foodEntries.create];
			for (const elem of createData) {
				await this.client.foodEntry.create(
					{
						data: { ...elem, nutritionData: { connect: { id: keyPath[0] } } } as Prisma.Args<
							Prisma.FoodEntryDelegate,
							'create'
						>['data']
					},
					tx
				);
			}
		}
		if (query.data?.foodEntries?.connect) {
			await Promise.all(
				IDBUtils.convertToArray(query.data.foodEntries.connect).map(async (connectWhere) => {
					await this.client.foodEntry.update(
						{ where: connectWhere, data: { nutritionDataId: keyPath[0] } },
						tx
					);
				})
			);
		}
		if (query.data?.foodEntries?.connectOrCreate) {
			await Promise.all(
				IDBUtils.convertToArray(query.data.foodEntries.connectOrCreate).map(
					async (connectOrCreate) => {
						await this.client.foodEntry.upsert(
							{
								where: connectOrCreate.where,
								create: { ...connectOrCreate.create, nutritionDataId: keyPath[0] } as NonNullable<
									Prisma.Args<Prisma.FoodEntryDelegate, 'create'>['data']
								>,
								update: { nutritionDataId: keyPath[0] }
							},
							tx
						);
					}
				)
			);
		}
		if (query.data?.foodEntries?.createMany) {
			await this.client.foodEntry.createMany(
				{
					data: IDBUtils.convertToArray(query.data.foodEntries.createMany.data).map(
						(createData) => ({
							...createData,
							nutritionDataId: keyPath[0]
						})
					)
				},
				tx
			);
		}
		const data = (await tx.objectStore('NutritionData').get(keyPath))!;
		const recordsWithRelations = this._applySelectClause(
			await this._applyRelations<object>([data], tx, query),
			query.select
		)[0];
		this._preprocessListFields([recordsWithRelations]);
		this.emit('create', keyPath);
		return recordsWithRelations as Prisma.Result<Prisma.NutritionDataDelegate, Q, 'create'>;
	}
	async createMany<Q extends Prisma.Args<Prisma.NutritionDataDelegate, 'createMany'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.NutritionDataDelegate, Q, 'createMany'>> {
		const createManyData = IDBUtils.convertToArray(query.data);
		tx = tx ?? this.client._db.transaction(['NutritionData'], 'readwrite');
		for (const createData of createManyData) {
			const record = this._removeNestedCreateData(await this._fillDefaults(createData, tx));
			const keyPath = await tx.objectStore('NutritionData').add(record);
			this.emit('create', keyPath);
		}
		return { count: createManyData.length };
	}
	async createManyAndReturn<
		Q extends Prisma.Args<Prisma.NutritionDataDelegate, 'createManyAndReturn'>
	>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.NutritionDataDelegate, Q, 'createManyAndReturn'>> {
		const createManyData = IDBUtils.convertToArray(query.data);
		const records: Prisma.Result<Prisma.NutritionDataDelegate, object, 'findMany'> = [];
		tx = tx ?? this.client._db.transaction(['NutritionData'], 'readwrite');
		for (const createData of createManyData) {
			const record = this._removeNestedCreateData(await this._fillDefaults(createData, tx));
			const keyPath = await tx.objectStore('NutritionData').add(record);
			this.emit('create', keyPath);
			records.push(this._applySelectClause([record], query.select)[0]);
		}
		this._preprocessListFields(records);
		return records as Prisma.Result<Prisma.NutritionDataDelegate, Q, 'createManyAndReturn'>;
	}
	async delete<Q extends Prisma.Args<Prisma.NutritionDataDelegate, 'delete'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.NutritionDataDelegate, Q, 'delete'>> {
		const storesNeeded = this._getNeededStoresForFind(query);
		this._getNeededStoresForNestedDelete(storesNeeded);
		tx = tx ?? this.client._db.transaction(Array.from(storesNeeded), 'readwrite');
		const record = await this.findUnique(query, tx);
		if (!record) throw new Error('Record not found');
		await this.client.foodEntry.updateMany(
			{
				where: { nutritionDataId: record.id },
				data: { nutritionDataId: null }
			},
			tx
		);
		await tx.objectStore('NutritionData').delete([record.id]);
		this.emit('delete', [record.id]);
		return record;
	}
	async deleteMany<Q extends Prisma.Args<Prisma.NutritionDataDelegate, 'deleteMany'>>(
		query?: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.NutritionDataDelegate, Q, 'deleteMany'>> {
		const storesNeeded = this._getNeededStoresForFind(query);
		this._getNeededStoresForNestedDelete(storesNeeded);
		tx = tx ?? this.client._db.transaction(Array.from(storesNeeded), 'readwrite');
		const records = await this.findMany(query, tx);
		for (const record of records) {
			await this.delete({ where: { id: record.id } }, tx);
		}
		return { count: records.length };
	}
	async update<Q extends Prisma.Args<Prisma.NutritionDataDelegate, 'update'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.NutritionDataDelegate, Q, 'update'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForUpdate(query)), 'readwrite');
		const record = await this.findUnique({ where: query.where }, tx);
		if (record === null) {
			tx.abort();
			throw new Error('Record not found');
		}
		const startKeyPath: PrismaIDBSchema['NutritionData']['key'] = [record.id];
		const stringFields = ['code', 'product_name', 'brands'] as const;
		for (const field of stringFields) {
			IDBUtils.handleStringUpdateField(record, field, query.data[field]);
		}
		const intFields = ['id'] as const;
		for (const field of intFields) {
			IDBUtils.handleIntUpdateField(record, field, query.data[field]);
		}
		const floatFields = [
			'energy_kcal_100g',
			'proteins_100g',
			'fat_100g',
			'carbohydrates_100g',
			'saturated_fat_100g',
			'unsaturated_fat_100g',
			'monounsaturated_fat_100g',
			'polyunsaturated_fat_100g',
			'trans_fat_100g',
			'cholesterol_100g',
			'sugars_100g',
			'polyols_100g',
			'fiber_100g',
			'salt_100g',
			'sodium_100g',
			'alcohol_100g',
			'vitamin_a_100g',
			'vitamin_d_100g',
			'vitamin_e_100g',
			'vitamin_k_100g',
			'vitamin_c_100g',
			'vitamin_b1_100g',
			'vitamin_b2_100g',
			'vitamin_b6_100g',
			'vitamin_b9_100g',
			'folates_100g',
			'vitamin_b12_100g',
			'potassium_100g',
			'calcium_100g',
			'phosphorus_100g',
			'iron_100g',
			'magnesium_100g',
			'zinc_100g',
			'copper_100g',
			'manganese_100g',
			'caffeine_100g'
		] as const;
		for (const field of floatFields) {
			IDBUtils.handleFloatUpdateField(record, field, query.data[field]);
		}
		if (query.data.foodEntries) {
			if (query.data.foodEntries.connect) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.foodEntries.connect).map(async (connectWhere) => {
						await this.client.foodEntry.update(
							{ where: connectWhere, data: { nutritionDataId: record.id } },
							tx
						);
					})
				);
			}
			if (query.data.foodEntries.disconnect) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.foodEntries.disconnect).map(async (connectWhere) => {
						await this.client.foodEntry.update(
							{ where: connectWhere, data: { nutritionDataId: null } },
							tx
						);
					})
				);
			}
			if (query.data.foodEntries.create) {
				const createData = Array.isArray(query.data.foodEntries.create)
					? query.data.foodEntries.create
					: [query.data.foodEntries.create];
				for (const elem of createData) {
					await this.client.foodEntry.create(
						{
							data: { ...elem, nutritionDataId: record.id } as Prisma.Args<
								Prisma.FoodEntryDelegate,
								'create'
							>['data']
						},
						tx
					);
				}
			}
			if (query.data.foodEntries.createMany) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.foodEntries.createMany.data).map(
						async (createData) => {
							await this.client.foodEntry.create(
								{ data: { ...createData, nutritionDataId: record.id } },
								tx
							);
						}
					)
				);
			}
			if (query.data.foodEntries.update) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.foodEntries.update).map(async (updateData) => {
						await this.client.foodEntry.update(updateData, tx);
					})
				);
			}
			if (query.data.foodEntries.updateMany) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.foodEntries.updateMany).map(async (updateData) => {
						await this.client.foodEntry.updateMany(updateData, tx);
					})
				);
			}
			if (query.data.foodEntries.upsert) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.foodEntries.upsert).map(async (upsertData) => {
						await this.client.foodEntry.upsert(
							{
								...upsertData,
								where: { ...upsertData.where, nutritionDataId: record.id },
								create: { ...upsertData.create, nutritionDataId: record.id } as Prisma.Args<
									Prisma.FoodEntryDelegate,
									'upsert'
								>['create']
							},
							tx
						);
					})
				);
			}
			if (query.data.foodEntries.delete) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.foodEntries.delete).map(async (deleteData) => {
						await this.client.foodEntry.delete(
							{ where: { ...deleteData, nutritionDataId: record.id } },
							tx
						);
					})
				);
			}
			if (query.data.foodEntries.deleteMany) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.foodEntries.deleteMany).map(async (deleteData) => {
						await this.client.foodEntry.deleteMany(
							{ where: { ...deleteData, nutritionDataId: record.id } },
							tx
						);
					})
				);
			}
			if (query.data.foodEntries.set) {
				const existing = await this.client.foodEntry.findMany(
					{ where: { nutritionDataId: record.id } },
					tx
				);
				if (existing.length > 0) {
					await this.client.foodEntry.updateMany(
						{ where: { nutritionDataId: record.id }, data: { nutritionDataId: null } },
						tx
					);
				}
				await Promise.all(
					IDBUtils.convertToArray(query.data.foodEntries.set).map(async (setData) => {
						await this.client.foodEntry.update(
							{ where: setData, data: { nutritionDataId: record.id } },
							tx
						);
					})
				);
			}
		}
		const endKeyPath: PrismaIDBSchema['NutritionData']['key'] = [record.id];
		for (let i = 0; i < startKeyPath.length; i++) {
			if (startKeyPath[i] !== endKeyPath[i]) {
				if ((await tx.objectStore('NutritionData').get(endKeyPath)) !== undefined) {
					throw new Error('Record with the same keyPath already exists');
				}
				await tx.objectStore('NutritionData').delete(startKeyPath);
				break;
			}
		}
		const keyPath = await tx.objectStore('NutritionData').put(record);
		this.emit('update', keyPath, startKeyPath);
		for (let i = 0; i < startKeyPath.length; i++) {
			if (startKeyPath[i] !== endKeyPath[i]) {
				await this.client.foodEntry.updateMany(
					{
						where: { nutritionDataId: startKeyPath[0] },
						data: { nutritionDataId: endKeyPath[0] }
					},
					tx
				);
				break;
			}
		}
		const recordWithRelations = (await this.findUnique(
			{
				where: { id: keyPath[0] }
			},
			tx
		))!;
		return recordWithRelations as Prisma.Result<Prisma.NutritionDataDelegate, Q, 'update'>;
	}
	async updateMany<Q extends Prisma.Args<Prisma.NutritionDataDelegate, 'updateMany'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.NutritionDataDelegate, Q, 'updateMany'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readwrite');
		const records = await this.findMany({ where: query.where }, tx);
		await Promise.all(
			records.map(async (record) => {
				await this.update({ where: { id: record.id }, data: query.data }, tx);
			})
		);
		return { count: records.length };
	}
	async upsert<Q extends Prisma.Args<Prisma.NutritionDataDelegate, 'upsert'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.NutritionDataDelegate, Q, 'upsert'>> {
		const neededStores = this._getNeededStoresForUpdate({
			...query,
			data: { ...query.update, ...query.create } as Prisma.Args<
				Prisma.NutritionDataDelegate,
				'update'
			>['data']
		});
		tx = tx ?? this.client._db.transaction(Array.from(neededStores), 'readwrite');
		let record = await this.findUnique({ where: query.where }, tx);
		if (!record) record = await this.create({ data: query.create }, tx);
		else record = await this.update({ where: query.where, data: query.update }, tx);
		record = await this.findUniqueOrThrow(
			{ where: { id: record.id }, select: query.select, include: query.include },
			tx
		);
		return record as Prisma.Result<Prisma.NutritionDataDelegate, Q, 'upsert'>;
	}
	async aggregate<Q extends Prisma.Args<Prisma.NutritionDataDelegate, 'aggregate'>>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.NutritionDataDelegate, Q, 'aggregate'>> {
		tx = tx ?? this.client._db.transaction(['NutritionData'], 'readonly');
		const records = await this.findMany({ where: query?.where }, tx);
		const result: Partial<Prisma.Result<Prisma.NutritionDataDelegate, Q, 'aggregate'>> = {};
		if (query?._count) {
			if (query._count === true) {
				(result._count as number) = records.length;
			} else {
				for (const key of Object.keys(query._count)) {
					const typedKey = key as keyof typeof query._count;
					if (typedKey === '_all') {
						(result._count as Record<string, number>)[typedKey] = records.length;
						continue;
					}
					(result._count as Record<string, number>)[typedKey] = (
						await this.findMany({ where: { [`${typedKey}`]: { not: null } } }, tx)
					).length;
				}
			}
		}
		if (query?._min) {
			const minResult = {} as Prisma.Result<Prisma.NutritionDataDelegate, Q, 'aggregate'>['_min'];
			const numericFields = [
				'id',
				'energy_kcal_100g',
				'proteins_100g',
				'fat_100g',
				'carbohydrates_100g',
				'saturated_fat_100g',
				'unsaturated_fat_100g',
				'monounsaturated_fat_100g',
				'polyunsaturated_fat_100g',
				'trans_fat_100g',
				'cholesterol_100g',
				'sugars_100g',
				'polyols_100g',
				'fiber_100g',
				'salt_100g',
				'sodium_100g',
				'alcohol_100g',
				'vitamin_a_100g',
				'vitamin_d_100g',
				'vitamin_e_100g',
				'vitamin_k_100g',
				'vitamin_c_100g',
				'vitamin_b1_100g',
				'vitamin_b2_100g',
				'vitamin_b6_100g',
				'vitamin_b9_100g',
				'folates_100g',
				'vitamin_b12_100g',
				'potassium_100g',
				'calcium_100g',
				'phosphorus_100g',
				'iron_100g',
				'magnesium_100g',
				'zinc_100g',
				'copper_100g',
				'manganese_100g',
				'caffeine_100g'
			] as const;
			for (const field of numericFields) {
				if (!query._min[field]) continue;
				const values = records
					.map((record) => record[field] as number)
					.filter((value) => value !== undefined);
				(minResult[field as keyof typeof minResult] as number) = Math.min(...values);
			}
			const stringFields = ['code', 'product_name', 'brands'] as const;
			for (const field of stringFields) {
				if (!query._min[field]) continue;
				const values = records
					.map((record) => record[field] as string)
					.filter((value) => value !== undefined);
				(minResult[field as keyof typeof minResult] as string) = values.sort()[0];
			}
			result._min = minResult;
		}
		if (query?._max) {
			const maxResult = {} as Prisma.Result<Prisma.NutritionDataDelegate, Q, 'aggregate'>['_max'];
			const numericFields = [
				'id',
				'energy_kcal_100g',
				'proteins_100g',
				'fat_100g',
				'carbohydrates_100g',
				'saturated_fat_100g',
				'unsaturated_fat_100g',
				'monounsaturated_fat_100g',
				'polyunsaturated_fat_100g',
				'trans_fat_100g',
				'cholesterol_100g',
				'sugars_100g',
				'polyols_100g',
				'fiber_100g',
				'salt_100g',
				'sodium_100g',
				'alcohol_100g',
				'vitamin_a_100g',
				'vitamin_d_100g',
				'vitamin_e_100g',
				'vitamin_k_100g',
				'vitamin_c_100g',
				'vitamin_b1_100g',
				'vitamin_b2_100g',
				'vitamin_b6_100g',
				'vitamin_b9_100g',
				'folates_100g',
				'vitamin_b12_100g',
				'potassium_100g',
				'calcium_100g',
				'phosphorus_100g',
				'iron_100g',
				'magnesium_100g',
				'zinc_100g',
				'copper_100g',
				'manganese_100g',
				'caffeine_100g'
			] as const;
			for (const field of numericFields) {
				if (!query._max[field]) continue;
				const values = records
					.map((record) => record[field] as number)
					.filter((value) => value !== undefined);
				(maxResult[field as keyof typeof maxResult] as number) = Math.max(...values);
			}
			const stringFields = ['code', 'product_name', 'brands'] as const;
			for (const field of stringFields) {
				if (!query._max[field]) continue;
				const values = records
					.map((record) => record[field] as string)
					.filter((value) => value !== undefined);
				(maxResult[field as keyof typeof maxResult] as string) = values.sort().reverse()[0];
			}
			result._max = maxResult;
		}
		if (query?._avg) {
			const avgResult = {} as Prisma.Result<Prisma.NutritionDataDelegate, Q, 'aggregate'>['_avg'];
			for (const untypedField of Object.keys(query._avg)) {
				const field = untypedField as keyof (typeof records)[number];
				const values = records.map((record) => record[field] as number);
				(avgResult[field as keyof typeof avgResult] as number) =
					values.reduce((a, b) => a + b, 0) / values.length;
			}
			result._avg = avgResult;
		}
		if (query?._sum) {
			const sumResult = {} as Prisma.Result<Prisma.NutritionDataDelegate, Q, 'aggregate'>['_sum'];
			for (const untypedField of Object.keys(query._sum)) {
				const field = untypedField as keyof (typeof records)[number];
				const values = records.map((record) => record[field] as number);
				(sumResult[field as keyof typeof sumResult] as number) = values.reduce((a, b) => a + b, 0);
			}
			result._sum = sumResult;
		}
		return result as unknown as Prisma.Result<Prisma.NutritionDataDelegate, Q, 'aggregate'>;
	}
}
class GettingStartedAnswersIDBClass extends BaseIDBModelClass<'GettingStartedAnswers'> {
	private async _applyWhereClause<
		W extends Prisma.Args<Prisma.GettingStartedAnswersDelegate, 'findFirstOrThrow'>['where'],
		R extends Prisma.Result<Prisma.GettingStartedAnswersDelegate, object, 'findFirstOrThrow'>
	>(records: R[], whereClause: W, tx: IDBUtils.TransactionType): Promise<R[]> {
		if (!whereClause) return records;
		records = await IDBUtils.applyLogicalFilters<Prisma.GettingStartedAnswersDelegate, R, W>(
			records,
			whereClause,
			tx,
			this.keyPath,
			this._applyWhereClause.bind(this)
		);
		return (
			await Promise.all(
				records.map(async (record) => {
					const stringFields = ['id', 'userId'] as const;
					for (const field of stringFields) {
						if (!IDBUtils.whereStringFilter(record, field, whereClause[field])) return null;
					}
					if (whereClause.user) {
						const { is, isNot, ...rest } = whereClause.user;
						if (is !== null && is !== undefined) {
							const relatedRecord = await this.client.user.findFirst(
								{ where: { ...is, id: record.userId } },
								tx
							);
							if (!relatedRecord) return null;
						}
						if (isNot !== null && isNot !== undefined) {
							const relatedRecord = await this.client.user.findFirst(
								{ where: { ...isNot, id: record.userId } },
								tx
							);
							if (relatedRecord) return null;
						}
						if (Object.keys(rest).length) {
							const relatedRecord = await this.client.user.findFirst(
								{ where: { ...whereClause.user, id: record.userId } },
								tx
							);
							if (!relatedRecord) return null;
						}
					}
					return record;
				})
			)
		).filter((result) => result !== null);
	}
	private _applySelectClause<
		S extends Prisma.Args<Prisma.GettingStartedAnswersDelegate, 'findMany'>['select']
	>(
		records: Prisma.Result<Prisma.GettingStartedAnswersDelegate, object, 'findFirstOrThrow'>[],
		selectClause: S
	): Prisma.Result<Prisma.GettingStartedAnswersDelegate, { select: S }, 'findFirstOrThrow'>[] {
		if (!selectClause) {
			return records as Prisma.Result<
				Prisma.GettingStartedAnswersDelegate,
				{ select: S },
				'findFirstOrThrow'
			>[];
		}
		return records.map((record) => {
			const partialRecord: Partial<typeof record> = record;
			for (const untypedKey of ['id', 'user', 'userId', 'fitnessKnowledge', 'myFitPrimaryUsage']) {
				const key = untypedKey as keyof typeof record & keyof S;
				if (!selectClause[key]) delete partialRecord[key];
			}
			return partialRecord;
		}) as Prisma.Result<Prisma.GettingStartedAnswersDelegate, { select: S }, 'findFirstOrThrow'>[];
	}
	private async _applyRelations<
		Q extends Prisma.Args<Prisma.GettingStartedAnswersDelegate, 'findMany'>
	>(
		records: Prisma.Result<Prisma.GettingStartedAnswersDelegate, object, 'findFirstOrThrow'>[],
		tx: IDBUtils.TransactionType,
		query?: Q
	): Promise<Prisma.Result<Prisma.GettingStartedAnswersDelegate, Q, 'findFirstOrThrow'>[]> {
		if (!query)
			return records as Prisma.Result<
				Prisma.GettingStartedAnswersDelegate,
				Q,
				'findFirstOrThrow'
			>[];
		const recordsWithRelations = records.map(async (record) => {
			const unsafeRecord = record as Record<string, unknown>;
			const attach_user = query.select?.user || query.include?.user;
			if (attach_user) {
				unsafeRecord['user'] = await this.client.user.findUnique(
					{
						...(attach_user === true ? {} : attach_user),
						where: { id: record.userId! }
					},
					tx
				);
			}
			return unsafeRecord;
		});
		return (await Promise.all(recordsWithRelations)) as Prisma.Result<
			Prisma.GettingStartedAnswersDelegate,
			Q,
			'findFirstOrThrow'
		>[];
	}
	async _applyOrderByClause<
		O extends Prisma.Args<Prisma.GettingStartedAnswersDelegate, 'findMany'>['orderBy'],
		R extends Prisma.Result<Prisma.GettingStartedAnswersDelegate, object, 'findFirstOrThrow'>
	>(records: R[], orderByClause: O, tx: IDBUtils.TransactionType): Promise<void> {
		if (orderByClause === undefined) return;
		const orderByClauses = IDBUtils.convertToArray(orderByClause);
		const indexedKeys = await Promise.all(
			records.map(async (record) => {
				const keys = await Promise.all(
					orderByClauses.map(async (clause) => await this._resolveOrderByKey(record, clause, tx))
				);
				return { keys, record };
			})
		);
		indexedKeys.sort((a, b) => {
			for (let i = 0; i < orderByClauses.length; i++) {
				const clause = orderByClauses[i];
				const comparison = IDBUtils.genericComparator(
					a.keys[i],
					b.keys[i],
					this._resolveSortOrder(clause)
				);
				if (comparison !== 0) return comparison;
			}
			return 0;
		});
		for (let i = 0; i < records.length; i++) {
			records[i] = indexedKeys[i].record;
		}
	}
	async _resolveOrderByKey(
		record: Prisma.Result<Prisma.GettingStartedAnswersDelegate, object, 'findFirstOrThrow'>,
		orderByInput: Prisma.GettingStartedAnswersOrderByWithRelationInput,
		tx: IDBUtils.TransactionType
	): Promise<unknown> {
		const scalarFields = ['id', 'userId', 'fitnessKnowledge', 'myFitPrimaryUsage'] as const;
		for (const field of scalarFields) if (orderByInput[field]) return record[field];
		if (orderByInput.user) {
			return await this.client.user._resolveOrderByKey(
				await this.client.user.findFirstOrThrow({ where: { id: record.userId } }),
				orderByInput.user,
				tx
			);
		}
	}
	_resolveSortOrder(
		orderByInput: Prisma.GettingStartedAnswersOrderByWithRelationInput
	): Prisma.SortOrder | { sort: Prisma.SortOrder; nulls?: 'first' | 'last' } {
		const scalarFields = ['id', 'userId', 'fitnessKnowledge', 'myFitPrimaryUsage'] as const;
		for (const field of scalarFields) if (orderByInput[field]) return orderByInput[field];
		if (orderByInput.user) {
			return this.client.user._resolveSortOrder(orderByInput.user);
		}
		throw new Error('No field in orderBy clause');
	}
	private async _fillDefaults<
		D extends Prisma.Args<Prisma.GettingStartedAnswersDelegate, 'create'>['data']
	>(data: D, tx?: IDBUtils.ReadwriteTransactionType): Promise<D> {
		if (data === undefined) data = {} as NonNullable<D>;
		if (data.id === undefined) {
			data.id = uuidv4();
		}
		return data;
	}
	_getNeededStoresForWhere<
		W extends Prisma.Args<Prisma.GettingStartedAnswersDelegate, 'findMany'>['where']
	>(whereClause: W, neededStores: Set<StoreNames<PrismaIDBSchema>>) {
		if (whereClause === undefined) return;
		for (const param of IDBUtils.LogicalParams) {
			if (whereClause[param]) {
				for (const clause of IDBUtils.convertToArray(whereClause[param])) {
					this._getNeededStoresForWhere(clause, neededStores);
				}
			}
		}
		if (whereClause.user) {
			neededStores.add('User');
			this.client.user._getNeededStoresForWhere(whereClause.user, neededStores);
		}
	}
	_getNeededStoresForFind<Q extends Prisma.Args<Prisma.GettingStartedAnswersDelegate, 'findMany'>>(
		query?: Q
	): Set<StoreNames<PrismaIDBSchema>> {
		const neededStores: Set<StoreNames<PrismaIDBSchema>> = new Set();
		neededStores.add('GettingStartedAnswers');
		this._getNeededStoresForWhere(query?.where, neededStores);
		if (query?.orderBy) {
			const orderBy = IDBUtils.convertToArray(query.orderBy);
			const orderBy_user = orderBy.find((clause) => clause.user);
			if (orderBy_user) {
				this.client.user
					._getNeededStoresForFind({ orderBy: orderBy_user.user })
					.forEach((storeName) => neededStores.add(storeName));
			}
		}
		if (query?.select?.user || query?.include?.user) {
			neededStores.add('User');
			if (typeof query.select?.user === 'object') {
				this.client.user
					._getNeededStoresForFind(query.select.user)
					.forEach((storeName) => neededStores.add(storeName));
			}
			if (typeof query.include?.user === 'object') {
				this.client.user
					._getNeededStoresForFind(query.include.user)
					.forEach((storeName) => neededStores.add(storeName));
			}
		}
		return neededStores;
	}
	_getNeededStoresForCreate<
		D extends Partial<Prisma.Args<Prisma.GettingStartedAnswersDelegate, 'create'>['data']>
	>(data: D): Set<StoreNames<PrismaIDBSchema>> {
		const neededStores: Set<StoreNames<PrismaIDBSchema>> = new Set();
		neededStores.add('GettingStartedAnswers');
		if (data?.user) {
			neededStores.add('User');
			if (data.user.create) {
				const createData = Array.isArray(data.user.create) ? data.user.create : [data.user.create];
				createData.forEach((record) =>
					this.client.user
						._getNeededStoresForCreate(record)
						.forEach((storeName) => neededStores.add(storeName))
				);
			}
			if (data.user.connectOrCreate) {
				IDBUtils.convertToArray(data.user.connectOrCreate).forEach((record) =>
					this.client.user
						._getNeededStoresForCreate(record.create)
						.forEach((storeName) => neededStores.add(storeName))
				);
			}
		}
		if (data?.userId !== undefined) {
			neededStores.add('User');
		}
		return neededStores;
	}
	_getNeededStoresForUpdate<Q extends Prisma.Args<Prisma.GettingStartedAnswersDelegate, 'update'>>(
		query: Partial<Q>
	): Set<StoreNames<PrismaIDBSchema>> {
		const neededStores = this._getNeededStoresForFind(query).union(
			this._getNeededStoresForCreate(
				query.data as Prisma.Args<Prisma.GettingStartedAnswersDelegate, 'create'>['data']
			)
		);
		if (query.data?.user?.connect) {
			neededStores.add('User');
			IDBUtils.convertToArray(query.data.user.connect).forEach((connect) => {
				this.client.user._getNeededStoresForWhere(connect, neededStores);
			});
		}
		if (query.data?.user?.update) {
			neededStores.add('User');
			IDBUtils.convertToArray(query.data.user.update).forEach((update) => {
				this.client.user
					._getNeededStoresForUpdate(update as Prisma.Args<Prisma.UserDelegate, 'update'>)
					.forEach((store) => neededStores.add(store));
			});
		}
		if (query.data?.user?.upsert) {
			neededStores.add('User');
			IDBUtils.convertToArray(query.data.user.upsert).forEach((upsert) => {
				const update = {
					where: upsert.where,
					data: { ...upsert.update, ...upsert.create }
				} as Prisma.Args<Prisma.UserDelegate, 'update'>;
				this.client.user
					._getNeededStoresForUpdate(update)
					.forEach((store) => neededStores.add(store));
			});
		}
		return neededStores;
	}
	_getNeededStoresForNestedDelete(neededStores: Set<StoreNames<PrismaIDBSchema>>): void {
		neededStores.add('GettingStartedAnswers');
	}
	private _removeNestedCreateData<
		D extends Prisma.Args<Prisma.GettingStartedAnswersDelegate, 'create'>['data']
	>(data: D): Prisma.Result<Prisma.GettingStartedAnswersDelegate, object, 'findFirstOrThrow'> {
		const recordWithoutNestedCreate = structuredClone(data);
		delete recordWithoutNestedCreate?.user;
		return recordWithoutNestedCreate as Prisma.Result<
			Prisma.GettingStartedAnswersDelegate,
			object,
			'findFirstOrThrow'
		>;
	}
	private _preprocessListFields(
		records: Prisma.Result<Prisma.GettingStartedAnswersDelegate, object, 'findMany'>
	): void {}
	async findMany<Q extends Prisma.Args<Prisma.GettingStartedAnswersDelegate, 'findMany'>>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.GettingStartedAnswersDelegate, Q, 'findMany'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		const records = await this._applyWhereClause(
			await tx.objectStore('GettingStartedAnswers').getAll(),
			query?.where,
			tx
		);
		await this._applyOrderByClause(records, query?.orderBy, tx);
		const relationAppliedRecords = (await this._applyRelations(
			records,
			tx,
			query
		)) as Prisma.Result<Prisma.GettingStartedAnswersDelegate, object, 'findFirstOrThrow'>[];
		const selectClause = query?.select;
		let selectAppliedRecords = this._applySelectClause(relationAppliedRecords, selectClause);
		if (query?.distinct) {
			const distinctFields = IDBUtils.convertToArray(query.distinct);
			const seen = new Set<string>();
			selectAppliedRecords = selectAppliedRecords.filter((record) => {
				const key = distinctFields.map((field) => record[field]).join('|');
				if (seen.has(key)) return false;
				seen.add(key);
				return true;
			});
		}
		this._preprocessListFields(selectAppliedRecords);
		return selectAppliedRecords as Prisma.Result<
			Prisma.GettingStartedAnswersDelegate,
			Q,
			'findMany'
		>;
	}
	async findFirst<Q extends Prisma.Args<Prisma.GettingStartedAnswersDelegate, 'findFirst'>>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.GettingStartedAnswersDelegate, Q, 'findFirst'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		return (await this.findMany(query, tx))[0] ?? null;
	}
	async findFirstOrThrow<
		Q extends Prisma.Args<Prisma.GettingStartedAnswersDelegate, 'findFirstOrThrow'>
	>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.GettingStartedAnswersDelegate, Q, 'findFirstOrThrow'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		const record = await this.findFirst(query, tx);
		if (!record) {
			tx.abort();
			throw new Error('Record not found');
		}
		return record;
	}
	async findUnique<Q extends Prisma.Args<Prisma.GettingStartedAnswersDelegate, 'findUnique'>>(
		query: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.GettingStartedAnswersDelegate, Q, 'findUnique'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		let record;
		if (query.where.id !== undefined) {
			record = await tx.objectStore('GettingStartedAnswers').get([query.where.id]);
		} else if (query.where.userId !== undefined) {
			record = await tx
				.objectStore('GettingStartedAnswers')
				.index('userIdIndex')
				.get([query.where.userId]);
		}
		if (!record) return null;

		const recordWithRelations = this._applySelectClause(
			await this._applyRelations(
				await this._applyWhereClause([record], query.where, tx),
				tx,
				query
			),
			query.select
		)[0];
		this._preprocessListFields([recordWithRelations]);
		return recordWithRelations as Prisma.Result<
			Prisma.GettingStartedAnswersDelegate,
			Q,
			'findUnique'
		>;
	}
	async findUniqueOrThrow<
		Q extends Prisma.Args<Prisma.GettingStartedAnswersDelegate, 'findUniqueOrThrow'>
	>(
		query: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.GettingStartedAnswersDelegate, Q, 'findUniqueOrThrow'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		const record = await this.findUnique(query, tx);
		if (!record) {
			tx.abort();
			throw new Error('Record not found');
		}
		return record;
	}
	async count<Q extends Prisma.Args<Prisma.GettingStartedAnswersDelegate, 'count'>>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.GettingStartedAnswersDelegate, Q, 'count'>> {
		tx = tx ?? this.client._db.transaction(['GettingStartedAnswers'], 'readonly');
		if (!query?.select || query.select === true) {
			const records = await this.findMany({ where: query?.where }, tx);
			return records.length as Prisma.Result<Prisma.GettingStartedAnswersDelegate, Q, 'count'>;
		}
		const result: Partial<
			Record<keyof Prisma.GettingStartedAnswersCountAggregateInputType, number>
		> = {};
		for (const key of Object.keys(query.select)) {
			const typedKey = key as keyof typeof query.select;
			if (typedKey === '_all') {
				result[typedKey] = (await this.findMany({ where: query.where }, tx)).length;
				continue;
			}
			result[typedKey] = (
				await this.findMany({ where: { [`${typedKey}`]: { not: null } } }, tx)
			).length;
		}
		return result as Prisma.Result<Prisma.GettingStartedAnswersDelegate, Q, 'count'>;
	}
	async create<Q extends Prisma.Args<Prisma.GettingStartedAnswersDelegate, 'create'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.GettingStartedAnswersDelegate, Q, 'create'>> {
		const storesNeeded = this._getNeededStoresForCreate(query.data);
		tx = tx ?? this.client._db.transaction(Array.from(storesNeeded), 'readwrite');
		if (query.data.user) {
			const fk: Partial<PrismaIDBSchema['User']['key']> = [];
			if (query.data.user?.create) {
				const record = await this.client.user.create({ data: query.data.user.create }, tx);
				fk[0] = record.id;
			}
			if (query.data.user?.connect) {
				const record = await this.client.user.findUniqueOrThrow(
					{ where: query.data.user.connect },
					tx
				);
				delete query.data.user.connect;
				fk[0] = record.id;
			}
			if (query.data.user?.connectOrCreate) {
				const record = await this.client.user.upsert(
					{
						where: query.data.user.connectOrCreate.where,
						create: query.data.user.connectOrCreate.create,
						update: {}
					},
					tx
				);
				fk[0] = record.id;
			}
			const unsafeData = query.data as Record<string, unknown>;
			unsafeData.userId = fk[0];
			delete unsafeData.user;
		} else if (query.data?.userId !== undefined && query.data.userId !== null) {
			await this.client.user.findUniqueOrThrow(
				{
					where: { id: query.data.userId }
				},
				tx
			);
		}
		const record = this._removeNestedCreateData(await this._fillDefaults(query.data, tx));
		const keyPath = await tx.objectStore('GettingStartedAnswers').add(record);
		const data = (await tx.objectStore('GettingStartedAnswers').get(keyPath))!;
		const recordsWithRelations = this._applySelectClause(
			await this._applyRelations<object>([data], tx, query),
			query.select
		)[0];
		this._preprocessListFields([recordsWithRelations]);
		this.emit('create', keyPath);
		return recordsWithRelations as Prisma.Result<Prisma.GettingStartedAnswersDelegate, Q, 'create'>;
	}
	async createMany<Q extends Prisma.Args<Prisma.GettingStartedAnswersDelegate, 'createMany'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.GettingStartedAnswersDelegate, Q, 'createMany'>> {
		const createManyData = IDBUtils.convertToArray(query.data);
		tx = tx ?? this.client._db.transaction(['GettingStartedAnswers'], 'readwrite');
		for (const createData of createManyData) {
			const record = this._removeNestedCreateData(await this._fillDefaults(createData, tx));
			const keyPath = await tx.objectStore('GettingStartedAnswers').add(record);
			this.emit('create', keyPath);
		}
		return { count: createManyData.length };
	}
	async createManyAndReturn<
		Q extends Prisma.Args<Prisma.GettingStartedAnswersDelegate, 'createManyAndReturn'>
	>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.GettingStartedAnswersDelegate, Q, 'createManyAndReturn'>> {
		const createManyData = IDBUtils.convertToArray(query.data);
		const records: Prisma.Result<Prisma.GettingStartedAnswersDelegate, object, 'findMany'> = [];
		tx = tx ?? this.client._db.transaction(['GettingStartedAnswers'], 'readwrite');
		for (const createData of createManyData) {
			const record = this._removeNestedCreateData(await this._fillDefaults(createData, tx));
			const keyPath = await tx.objectStore('GettingStartedAnswers').add(record);
			this.emit('create', keyPath);
			records.push(this._applySelectClause([record], query.select)[0]);
		}
		this._preprocessListFields(records);
		return records as Prisma.Result<Prisma.GettingStartedAnswersDelegate, Q, 'createManyAndReturn'>;
	}
	async delete<Q extends Prisma.Args<Prisma.GettingStartedAnswersDelegate, 'delete'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.GettingStartedAnswersDelegate, Q, 'delete'>> {
		const storesNeeded = this._getNeededStoresForFind(query);
		this._getNeededStoresForNestedDelete(storesNeeded);
		tx = tx ?? this.client._db.transaction(Array.from(storesNeeded), 'readwrite');
		const record = await this.findUnique(query, tx);
		if (!record) throw new Error('Record not found');
		await tx.objectStore('GettingStartedAnswers').delete([record.id]);
		this.emit('delete', [record.id]);
		return record;
	}
	async deleteMany<Q extends Prisma.Args<Prisma.GettingStartedAnswersDelegate, 'deleteMany'>>(
		query?: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.GettingStartedAnswersDelegate, Q, 'deleteMany'>> {
		const storesNeeded = this._getNeededStoresForFind(query);
		this._getNeededStoresForNestedDelete(storesNeeded);
		tx = tx ?? this.client._db.transaction(Array.from(storesNeeded), 'readwrite');
		const records = await this.findMany(query, tx);
		for (const record of records) {
			await this.delete({ where: { id: record.id } }, tx);
		}
		return { count: records.length };
	}
	async update<Q extends Prisma.Args<Prisma.GettingStartedAnswersDelegate, 'update'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.GettingStartedAnswersDelegate, Q, 'update'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForUpdate(query)), 'readwrite');
		const record = await this.findUnique({ where: query.where }, tx);
		if (record === null) {
			tx.abort();
			throw new Error('Record not found');
		}
		const startKeyPath: PrismaIDBSchema['GettingStartedAnswers']['key'] = [record.id];
		const stringFields = ['id', 'userId'] as const;
		for (const field of stringFields) {
			IDBUtils.handleStringUpdateField(record, field, query.data[field]);
		}
		const enumFields = ['fitnessKnowledge', 'myFitPrimaryUsage'] as const;
		for (const field of enumFields) {
			IDBUtils.handleEnumUpdateField(record, field, query.data[field]);
		}
		if (query.data.user) {
			if (query.data.user.connect) {
				const other = await this.client.user.findUniqueOrThrow(
					{ where: query.data.user.connect },
					tx
				);
				record.userId = other.id;
			}
			if (query.data.user.create) {
				const other = await this.client.user.create({ data: query.data.user.create }, tx);
				record.userId = other.id;
			}
			if (query.data.user.update) {
				const updateData = query.data.user.update.data ?? query.data.user.update;
				await this.client.user.update(
					{
						where: {
							...query.data.user.update.where,
							id: record.userId!
						} as Prisma.UserWhereUniqueInput,
						data: updateData
					},
					tx
				);
			}
			if (query.data.user.upsert) {
				await this.client.user.upsert(
					{
						where: {
							...query.data.user.upsert.where,
							id: record.userId!
						} as Prisma.UserWhereUniqueInput,
						create: { ...query.data.user.upsert.create, id: record.userId! } as Prisma.Args<
							Prisma.UserDelegate,
							'upsert'
						>['create'],
						update: query.data.user.upsert.update
					},
					tx
				);
			}
			if (query.data.user.connectOrCreate) {
				await this.client.user.upsert(
					{
						where: { ...query.data.user.connectOrCreate.where, id: record.userId! },
						create: {
							...query.data.user.connectOrCreate.create,
							id: record.userId!
						} as Prisma.Args<Prisma.UserDelegate, 'upsert'>['create'],
						update: { id: record.userId! }
					},
					tx
				);
			}
		}
		if (query.data.userId !== undefined) {
			const related = await this.client.user.findUnique({ where: { id: record.userId } }, tx);
			if (!related) throw new Error('Related record not found');
		}
		const endKeyPath: PrismaIDBSchema['GettingStartedAnswers']['key'] = [record.id];
		for (let i = 0; i < startKeyPath.length; i++) {
			if (startKeyPath[i] !== endKeyPath[i]) {
				if ((await tx.objectStore('GettingStartedAnswers').get(endKeyPath)) !== undefined) {
					throw new Error('Record with the same keyPath already exists');
				}
				await tx.objectStore('GettingStartedAnswers').delete(startKeyPath);
				break;
			}
		}
		const keyPath = await tx.objectStore('GettingStartedAnswers').put(record);
		this.emit('update', keyPath, startKeyPath);
		for (let i = 0; i < startKeyPath.length; i++) {
			if (startKeyPath[i] !== endKeyPath[i]) {
				break;
			}
		}
		const recordWithRelations = (await this.findUnique(
			{
				where: { id: keyPath[0] }
			},
			tx
		))!;
		return recordWithRelations as Prisma.Result<Prisma.GettingStartedAnswersDelegate, Q, 'update'>;
	}
	async updateMany<Q extends Prisma.Args<Prisma.GettingStartedAnswersDelegate, 'updateMany'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.GettingStartedAnswersDelegate, Q, 'updateMany'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readwrite');
		const records = await this.findMany({ where: query.where }, tx);
		await Promise.all(
			records.map(async (record) => {
				await this.update({ where: { id: record.id }, data: query.data }, tx);
			})
		);
		return { count: records.length };
	}
	async upsert<Q extends Prisma.Args<Prisma.GettingStartedAnswersDelegate, 'upsert'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.GettingStartedAnswersDelegate, Q, 'upsert'>> {
		const neededStores = this._getNeededStoresForUpdate({
			...query,
			data: { ...query.update, ...query.create } as Prisma.Args<
				Prisma.GettingStartedAnswersDelegate,
				'update'
			>['data']
		});
		tx = tx ?? this.client._db.transaction(Array.from(neededStores), 'readwrite');
		let record = await this.findUnique({ where: query.where }, tx);
		if (!record) record = await this.create({ data: query.create }, tx);
		else record = await this.update({ where: query.where, data: query.update }, tx);
		record = await this.findUniqueOrThrow(
			{ where: { id: record.id }, select: query.select, include: query.include },
			tx
		);
		return record as Prisma.Result<Prisma.GettingStartedAnswersDelegate, Q, 'upsert'>;
	}
	async aggregate<Q extends Prisma.Args<Prisma.GettingStartedAnswersDelegate, 'aggregate'>>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.GettingStartedAnswersDelegate, Q, 'aggregate'>> {
		tx = tx ?? this.client._db.transaction(['GettingStartedAnswers'], 'readonly');
		const records = await this.findMany({ where: query?.where }, tx);
		const result: Partial<Prisma.Result<Prisma.GettingStartedAnswersDelegate, Q, 'aggregate'>> = {};
		if (query?._count) {
			if (query._count === true) {
				(result._count as number) = records.length;
			} else {
				for (const key of Object.keys(query._count)) {
					const typedKey = key as keyof typeof query._count;
					if (typedKey === '_all') {
						(result._count as Record<string, number>)[typedKey] = records.length;
						continue;
					}
					(result._count as Record<string, number>)[typedKey] = (
						await this.findMany({ where: { [`${typedKey}`]: { not: null } } }, tx)
					).length;
				}
			}
		}
		if (query?._min) {
			const minResult = {} as Prisma.Result<
				Prisma.GettingStartedAnswersDelegate,
				Q,
				'aggregate'
			>['_min'];
			const stringFields = ['id', 'userId'] as const;
			for (const field of stringFields) {
				if (!query._min[field]) continue;
				const values = records
					.map((record) => record[field] as string)
					.filter((value) => value !== undefined);
				(minResult[field as keyof typeof minResult] as string) = values.sort()[0];
			}
			result._min = minResult;
		}
		if (query?._max) {
			const maxResult = {} as Prisma.Result<
				Prisma.GettingStartedAnswersDelegate,
				Q,
				'aggregate'
			>['_max'];
			const stringFields = ['id', 'userId'] as const;
			for (const field of stringFields) {
				if (!query._max[field]) continue;
				const values = records
					.map((record) => record[field] as string)
					.filter((value) => value !== undefined);
				(maxResult[field as keyof typeof maxResult] as string) = values.sort().reverse()[0];
			}
			result._max = maxResult;
		}
		return result as unknown as Prisma.Result<Prisma.GettingStartedAnswersDelegate, Q, 'aggregate'>;
	}
}
class DashboardItemIDBClass extends BaseIDBModelClass<'DashboardItem'> {
	private async _applyWhereClause<
		W extends Prisma.Args<Prisma.DashboardItemDelegate, 'findFirstOrThrow'>['where'],
		R extends Prisma.Result<Prisma.DashboardItemDelegate, object, 'findFirstOrThrow'>
	>(records: R[], whereClause: W, tx: IDBUtils.TransactionType): Promise<R[]> {
		if (!whereClause) return records;
		records = await IDBUtils.applyLogicalFilters<Prisma.DashboardItemDelegate, R, W>(
			records,
			whereClause,
			tx,
			this.keyPath,
			this._applyWhereClause.bind(this)
		);
		return (
			await Promise.all(
				records.map(async (record) => {
					const stringFields = ['id', 'userId'] as const;
					for (const field of stringFields) {
						if (!IDBUtils.whereStringFilter(record, field, whereClause[field])) return null;
					}
					const dateTimeFields = ['createdAt'] as const;
					for (const field of dateTimeFields) {
						if (!IDBUtils.whereDateTimeFilter(record, field, whereClause[field])) return null;
					}
					if (whereClause.user) {
						const { is, isNot, ...rest } = whereClause.user;
						if (is !== null && is !== undefined) {
							const relatedRecord = await this.client.user.findFirst(
								{ where: { ...is, id: record.userId } },
								tx
							);
							if (!relatedRecord) return null;
						}
						if (isNot !== null && isNot !== undefined) {
							const relatedRecord = await this.client.user.findFirst(
								{ where: { ...isNot, id: record.userId } },
								tx
							);
							if (relatedRecord) return null;
						}
						if (Object.keys(rest).length) {
							const relatedRecord = await this.client.user.findFirst(
								{ where: { ...whereClause.user, id: record.userId } },
								tx
							);
							if (!relatedRecord) return null;
						}
					}
					return record;
				})
			)
		).filter((result) => result !== null);
	}
	private _applySelectClause<
		S extends Prisma.Args<Prisma.DashboardItemDelegate, 'findMany'>['select']
	>(
		records: Prisma.Result<Prisma.DashboardItemDelegate, object, 'findFirstOrThrow'>[],
		selectClause: S
	): Prisma.Result<Prisma.DashboardItemDelegate, { select: S }, 'findFirstOrThrow'>[] {
		if (!selectClause) {
			return records as Prisma.Result<
				Prisma.DashboardItemDelegate,
				{ select: S },
				'findFirstOrThrow'
			>[];
		}
		return records.map((record) => {
			const partialRecord: Partial<typeof record> = record;
			for (const untypedKey of ['id', 'user', 'userId', 'type', 'createdAt']) {
				const key = untypedKey as keyof typeof record & keyof S;
				if (!selectClause[key]) delete partialRecord[key];
			}
			return partialRecord;
		}) as Prisma.Result<Prisma.DashboardItemDelegate, { select: S }, 'findFirstOrThrow'>[];
	}
	private async _applyRelations<Q extends Prisma.Args<Prisma.DashboardItemDelegate, 'findMany'>>(
		records: Prisma.Result<Prisma.DashboardItemDelegate, object, 'findFirstOrThrow'>[],
		tx: IDBUtils.TransactionType,
		query?: Q
	): Promise<Prisma.Result<Prisma.DashboardItemDelegate, Q, 'findFirstOrThrow'>[]> {
		if (!query)
			return records as Prisma.Result<Prisma.DashboardItemDelegate, Q, 'findFirstOrThrow'>[];
		const recordsWithRelations = records.map(async (record) => {
			const unsafeRecord = record as Record<string, unknown>;
			const attach_user = query.select?.user || query.include?.user;
			if (attach_user) {
				unsafeRecord['user'] = await this.client.user.findUnique(
					{
						...(attach_user === true ? {} : attach_user),
						where: { id: record.userId! }
					},
					tx
				);
			}
			return unsafeRecord;
		});
		return (await Promise.all(recordsWithRelations)) as Prisma.Result<
			Prisma.DashboardItemDelegate,
			Q,
			'findFirstOrThrow'
		>[];
	}
	async _applyOrderByClause<
		O extends Prisma.Args<Prisma.DashboardItemDelegate, 'findMany'>['orderBy'],
		R extends Prisma.Result<Prisma.DashboardItemDelegate, object, 'findFirstOrThrow'>
	>(records: R[], orderByClause: O, tx: IDBUtils.TransactionType): Promise<void> {
		if (orderByClause === undefined) return;
		const orderByClauses = IDBUtils.convertToArray(orderByClause);
		const indexedKeys = await Promise.all(
			records.map(async (record) => {
				const keys = await Promise.all(
					orderByClauses.map(async (clause) => await this._resolveOrderByKey(record, clause, tx))
				);
				return { keys, record };
			})
		);
		indexedKeys.sort((a, b) => {
			for (let i = 0; i < orderByClauses.length; i++) {
				const clause = orderByClauses[i];
				const comparison = IDBUtils.genericComparator(
					a.keys[i],
					b.keys[i],
					this._resolveSortOrder(clause)
				);
				if (comparison !== 0) return comparison;
			}
			return 0;
		});
		for (let i = 0; i < records.length; i++) {
			records[i] = indexedKeys[i].record;
		}
	}
	async _resolveOrderByKey(
		record: Prisma.Result<Prisma.DashboardItemDelegate, object, 'findFirstOrThrow'>,
		orderByInput: Prisma.DashboardItemOrderByWithRelationInput,
		tx: IDBUtils.TransactionType
	): Promise<unknown> {
		const scalarFields = ['id', 'userId', 'type', 'createdAt'] as const;
		for (const field of scalarFields) if (orderByInput[field]) return record[field];
		if (orderByInput.user) {
			return await this.client.user._resolveOrderByKey(
				await this.client.user.findFirstOrThrow({ where: { id: record.userId } }),
				orderByInput.user,
				tx
			);
		}
	}
	_resolveSortOrder(
		orderByInput: Prisma.DashboardItemOrderByWithRelationInput
	): Prisma.SortOrder | { sort: Prisma.SortOrder; nulls?: 'first' | 'last' } {
		const scalarFields = ['id', 'userId', 'type', 'createdAt'] as const;
		for (const field of scalarFields) if (orderByInput[field]) return orderByInput[field];
		if (orderByInput.user) {
			return this.client.user._resolveSortOrder(orderByInput.user);
		}
		throw new Error('No field in orderBy clause');
	}
	private async _fillDefaults<
		D extends Prisma.Args<Prisma.DashboardItemDelegate, 'create'>['data']
	>(data: D, tx?: IDBUtils.ReadwriteTransactionType): Promise<D> {
		if (data === undefined) data = {} as NonNullable<D>;
		if (data.id === undefined) {
			data.id = uuidv4();
		}
		if (data.createdAt === undefined) {
			data.createdAt = new Date();
		}
		if (typeof data.createdAt === 'string') {
			data.createdAt = new Date(data.createdAt);
		}
		return data;
	}
	_getNeededStoresForWhere<
		W extends Prisma.Args<Prisma.DashboardItemDelegate, 'findMany'>['where']
	>(whereClause: W, neededStores: Set<StoreNames<PrismaIDBSchema>>) {
		if (whereClause === undefined) return;
		for (const param of IDBUtils.LogicalParams) {
			if (whereClause[param]) {
				for (const clause of IDBUtils.convertToArray(whereClause[param])) {
					this._getNeededStoresForWhere(clause, neededStores);
				}
			}
		}
		if (whereClause.user) {
			neededStores.add('User');
			this.client.user._getNeededStoresForWhere(whereClause.user, neededStores);
		}
	}
	_getNeededStoresForFind<Q extends Prisma.Args<Prisma.DashboardItemDelegate, 'findMany'>>(
		query?: Q
	): Set<StoreNames<PrismaIDBSchema>> {
		const neededStores: Set<StoreNames<PrismaIDBSchema>> = new Set();
		neededStores.add('DashboardItem');
		this._getNeededStoresForWhere(query?.where, neededStores);
		if (query?.orderBy) {
			const orderBy = IDBUtils.convertToArray(query.orderBy);
			const orderBy_user = orderBy.find((clause) => clause.user);
			if (orderBy_user) {
				this.client.user
					._getNeededStoresForFind({ orderBy: orderBy_user.user })
					.forEach((storeName) => neededStores.add(storeName));
			}
		}
		if (query?.select?.user || query?.include?.user) {
			neededStores.add('User');
			if (typeof query.select?.user === 'object') {
				this.client.user
					._getNeededStoresForFind(query.select.user)
					.forEach((storeName) => neededStores.add(storeName));
			}
			if (typeof query.include?.user === 'object') {
				this.client.user
					._getNeededStoresForFind(query.include.user)
					.forEach((storeName) => neededStores.add(storeName));
			}
		}
		return neededStores;
	}
	_getNeededStoresForCreate<
		D extends Partial<Prisma.Args<Prisma.DashboardItemDelegate, 'create'>['data']>
	>(data: D): Set<StoreNames<PrismaIDBSchema>> {
		const neededStores: Set<StoreNames<PrismaIDBSchema>> = new Set();
		neededStores.add('DashboardItem');
		if (data?.user) {
			neededStores.add('User');
			if (data.user.create) {
				const createData = Array.isArray(data.user.create) ? data.user.create : [data.user.create];
				createData.forEach((record) =>
					this.client.user
						._getNeededStoresForCreate(record)
						.forEach((storeName) => neededStores.add(storeName))
				);
			}
			if (data.user.connectOrCreate) {
				IDBUtils.convertToArray(data.user.connectOrCreate).forEach((record) =>
					this.client.user
						._getNeededStoresForCreate(record.create)
						.forEach((storeName) => neededStores.add(storeName))
				);
			}
		}
		if (data?.userId !== undefined) {
			neededStores.add('User');
		}
		return neededStores;
	}
	_getNeededStoresForUpdate<Q extends Prisma.Args<Prisma.DashboardItemDelegate, 'update'>>(
		query: Partial<Q>
	): Set<StoreNames<PrismaIDBSchema>> {
		const neededStores = this._getNeededStoresForFind(query).union(
			this._getNeededStoresForCreate(
				query.data as Prisma.Args<Prisma.DashboardItemDelegate, 'create'>['data']
			)
		);
		if (query.data?.user?.connect) {
			neededStores.add('User');
			IDBUtils.convertToArray(query.data.user.connect).forEach((connect) => {
				this.client.user._getNeededStoresForWhere(connect, neededStores);
			});
		}
		if (query.data?.user?.update) {
			neededStores.add('User');
			IDBUtils.convertToArray(query.data.user.update).forEach((update) => {
				this.client.user
					._getNeededStoresForUpdate(update as Prisma.Args<Prisma.UserDelegate, 'update'>)
					.forEach((store) => neededStores.add(store));
			});
		}
		if (query.data?.user?.upsert) {
			neededStores.add('User');
			IDBUtils.convertToArray(query.data.user.upsert).forEach((upsert) => {
				const update = {
					where: upsert.where,
					data: { ...upsert.update, ...upsert.create }
				} as Prisma.Args<Prisma.UserDelegate, 'update'>;
				this.client.user
					._getNeededStoresForUpdate(update)
					.forEach((store) => neededStores.add(store));
			});
		}
		return neededStores;
	}
	_getNeededStoresForNestedDelete(neededStores: Set<StoreNames<PrismaIDBSchema>>): void {
		neededStores.add('DashboardItem');
	}
	private _removeNestedCreateData<
		D extends Prisma.Args<Prisma.DashboardItemDelegate, 'create'>['data']
	>(data: D): Prisma.Result<Prisma.DashboardItemDelegate, object, 'findFirstOrThrow'> {
		const recordWithoutNestedCreate = structuredClone(data);
		delete recordWithoutNestedCreate?.user;
		return recordWithoutNestedCreate as Prisma.Result<
			Prisma.DashboardItemDelegate,
			object,
			'findFirstOrThrow'
		>;
	}
	private _preprocessListFields(
		records: Prisma.Result<Prisma.DashboardItemDelegate, object, 'findMany'>
	): void {}
	async findMany<Q extends Prisma.Args<Prisma.DashboardItemDelegate, 'findMany'>>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.DashboardItemDelegate, Q, 'findMany'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		const records = await this._applyWhereClause(
			await tx.objectStore('DashboardItem').getAll(),
			query?.where,
			tx
		);
		await this._applyOrderByClause(records, query?.orderBy, tx);
		const relationAppliedRecords = (await this._applyRelations(
			records,
			tx,
			query
		)) as Prisma.Result<Prisma.DashboardItemDelegate, object, 'findFirstOrThrow'>[];
		const selectClause = query?.select;
		let selectAppliedRecords = this._applySelectClause(relationAppliedRecords, selectClause);
		if (query?.distinct) {
			const distinctFields = IDBUtils.convertToArray(query.distinct);
			const seen = new Set<string>();
			selectAppliedRecords = selectAppliedRecords.filter((record) => {
				const key = distinctFields.map((field) => record[field]).join('|');
				if (seen.has(key)) return false;
				seen.add(key);
				return true;
			});
		}
		this._preprocessListFields(selectAppliedRecords);
		return selectAppliedRecords as Prisma.Result<Prisma.DashboardItemDelegate, Q, 'findMany'>;
	}
	async findFirst<Q extends Prisma.Args<Prisma.DashboardItemDelegate, 'findFirst'>>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.DashboardItemDelegate, Q, 'findFirst'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		return (await this.findMany(query, tx))[0] ?? null;
	}
	async findFirstOrThrow<Q extends Prisma.Args<Prisma.DashboardItemDelegate, 'findFirstOrThrow'>>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.DashboardItemDelegate, Q, 'findFirstOrThrow'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		const record = await this.findFirst(query, tx);
		if (!record) {
			tx.abort();
			throw new Error('Record not found');
		}
		return record;
	}
	async findUnique<Q extends Prisma.Args<Prisma.DashboardItemDelegate, 'findUnique'>>(
		query: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.DashboardItemDelegate, Q, 'findUnique'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		let record;
		if (query.where.id !== undefined) {
			record = await tx.objectStore('DashboardItem').get([query.where.id]);
		} else if (query.where.userId !== undefined) {
			record = await tx.objectStore('DashboardItem').index('userIdIndex').get([query.where.userId]);
		} else if (query.where.userId_type !== undefined) {
			record = await tx
				.objectStore('DashboardItem')
				.index('userId_typeIndex')
				.get([query.where.userId_type.userId, query.where.userId_type.type]);
		}
		if (!record) return null;

		const recordWithRelations = this._applySelectClause(
			await this._applyRelations(
				await this._applyWhereClause([record], query.where, tx),
				tx,
				query
			),
			query.select
		)[0];
		this._preprocessListFields([recordWithRelations]);
		return recordWithRelations as Prisma.Result<Prisma.DashboardItemDelegate, Q, 'findUnique'>;
	}
	async findUniqueOrThrow<Q extends Prisma.Args<Prisma.DashboardItemDelegate, 'findUniqueOrThrow'>>(
		query: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.DashboardItemDelegate, Q, 'findUniqueOrThrow'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		const record = await this.findUnique(query, tx);
		if (!record) {
			tx.abort();
			throw new Error('Record not found');
		}
		return record;
	}
	async count<Q extends Prisma.Args<Prisma.DashboardItemDelegate, 'count'>>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.DashboardItemDelegate, Q, 'count'>> {
		tx = tx ?? this.client._db.transaction(['DashboardItem'], 'readonly');
		if (!query?.select || query.select === true) {
			const records = await this.findMany({ where: query?.where }, tx);
			return records.length as Prisma.Result<Prisma.DashboardItemDelegate, Q, 'count'>;
		}
		const result: Partial<Record<keyof Prisma.DashboardItemCountAggregateInputType, number>> = {};
		for (const key of Object.keys(query.select)) {
			const typedKey = key as keyof typeof query.select;
			if (typedKey === '_all') {
				result[typedKey] = (await this.findMany({ where: query.where }, tx)).length;
				continue;
			}
			result[typedKey] = (
				await this.findMany({ where: { [`${typedKey}`]: { not: null } } }, tx)
			).length;
		}
		return result as Prisma.Result<Prisma.DashboardItemDelegate, Q, 'count'>;
	}
	async create<Q extends Prisma.Args<Prisma.DashboardItemDelegate, 'create'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.DashboardItemDelegate, Q, 'create'>> {
		const storesNeeded = this._getNeededStoresForCreate(query.data);
		tx = tx ?? this.client._db.transaction(Array.from(storesNeeded), 'readwrite');
		if (query.data.user) {
			const fk: Partial<PrismaIDBSchema['User']['key']> = [];
			if (query.data.user?.create) {
				const record = await this.client.user.create({ data: query.data.user.create }, tx);
				fk[0] = record.id;
			}
			if (query.data.user?.connect) {
				const record = await this.client.user.findUniqueOrThrow(
					{ where: query.data.user.connect },
					tx
				);
				delete query.data.user.connect;
				fk[0] = record.id;
			}
			if (query.data.user?.connectOrCreate) {
				const record = await this.client.user.upsert(
					{
						where: query.data.user.connectOrCreate.where,
						create: query.data.user.connectOrCreate.create,
						update: {}
					},
					tx
				);
				fk[0] = record.id;
			}
			const unsafeData = query.data as Record<string, unknown>;
			unsafeData.userId = fk[0];
			delete unsafeData.user;
		} else if (query.data?.userId !== undefined && query.data.userId !== null) {
			await this.client.user.findUniqueOrThrow(
				{
					where: { id: query.data.userId }
				},
				tx
			);
		}
		const record = this._removeNestedCreateData(await this._fillDefaults(query.data, tx));
		const keyPath = await tx.objectStore('DashboardItem').add(record);
		const data = (await tx.objectStore('DashboardItem').get(keyPath))!;
		const recordsWithRelations = this._applySelectClause(
			await this._applyRelations<object>([data], tx, query),
			query.select
		)[0];
		this._preprocessListFields([recordsWithRelations]);
		this.emit('create', keyPath);
		return recordsWithRelations as Prisma.Result<Prisma.DashboardItemDelegate, Q, 'create'>;
	}
	async createMany<Q extends Prisma.Args<Prisma.DashboardItemDelegate, 'createMany'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.DashboardItemDelegate, Q, 'createMany'>> {
		const createManyData = IDBUtils.convertToArray(query.data);
		tx = tx ?? this.client._db.transaction(['DashboardItem'], 'readwrite');
		for (const createData of createManyData) {
			const record = this._removeNestedCreateData(await this._fillDefaults(createData, tx));
			const keyPath = await tx.objectStore('DashboardItem').add(record);
			this.emit('create', keyPath);
		}
		return { count: createManyData.length };
	}
	async createManyAndReturn<
		Q extends Prisma.Args<Prisma.DashboardItemDelegate, 'createManyAndReturn'>
	>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.DashboardItemDelegate, Q, 'createManyAndReturn'>> {
		const createManyData = IDBUtils.convertToArray(query.data);
		const records: Prisma.Result<Prisma.DashboardItemDelegate, object, 'findMany'> = [];
		tx = tx ?? this.client._db.transaction(['DashboardItem'], 'readwrite');
		for (const createData of createManyData) {
			const record = this._removeNestedCreateData(await this._fillDefaults(createData, tx));
			const keyPath = await tx.objectStore('DashboardItem').add(record);
			this.emit('create', keyPath);
			records.push(this._applySelectClause([record], query.select)[0]);
		}
		this._preprocessListFields(records);
		return records as Prisma.Result<Prisma.DashboardItemDelegate, Q, 'createManyAndReturn'>;
	}
	async delete<Q extends Prisma.Args<Prisma.DashboardItemDelegate, 'delete'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.DashboardItemDelegate, Q, 'delete'>> {
		const storesNeeded = this._getNeededStoresForFind(query);
		this._getNeededStoresForNestedDelete(storesNeeded);
		tx = tx ?? this.client._db.transaction(Array.from(storesNeeded), 'readwrite');
		const record = await this.findUnique(query, tx);
		if (!record) throw new Error('Record not found');
		await tx.objectStore('DashboardItem').delete([record.id]);
		this.emit('delete', [record.id]);
		return record;
	}
	async deleteMany<Q extends Prisma.Args<Prisma.DashboardItemDelegate, 'deleteMany'>>(
		query?: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.DashboardItemDelegate, Q, 'deleteMany'>> {
		const storesNeeded = this._getNeededStoresForFind(query);
		this._getNeededStoresForNestedDelete(storesNeeded);
		tx = tx ?? this.client._db.transaction(Array.from(storesNeeded), 'readwrite');
		const records = await this.findMany(query, tx);
		for (const record of records) {
			await this.delete({ where: { id: record.id } }, tx);
		}
		return { count: records.length };
	}
	async update<Q extends Prisma.Args<Prisma.DashboardItemDelegate, 'update'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.DashboardItemDelegate, Q, 'update'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForUpdate(query)), 'readwrite');
		const record = await this.findUnique({ where: query.where }, tx);
		if (record === null) {
			tx.abort();
			throw new Error('Record not found');
		}
		const startKeyPath: PrismaIDBSchema['DashboardItem']['key'] = [record.id];
		const stringFields = ['id', 'userId'] as const;
		for (const field of stringFields) {
			IDBUtils.handleStringUpdateField(record, field, query.data[field]);
		}
		const dateTimeFields = ['createdAt'] as const;
		for (const field of dateTimeFields) {
			IDBUtils.handleDateTimeUpdateField(record, field, query.data[field]);
		}
		const enumFields = ['type'] as const;
		for (const field of enumFields) {
			IDBUtils.handleEnumUpdateField(record, field, query.data[field]);
		}
		if (query.data.user) {
			if (query.data.user.connect) {
				const other = await this.client.user.findUniqueOrThrow(
					{ where: query.data.user.connect },
					tx
				);
				record.userId = other.id;
			}
			if (query.data.user.create) {
				const other = await this.client.user.create({ data: query.data.user.create }, tx);
				record.userId = other.id;
			}
			if (query.data.user.update) {
				const updateData = query.data.user.update.data ?? query.data.user.update;
				await this.client.user.update(
					{
						where: {
							...query.data.user.update.where,
							id: record.userId!
						} as Prisma.UserWhereUniqueInput,
						data: updateData
					},
					tx
				);
			}
			if (query.data.user.upsert) {
				await this.client.user.upsert(
					{
						where: {
							...query.data.user.upsert.where,
							id: record.userId!
						} as Prisma.UserWhereUniqueInput,
						create: { ...query.data.user.upsert.create, id: record.userId! } as Prisma.Args<
							Prisma.UserDelegate,
							'upsert'
						>['create'],
						update: query.data.user.upsert.update
					},
					tx
				);
			}
			if (query.data.user.connectOrCreate) {
				await this.client.user.upsert(
					{
						where: { ...query.data.user.connectOrCreate.where, id: record.userId! },
						create: {
							...query.data.user.connectOrCreate.create,
							id: record.userId!
						} as Prisma.Args<Prisma.UserDelegate, 'upsert'>['create'],
						update: { id: record.userId! }
					},
					tx
				);
			}
		}
		if (query.data.userId !== undefined) {
			const related = await this.client.user.findUnique({ where: { id: record.userId } }, tx);
			if (!related) throw new Error('Related record not found');
		}
		const endKeyPath: PrismaIDBSchema['DashboardItem']['key'] = [record.id];
		for (let i = 0; i < startKeyPath.length; i++) {
			if (startKeyPath[i] !== endKeyPath[i]) {
				if ((await tx.objectStore('DashboardItem').get(endKeyPath)) !== undefined) {
					throw new Error('Record with the same keyPath already exists');
				}
				await tx.objectStore('DashboardItem').delete(startKeyPath);
				break;
			}
		}
		const keyPath = await tx.objectStore('DashboardItem').put(record);
		this.emit('update', keyPath, startKeyPath);
		for (let i = 0; i < startKeyPath.length; i++) {
			if (startKeyPath[i] !== endKeyPath[i]) {
				break;
			}
		}
		const recordWithRelations = (await this.findUnique(
			{
				where: { id: keyPath[0] }
			},
			tx
		))!;
		return recordWithRelations as Prisma.Result<Prisma.DashboardItemDelegate, Q, 'update'>;
	}
	async updateMany<Q extends Prisma.Args<Prisma.DashboardItemDelegate, 'updateMany'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.DashboardItemDelegate, Q, 'updateMany'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readwrite');
		const records = await this.findMany({ where: query.where }, tx);
		await Promise.all(
			records.map(async (record) => {
				await this.update({ where: { id: record.id }, data: query.data }, tx);
			})
		);
		return { count: records.length };
	}
	async upsert<Q extends Prisma.Args<Prisma.DashboardItemDelegate, 'upsert'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.DashboardItemDelegate, Q, 'upsert'>> {
		const neededStores = this._getNeededStoresForUpdate({
			...query,
			data: { ...query.update, ...query.create } as Prisma.Args<
				Prisma.DashboardItemDelegate,
				'update'
			>['data']
		});
		tx = tx ?? this.client._db.transaction(Array.from(neededStores), 'readwrite');
		let record = await this.findUnique({ where: query.where }, tx);
		if (!record) record = await this.create({ data: query.create }, tx);
		else record = await this.update({ where: query.where, data: query.update }, tx);
		record = await this.findUniqueOrThrow(
			{ where: { id: record.id }, select: query.select, include: query.include },
			tx
		);
		return record as Prisma.Result<Prisma.DashboardItemDelegate, Q, 'upsert'>;
	}
	async aggregate<Q extends Prisma.Args<Prisma.DashboardItemDelegate, 'aggregate'>>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.DashboardItemDelegate, Q, 'aggregate'>> {
		tx = tx ?? this.client._db.transaction(['DashboardItem'], 'readonly');
		const records = await this.findMany({ where: query?.where }, tx);
		const result: Partial<Prisma.Result<Prisma.DashboardItemDelegate, Q, 'aggregate'>> = {};
		if (query?._count) {
			if (query._count === true) {
				(result._count as number) = records.length;
			} else {
				for (const key of Object.keys(query._count)) {
					const typedKey = key as keyof typeof query._count;
					if (typedKey === '_all') {
						(result._count as Record<string, number>)[typedKey] = records.length;
						continue;
					}
					(result._count as Record<string, number>)[typedKey] = (
						await this.findMany({ where: { [`${typedKey}`]: { not: null } } }, tx)
					).length;
				}
			}
		}
		if (query?._min) {
			const minResult = {} as Prisma.Result<Prisma.DashboardItemDelegate, Q, 'aggregate'>['_min'];
			const dateTimeFields = ['createdAt'] as const;
			for (const field of dateTimeFields) {
				if (!query._min[field]) continue;
				const values = records
					.map((record) => record[field]?.getTime())
					.filter((value) => value !== undefined);
				(minResult[field as keyof typeof minResult] as Date) = new Date(Math.min(...values));
			}
			const stringFields = ['id', 'userId'] as const;
			for (const field of stringFields) {
				if (!query._min[field]) continue;
				const values = records
					.map((record) => record[field] as string)
					.filter((value) => value !== undefined);
				(minResult[field as keyof typeof minResult] as string) = values.sort()[0];
			}
			result._min = minResult;
		}
		if (query?._max) {
			const maxResult = {} as Prisma.Result<Prisma.DashboardItemDelegate, Q, 'aggregate'>['_max'];
			const dateTimeFields = ['createdAt'] as const;
			for (const field of dateTimeFields) {
				if (!query._max[field]) continue;
				const values = records
					.map((record) => record[field]?.getTime())
					.filter((value) => value !== undefined);
				(maxResult[field as keyof typeof maxResult] as Date) = new Date(Math.max(...values));
			}
			const stringFields = ['id', 'userId'] as const;
			for (const field of stringFields) {
				if (!query._max[field]) continue;
				const values = records
					.map((record) => record[field] as string)
					.filter((value) => value !== undefined);
				(maxResult[field as keyof typeof maxResult] as string) = values.sort().reverse()[0];
			}
			result._max = maxResult;
		}
		return result as unknown as Prisma.Result<Prisma.DashboardItemDelegate, Q, 'aggregate'>;
	}
}
class UserIDBClass extends BaseIDBModelClass<'User'> {
	private async _applyWhereClause<
		W extends Prisma.Args<Prisma.UserDelegate, 'findFirstOrThrow'>['where'],
		R extends Prisma.Result<Prisma.UserDelegate, object, 'findFirstOrThrow'>
	>(records: R[], whereClause: W, tx: IDBUtils.TransactionType): Promise<R[]> {
		if (!whereClause) return records;
		records = await IDBUtils.applyLogicalFilters<Prisma.UserDelegate, R, W>(
			records,
			whereClause,
			tx,
			this.keyPath,
			this._applyWhereClause.bind(this)
		);
		return (
			await Promise.all(
				records.map(async (record) => {
					const stringFields = ['id', 'email', 'name', 'image'] as const;
					for (const field of stringFields) {
						if (!IDBUtils.whereStringFilter(record, field, whereClause[field])) return null;
					}
					const booleanFields = ['emailVerified', 'isAnonymous'] as const;
					for (const field of booleanFields) {
						if (!IDBUtils.whereBoolFilter(record, field, whereClause[field])) return null;
					}
					const dateTimeFields = ['createdAt', 'updatedAt'] as const;
					for (const field of dateTimeFields) {
						if (!IDBUtils.whereDateTimeFilter(record, field, whereClause[field])) return null;
					}
					if (whereClause.sessions) {
						if (whereClause.sessions.every) {
							const violatingRecord = await this.client.session.findFirst({
								where: { NOT: { ...whereClause.sessions.every }, userId: record.id },
								tx
							});
							if (violatingRecord !== null) return null;
						}
						if (whereClause.sessions.some) {
							const relatedRecords = await this.client.session.findMany({
								where: { ...whereClause.sessions.some, userId: record.id },
								tx
							});
							if (relatedRecords.length === 0) return null;
						}
						if (whereClause.sessions.none) {
							const violatingRecord = await this.client.session.findFirst({
								where: { ...whereClause.sessions.none, userId: record.id },
								tx
							});
							if (violatingRecord !== null) return null;
						}
					}
					if (whereClause.accounts) {
						if (whereClause.accounts.every) {
							const violatingRecord = await this.client.account.findFirst({
								where: { NOT: { ...whereClause.accounts.every }, userId: record.id },
								tx
							});
							if (violatingRecord !== null) return null;
						}
						if (whereClause.accounts.some) {
							const relatedRecords = await this.client.account.findMany({
								where: { ...whereClause.accounts.some, userId: record.id },
								tx
							});
							if (relatedRecords.length === 0) return null;
						}
						if (whereClause.accounts.none) {
							const violatingRecord = await this.client.account.findFirst({
								where: { ...whereClause.accounts.none, userId: record.id },
								tx
							});
							if (violatingRecord !== null) return null;
						}
					}
					if (whereClause.exerciseSplits) {
						if (whereClause.exerciseSplits.every) {
							const violatingRecord = await this.client.exerciseSplit.findFirst({
								where: { NOT: { ...whereClause.exerciseSplits.every }, userId: record.id },
								tx
							});
							if (violatingRecord !== null) return null;
						}
						if (whereClause.exerciseSplits.some) {
							const relatedRecords = await this.client.exerciseSplit.findMany({
								where: { ...whereClause.exerciseSplits.some, userId: record.id },
								tx
							});
							if (relatedRecords.length === 0) return null;
						}
						if (whereClause.exerciseSplits.none) {
							const violatingRecord = await this.client.exerciseSplit.findFirst({
								where: { ...whereClause.exerciseSplits.none, userId: record.id },
								tx
							});
							if (violatingRecord !== null) return null;
						}
					}
					if (whereClause.gettingStartedAnswers === null) {
						const relatedRecord = await this.client.gettingStartedAnswers.findFirst(
							{ where: { userId: record.id } },
							tx
						);
						if (relatedRecord) return null;
					}
					if (whereClause.gettingStartedAnswers) {
						const { is, isNot, ...rest } = whereClause.gettingStartedAnswers;
						if (is === null) {
							const relatedRecord = await this.client.gettingStartedAnswers.findFirst(
								{ where: { userId: record.id } },
								tx
							);
							if (relatedRecord) return null;
						}
						if (is !== null && is !== undefined) {
							const relatedRecord = await this.client.gettingStartedAnswers.findFirst(
								{ where: { ...is, userId: record.id } },
								tx
							);
							if (!relatedRecord) return null;
						}
						if (isNot === null) {
							const relatedRecord = await this.client.gettingStartedAnswers.findFirst(
								{ where: { userId: record.id } },
								tx
							);
							if (!relatedRecord) return null;
						}
						if (isNot !== null && isNot !== undefined) {
							const relatedRecord = await this.client.gettingStartedAnswers.findFirst(
								{ where: { ...isNot, userId: record.id } },
								tx
							);
							if (relatedRecord) return null;
						}
						if (Object.keys(rest).length) {
							if (record.id === null) return null;
							const relatedRecord = await this.client.gettingStartedAnswers.findFirst(
								{ where: { ...whereClause.gettingStartedAnswers, userId: record.id } },
								tx
							);
							if (!relatedRecord) return null;
						}
					}
					if (whereClause.dashboardItems) {
						if (whereClause.dashboardItems.every) {
							const violatingRecord = await this.client.dashboardItem.findFirst({
								where: { NOT: { ...whereClause.dashboardItems.every }, userId: record.id },
								tx
							});
							if (violatingRecord !== null) return null;
						}
						if (whereClause.dashboardItems.some) {
							const relatedRecords = await this.client.dashboardItem.findMany({
								where: { ...whereClause.dashboardItems.some, userId: record.id },
								tx
							});
							if (relatedRecords.length === 0) return null;
						}
						if (whereClause.dashboardItems.none) {
							const violatingRecord = await this.client.dashboardItem.findFirst({
								where: { ...whereClause.dashboardItems.none, userId: record.id },
								tx
							});
							if (violatingRecord !== null) return null;
						}
					}
					if (whereClause.metrics) {
						if (whereClause.metrics.every) {
							const violatingRecord = await this.client.macroMetrics.findFirst({
								where: { NOT: { ...whereClause.metrics.every }, userId: record.id },
								tx
							});
							if (violatingRecord !== null) return null;
						}
						if (whereClause.metrics.some) {
							const relatedRecords = await this.client.macroMetrics.findMany({
								where: { ...whereClause.metrics.some, userId: record.id },
								tx
							});
							if (relatedRecords.length === 0) return null;
						}
						if (whereClause.metrics.none) {
							const violatingRecord = await this.client.macroMetrics.findFirst({
								where: { ...whereClause.metrics.none, userId: record.id },
								tx
							});
							if (violatingRecord !== null) return null;
						}
					}
					if (whereClause.activityTrackingPreferences === null) {
						const relatedRecord = await this.client.macroActivityTrackingPreferences.findFirst(
							{ where: { userId: record.id } },
							tx
						);
						if (relatedRecord) return null;
					}
					if (whereClause.activityTrackingPreferences) {
						const { is, isNot, ...rest } = whereClause.activityTrackingPreferences;
						if (is === null) {
							const relatedRecord = await this.client.macroActivityTrackingPreferences.findFirst(
								{ where: { userId: record.id } },
								tx
							);
							if (relatedRecord) return null;
						}
						if (is !== null && is !== undefined) {
							const relatedRecord = await this.client.macroActivityTrackingPreferences.findFirst(
								{ where: { ...is, userId: record.id } },
								tx
							);
							if (!relatedRecord) return null;
						}
						if (isNot === null) {
							const relatedRecord = await this.client.macroActivityTrackingPreferences.findFirst(
								{ where: { userId: record.id } },
								tx
							);
							if (!relatedRecord) return null;
						}
						if (isNot !== null && isNot !== undefined) {
							const relatedRecord = await this.client.macroActivityTrackingPreferences.findFirst(
								{ where: { ...isNot, userId: record.id } },
								tx
							);
							if (relatedRecord) return null;
						}
						if (Object.keys(rest).length) {
							if (record.id === null) return null;
							const relatedRecord = await this.client.macroActivityTrackingPreferences.findFirst(
								{ where: { ...whereClause.activityTrackingPreferences, userId: record.id } },
								tx
							);
							if (!relatedRecord) return null;
						}
					}
					if (whereClause.macroTargets === null) {
						const relatedRecord = await this.client.macroTargets.findFirst(
							{ where: { userId: record.id } },
							tx
						);
						if (relatedRecord) return null;
					}
					if (whereClause.macroTargets) {
						const { is, isNot, ...rest } = whereClause.macroTargets;
						if (is === null) {
							const relatedRecord = await this.client.macroTargets.findFirst(
								{ where: { userId: record.id } },
								tx
							);
							if (relatedRecord) return null;
						}
						if (is !== null && is !== undefined) {
							const relatedRecord = await this.client.macroTargets.findFirst(
								{ where: { ...is, userId: record.id } },
								tx
							);
							if (!relatedRecord) return null;
						}
						if (isNot === null) {
							const relatedRecord = await this.client.macroTargets.findFirst(
								{ where: { userId: record.id } },
								tx
							);
							if (!relatedRecord) return null;
						}
						if (isNot !== null && isNot !== undefined) {
							const relatedRecord = await this.client.macroTargets.findFirst(
								{ where: { ...isNot, userId: record.id } },
								tx
							);
							if (relatedRecord) return null;
						}
						if (Object.keys(rest).length) {
							if (record.id === null) return null;
							const relatedRecord = await this.client.macroTargets.findFirst(
								{ where: { ...whereClause.macroTargets, userId: record.id } },
								tx
							);
							if (!relatedRecord) return null;
						}
					}
					if (whereClause.foodEntries) {
						if (whereClause.foodEntries.every) {
							const violatingRecord = await this.client.foodEntry.findFirst({
								where: { NOT: { ...whereClause.foodEntries.every }, userId: record.id },
								tx
							});
							if (violatingRecord !== null) return null;
						}
						if (whereClause.foodEntries.some) {
							const relatedRecords = await this.client.foodEntry.findMany({
								where: { ...whereClause.foodEntries.some, userId: record.id },
								tx
							});
							if (relatedRecords.length === 0) return null;
						}
						if (whereClause.foodEntries.none) {
							const violatingRecord = await this.client.foodEntry.findFirst({
								where: { ...whereClause.foodEntries.none, userId: record.id },
								tx
							});
							if (violatingRecord !== null) return null;
						}
					}
					if (whereClause.activityEntries) {
						if (whereClause.activityEntries.every) {
							const violatingRecord = await this.client.activityEntry.findFirst({
								where: { NOT: { ...whereClause.activityEntries.every }, userId: record.id },
								tx
							});
							if (violatingRecord !== null) return null;
						}
						if (whereClause.activityEntries.some) {
							const relatedRecords = await this.client.activityEntry.findMany({
								where: { ...whereClause.activityEntries.some, userId: record.id },
								tx
							});
							if (relatedRecords.length === 0) return null;
						}
						if (whereClause.activityEntries.none) {
							const violatingRecord = await this.client.activityEntry.findFirst({
								where: { ...whereClause.activityEntries.none, userId: record.id },
								tx
							});
							if (violatingRecord !== null) return null;
						}
					}
					return record;
				})
			)
		).filter((result) => result !== null);
	}
	private _applySelectClause<S extends Prisma.Args<Prisma.UserDelegate, 'findMany'>['select']>(
		records: Prisma.Result<Prisma.UserDelegate, object, 'findFirstOrThrow'>[],
		selectClause: S
	): Prisma.Result<Prisma.UserDelegate, { select: S }, 'findFirstOrThrow'>[] {
		if (!selectClause) {
			return records as Prisma.Result<Prisma.UserDelegate, { select: S }, 'findFirstOrThrow'>[];
		}
		return records.map((record) => {
			const partialRecord: Partial<typeof record> = record;
			for (const untypedKey of [
				'id',
				'email',
				'name',
				'emailVerified',
				'image',
				'createdAt',
				'updatedAt',
				'isAnonymous',
				'sessions',
				'accounts',
				'exerciseSplits',
				'gettingStartedAnswers',
				'dashboardItems',
				'metrics',
				'activityTrackingPreferences',
				'macroTargets',
				'foodEntries',
				'activityEntries'
			]) {
				const key = untypedKey as keyof typeof record & keyof S;
				if (!selectClause[key]) delete partialRecord[key];
			}
			return partialRecord;
		}) as Prisma.Result<Prisma.UserDelegate, { select: S }, 'findFirstOrThrow'>[];
	}
	private async _applyRelations<Q extends Prisma.Args<Prisma.UserDelegate, 'findMany'>>(
		records: Prisma.Result<Prisma.UserDelegate, object, 'findFirstOrThrow'>[],
		tx: IDBUtils.TransactionType,
		query?: Q
	): Promise<Prisma.Result<Prisma.UserDelegate, Q, 'findFirstOrThrow'>[]> {
		if (!query) return records as Prisma.Result<Prisma.UserDelegate, Q, 'findFirstOrThrow'>[];
		const recordsWithRelations = records.map(async (record) => {
			const unsafeRecord = record as Record<string, unknown>;
			const attach_sessions = query.select?.sessions || query.include?.sessions;
			if (attach_sessions) {
				unsafeRecord['sessions'] = await this.client.session.findMany(
					{
						...(attach_sessions === true ? {} : attach_sessions),
						where: { userId: record.id! }
					},
					tx
				);
			}
			const attach_accounts = query.select?.accounts || query.include?.accounts;
			if (attach_accounts) {
				unsafeRecord['accounts'] = await this.client.account.findMany(
					{
						...(attach_accounts === true ? {} : attach_accounts),
						where: { userId: record.id! }
					},
					tx
				);
			}
			const attach_exerciseSplits = query.select?.exerciseSplits || query.include?.exerciseSplits;
			if (attach_exerciseSplits) {
				unsafeRecord['exerciseSplits'] = await this.client.exerciseSplit.findMany(
					{
						...(attach_exerciseSplits === true ? {} : attach_exerciseSplits),
						where: { userId: record.id! }
					},
					tx
				);
			}
			const attach_gettingStartedAnswers =
				query.select?.gettingStartedAnswers || query.include?.gettingStartedAnswers;
			if (attach_gettingStartedAnswers) {
				unsafeRecord['gettingStartedAnswers'] = await this.client.gettingStartedAnswers.findUnique(
					{
						...(attach_gettingStartedAnswers === true ? {} : attach_gettingStartedAnswers),
						where: { userId: record.id }
					},
					tx
				);
			}
			const attach_dashboardItems = query.select?.dashboardItems || query.include?.dashboardItems;
			if (attach_dashboardItems) {
				unsafeRecord['dashboardItems'] = await this.client.dashboardItem.findMany(
					{
						...(attach_dashboardItems === true ? {} : attach_dashboardItems),
						where: { userId: record.id! }
					},
					tx
				);
			}
			const attach_metrics = query.select?.metrics || query.include?.metrics;
			if (attach_metrics) {
				unsafeRecord['metrics'] = await this.client.macroMetrics.findMany(
					{
						...(attach_metrics === true ? {} : attach_metrics),
						where: { userId: record.id! }
					},
					tx
				);
			}
			const attach_activityTrackingPreferences =
				query.select?.activityTrackingPreferences || query.include?.activityTrackingPreferences;
			if (attach_activityTrackingPreferences) {
				unsafeRecord['activityTrackingPreferences'] =
					await this.client.macroActivityTrackingPreferences.findUnique(
						{
							...(attach_activityTrackingPreferences === true
								? {}
								: attach_activityTrackingPreferences),
							where: { userId: record.id }
						},
						tx
					);
			}
			const attach_macroTargets = query.select?.macroTargets || query.include?.macroTargets;
			if (attach_macroTargets) {
				unsafeRecord['macroTargets'] = await this.client.macroTargets.findUnique(
					{
						...(attach_macroTargets === true ? {} : attach_macroTargets),
						where: { userId: record.id }
					},
					tx
				);
			}
			const attach_foodEntries = query.select?.foodEntries || query.include?.foodEntries;
			if (attach_foodEntries) {
				unsafeRecord['foodEntries'] = await this.client.foodEntry.findMany(
					{
						...(attach_foodEntries === true ? {} : attach_foodEntries),
						where: { userId: record.id! }
					},
					tx
				);
			}
			const attach_activityEntries =
				query.select?.activityEntries || query.include?.activityEntries;
			if (attach_activityEntries) {
				unsafeRecord['activityEntries'] = await this.client.activityEntry.findMany(
					{
						...(attach_activityEntries === true ? {} : attach_activityEntries),
						where: { userId: record.id! }
					},
					tx
				);
			}
			return unsafeRecord;
		});
		return (await Promise.all(recordsWithRelations)) as Prisma.Result<
			Prisma.UserDelegate,
			Q,
			'findFirstOrThrow'
		>[];
	}
	async _applyOrderByClause<
		O extends Prisma.Args<Prisma.UserDelegate, 'findMany'>['orderBy'],
		R extends Prisma.Result<Prisma.UserDelegate, object, 'findFirstOrThrow'>
	>(records: R[], orderByClause: O, tx: IDBUtils.TransactionType): Promise<void> {
		if (orderByClause === undefined) return;
		const orderByClauses = IDBUtils.convertToArray(orderByClause);
		const indexedKeys = await Promise.all(
			records.map(async (record) => {
				const keys = await Promise.all(
					orderByClauses.map(async (clause) => await this._resolveOrderByKey(record, clause, tx))
				);
				return { keys, record };
			})
		);
		indexedKeys.sort((a, b) => {
			for (let i = 0; i < orderByClauses.length; i++) {
				const clause = orderByClauses[i];
				const comparison = IDBUtils.genericComparator(
					a.keys[i],
					b.keys[i],
					this._resolveSortOrder(clause)
				);
				if (comparison !== 0) return comparison;
			}
			return 0;
		});
		for (let i = 0; i < records.length; i++) {
			records[i] = indexedKeys[i].record;
		}
	}
	async _resolveOrderByKey(
		record: Prisma.Result<Prisma.UserDelegate, object, 'findFirstOrThrow'>,
		orderByInput: Prisma.UserOrderByWithRelationInput,
		tx: IDBUtils.TransactionType
	): Promise<unknown> {
		const scalarFields = [
			'id',
			'email',
			'name',
			'emailVerified',
			'image',
			'createdAt',
			'updatedAt',
			'isAnonymous'
		] as const;
		for (const field of scalarFields) if (orderByInput[field]) return record[field];
		if (orderByInput.gettingStartedAnswers) {
			return record.id === null
				? null
				: await this.client.gettingStartedAnswers._resolveOrderByKey(
						await this.client.gettingStartedAnswers.findFirstOrThrow({
							where: { userId: record.id }
						}),
						orderByInput.gettingStartedAnswers,
						tx
					);
		}
		if (orderByInput.activityTrackingPreferences) {
			return record.id === null
				? null
				: await this.client.macroActivityTrackingPreferences._resolveOrderByKey(
						await this.client.macroActivityTrackingPreferences.findFirstOrThrow({
							where: { userId: record.id }
						}),
						orderByInput.activityTrackingPreferences,
						tx
					);
		}
		if (orderByInput.macroTargets) {
			return record.id === null
				? null
				: await this.client.macroTargets._resolveOrderByKey(
						await this.client.macroTargets.findFirstOrThrow({ where: { userId: record.id } }),
						orderByInput.macroTargets,
						tx
					);
		}
		if (orderByInput.sessions) {
			return await this.client.session.count({ where: { userId: record.id } }, tx);
		}
		if (orderByInput.accounts) {
			return await this.client.account.count({ where: { userId: record.id } }, tx);
		}
		if (orderByInput.exerciseSplits) {
			return await this.client.exerciseSplit.count({ where: { userId: record.id } }, tx);
		}
		if (orderByInput.dashboardItems) {
			return await this.client.dashboardItem.count({ where: { userId: record.id } }, tx);
		}
		if (orderByInput.metrics) {
			return await this.client.macroMetrics.count({ where: { userId: record.id } }, tx);
		}
		if (orderByInput.foodEntries) {
			return await this.client.foodEntry.count({ where: { userId: record.id } }, tx);
		}
		if (orderByInput.activityEntries) {
			return await this.client.activityEntry.count({ where: { userId: record.id } }, tx);
		}
	}
	_resolveSortOrder(
		orderByInput: Prisma.UserOrderByWithRelationInput
	): Prisma.SortOrder | { sort: Prisma.SortOrder; nulls?: 'first' | 'last' } {
		const scalarFields = [
			'id',
			'email',
			'name',
			'emailVerified',
			'image',
			'createdAt',
			'updatedAt',
			'isAnonymous'
		] as const;
		for (const field of scalarFields) if (orderByInput[field]) return orderByInput[field];
		if (orderByInput.gettingStartedAnswers) {
			return this.client.gettingStartedAnswers._resolveSortOrder(
				orderByInput.gettingStartedAnswers
			);
		}
		if (orderByInput.activityTrackingPreferences) {
			return this.client.macroActivityTrackingPreferences._resolveSortOrder(
				orderByInput.activityTrackingPreferences
			);
		}
		if (orderByInput.macroTargets) {
			return this.client.macroTargets._resolveSortOrder(orderByInput.macroTargets);
		}
		if (orderByInput.sessions?._count) {
			return orderByInput.sessions._count;
		}
		if (orderByInput.accounts?._count) {
			return orderByInput.accounts._count;
		}
		if (orderByInput.exerciseSplits?._count) {
			return orderByInput.exerciseSplits._count;
		}
		if (orderByInput.dashboardItems?._count) {
			return orderByInput.dashboardItems._count;
		}
		if (orderByInput.metrics?._count) {
			return orderByInput.metrics._count;
		}
		if (orderByInput.foodEntries?._count) {
			return orderByInput.foodEntries._count;
		}
		if (orderByInput.activityEntries?._count) {
			return orderByInput.activityEntries._count;
		}
		throw new Error('No field in orderBy clause');
	}
	private async _fillDefaults<D extends Prisma.Args<Prisma.UserDelegate, 'create'>['data']>(
		data: D,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<D> {
		if (data === undefined) data = {} as NonNullable<D>;
		if (data.name === undefined) {
			data.name = null;
		}
		if (data.image === undefined) {
			data.image = null;
		}
		if (data.isAnonymous === undefined) {
			data.isAnonymous = null;
		}
		if (typeof data.createdAt === 'string') {
			data.createdAt = new Date(data.createdAt);
		}
		if (typeof data.updatedAt === 'string') {
			data.updatedAt = new Date(data.updatedAt);
		}
		return data;
	}
	_getNeededStoresForWhere<W extends Prisma.Args<Prisma.UserDelegate, 'findMany'>['where']>(
		whereClause: W,
		neededStores: Set<StoreNames<PrismaIDBSchema>>
	) {
		if (whereClause === undefined) return;
		for (const param of IDBUtils.LogicalParams) {
			if (whereClause[param]) {
				for (const clause of IDBUtils.convertToArray(whereClause[param])) {
					this._getNeededStoresForWhere(clause, neededStores);
				}
			}
		}
		if (whereClause.sessions) {
			neededStores.add('Session');
			this.client.session._getNeededStoresForWhere(whereClause.sessions.every, neededStores);
			this.client.session._getNeededStoresForWhere(whereClause.sessions.some, neededStores);
			this.client.session._getNeededStoresForWhere(whereClause.sessions.none, neededStores);
		}
		if (whereClause.accounts) {
			neededStores.add('Account');
			this.client.account._getNeededStoresForWhere(whereClause.accounts.every, neededStores);
			this.client.account._getNeededStoresForWhere(whereClause.accounts.some, neededStores);
			this.client.account._getNeededStoresForWhere(whereClause.accounts.none, neededStores);
		}
		if (whereClause.exerciseSplits) {
			neededStores.add('ExerciseSplit');
			this.client.exerciseSplit._getNeededStoresForWhere(
				whereClause.exerciseSplits.every,
				neededStores
			);
			this.client.exerciseSplit._getNeededStoresForWhere(
				whereClause.exerciseSplits.some,
				neededStores
			);
			this.client.exerciseSplit._getNeededStoresForWhere(
				whereClause.exerciseSplits.none,
				neededStores
			);
		}
		if (whereClause.gettingStartedAnswers) {
			neededStores.add('GettingStartedAnswers');
			this.client.gettingStartedAnswers._getNeededStoresForWhere(
				whereClause.gettingStartedAnswers,
				neededStores
			);
		}
		if (whereClause.dashboardItems) {
			neededStores.add('DashboardItem');
			this.client.dashboardItem._getNeededStoresForWhere(
				whereClause.dashboardItems.every,
				neededStores
			);
			this.client.dashboardItem._getNeededStoresForWhere(
				whereClause.dashboardItems.some,
				neededStores
			);
			this.client.dashboardItem._getNeededStoresForWhere(
				whereClause.dashboardItems.none,
				neededStores
			);
		}
		if (whereClause.metrics) {
			neededStores.add('MacroMetrics');
			this.client.macroMetrics._getNeededStoresForWhere(whereClause.metrics.every, neededStores);
			this.client.macroMetrics._getNeededStoresForWhere(whereClause.metrics.some, neededStores);
			this.client.macroMetrics._getNeededStoresForWhere(whereClause.metrics.none, neededStores);
		}
		if (whereClause.activityTrackingPreferences) {
			neededStores.add('MacroActivityTrackingPreferences');
			this.client.macroActivityTrackingPreferences._getNeededStoresForWhere(
				whereClause.activityTrackingPreferences,
				neededStores
			);
		}
		if (whereClause.macroTargets) {
			neededStores.add('MacroTargets');
			this.client.macroTargets._getNeededStoresForWhere(whereClause.macroTargets, neededStores);
		}
		if (whereClause.foodEntries) {
			neededStores.add('FoodEntry');
			this.client.foodEntry._getNeededStoresForWhere(whereClause.foodEntries.every, neededStores);
			this.client.foodEntry._getNeededStoresForWhere(whereClause.foodEntries.some, neededStores);
			this.client.foodEntry._getNeededStoresForWhere(whereClause.foodEntries.none, neededStores);
		}
		if (whereClause.activityEntries) {
			neededStores.add('ActivityEntry');
			this.client.activityEntry._getNeededStoresForWhere(
				whereClause.activityEntries.every,
				neededStores
			);
			this.client.activityEntry._getNeededStoresForWhere(
				whereClause.activityEntries.some,
				neededStores
			);
			this.client.activityEntry._getNeededStoresForWhere(
				whereClause.activityEntries.none,
				neededStores
			);
		}
	}
	_getNeededStoresForFind<Q extends Prisma.Args<Prisma.UserDelegate, 'findMany'>>(
		query?: Q
	): Set<StoreNames<PrismaIDBSchema>> {
		const neededStores: Set<StoreNames<PrismaIDBSchema>> = new Set();
		neededStores.add('User');
		this._getNeededStoresForWhere(query?.where, neededStores);
		if (query?.orderBy) {
			const orderBy = IDBUtils.convertToArray(query.orderBy);
			const orderBy_sessions = orderBy.find((clause) => clause.sessions);
			if (orderBy_sessions) {
				neededStores.add('Session');
			}
			const orderBy_accounts = orderBy.find((clause) => clause.accounts);
			if (orderBy_accounts) {
				neededStores.add('Account');
			}
			const orderBy_exerciseSplits = orderBy.find((clause) => clause.exerciseSplits);
			if (orderBy_exerciseSplits) {
				neededStores.add('ExerciseSplit');
			}
			const orderBy_gettingStartedAnswers = orderBy.find((clause) => clause.gettingStartedAnswers);
			if (orderBy_gettingStartedAnswers) {
				this.client.gettingStartedAnswers
					._getNeededStoresForFind({ orderBy: orderBy_gettingStartedAnswers.gettingStartedAnswers })
					.forEach((storeName) => neededStores.add(storeName));
			}
			const orderBy_dashboardItems = orderBy.find((clause) => clause.dashboardItems);
			if (orderBy_dashboardItems) {
				neededStores.add('DashboardItem');
			}
			const orderBy_metrics = orderBy.find((clause) => clause.metrics);
			if (orderBy_metrics) {
				neededStores.add('MacroMetrics');
			}
			const orderBy_activityTrackingPreferences = orderBy.find(
				(clause) => clause.activityTrackingPreferences
			);
			if (orderBy_activityTrackingPreferences) {
				this.client.macroActivityTrackingPreferences
					._getNeededStoresForFind({
						orderBy: orderBy_activityTrackingPreferences.activityTrackingPreferences
					})
					.forEach((storeName) => neededStores.add(storeName));
			}
			const orderBy_macroTargets = orderBy.find((clause) => clause.macroTargets);
			if (orderBy_macroTargets) {
				this.client.macroTargets
					._getNeededStoresForFind({ orderBy: orderBy_macroTargets.macroTargets })
					.forEach((storeName) => neededStores.add(storeName));
			}
			const orderBy_foodEntries = orderBy.find((clause) => clause.foodEntries);
			if (orderBy_foodEntries) {
				neededStores.add('FoodEntry');
			}
			const orderBy_activityEntries = orderBy.find((clause) => clause.activityEntries);
			if (orderBy_activityEntries) {
				neededStores.add('ActivityEntry');
			}
		}
		if (query?.select?.sessions || query?.include?.sessions) {
			neededStores.add('Session');
			if (typeof query.select?.sessions === 'object') {
				this.client.session
					._getNeededStoresForFind(query.select.sessions)
					.forEach((storeName) => neededStores.add(storeName));
			}
			if (typeof query.include?.sessions === 'object') {
				this.client.session
					._getNeededStoresForFind(query.include.sessions)
					.forEach((storeName) => neededStores.add(storeName));
			}
		}
		if (query?.select?.accounts || query?.include?.accounts) {
			neededStores.add('Account');
			if (typeof query.select?.accounts === 'object') {
				this.client.account
					._getNeededStoresForFind(query.select.accounts)
					.forEach((storeName) => neededStores.add(storeName));
			}
			if (typeof query.include?.accounts === 'object') {
				this.client.account
					._getNeededStoresForFind(query.include.accounts)
					.forEach((storeName) => neededStores.add(storeName));
			}
		}
		if (query?.select?.exerciseSplits || query?.include?.exerciseSplits) {
			neededStores.add('ExerciseSplit');
			if (typeof query.select?.exerciseSplits === 'object') {
				this.client.exerciseSplit
					._getNeededStoresForFind(query.select.exerciseSplits)
					.forEach((storeName) => neededStores.add(storeName));
			}
			if (typeof query.include?.exerciseSplits === 'object') {
				this.client.exerciseSplit
					._getNeededStoresForFind(query.include.exerciseSplits)
					.forEach((storeName) => neededStores.add(storeName));
			}
		}
		if (query?.select?.gettingStartedAnswers || query?.include?.gettingStartedAnswers) {
			neededStores.add('GettingStartedAnswers');
			if (typeof query.select?.gettingStartedAnswers === 'object') {
				this.client.gettingStartedAnswers
					._getNeededStoresForFind(query.select.gettingStartedAnswers)
					.forEach((storeName) => neededStores.add(storeName));
			}
			if (typeof query.include?.gettingStartedAnswers === 'object') {
				this.client.gettingStartedAnswers
					._getNeededStoresForFind(query.include.gettingStartedAnswers)
					.forEach((storeName) => neededStores.add(storeName));
			}
		}
		if (query?.select?.dashboardItems || query?.include?.dashboardItems) {
			neededStores.add('DashboardItem');
			if (typeof query.select?.dashboardItems === 'object') {
				this.client.dashboardItem
					._getNeededStoresForFind(query.select.dashboardItems)
					.forEach((storeName) => neededStores.add(storeName));
			}
			if (typeof query.include?.dashboardItems === 'object') {
				this.client.dashboardItem
					._getNeededStoresForFind(query.include.dashboardItems)
					.forEach((storeName) => neededStores.add(storeName));
			}
		}
		if (query?.select?.metrics || query?.include?.metrics) {
			neededStores.add('MacroMetrics');
			if (typeof query.select?.metrics === 'object') {
				this.client.macroMetrics
					._getNeededStoresForFind(query.select.metrics)
					.forEach((storeName) => neededStores.add(storeName));
			}
			if (typeof query.include?.metrics === 'object') {
				this.client.macroMetrics
					._getNeededStoresForFind(query.include.metrics)
					.forEach((storeName) => neededStores.add(storeName));
			}
		}
		if (query?.select?.activityTrackingPreferences || query?.include?.activityTrackingPreferences) {
			neededStores.add('MacroActivityTrackingPreferences');
			if (typeof query.select?.activityTrackingPreferences === 'object') {
				this.client.macroActivityTrackingPreferences
					._getNeededStoresForFind(query.select.activityTrackingPreferences)
					.forEach((storeName) => neededStores.add(storeName));
			}
			if (typeof query.include?.activityTrackingPreferences === 'object') {
				this.client.macroActivityTrackingPreferences
					._getNeededStoresForFind(query.include.activityTrackingPreferences)
					.forEach((storeName) => neededStores.add(storeName));
			}
		}
		if (query?.select?.macroTargets || query?.include?.macroTargets) {
			neededStores.add('MacroTargets');
			if (typeof query.select?.macroTargets === 'object') {
				this.client.macroTargets
					._getNeededStoresForFind(query.select.macroTargets)
					.forEach((storeName) => neededStores.add(storeName));
			}
			if (typeof query.include?.macroTargets === 'object') {
				this.client.macroTargets
					._getNeededStoresForFind(query.include.macroTargets)
					.forEach((storeName) => neededStores.add(storeName));
			}
		}
		if (query?.select?.foodEntries || query?.include?.foodEntries) {
			neededStores.add('FoodEntry');
			if (typeof query.select?.foodEntries === 'object') {
				this.client.foodEntry
					._getNeededStoresForFind(query.select.foodEntries)
					.forEach((storeName) => neededStores.add(storeName));
			}
			if (typeof query.include?.foodEntries === 'object') {
				this.client.foodEntry
					._getNeededStoresForFind(query.include.foodEntries)
					.forEach((storeName) => neededStores.add(storeName));
			}
		}
		if (query?.select?.activityEntries || query?.include?.activityEntries) {
			neededStores.add('ActivityEntry');
			if (typeof query.select?.activityEntries === 'object') {
				this.client.activityEntry
					._getNeededStoresForFind(query.select.activityEntries)
					.forEach((storeName) => neededStores.add(storeName));
			}
			if (typeof query.include?.activityEntries === 'object') {
				this.client.activityEntry
					._getNeededStoresForFind(query.include.activityEntries)
					.forEach((storeName) => neededStores.add(storeName));
			}
		}
		return neededStores;
	}
	_getNeededStoresForCreate<D extends Partial<Prisma.Args<Prisma.UserDelegate, 'create'>['data']>>(
		data: D
	): Set<StoreNames<PrismaIDBSchema>> {
		const neededStores: Set<StoreNames<PrismaIDBSchema>> = new Set();
		neededStores.add('User');
		if (data?.sessions) {
			neededStores.add('Session');
			if (data.sessions.create) {
				const createData = Array.isArray(data.sessions.create)
					? data.sessions.create
					: [data.sessions.create];
				createData.forEach((record) =>
					this.client.session
						._getNeededStoresForCreate(record)
						.forEach((storeName) => neededStores.add(storeName))
				);
			}
			if (data.sessions.connectOrCreate) {
				IDBUtils.convertToArray(data.sessions.connectOrCreate).forEach((record) =>
					this.client.session
						._getNeededStoresForCreate(record.create)
						.forEach((storeName) => neededStores.add(storeName))
				);
			}
			if (data.sessions.createMany) {
				IDBUtils.convertToArray(data.sessions.createMany.data).forEach((record) =>
					this.client.session
						._getNeededStoresForCreate(record)
						.forEach((storeName) => neededStores.add(storeName))
				);
			}
		}
		if (data?.accounts) {
			neededStores.add('Account');
			if (data.accounts.create) {
				const createData = Array.isArray(data.accounts.create)
					? data.accounts.create
					: [data.accounts.create];
				createData.forEach((record) =>
					this.client.account
						._getNeededStoresForCreate(record)
						.forEach((storeName) => neededStores.add(storeName))
				);
			}
			if (data.accounts.connectOrCreate) {
				IDBUtils.convertToArray(data.accounts.connectOrCreate).forEach((record) =>
					this.client.account
						._getNeededStoresForCreate(record.create)
						.forEach((storeName) => neededStores.add(storeName))
				);
			}
			if (data.accounts.createMany) {
				IDBUtils.convertToArray(data.accounts.createMany.data).forEach((record) =>
					this.client.account
						._getNeededStoresForCreate(record)
						.forEach((storeName) => neededStores.add(storeName))
				);
			}
		}
		if (data?.exerciseSplits) {
			neededStores.add('ExerciseSplit');
			if (data.exerciseSplits.create) {
				const createData = Array.isArray(data.exerciseSplits.create)
					? data.exerciseSplits.create
					: [data.exerciseSplits.create];
				createData.forEach((record) =>
					this.client.exerciseSplit
						._getNeededStoresForCreate(record)
						.forEach((storeName) => neededStores.add(storeName))
				);
			}
			if (data.exerciseSplits.connectOrCreate) {
				IDBUtils.convertToArray(data.exerciseSplits.connectOrCreate).forEach((record) =>
					this.client.exerciseSplit
						._getNeededStoresForCreate(record.create)
						.forEach((storeName) => neededStores.add(storeName))
				);
			}
			if (data.exerciseSplits.createMany) {
				IDBUtils.convertToArray(data.exerciseSplits.createMany.data).forEach((record) =>
					this.client.exerciseSplit
						._getNeededStoresForCreate(record)
						.forEach((storeName) => neededStores.add(storeName))
				);
			}
		}
		if (data?.gettingStartedAnswers) {
			neededStores.add('GettingStartedAnswers');
			if (data.gettingStartedAnswers.create) {
				const createData = Array.isArray(data.gettingStartedAnswers.create)
					? data.gettingStartedAnswers.create
					: [data.gettingStartedAnswers.create];
				createData.forEach((record) =>
					this.client.gettingStartedAnswers
						._getNeededStoresForCreate(record)
						.forEach((storeName) => neededStores.add(storeName))
				);
			}
			if (data.gettingStartedAnswers.connectOrCreate) {
				IDBUtils.convertToArray(data.gettingStartedAnswers.connectOrCreate).forEach((record) =>
					this.client.gettingStartedAnswers
						._getNeededStoresForCreate(record.create)
						.forEach((storeName) => neededStores.add(storeName))
				);
			}
		}
		if (data?.dashboardItems) {
			neededStores.add('DashboardItem');
			if (data.dashboardItems.create) {
				const createData = Array.isArray(data.dashboardItems.create)
					? data.dashboardItems.create
					: [data.dashboardItems.create];
				createData.forEach((record) =>
					this.client.dashboardItem
						._getNeededStoresForCreate(record)
						.forEach((storeName) => neededStores.add(storeName))
				);
			}
			if (data.dashboardItems.connectOrCreate) {
				IDBUtils.convertToArray(data.dashboardItems.connectOrCreate).forEach((record) =>
					this.client.dashboardItem
						._getNeededStoresForCreate(record.create)
						.forEach((storeName) => neededStores.add(storeName))
				);
			}
			if (data.dashboardItems.createMany) {
				IDBUtils.convertToArray(data.dashboardItems.createMany.data).forEach((record) =>
					this.client.dashboardItem
						._getNeededStoresForCreate(record)
						.forEach((storeName) => neededStores.add(storeName))
				);
			}
		}
		if (data?.metrics) {
			neededStores.add('MacroMetrics');
			if (data.metrics.create) {
				const createData = Array.isArray(data.metrics.create)
					? data.metrics.create
					: [data.metrics.create];
				createData.forEach((record) =>
					this.client.macroMetrics
						._getNeededStoresForCreate(record)
						.forEach((storeName) => neededStores.add(storeName))
				);
			}
			if (data.metrics.connectOrCreate) {
				IDBUtils.convertToArray(data.metrics.connectOrCreate).forEach((record) =>
					this.client.macroMetrics
						._getNeededStoresForCreate(record.create)
						.forEach((storeName) => neededStores.add(storeName))
				);
			}
			if (data.metrics.createMany) {
				IDBUtils.convertToArray(data.metrics.createMany.data).forEach((record) =>
					this.client.macroMetrics
						._getNeededStoresForCreate(record)
						.forEach((storeName) => neededStores.add(storeName))
				);
			}
		}
		if (data?.activityTrackingPreferences) {
			neededStores.add('MacroActivityTrackingPreferences');
			if (data.activityTrackingPreferences.create) {
				const createData = Array.isArray(data.activityTrackingPreferences.create)
					? data.activityTrackingPreferences.create
					: [data.activityTrackingPreferences.create];
				createData.forEach((record) =>
					this.client.macroActivityTrackingPreferences
						._getNeededStoresForCreate(record)
						.forEach((storeName) => neededStores.add(storeName))
				);
			}
			if (data.activityTrackingPreferences.connectOrCreate) {
				IDBUtils.convertToArray(data.activityTrackingPreferences.connectOrCreate).forEach(
					(record) =>
						this.client.macroActivityTrackingPreferences
							._getNeededStoresForCreate(record.create)
							.forEach((storeName) => neededStores.add(storeName))
				);
			}
		}
		if (data?.macroTargets) {
			neededStores.add('MacroTargets');
			if (data.macroTargets.create) {
				const createData = Array.isArray(data.macroTargets.create)
					? data.macroTargets.create
					: [data.macroTargets.create];
				createData.forEach((record) =>
					this.client.macroTargets
						._getNeededStoresForCreate(record)
						.forEach((storeName) => neededStores.add(storeName))
				);
			}
			if (data.macroTargets.connectOrCreate) {
				IDBUtils.convertToArray(data.macroTargets.connectOrCreate).forEach((record) =>
					this.client.macroTargets
						._getNeededStoresForCreate(record.create)
						.forEach((storeName) => neededStores.add(storeName))
				);
			}
		}
		if (data?.foodEntries) {
			neededStores.add('FoodEntry');
			if (data.foodEntries.create) {
				const createData = Array.isArray(data.foodEntries.create)
					? data.foodEntries.create
					: [data.foodEntries.create];
				createData.forEach((record) =>
					this.client.foodEntry
						._getNeededStoresForCreate(record)
						.forEach((storeName) => neededStores.add(storeName))
				);
			}
			if (data.foodEntries.connectOrCreate) {
				IDBUtils.convertToArray(data.foodEntries.connectOrCreate).forEach((record) =>
					this.client.foodEntry
						._getNeededStoresForCreate(record.create)
						.forEach((storeName) => neededStores.add(storeName))
				);
			}
			if (data.foodEntries.createMany) {
				IDBUtils.convertToArray(data.foodEntries.createMany.data).forEach((record) =>
					this.client.foodEntry
						._getNeededStoresForCreate(record)
						.forEach((storeName) => neededStores.add(storeName))
				);
			}
		}
		if (data?.activityEntries) {
			neededStores.add('ActivityEntry');
			if (data.activityEntries.create) {
				const createData = Array.isArray(data.activityEntries.create)
					? data.activityEntries.create
					: [data.activityEntries.create];
				createData.forEach((record) =>
					this.client.activityEntry
						._getNeededStoresForCreate(record)
						.forEach((storeName) => neededStores.add(storeName))
				);
			}
			if (data.activityEntries.connectOrCreate) {
				IDBUtils.convertToArray(data.activityEntries.connectOrCreate).forEach((record) =>
					this.client.activityEntry
						._getNeededStoresForCreate(record.create)
						.forEach((storeName) => neededStores.add(storeName))
				);
			}
			if (data.activityEntries.createMany) {
				IDBUtils.convertToArray(data.activityEntries.createMany.data).forEach((record) =>
					this.client.activityEntry
						._getNeededStoresForCreate(record)
						.forEach((storeName) => neededStores.add(storeName))
				);
			}
		}
		return neededStores;
	}
	_getNeededStoresForUpdate<Q extends Prisma.Args<Prisma.UserDelegate, 'update'>>(
		query: Partial<Q>
	): Set<StoreNames<PrismaIDBSchema>> {
		const neededStores = this._getNeededStoresForFind(query).union(
			this._getNeededStoresForCreate(
				query.data as Prisma.Args<Prisma.UserDelegate, 'create'>['data']
			)
		);
		if (query.data?.sessions?.connect) {
			neededStores.add('Session');
			IDBUtils.convertToArray(query.data.sessions.connect).forEach((connect) => {
				this.client.session._getNeededStoresForWhere(connect, neededStores);
			});
		}
		if (query.data?.sessions?.set) {
			neededStores.add('Session');
			IDBUtils.convertToArray(query.data.sessions.set).forEach((setWhere) => {
				this.client.session._getNeededStoresForWhere(setWhere, neededStores);
			});
		}
		if (query.data?.sessions?.updateMany) {
			neededStores.add('Session');
			IDBUtils.convertToArray(query.data.sessions.updateMany).forEach((update) => {
				this.client.session
					._getNeededStoresForUpdate(update as Prisma.Args<Prisma.SessionDelegate, 'update'>)
					.forEach((store) => neededStores.add(store));
			});
		}
		if (query.data?.sessions?.update) {
			neededStores.add('Session');
			IDBUtils.convertToArray(query.data.sessions.update).forEach((update) => {
				this.client.session
					._getNeededStoresForUpdate(update as Prisma.Args<Prisma.SessionDelegate, 'update'>)
					.forEach((store) => neededStores.add(store));
			});
		}
		if (query.data?.sessions?.upsert) {
			neededStores.add('Session');
			IDBUtils.convertToArray(query.data.sessions.upsert).forEach((upsert) => {
				const update = {
					where: upsert.where,
					data: { ...upsert.update, ...upsert.create }
				} as Prisma.Args<Prisma.SessionDelegate, 'update'>;
				this.client.session
					._getNeededStoresForUpdate(update)
					.forEach((store) => neededStores.add(store));
			});
		}
		if (query.data?.accounts?.connect) {
			neededStores.add('Account');
			IDBUtils.convertToArray(query.data.accounts.connect).forEach((connect) => {
				this.client.account._getNeededStoresForWhere(connect, neededStores);
			});
		}
		if (query.data?.accounts?.set) {
			neededStores.add('Account');
			IDBUtils.convertToArray(query.data.accounts.set).forEach((setWhere) => {
				this.client.account._getNeededStoresForWhere(setWhere, neededStores);
			});
		}
		if (query.data?.accounts?.updateMany) {
			neededStores.add('Account');
			IDBUtils.convertToArray(query.data.accounts.updateMany).forEach((update) => {
				this.client.account
					._getNeededStoresForUpdate(update as Prisma.Args<Prisma.AccountDelegate, 'update'>)
					.forEach((store) => neededStores.add(store));
			});
		}
		if (query.data?.accounts?.update) {
			neededStores.add('Account');
			IDBUtils.convertToArray(query.data.accounts.update).forEach((update) => {
				this.client.account
					._getNeededStoresForUpdate(update as Prisma.Args<Prisma.AccountDelegate, 'update'>)
					.forEach((store) => neededStores.add(store));
			});
		}
		if (query.data?.accounts?.upsert) {
			neededStores.add('Account');
			IDBUtils.convertToArray(query.data.accounts.upsert).forEach((upsert) => {
				const update = {
					where: upsert.where,
					data: { ...upsert.update, ...upsert.create }
				} as Prisma.Args<Prisma.AccountDelegate, 'update'>;
				this.client.account
					._getNeededStoresForUpdate(update)
					.forEach((store) => neededStores.add(store));
			});
		}
		if (query.data?.exerciseSplits?.connect) {
			neededStores.add('ExerciseSplit');
			IDBUtils.convertToArray(query.data.exerciseSplits.connect).forEach((connect) => {
				this.client.exerciseSplit._getNeededStoresForWhere(connect, neededStores);
			});
		}
		if (query.data?.exerciseSplits?.set) {
			neededStores.add('ExerciseSplit');
			IDBUtils.convertToArray(query.data.exerciseSplits.set).forEach((setWhere) => {
				this.client.exerciseSplit._getNeededStoresForWhere(setWhere, neededStores);
			});
		}
		if (query.data?.exerciseSplits?.updateMany) {
			neededStores.add('ExerciseSplit');
			IDBUtils.convertToArray(query.data.exerciseSplits.updateMany).forEach((update) => {
				this.client.exerciseSplit
					._getNeededStoresForUpdate(update as Prisma.Args<Prisma.ExerciseSplitDelegate, 'update'>)
					.forEach((store) => neededStores.add(store));
			});
		}
		if (query.data?.exerciseSplits?.update) {
			neededStores.add('ExerciseSplit');
			IDBUtils.convertToArray(query.data.exerciseSplits.update).forEach((update) => {
				this.client.exerciseSplit
					._getNeededStoresForUpdate(update as Prisma.Args<Prisma.ExerciseSplitDelegate, 'update'>)
					.forEach((store) => neededStores.add(store));
			});
		}
		if (query.data?.exerciseSplits?.upsert) {
			neededStores.add('ExerciseSplit');
			IDBUtils.convertToArray(query.data.exerciseSplits.upsert).forEach((upsert) => {
				const update = {
					where: upsert.where,
					data: { ...upsert.update, ...upsert.create }
				} as Prisma.Args<Prisma.ExerciseSplitDelegate, 'update'>;
				this.client.exerciseSplit
					._getNeededStoresForUpdate(update)
					.forEach((store) => neededStores.add(store));
			});
		}
		if (query.data?.gettingStartedAnswers?.connect) {
			neededStores.add('GettingStartedAnswers');
			IDBUtils.convertToArray(query.data.gettingStartedAnswers.connect).forEach((connect) => {
				this.client.gettingStartedAnswers._getNeededStoresForWhere(connect, neededStores);
			});
		}
		if (query.data?.gettingStartedAnswers?.disconnect) {
			neededStores.add('GettingStartedAnswers');
			if (query.data?.gettingStartedAnswers?.disconnect !== true) {
				IDBUtils.convertToArray(query.data.gettingStartedAnswers.disconnect).forEach(
					(disconnect) => {
						this.client.gettingStartedAnswers._getNeededStoresForWhere(disconnect, neededStores);
					}
				);
			}
		}
		if (query.data?.gettingStartedAnswers?.update) {
			neededStores.add('GettingStartedAnswers');
			IDBUtils.convertToArray(query.data.gettingStartedAnswers.update).forEach((update) => {
				this.client.gettingStartedAnswers
					._getNeededStoresForUpdate(
						update as Prisma.Args<Prisma.GettingStartedAnswersDelegate, 'update'>
					)
					.forEach((store) => neededStores.add(store));
			});
		}
		if (query.data?.gettingStartedAnswers?.upsert) {
			neededStores.add('GettingStartedAnswers');
			IDBUtils.convertToArray(query.data.gettingStartedAnswers.upsert).forEach((upsert) => {
				const update = {
					where: upsert.where,
					data: { ...upsert.update, ...upsert.create }
				} as Prisma.Args<Prisma.GettingStartedAnswersDelegate, 'update'>;
				this.client.gettingStartedAnswers
					._getNeededStoresForUpdate(update)
					.forEach((store) => neededStores.add(store));
			});
		}
		if (query.data?.dashboardItems?.connect) {
			neededStores.add('DashboardItem');
			IDBUtils.convertToArray(query.data.dashboardItems.connect).forEach((connect) => {
				this.client.dashboardItem._getNeededStoresForWhere(connect, neededStores);
			});
		}
		if (query.data?.dashboardItems?.set) {
			neededStores.add('DashboardItem');
			IDBUtils.convertToArray(query.data.dashboardItems.set).forEach((setWhere) => {
				this.client.dashboardItem._getNeededStoresForWhere(setWhere, neededStores);
			});
		}
		if (query.data?.dashboardItems?.updateMany) {
			neededStores.add('DashboardItem');
			IDBUtils.convertToArray(query.data.dashboardItems.updateMany).forEach((update) => {
				this.client.dashboardItem
					._getNeededStoresForUpdate(update as Prisma.Args<Prisma.DashboardItemDelegate, 'update'>)
					.forEach((store) => neededStores.add(store));
			});
		}
		if (query.data?.dashboardItems?.update) {
			neededStores.add('DashboardItem');
			IDBUtils.convertToArray(query.data.dashboardItems.update).forEach((update) => {
				this.client.dashboardItem
					._getNeededStoresForUpdate(update as Prisma.Args<Prisma.DashboardItemDelegate, 'update'>)
					.forEach((store) => neededStores.add(store));
			});
		}
		if (query.data?.dashboardItems?.upsert) {
			neededStores.add('DashboardItem');
			IDBUtils.convertToArray(query.data.dashboardItems.upsert).forEach((upsert) => {
				const update = {
					where: upsert.where,
					data: { ...upsert.update, ...upsert.create }
				} as Prisma.Args<Prisma.DashboardItemDelegate, 'update'>;
				this.client.dashboardItem
					._getNeededStoresForUpdate(update)
					.forEach((store) => neededStores.add(store));
			});
		}
		if (query.data?.metrics?.connect) {
			neededStores.add('MacroMetrics');
			IDBUtils.convertToArray(query.data.metrics.connect).forEach((connect) => {
				this.client.macroMetrics._getNeededStoresForWhere(connect, neededStores);
			});
		}
		if (query.data?.metrics?.set) {
			neededStores.add('MacroMetrics');
			IDBUtils.convertToArray(query.data.metrics.set).forEach((setWhere) => {
				this.client.macroMetrics._getNeededStoresForWhere(setWhere, neededStores);
			});
		}
		if (query.data?.metrics?.updateMany) {
			neededStores.add('MacroMetrics');
			IDBUtils.convertToArray(query.data.metrics.updateMany).forEach((update) => {
				this.client.macroMetrics
					._getNeededStoresForUpdate(update as Prisma.Args<Prisma.MacroMetricsDelegate, 'update'>)
					.forEach((store) => neededStores.add(store));
			});
		}
		if (query.data?.metrics?.update) {
			neededStores.add('MacroMetrics');
			IDBUtils.convertToArray(query.data.metrics.update).forEach((update) => {
				this.client.macroMetrics
					._getNeededStoresForUpdate(update as Prisma.Args<Prisma.MacroMetricsDelegate, 'update'>)
					.forEach((store) => neededStores.add(store));
			});
		}
		if (query.data?.metrics?.upsert) {
			neededStores.add('MacroMetrics');
			IDBUtils.convertToArray(query.data.metrics.upsert).forEach((upsert) => {
				const update = {
					where: upsert.where,
					data: { ...upsert.update, ...upsert.create }
				} as Prisma.Args<Prisma.MacroMetricsDelegate, 'update'>;
				this.client.macroMetrics
					._getNeededStoresForUpdate(update)
					.forEach((store) => neededStores.add(store));
			});
		}
		if (query.data?.activityTrackingPreferences?.connect) {
			neededStores.add('MacroActivityTrackingPreferences');
			IDBUtils.convertToArray(query.data.activityTrackingPreferences.connect).forEach((connect) => {
				this.client.macroActivityTrackingPreferences._getNeededStoresForWhere(
					connect,
					neededStores
				);
			});
		}
		if (query.data?.activityTrackingPreferences?.disconnect) {
			neededStores.add('MacroActivityTrackingPreferences');
			if (query.data?.activityTrackingPreferences?.disconnect !== true) {
				IDBUtils.convertToArray(query.data.activityTrackingPreferences.disconnect).forEach(
					(disconnect) => {
						this.client.macroActivityTrackingPreferences._getNeededStoresForWhere(
							disconnect,
							neededStores
						);
					}
				);
			}
		}
		if (query.data?.activityTrackingPreferences?.update) {
			neededStores.add('MacroActivityTrackingPreferences');
			IDBUtils.convertToArray(query.data.activityTrackingPreferences.update).forEach((update) => {
				this.client.macroActivityTrackingPreferences
					._getNeededStoresForUpdate(
						update as Prisma.Args<Prisma.MacroActivityTrackingPreferencesDelegate, 'update'>
					)
					.forEach((store) => neededStores.add(store));
			});
		}
		if (query.data?.activityTrackingPreferences?.upsert) {
			neededStores.add('MacroActivityTrackingPreferences');
			IDBUtils.convertToArray(query.data.activityTrackingPreferences.upsert).forEach((upsert) => {
				const update = {
					where: upsert.where,
					data: { ...upsert.update, ...upsert.create }
				} as Prisma.Args<Prisma.MacroActivityTrackingPreferencesDelegate, 'update'>;
				this.client.macroActivityTrackingPreferences
					._getNeededStoresForUpdate(update)
					.forEach((store) => neededStores.add(store));
			});
		}
		if (query.data?.macroTargets?.connect) {
			neededStores.add('MacroTargets');
			IDBUtils.convertToArray(query.data.macroTargets.connect).forEach((connect) => {
				this.client.macroTargets._getNeededStoresForWhere(connect, neededStores);
			});
		}
		if (query.data?.macroTargets?.disconnect) {
			neededStores.add('MacroTargets');
			if (query.data?.macroTargets?.disconnect !== true) {
				IDBUtils.convertToArray(query.data.macroTargets.disconnect).forEach((disconnect) => {
					this.client.macroTargets._getNeededStoresForWhere(disconnect, neededStores);
				});
			}
		}
		if (query.data?.macroTargets?.update) {
			neededStores.add('MacroTargets');
			IDBUtils.convertToArray(query.data.macroTargets.update).forEach((update) => {
				this.client.macroTargets
					._getNeededStoresForUpdate(update as Prisma.Args<Prisma.MacroTargetsDelegate, 'update'>)
					.forEach((store) => neededStores.add(store));
			});
		}
		if (query.data?.macroTargets?.upsert) {
			neededStores.add('MacroTargets');
			IDBUtils.convertToArray(query.data.macroTargets.upsert).forEach((upsert) => {
				const update = {
					where: upsert.where,
					data: { ...upsert.update, ...upsert.create }
				} as Prisma.Args<Prisma.MacroTargetsDelegate, 'update'>;
				this.client.macroTargets
					._getNeededStoresForUpdate(update)
					.forEach((store) => neededStores.add(store));
			});
		}
		if (query.data?.foodEntries?.connect) {
			neededStores.add('FoodEntry');
			IDBUtils.convertToArray(query.data.foodEntries.connect).forEach((connect) => {
				this.client.foodEntry._getNeededStoresForWhere(connect, neededStores);
			});
		}
		if (query.data?.foodEntries?.set) {
			neededStores.add('FoodEntry');
			IDBUtils.convertToArray(query.data.foodEntries.set).forEach((setWhere) => {
				this.client.foodEntry._getNeededStoresForWhere(setWhere, neededStores);
			});
		}
		if (query.data?.foodEntries?.updateMany) {
			neededStores.add('FoodEntry');
			IDBUtils.convertToArray(query.data.foodEntries.updateMany).forEach((update) => {
				this.client.foodEntry
					._getNeededStoresForUpdate(update as Prisma.Args<Prisma.FoodEntryDelegate, 'update'>)
					.forEach((store) => neededStores.add(store));
			});
		}
		if (query.data?.foodEntries?.update) {
			neededStores.add('FoodEntry');
			IDBUtils.convertToArray(query.data.foodEntries.update).forEach((update) => {
				this.client.foodEntry
					._getNeededStoresForUpdate(update as Prisma.Args<Prisma.FoodEntryDelegate, 'update'>)
					.forEach((store) => neededStores.add(store));
			});
		}
		if (query.data?.foodEntries?.upsert) {
			neededStores.add('FoodEntry');
			IDBUtils.convertToArray(query.data.foodEntries.upsert).forEach((upsert) => {
				const update = {
					where: upsert.where,
					data: { ...upsert.update, ...upsert.create }
				} as Prisma.Args<Prisma.FoodEntryDelegate, 'update'>;
				this.client.foodEntry
					._getNeededStoresForUpdate(update)
					.forEach((store) => neededStores.add(store));
			});
		}
		if (query.data?.activityEntries?.connect) {
			neededStores.add('ActivityEntry');
			IDBUtils.convertToArray(query.data.activityEntries.connect).forEach((connect) => {
				this.client.activityEntry._getNeededStoresForWhere(connect, neededStores);
			});
		}
		if (query.data?.activityEntries?.set) {
			neededStores.add('ActivityEntry');
			IDBUtils.convertToArray(query.data.activityEntries.set).forEach((setWhere) => {
				this.client.activityEntry._getNeededStoresForWhere(setWhere, neededStores);
			});
		}
		if (query.data?.activityEntries?.updateMany) {
			neededStores.add('ActivityEntry');
			IDBUtils.convertToArray(query.data.activityEntries.updateMany).forEach((update) => {
				this.client.activityEntry
					._getNeededStoresForUpdate(update as Prisma.Args<Prisma.ActivityEntryDelegate, 'update'>)
					.forEach((store) => neededStores.add(store));
			});
		}
		if (query.data?.activityEntries?.update) {
			neededStores.add('ActivityEntry');
			IDBUtils.convertToArray(query.data.activityEntries.update).forEach((update) => {
				this.client.activityEntry
					._getNeededStoresForUpdate(update as Prisma.Args<Prisma.ActivityEntryDelegate, 'update'>)
					.forEach((store) => neededStores.add(store));
			});
		}
		if (query.data?.activityEntries?.upsert) {
			neededStores.add('ActivityEntry');
			IDBUtils.convertToArray(query.data.activityEntries.upsert).forEach((upsert) => {
				const update = {
					where: upsert.where,
					data: { ...upsert.update, ...upsert.create }
				} as Prisma.Args<Prisma.ActivityEntryDelegate, 'update'>;
				this.client.activityEntry
					._getNeededStoresForUpdate(update)
					.forEach((store) => neededStores.add(store));
			});
		}
		if (query.data?.sessions?.delete || query.data?.sessions?.deleteMany) {
			this.client.session._getNeededStoresForNestedDelete(neededStores);
		}
		if (query.data?.accounts?.delete || query.data?.accounts?.deleteMany) {
			this.client.account._getNeededStoresForNestedDelete(neededStores);
		}
		if (query.data?.exerciseSplits?.delete || query.data?.exerciseSplits?.deleteMany) {
			this.client.exerciseSplit._getNeededStoresForNestedDelete(neededStores);
		}
		if (query.data?.gettingStartedAnswers?.delete) {
			this.client.gettingStartedAnswers._getNeededStoresForNestedDelete(neededStores);
		}
		if (query.data?.dashboardItems?.delete || query.data?.dashboardItems?.deleteMany) {
			this.client.dashboardItem._getNeededStoresForNestedDelete(neededStores);
		}
		if (query.data?.metrics?.delete || query.data?.metrics?.deleteMany) {
			this.client.macroMetrics._getNeededStoresForNestedDelete(neededStores);
		}
		if (query.data?.activityTrackingPreferences?.delete) {
			this.client.macroActivityTrackingPreferences._getNeededStoresForNestedDelete(neededStores);
		}
		if (query.data?.macroTargets?.delete) {
			this.client.macroTargets._getNeededStoresForNestedDelete(neededStores);
		}
		if (query.data?.foodEntries?.delete || query.data?.foodEntries?.deleteMany) {
			this.client.foodEntry._getNeededStoresForNestedDelete(neededStores);
		}
		if (query.data?.activityEntries?.delete || query.data?.activityEntries?.deleteMany) {
			this.client.activityEntry._getNeededStoresForNestedDelete(neededStores);
		}
		if (query.data?.id !== undefined) {
			neededStores.add('ExerciseSplit');
			neededStores.add('MacroTargets');
			neededStores.add('MacroMetrics');
			neededStores.add('MacroActivityTrackingPreferences');
			neededStores.add('FoodEntry');
			neededStores.add('ActivityEntry');
			neededStores.add('GettingStartedAnswers');
			neededStores.add('DashboardItem');
			neededStores.add('Session');
			neededStores.add('Account');
		}
		return neededStores;
	}
	_getNeededStoresForNestedDelete(neededStores: Set<StoreNames<PrismaIDBSchema>>): void {
		neededStores.add('User');
		this.client.session._getNeededStoresForNestedDelete(neededStores);
		this.client.account._getNeededStoresForNestedDelete(neededStores);
		this.client.exerciseSplit._getNeededStoresForNestedDelete(neededStores);
		this.client.gettingStartedAnswers._getNeededStoresForNestedDelete(neededStores);
		this.client.dashboardItem._getNeededStoresForNestedDelete(neededStores);
		this.client.macroMetrics._getNeededStoresForNestedDelete(neededStores);
		this.client.macroActivityTrackingPreferences._getNeededStoresForNestedDelete(neededStores);
		this.client.macroTargets._getNeededStoresForNestedDelete(neededStores);
		this.client.foodEntry._getNeededStoresForNestedDelete(neededStores);
		this.client.activityEntry._getNeededStoresForNestedDelete(neededStores);
	}
	private _removeNestedCreateData<D extends Prisma.Args<Prisma.UserDelegate, 'create'>['data']>(
		data: D
	): Prisma.Result<Prisma.UserDelegate, object, 'findFirstOrThrow'> {
		const recordWithoutNestedCreate = structuredClone(data);
		delete recordWithoutNestedCreate?.sessions;
		delete recordWithoutNestedCreate?.accounts;
		delete recordWithoutNestedCreate?.exerciseSplits;
		delete recordWithoutNestedCreate?.gettingStartedAnswers;
		delete recordWithoutNestedCreate?.dashboardItems;
		delete recordWithoutNestedCreate?.metrics;
		delete recordWithoutNestedCreate?.activityTrackingPreferences;
		delete recordWithoutNestedCreate?.macroTargets;
		delete recordWithoutNestedCreate?.foodEntries;
		delete recordWithoutNestedCreate?.activityEntries;
		return recordWithoutNestedCreate as Prisma.Result<
			Prisma.UserDelegate,
			object,
			'findFirstOrThrow'
		>;
	}
	private _preprocessListFields(
		records: Prisma.Result<Prisma.UserDelegate, object, 'findMany'>
	): void {}
	async findMany<Q extends Prisma.Args<Prisma.UserDelegate, 'findMany'>>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.UserDelegate, Q, 'findMany'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		const records = await this._applyWhereClause(
			await tx.objectStore('User').getAll(),
			query?.where,
			tx
		);
		await this._applyOrderByClause(records, query?.orderBy, tx);
		const relationAppliedRecords = (await this._applyRelations(
			records,
			tx,
			query
		)) as Prisma.Result<Prisma.UserDelegate, object, 'findFirstOrThrow'>[];
		const selectClause = query?.select;
		let selectAppliedRecords = this._applySelectClause(relationAppliedRecords, selectClause);
		if (query?.distinct) {
			const distinctFields = IDBUtils.convertToArray(query.distinct);
			const seen = new Set<string>();
			selectAppliedRecords = selectAppliedRecords.filter((record) => {
				const key = distinctFields.map((field) => record[field]).join('|');
				if (seen.has(key)) return false;
				seen.add(key);
				return true;
			});
		}
		this._preprocessListFields(selectAppliedRecords);
		return selectAppliedRecords as Prisma.Result<Prisma.UserDelegate, Q, 'findMany'>;
	}
	async findFirst<Q extends Prisma.Args<Prisma.UserDelegate, 'findFirst'>>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.UserDelegate, Q, 'findFirst'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		return (await this.findMany(query, tx))[0] ?? null;
	}
	async findFirstOrThrow<Q extends Prisma.Args<Prisma.UserDelegate, 'findFirstOrThrow'>>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.UserDelegate, Q, 'findFirstOrThrow'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		const record = await this.findFirst(query, tx);
		if (!record) {
			tx.abort();
			throw new Error('Record not found');
		}
		return record;
	}
	async findUnique<Q extends Prisma.Args<Prisma.UserDelegate, 'findUnique'>>(
		query: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.UserDelegate, Q, 'findUnique'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		let record;
		if (query.where.id !== undefined) {
			record = await tx.objectStore('User').get([query.where.id]);
		} else if (query.where.email !== undefined) {
			record = await tx.objectStore('User').index('emailIndex').get([query.where.email]);
		}
		if (!record) return null;

		const recordWithRelations = this._applySelectClause(
			await this._applyRelations(
				await this._applyWhereClause([record], query.where, tx),
				tx,
				query
			),
			query.select
		)[0];
		this._preprocessListFields([recordWithRelations]);
		return recordWithRelations as Prisma.Result<Prisma.UserDelegate, Q, 'findUnique'>;
	}
	async findUniqueOrThrow<Q extends Prisma.Args<Prisma.UserDelegate, 'findUniqueOrThrow'>>(
		query: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.UserDelegate, Q, 'findUniqueOrThrow'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		const record = await this.findUnique(query, tx);
		if (!record) {
			tx.abort();
			throw new Error('Record not found');
		}
		return record;
	}
	async count<Q extends Prisma.Args<Prisma.UserDelegate, 'count'>>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.UserDelegate, Q, 'count'>> {
		tx = tx ?? this.client._db.transaction(['User'], 'readonly');
		if (!query?.select || query.select === true) {
			const records = await this.findMany({ where: query?.where }, tx);
			return records.length as Prisma.Result<Prisma.UserDelegate, Q, 'count'>;
		}
		const result: Partial<Record<keyof Prisma.UserCountAggregateInputType, number>> = {};
		for (const key of Object.keys(query.select)) {
			const typedKey = key as keyof typeof query.select;
			if (typedKey === '_all') {
				result[typedKey] = (await this.findMany({ where: query.where }, tx)).length;
				continue;
			}
			result[typedKey] = (
				await this.findMany({ where: { [`${typedKey}`]: { not: null } } }, tx)
			).length;
		}
		return result as Prisma.Result<Prisma.UserDelegate, Q, 'count'>;
	}
	async create<Q extends Prisma.Args<Prisma.UserDelegate, 'create'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.UserDelegate, Q, 'create'>> {
		const storesNeeded = this._getNeededStoresForCreate(query.data);
		tx = tx ?? this.client._db.transaction(Array.from(storesNeeded), 'readwrite');
		const record = this._removeNestedCreateData(await this._fillDefaults(query.data, tx));
		const keyPath = await tx.objectStore('User').add(record);
		if (query.data?.sessions?.create) {
			for (const elem of IDBUtils.convertToArray(query.data.sessions.create)) {
				await this.client.session.create(
					{
						data: { ...elem, user: { connect: { id: keyPath[0] } } } as Prisma.Args<
							Prisma.SessionDelegate,
							'create'
						>['data']
					},
					tx
				);
			}
		}
		if (query.data?.sessions?.connect) {
			await Promise.all(
				IDBUtils.convertToArray(query.data.sessions.connect).map(async (connectWhere) => {
					await this.client.session.update(
						{ where: connectWhere, data: { userId: keyPath[0] } },
						tx
					);
				})
			);
		}
		if (query.data?.sessions?.connectOrCreate) {
			await Promise.all(
				IDBUtils.convertToArray(query.data.sessions.connectOrCreate).map(
					async (connectOrCreate) => {
						await this.client.session.upsert(
							{
								where: connectOrCreate.where,
								create: { ...connectOrCreate.create, userId: keyPath[0] } as NonNullable<
									Prisma.Args<Prisma.SessionDelegate, 'create'>['data']
								>,
								update: { userId: keyPath[0] }
							},
							tx
						);
					}
				)
			);
		}
		if (query.data?.sessions?.createMany) {
			await this.client.session.createMany(
				{
					data: IDBUtils.convertToArray(query.data.sessions.createMany.data).map((createData) => ({
						...createData,
						userId: keyPath[0]
					}))
				},
				tx
			);
		}
		if (query.data?.accounts?.create) {
			for (const elem of IDBUtils.convertToArray(query.data.accounts.create)) {
				await this.client.account.create(
					{
						data: { ...elem, user: { connect: { id: keyPath[0] } } } as Prisma.Args<
							Prisma.AccountDelegate,
							'create'
						>['data']
					},
					tx
				);
			}
		}
		if (query.data?.accounts?.connect) {
			await Promise.all(
				IDBUtils.convertToArray(query.data.accounts.connect).map(async (connectWhere) => {
					await this.client.account.update(
						{ where: connectWhere, data: { userId: keyPath[0] } },
						tx
					);
				})
			);
		}
		if (query.data?.accounts?.connectOrCreate) {
			await Promise.all(
				IDBUtils.convertToArray(query.data.accounts.connectOrCreate).map(
					async (connectOrCreate) => {
						await this.client.account.upsert(
							{
								where: connectOrCreate.where,
								create: { ...connectOrCreate.create, userId: keyPath[0] } as NonNullable<
									Prisma.Args<Prisma.AccountDelegate, 'create'>['data']
								>,
								update: { userId: keyPath[0] }
							},
							tx
						);
					}
				)
			);
		}
		if (query.data?.accounts?.createMany) {
			await this.client.account.createMany(
				{
					data: IDBUtils.convertToArray(query.data.accounts.createMany.data).map((createData) => ({
						...createData,
						userId: keyPath[0]
					}))
				},
				tx
			);
		}
		if (query.data?.exerciseSplits?.create) {
			for (const elem of IDBUtils.convertToArray(query.data.exerciseSplits.create)) {
				await this.client.exerciseSplit.create(
					{
						data: { ...elem, user: { connect: { id: keyPath[0] } } } as Prisma.Args<
							Prisma.ExerciseSplitDelegate,
							'create'
						>['data']
					},
					tx
				);
			}
		}
		if (query.data?.exerciseSplits?.connect) {
			await Promise.all(
				IDBUtils.convertToArray(query.data.exerciseSplits.connect).map(async (connectWhere) => {
					await this.client.exerciseSplit.update(
						{ where: connectWhere, data: { userId: keyPath[0] } },
						tx
					);
				})
			);
		}
		if (query.data?.exerciseSplits?.connectOrCreate) {
			await Promise.all(
				IDBUtils.convertToArray(query.data.exerciseSplits.connectOrCreate).map(
					async (connectOrCreate) => {
						await this.client.exerciseSplit.upsert(
							{
								where: connectOrCreate.where,
								create: { ...connectOrCreate.create, userId: keyPath[0] } as NonNullable<
									Prisma.Args<Prisma.ExerciseSplitDelegate, 'create'>['data']
								>,
								update: { userId: keyPath[0] }
							},
							tx
						);
					}
				)
			);
		}
		if (query.data?.exerciseSplits?.createMany) {
			await this.client.exerciseSplit.createMany(
				{
					data: IDBUtils.convertToArray(query.data.exerciseSplits.createMany.data).map(
						(createData) => ({
							...createData,
							userId: keyPath[0]
						})
					)
				},
				tx
			);
		}
		if (query.data.gettingStartedAnswers?.create) {
			await this.client.gettingStartedAnswers.create(
				{
					data: { ...query.data.gettingStartedAnswers.create, userId: keyPath[0] } as Prisma.Args<
						Prisma.GettingStartedAnswersDelegate,
						'create'
					>['data']
				},
				tx
			);
		}
		if (query.data.gettingStartedAnswers?.connect) {
			await this.client.gettingStartedAnswers.update(
				{ where: query.data.gettingStartedAnswers.connect, data: { userId: keyPath[0] } },
				tx
			);
		}
		if (query.data.gettingStartedAnswers?.connectOrCreate) {
			if (query.data.gettingStartedAnswers?.connectOrCreate) {
				await this.client.gettingStartedAnswers.upsert(
					{
						where: query.data.gettingStartedAnswers.connectOrCreate.where,
						create: {
							...query.data.gettingStartedAnswers.connectOrCreate.create,
							userId: keyPath[0]
						} as Prisma.Args<Prisma.GettingStartedAnswersDelegate, 'create'>['data'],
						update: { userId: keyPath[0] }
					},
					tx
				);
			}
		}
		if (query.data?.dashboardItems?.create) {
			for (const elem of IDBUtils.convertToArray(query.data.dashboardItems.create)) {
				await this.client.dashboardItem.create(
					{
						data: { ...elem, user: { connect: { id: keyPath[0] } } } as Prisma.Args<
							Prisma.DashboardItemDelegate,
							'create'
						>['data']
					},
					tx
				);
			}
		}
		if (query.data?.dashboardItems?.connect) {
			await Promise.all(
				IDBUtils.convertToArray(query.data.dashboardItems.connect).map(async (connectWhere) => {
					await this.client.dashboardItem.update(
						{ where: connectWhere, data: { userId: keyPath[0] } },
						tx
					);
				})
			);
		}
		if (query.data?.dashboardItems?.connectOrCreate) {
			await Promise.all(
				IDBUtils.convertToArray(query.data.dashboardItems.connectOrCreate).map(
					async (connectOrCreate) => {
						await this.client.dashboardItem.upsert(
							{
								where: connectOrCreate.where,
								create: { ...connectOrCreate.create, userId: keyPath[0] } as NonNullable<
									Prisma.Args<Prisma.DashboardItemDelegate, 'create'>['data']
								>,
								update: { userId: keyPath[0] }
							},
							tx
						);
					}
				)
			);
		}
		if (query.data?.dashboardItems?.createMany) {
			await this.client.dashboardItem.createMany(
				{
					data: IDBUtils.convertToArray(query.data.dashboardItems.createMany.data).map(
						(createData) => ({
							...createData,
							userId: keyPath[0]
						})
					)
				},
				tx
			);
		}
		if (query.data?.metrics?.create) {
			for (const elem of IDBUtils.convertToArray(query.data.metrics.create)) {
				await this.client.macroMetrics.create(
					{
						data: { ...elem, user: { connect: { id: keyPath[0] } } } as Prisma.Args<
							Prisma.MacroMetricsDelegate,
							'create'
						>['data']
					},
					tx
				);
			}
		}
		if (query.data?.metrics?.connect) {
			await Promise.all(
				IDBUtils.convertToArray(query.data.metrics.connect).map(async (connectWhere) => {
					await this.client.macroMetrics.update(
						{ where: connectWhere, data: { userId: keyPath[0] } },
						tx
					);
				})
			);
		}
		if (query.data?.metrics?.connectOrCreate) {
			await Promise.all(
				IDBUtils.convertToArray(query.data.metrics.connectOrCreate).map(async (connectOrCreate) => {
					await this.client.macroMetrics.upsert(
						{
							where: connectOrCreate.where,
							create: { ...connectOrCreate.create, userId: keyPath[0] } as NonNullable<
								Prisma.Args<Prisma.MacroMetricsDelegate, 'create'>['data']
							>,
							update: { userId: keyPath[0] }
						},
						tx
					);
				})
			);
		}
		if (query.data?.metrics?.createMany) {
			await this.client.macroMetrics.createMany(
				{
					data: IDBUtils.convertToArray(query.data.metrics.createMany.data).map((createData) => ({
						...createData,
						userId: keyPath[0]
					}))
				},
				tx
			);
		}
		if (query.data.activityTrackingPreferences?.create) {
			await this.client.macroActivityTrackingPreferences.create(
				{
					data: {
						...query.data.activityTrackingPreferences.create,
						userId: keyPath[0]
					} as Prisma.Args<Prisma.MacroActivityTrackingPreferencesDelegate, 'create'>['data']
				},
				tx
			);
		}
		if (query.data.activityTrackingPreferences?.connect) {
			await this.client.macroActivityTrackingPreferences.update(
				{ where: query.data.activityTrackingPreferences.connect, data: { userId: keyPath[0] } },
				tx
			);
		}
		if (query.data.activityTrackingPreferences?.connectOrCreate) {
			if (query.data.activityTrackingPreferences?.connectOrCreate) {
				await this.client.macroActivityTrackingPreferences.upsert(
					{
						where: query.data.activityTrackingPreferences.connectOrCreate.where,
						create: {
							...query.data.activityTrackingPreferences.connectOrCreate.create,
							userId: keyPath[0]
						} as Prisma.Args<Prisma.MacroActivityTrackingPreferencesDelegate, 'create'>['data'],
						update: { userId: keyPath[0] }
					},
					tx
				);
			}
		}
		if (query.data.macroTargets?.create) {
			await this.client.macroTargets.create(
				{
					data: { ...query.data.macroTargets.create, userId: keyPath[0] } as Prisma.Args<
						Prisma.MacroTargetsDelegate,
						'create'
					>['data']
				},
				tx
			);
		}
		if (query.data.macroTargets?.connect) {
			await this.client.macroTargets.update(
				{ where: query.data.macroTargets.connect, data: { userId: keyPath[0] } },
				tx
			);
		}
		if (query.data.macroTargets?.connectOrCreate) {
			if (query.data.macroTargets?.connectOrCreate) {
				await this.client.macroTargets.upsert(
					{
						where: query.data.macroTargets.connectOrCreate.where,
						create: {
							...query.data.macroTargets.connectOrCreate.create,
							userId: keyPath[0]
						} as Prisma.Args<Prisma.MacroTargetsDelegate, 'create'>['data'],
						update: { userId: keyPath[0] }
					},
					tx
				);
			}
		}
		if (query.data?.foodEntries?.create) {
			const createData = Array.isArray(query.data.foodEntries.create)
				? query.data.foodEntries.create
				: [query.data.foodEntries.create];
			for (const elem of createData) {
				await this.client.foodEntry.create(
					{
						data: { ...elem, user: { connect: { id: keyPath[0] } } } as Prisma.Args<
							Prisma.FoodEntryDelegate,
							'create'
						>['data']
					},
					tx
				);
			}
		}
		if (query.data?.foodEntries?.connect) {
			await Promise.all(
				IDBUtils.convertToArray(query.data.foodEntries.connect).map(async (connectWhere) => {
					await this.client.foodEntry.update(
						{ where: connectWhere, data: { userId: keyPath[0] } },
						tx
					);
				})
			);
		}
		if (query.data?.foodEntries?.connectOrCreate) {
			await Promise.all(
				IDBUtils.convertToArray(query.data.foodEntries.connectOrCreate).map(
					async (connectOrCreate) => {
						await this.client.foodEntry.upsert(
							{
								where: connectOrCreate.where,
								create: { ...connectOrCreate.create, userId: keyPath[0] } as NonNullable<
									Prisma.Args<Prisma.FoodEntryDelegate, 'create'>['data']
								>,
								update: { userId: keyPath[0] }
							},
							tx
						);
					}
				)
			);
		}
		if (query.data?.foodEntries?.createMany) {
			await this.client.foodEntry.createMany(
				{
					data: IDBUtils.convertToArray(query.data.foodEntries.createMany.data).map(
						(createData) => ({
							...createData,
							userId: keyPath[0]
						})
					)
				},
				tx
			);
		}
		if (query.data?.activityEntries?.create) {
			for (const elem of IDBUtils.convertToArray(query.data.activityEntries.create)) {
				await this.client.activityEntry.create(
					{
						data: { ...elem, user: { connect: { id: keyPath[0] } } } as Prisma.Args<
							Prisma.ActivityEntryDelegate,
							'create'
						>['data']
					},
					tx
				);
			}
		}
		if (query.data?.activityEntries?.connect) {
			await Promise.all(
				IDBUtils.convertToArray(query.data.activityEntries.connect).map(async (connectWhere) => {
					await this.client.activityEntry.update(
						{ where: connectWhere, data: { userId: keyPath[0] } },
						tx
					);
				})
			);
		}
		if (query.data?.activityEntries?.connectOrCreate) {
			await Promise.all(
				IDBUtils.convertToArray(query.data.activityEntries.connectOrCreate).map(
					async (connectOrCreate) => {
						await this.client.activityEntry.upsert(
							{
								where: connectOrCreate.where,
								create: { ...connectOrCreate.create, userId: keyPath[0] } as NonNullable<
									Prisma.Args<Prisma.ActivityEntryDelegate, 'create'>['data']
								>,
								update: { userId: keyPath[0] }
							},
							tx
						);
					}
				)
			);
		}
		if (query.data?.activityEntries?.createMany) {
			await this.client.activityEntry.createMany(
				{
					data: IDBUtils.convertToArray(query.data.activityEntries.createMany.data).map(
						(createData) => ({
							...createData,
							userId: keyPath[0]
						})
					)
				},
				tx
			);
		}
		const data = (await tx.objectStore('User').get(keyPath))!;
		const recordsWithRelations = this._applySelectClause(
			await this._applyRelations<object>([data], tx, query),
			query.select
		)[0];
		this._preprocessListFields([recordsWithRelations]);
		this.emit('create', keyPath);
		return recordsWithRelations as Prisma.Result<Prisma.UserDelegate, Q, 'create'>;
	}
	async createMany<Q extends Prisma.Args<Prisma.UserDelegate, 'createMany'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.UserDelegate, Q, 'createMany'>> {
		const createManyData = IDBUtils.convertToArray(query.data);
		tx = tx ?? this.client._db.transaction(['User'], 'readwrite');
		for (const createData of createManyData) {
			const record = this._removeNestedCreateData(await this._fillDefaults(createData, tx));
			const keyPath = await tx.objectStore('User').add(record);
			this.emit('create', keyPath);
		}
		return { count: createManyData.length };
	}
	async createManyAndReturn<Q extends Prisma.Args<Prisma.UserDelegate, 'createManyAndReturn'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.UserDelegate, Q, 'createManyAndReturn'>> {
		const createManyData = IDBUtils.convertToArray(query.data);
		const records: Prisma.Result<Prisma.UserDelegate, object, 'findMany'> = [];
		tx = tx ?? this.client._db.transaction(['User'], 'readwrite');
		for (const createData of createManyData) {
			const record = this._removeNestedCreateData(await this._fillDefaults(createData, tx));
			const keyPath = await tx.objectStore('User').add(record);
			this.emit('create', keyPath);
			records.push(this._applySelectClause([record], query.select)[0]);
		}
		this._preprocessListFields(records);
		return records as Prisma.Result<Prisma.UserDelegate, Q, 'createManyAndReturn'>;
	}
	async delete<Q extends Prisma.Args<Prisma.UserDelegate, 'delete'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.UserDelegate, Q, 'delete'>> {
		const storesNeeded = this._getNeededStoresForFind(query);
		this._getNeededStoresForNestedDelete(storesNeeded);
		tx = tx ?? this.client._db.transaction(Array.from(storesNeeded), 'readwrite');
		const record = await this.findUnique(query, tx);
		if (!record) throw new Error('Record not found');
		const relatedExerciseSplit = await this.client.exerciseSplit.findMany(
			{ where: { userId: record.id } },
			tx
		);
		if (relatedExerciseSplit.length)
			throw new Error('Cannot delete record, other records depend on it');
		const relatedMacroTargets = await this.client.macroTargets.findMany(
			{ where: { userId: record.id } },
			tx
		);
		if (relatedMacroTargets.length)
			throw new Error('Cannot delete record, other records depend on it');
		const relatedMacroMetrics = await this.client.macroMetrics.findMany(
			{ where: { userId: record.id } },
			tx
		);
		if (relatedMacroMetrics.length)
			throw new Error('Cannot delete record, other records depend on it');
		const relatedMacroActivityTrackingPreferences =
			await this.client.macroActivityTrackingPreferences.findMany(
				{ where: { userId: record.id } },
				tx
			);
		if (relatedMacroActivityTrackingPreferences.length)
			throw new Error('Cannot delete record, other records depend on it');
		const relatedFoodEntry = await this.client.foodEntry.findMany(
			{ where: { userId: record.id } },
			tx
		);
		if (relatedFoodEntry.length)
			throw new Error('Cannot delete record, other records depend on it');
		const relatedActivityEntry = await this.client.activityEntry.findMany(
			{ where: { userId: record.id } },
			tx
		);
		if (relatedActivityEntry.length)
			throw new Error('Cannot delete record, other records depend on it');
		const relatedGettingStartedAnswers = await this.client.gettingStartedAnswers.findMany(
			{ where: { userId: record.id } },
			tx
		);
		if (relatedGettingStartedAnswers.length)
			throw new Error('Cannot delete record, other records depend on it');
		const relatedDashboardItem = await this.client.dashboardItem.findMany(
			{ where: { userId: record.id } },
			tx
		);
		if (relatedDashboardItem.length)
			throw new Error('Cannot delete record, other records depend on it');
		await this.client.session.deleteMany(
			{
				where: { userId: record.id }
			},
			tx
		);
		await this.client.account.deleteMany(
			{
				where: { userId: record.id }
			},
			tx
		);
		await tx.objectStore('User').delete([record.id]);
		this.emit('delete', [record.id]);
		return record;
	}
	async deleteMany<Q extends Prisma.Args<Prisma.UserDelegate, 'deleteMany'>>(
		query?: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.UserDelegate, Q, 'deleteMany'>> {
		const storesNeeded = this._getNeededStoresForFind(query);
		this._getNeededStoresForNestedDelete(storesNeeded);
		tx = tx ?? this.client._db.transaction(Array.from(storesNeeded), 'readwrite');
		const records = await this.findMany(query, tx);
		for (const record of records) {
			await this.delete({ where: { id: record.id } }, tx);
		}
		return { count: records.length };
	}
	async update<Q extends Prisma.Args<Prisma.UserDelegate, 'update'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.UserDelegate, Q, 'update'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForUpdate(query)), 'readwrite');
		const record = await this.findUnique({ where: query.where }, tx);
		if (record === null) {
			tx.abort();
			throw new Error('Record not found');
		}
		const startKeyPath: PrismaIDBSchema['User']['key'] = [record.id];
		const stringFields = ['id', 'email', 'name', 'image'] as const;
		for (const field of stringFields) {
			IDBUtils.handleStringUpdateField(record, field, query.data[field]);
		}
		const dateTimeFields = ['createdAt', 'updatedAt'] as const;
		for (const field of dateTimeFields) {
			IDBUtils.handleDateTimeUpdateField(record, field, query.data[field]);
		}
		const booleanFields = ['emailVerified', 'isAnonymous'] as const;
		for (const field of booleanFields) {
			IDBUtils.handleBooleanUpdateField(record, field, query.data[field]);
		}
		if (query.data.sessions) {
			if (query.data.sessions.connect) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.sessions.connect).map(async (connectWhere) => {
						await this.client.session.update(
							{ where: connectWhere, data: { userId: record.id } },
							tx
						);
					})
				);
			}
			if (query.data.sessions.disconnect) {
				throw new Error('Cannot disconnect required relation');
			}
			if (query.data.sessions.create) {
				const createData = Array.isArray(query.data.sessions.create)
					? query.data.sessions.create
					: [query.data.sessions.create];
				for (const elem of createData) {
					await this.client.session.create(
						{
							data: { ...elem, userId: record.id } as Prisma.Args<
								Prisma.SessionDelegate,
								'create'
							>['data']
						},
						tx
					);
				}
			}
			if (query.data.sessions.createMany) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.sessions.createMany.data).map(async (createData) => {
						await this.client.session.create({ data: { ...createData, userId: record.id } }, tx);
					})
				);
			}
			if (query.data.sessions.update) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.sessions.update).map(async (updateData) => {
						await this.client.session.update(updateData, tx);
					})
				);
			}
			if (query.data.sessions.updateMany) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.sessions.updateMany).map(async (updateData) => {
						await this.client.session.updateMany(updateData, tx);
					})
				);
			}
			if (query.data.sessions.upsert) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.sessions.upsert).map(async (upsertData) => {
						await this.client.session.upsert(
							{
								...upsertData,
								where: { ...upsertData.where, userId: record.id },
								create: { ...upsertData.create, userId: record.id } as Prisma.Args<
									Prisma.SessionDelegate,
									'upsert'
								>['create']
							},
							tx
						);
					})
				);
			}
			if (query.data.sessions.delete) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.sessions.delete).map(async (deleteData) => {
						await this.client.session.delete({ where: { ...deleteData, userId: record.id } }, tx);
					})
				);
			}
			if (query.data.sessions.deleteMany) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.sessions.deleteMany).map(async (deleteData) => {
						await this.client.session.deleteMany(
							{ where: { ...deleteData, userId: record.id } },
							tx
						);
					})
				);
			}
			if (query.data.sessions.set) {
				const existing = await this.client.session.findMany({ where: { userId: record.id } }, tx);
				if (existing.length > 0) {
					throw new Error('Cannot set required relation');
				}
				await Promise.all(
					IDBUtils.convertToArray(query.data.sessions.set).map(async (setData) => {
						await this.client.session.update({ where: setData, data: { userId: record.id } }, tx);
					})
				);
			}
		}
		if (query.data.accounts) {
			if (query.data.accounts.connect) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.accounts.connect).map(async (connectWhere) => {
						await this.client.account.update(
							{ where: connectWhere, data: { userId: record.id } },
							tx
						);
					})
				);
			}
			if (query.data.accounts.disconnect) {
				throw new Error('Cannot disconnect required relation');
			}
			if (query.data.accounts.create) {
				const createData = Array.isArray(query.data.accounts.create)
					? query.data.accounts.create
					: [query.data.accounts.create];
				for (const elem of createData) {
					await this.client.account.create(
						{
							data: { ...elem, userId: record.id } as Prisma.Args<
								Prisma.AccountDelegate,
								'create'
							>['data']
						},
						tx
					);
				}
			}
			if (query.data.accounts.createMany) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.accounts.createMany.data).map(async (createData) => {
						await this.client.account.create({ data: { ...createData, userId: record.id } }, tx);
					})
				);
			}
			if (query.data.accounts.update) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.accounts.update).map(async (updateData) => {
						await this.client.account.update(updateData, tx);
					})
				);
			}
			if (query.data.accounts.updateMany) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.accounts.updateMany).map(async (updateData) => {
						await this.client.account.updateMany(updateData, tx);
					})
				);
			}
			if (query.data.accounts.upsert) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.accounts.upsert).map(async (upsertData) => {
						await this.client.account.upsert(
							{
								...upsertData,
								where: { ...upsertData.where, userId: record.id },
								create: { ...upsertData.create, userId: record.id } as Prisma.Args<
									Prisma.AccountDelegate,
									'upsert'
								>['create']
							},
							tx
						);
					})
				);
			}
			if (query.data.accounts.delete) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.accounts.delete).map(async (deleteData) => {
						await this.client.account.delete({ where: { ...deleteData, userId: record.id } }, tx);
					})
				);
			}
			if (query.data.accounts.deleteMany) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.accounts.deleteMany).map(async (deleteData) => {
						await this.client.account.deleteMany(
							{ where: { ...deleteData, userId: record.id } },
							tx
						);
					})
				);
			}
			if (query.data.accounts.set) {
				const existing = await this.client.account.findMany({ where: { userId: record.id } }, tx);
				if (existing.length > 0) {
					throw new Error('Cannot set required relation');
				}
				await Promise.all(
					IDBUtils.convertToArray(query.data.accounts.set).map(async (setData) => {
						await this.client.account.update({ where: setData, data: { userId: record.id } }, tx);
					})
				);
			}
		}
		if (query.data.exerciseSplits) {
			if (query.data.exerciseSplits.connect) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.exerciseSplits.connect).map(async (connectWhere) => {
						await this.client.exerciseSplit.update(
							{ where: connectWhere, data: { userId: record.id } },
							tx
						);
					})
				);
			}
			if (query.data.exerciseSplits.disconnect) {
				throw new Error('Cannot disconnect required relation');
			}
			if (query.data.exerciseSplits.create) {
				const createData = Array.isArray(query.data.exerciseSplits.create)
					? query.data.exerciseSplits.create
					: [query.data.exerciseSplits.create];
				for (const elem of createData) {
					await this.client.exerciseSplit.create(
						{
							data: { ...elem, userId: record.id } as Prisma.Args<
								Prisma.ExerciseSplitDelegate,
								'create'
							>['data']
						},
						tx
					);
				}
			}
			if (query.data.exerciseSplits.createMany) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.exerciseSplits.createMany.data).map(
						async (createData) => {
							await this.client.exerciseSplit.create(
								{ data: { ...createData, userId: record.id } },
								tx
							);
						}
					)
				);
			}
			if (query.data.exerciseSplits.update) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.exerciseSplits.update).map(async (updateData) => {
						await this.client.exerciseSplit.update(updateData, tx);
					})
				);
			}
			if (query.data.exerciseSplits.updateMany) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.exerciseSplits.updateMany).map(async (updateData) => {
						await this.client.exerciseSplit.updateMany(updateData, tx);
					})
				);
			}
			if (query.data.exerciseSplits.upsert) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.exerciseSplits.upsert).map(async (upsertData) => {
						await this.client.exerciseSplit.upsert(
							{
								...upsertData,
								where: { ...upsertData.where, userId: record.id },
								create: { ...upsertData.create, userId: record.id } as Prisma.Args<
									Prisma.ExerciseSplitDelegate,
									'upsert'
								>['create']
							},
							tx
						);
					})
				);
			}
			if (query.data.exerciseSplits.delete) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.exerciseSplits.delete).map(async (deleteData) => {
						await this.client.exerciseSplit.delete(
							{ where: { ...deleteData, userId: record.id } },
							tx
						);
					})
				);
			}
			if (query.data.exerciseSplits.deleteMany) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.exerciseSplits.deleteMany).map(async (deleteData) => {
						await this.client.exerciseSplit.deleteMany(
							{ where: { ...deleteData, userId: record.id } },
							tx
						);
					})
				);
			}
			if (query.data.exerciseSplits.set) {
				const existing = await this.client.exerciseSplit.findMany(
					{ where: { userId: record.id } },
					tx
				);
				if (existing.length > 0) {
					throw new Error('Cannot set required relation');
				}
				await Promise.all(
					IDBUtils.convertToArray(query.data.exerciseSplits.set).map(async (setData) => {
						await this.client.exerciseSplit.update(
							{ where: setData, data: { userId: record.id } },
							tx
						);
					})
				);
			}
		}
		if (query.data.gettingStartedAnswers) {
			if (query.data.gettingStartedAnswers.connect) {
				await this.client.gettingStartedAnswers.update(
					{ where: query.data.gettingStartedAnswers.connect, data: { userId: record.id } },
					tx
				);
			}
			if (query.data.gettingStartedAnswers.disconnect) {
				throw new Error('Cannot disconnect required relation');
			}
			if (query.data.gettingStartedAnswers.create) {
				await this.client.gettingStartedAnswers.create(
					{
						data: { ...query.data.gettingStartedAnswers.create, userId: record.id } as Prisma.Args<
							Prisma.GettingStartedAnswersDelegate,
							'create'
						>['data']
					},
					tx
				);
			}
			if (query.data.gettingStartedAnswers.delete) {
				const deleteWhere =
					query.data.gettingStartedAnswers.delete === true
						? {}
						: query.data.gettingStartedAnswers.delete;
				await this.client.gettingStartedAnswers.delete(
					{
						where: {
							...deleteWhere,
							userId: record.id
						} as Prisma.GettingStartedAnswersWhereUniqueInput
					},
					tx
				);
			}
			if (query.data.gettingStartedAnswers.update) {
				const updateData =
					query.data.gettingStartedAnswers.update.data ?? query.data.gettingStartedAnswers.update;
				await this.client.gettingStartedAnswers.update(
					{
						where: {
							...query.data.gettingStartedAnswers.update.where,
							userId: record.id
						} as Prisma.GettingStartedAnswersWhereUniqueInput,
						data: updateData
					},
					tx
				);
			}
			if (query.data.gettingStartedAnswers.upsert) {
				await this.client.gettingStartedAnswers.upsert(
					{
						...query.data.gettingStartedAnswers.upsert,
						where: {
							...query.data.gettingStartedAnswers.upsert.where,
							userId: record.id
						} as Prisma.GettingStartedAnswersWhereUniqueInput,
						create: {
							...query.data.gettingStartedAnswers.upsert.create,
							userId: record.id
						} as Prisma.Args<Prisma.GettingStartedAnswersDelegate, 'upsert'>['create']
					},
					tx
				);
			}
			if (query.data.gettingStartedAnswers.connectOrCreate) {
				await this.client.gettingStartedAnswers.upsert(
					{
						where: {
							...query.data.gettingStartedAnswers.connectOrCreate.where,
							userId: record.id
						} as Prisma.GettingStartedAnswersWhereUniqueInput,
						create: {
							...query.data.gettingStartedAnswers.connectOrCreate.create,
							userId: record.id
						} as Prisma.Args<Prisma.GettingStartedAnswersDelegate, 'upsert'>['create'],
						update: { userId: record.id }
					},
					tx
				);
			}
		}
		if (query.data.dashboardItems) {
			if (query.data.dashboardItems.connect) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.dashboardItems.connect).map(async (connectWhere) => {
						await this.client.dashboardItem.update(
							{ where: connectWhere, data: { userId: record.id } },
							tx
						);
					})
				);
			}
			if (query.data.dashboardItems.disconnect) {
				throw new Error('Cannot disconnect required relation');
			}
			if (query.data.dashboardItems.create) {
				const createData = Array.isArray(query.data.dashboardItems.create)
					? query.data.dashboardItems.create
					: [query.data.dashboardItems.create];
				for (const elem of createData) {
					await this.client.dashboardItem.create(
						{
							data: { ...elem, userId: record.id } as Prisma.Args<
								Prisma.DashboardItemDelegate,
								'create'
							>['data']
						},
						tx
					);
				}
			}
			if (query.data.dashboardItems.createMany) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.dashboardItems.createMany.data).map(
						async (createData) => {
							await this.client.dashboardItem.create(
								{ data: { ...createData, userId: record.id } },
								tx
							);
						}
					)
				);
			}
			if (query.data.dashboardItems.update) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.dashboardItems.update).map(async (updateData) => {
						await this.client.dashboardItem.update(updateData, tx);
					})
				);
			}
			if (query.data.dashboardItems.updateMany) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.dashboardItems.updateMany).map(async (updateData) => {
						await this.client.dashboardItem.updateMany(updateData, tx);
					})
				);
			}
			if (query.data.dashboardItems.upsert) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.dashboardItems.upsert).map(async (upsertData) => {
						await this.client.dashboardItem.upsert(
							{
								...upsertData,
								where: { ...upsertData.where, userId: record.id },
								create: { ...upsertData.create, userId: record.id } as Prisma.Args<
									Prisma.DashboardItemDelegate,
									'upsert'
								>['create']
							},
							tx
						);
					})
				);
			}
			if (query.data.dashboardItems.delete) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.dashboardItems.delete).map(async (deleteData) => {
						await this.client.dashboardItem.delete(
							{ where: { ...deleteData, userId: record.id } },
							tx
						);
					})
				);
			}
			if (query.data.dashboardItems.deleteMany) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.dashboardItems.deleteMany).map(async (deleteData) => {
						await this.client.dashboardItem.deleteMany(
							{ where: { ...deleteData, userId: record.id } },
							tx
						);
					})
				);
			}
			if (query.data.dashboardItems.set) {
				const existing = await this.client.dashboardItem.findMany(
					{ where: { userId: record.id } },
					tx
				);
				if (existing.length > 0) {
					throw new Error('Cannot set required relation');
				}
				await Promise.all(
					IDBUtils.convertToArray(query.data.dashboardItems.set).map(async (setData) => {
						await this.client.dashboardItem.update(
							{ where: setData, data: { userId: record.id } },
							tx
						);
					})
				);
			}
		}
		if (query.data.metrics) {
			if (query.data.metrics.connect) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.metrics.connect).map(async (connectWhere) => {
						await this.client.macroMetrics.update(
							{ where: connectWhere, data: { userId: record.id } },
							tx
						);
					})
				);
			}
			if (query.data.metrics.disconnect) {
				throw new Error('Cannot disconnect required relation');
			}
			if (query.data.metrics.create) {
				const createData = Array.isArray(query.data.metrics.create)
					? query.data.metrics.create
					: [query.data.metrics.create];
				for (const elem of createData) {
					await this.client.macroMetrics.create(
						{
							data: { ...elem, userId: record.id } as Prisma.Args<
								Prisma.MacroMetricsDelegate,
								'create'
							>['data']
						},
						tx
					);
				}
			}
			if (query.data.metrics.createMany) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.metrics.createMany.data).map(async (createData) => {
						await this.client.macroMetrics.create(
							{ data: { ...createData, userId: record.id } },
							tx
						);
					})
				);
			}
			if (query.data.metrics.update) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.metrics.update).map(async (updateData) => {
						await this.client.macroMetrics.update(updateData, tx);
					})
				);
			}
			if (query.data.metrics.updateMany) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.metrics.updateMany).map(async (updateData) => {
						await this.client.macroMetrics.updateMany(updateData, tx);
					})
				);
			}
			if (query.data.metrics.upsert) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.metrics.upsert).map(async (upsertData) => {
						await this.client.macroMetrics.upsert(
							{
								...upsertData,
								where: { ...upsertData.where, userId: record.id },
								create: { ...upsertData.create, userId: record.id } as Prisma.Args<
									Prisma.MacroMetricsDelegate,
									'upsert'
								>['create']
							},
							tx
						);
					})
				);
			}
			if (query.data.metrics.delete) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.metrics.delete).map(async (deleteData) => {
						await this.client.macroMetrics.delete(
							{ where: { ...deleteData, userId: record.id } },
							tx
						);
					})
				);
			}
			if (query.data.metrics.deleteMany) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.metrics.deleteMany).map(async (deleteData) => {
						await this.client.macroMetrics.deleteMany(
							{ where: { ...deleteData, userId: record.id } },
							tx
						);
					})
				);
			}
			if (query.data.metrics.set) {
				const existing = await this.client.macroMetrics.findMany(
					{ where: { userId: record.id } },
					tx
				);
				if (existing.length > 0) {
					throw new Error('Cannot set required relation');
				}
				await Promise.all(
					IDBUtils.convertToArray(query.data.metrics.set).map(async (setData) => {
						await this.client.macroMetrics.update(
							{ where: setData, data: { userId: record.id } },
							tx
						);
					})
				);
			}
		}
		if (query.data.activityTrackingPreferences) {
			if (query.data.activityTrackingPreferences.connect) {
				await this.client.macroActivityTrackingPreferences.update(
					{ where: query.data.activityTrackingPreferences.connect, data: { userId: record.id } },
					tx
				);
			}
			if (query.data.activityTrackingPreferences.disconnect) {
				throw new Error('Cannot disconnect required relation');
			}
			if (query.data.activityTrackingPreferences.create) {
				await this.client.macroActivityTrackingPreferences.create(
					{
						data: {
							...query.data.activityTrackingPreferences.create,
							userId: record.id
						} as Prisma.Args<Prisma.MacroActivityTrackingPreferencesDelegate, 'create'>['data']
					},
					tx
				);
			}
			if (query.data.activityTrackingPreferences.delete) {
				const deleteWhere =
					query.data.activityTrackingPreferences.delete === true
						? {}
						: query.data.activityTrackingPreferences.delete;
				await this.client.macroActivityTrackingPreferences.delete(
					{
						where: {
							...deleteWhere,
							userId: record.id
						} as Prisma.MacroActivityTrackingPreferencesWhereUniqueInput
					},
					tx
				);
			}
			if (query.data.activityTrackingPreferences.update) {
				const updateData =
					query.data.activityTrackingPreferences.update.data ??
					query.data.activityTrackingPreferences.update;
				await this.client.macroActivityTrackingPreferences.update(
					{
						where: {
							...query.data.activityTrackingPreferences.update.where,
							userId: record.id
						} as Prisma.MacroActivityTrackingPreferencesWhereUniqueInput,
						data: updateData
					},
					tx
				);
			}
			if (query.data.activityTrackingPreferences.upsert) {
				await this.client.macroActivityTrackingPreferences.upsert(
					{
						...query.data.activityTrackingPreferences.upsert,
						where: {
							...query.data.activityTrackingPreferences.upsert.where,
							userId: record.id
						} as Prisma.MacroActivityTrackingPreferencesWhereUniqueInput,
						create: {
							...query.data.activityTrackingPreferences.upsert.create,
							userId: record.id
						} as Prisma.Args<Prisma.MacroActivityTrackingPreferencesDelegate, 'upsert'>['create']
					},
					tx
				);
			}
			if (query.data.activityTrackingPreferences.connectOrCreate) {
				await this.client.macroActivityTrackingPreferences.upsert(
					{
						where: {
							...query.data.activityTrackingPreferences.connectOrCreate.where,
							userId: record.id
						} as Prisma.MacroActivityTrackingPreferencesWhereUniqueInput,
						create: {
							...query.data.activityTrackingPreferences.connectOrCreate.create,
							userId: record.id
						} as Prisma.Args<Prisma.MacroActivityTrackingPreferencesDelegate, 'upsert'>['create'],
						update: { userId: record.id }
					},
					tx
				);
			}
		}
		if (query.data.macroTargets) {
			if (query.data.macroTargets.connect) {
				await this.client.macroTargets.update(
					{ where: query.data.macroTargets.connect, data: { userId: record.id } },
					tx
				);
			}
			if (query.data.macroTargets.disconnect) {
				throw new Error('Cannot disconnect required relation');
			}
			if (query.data.macroTargets.create) {
				await this.client.macroTargets.create(
					{
						data: { ...query.data.macroTargets.create, userId: record.id } as Prisma.Args<
							Prisma.MacroTargetsDelegate,
							'create'
						>['data']
					},
					tx
				);
			}
			if (query.data.macroTargets.delete) {
				const deleteWhere =
					query.data.macroTargets.delete === true ? {} : query.data.macroTargets.delete;
				await this.client.macroTargets.delete(
					{ where: { ...deleteWhere, userId: record.id } as Prisma.MacroTargetsWhereUniqueInput },
					tx
				);
			}
			if (query.data.macroTargets.update) {
				const updateData = query.data.macroTargets.update.data ?? query.data.macroTargets.update;
				await this.client.macroTargets.update(
					{
						where: {
							...query.data.macroTargets.update.where,
							userId: record.id
						} as Prisma.MacroTargetsWhereUniqueInput,
						data: updateData
					},
					tx
				);
			}
			if (query.data.macroTargets.upsert) {
				await this.client.macroTargets.upsert(
					{
						...query.data.macroTargets.upsert,
						where: {
							...query.data.macroTargets.upsert.where,
							userId: record.id
						} as Prisma.MacroTargetsWhereUniqueInput,
						create: { ...query.data.macroTargets.upsert.create, userId: record.id } as Prisma.Args<
							Prisma.MacroTargetsDelegate,
							'upsert'
						>['create']
					},
					tx
				);
			}
			if (query.data.macroTargets.connectOrCreate) {
				await this.client.macroTargets.upsert(
					{
						where: {
							...query.data.macroTargets.connectOrCreate.where,
							userId: record.id
						} as Prisma.MacroTargetsWhereUniqueInput,
						create: {
							...query.data.macroTargets.connectOrCreate.create,
							userId: record.id
						} as Prisma.Args<Prisma.MacroTargetsDelegate, 'upsert'>['create'],
						update: { userId: record.id }
					},
					tx
				);
			}
		}
		if (query.data.foodEntries) {
			if (query.data.foodEntries.connect) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.foodEntries.connect).map(async (connectWhere) => {
						await this.client.foodEntry.update(
							{ where: connectWhere, data: { userId: record.id } },
							tx
						);
					})
				);
			}
			if (query.data.foodEntries.disconnect) {
				throw new Error('Cannot disconnect required relation');
			}
			if (query.data.foodEntries.create) {
				const createData = Array.isArray(query.data.foodEntries.create)
					? query.data.foodEntries.create
					: [query.data.foodEntries.create];
				for (const elem of createData) {
					await this.client.foodEntry.create(
						{
							data: { ...elem, userId: record.id } as Prisma.Args<
								Prisma.FoodEntryDelegate,
								'create'
							>['data']
						},
						tx
					);
				}
			}
			if (query.data.foodEntries.createMany) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.foodEntries.createMany.data).map(
						async (createData) => {
							await this.client.foodEntry.create(
								{ data: { ...createData, userId: record.id } },
								tx
							);
						}
					)
				);
			}
			if (query.data.foodEntries.update) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.foodEntries.update).map(async (updateData) => {
						await this.client.foodEntry.update(updateData, tx);
					})
				);
			}
			if (query.data.foodEntries.updateMany) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.foodEntries.updateMany).map(async (updateData) => {
						await this.client.foodEntry.updateMany(updateData, tx);
					})
				);
			}
			if (query.data.foodEntries.upsert) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.foodEntries.upsert).map(async (upsertData) => {
						await this.client.foodEntry.upsert(
							{
								...upsertData,
								where: { ...upsertData.where, userId: record.id },
								create: { ...upsertData.create, userId: record.id } as Prisma.Args<
									Prisma.FoodEntryDelegate,
									'upsert'
								>['create']
							},
							tx
						);
					})
				);
			}
			if (query.data.foodEntries.delete) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.foodEntries.delete).map(async (deleteData) => {
						await this.client.foodEntry.delete({ where: { ...deleteData, userId: record.id } }, tx);
					})
				);
			}
			if (query.data.foodEntries.deleteMany) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.foodEntries.deleteMany).map(async (deleteData) => {
						await this.client.foodEntry.deleteMany(
							{ where: { ...deleteData, userId: record.id } },
							tx
						);
					})
				);
			}
			if (query.data.foodEntries.set) {
				const existing = await this.client.foodEntry.findMany({ where: { userId: record.id } }, tx);
				if (existing.length > 0) {
					throw new Error('Cannot set required relation');
				}
				await Promise.all(
					IDBUtils.convertToArray(query.data.foodEntries.set).map(async (setData) => {
						await this.client.foodEntry.update({ where: setData, data: { userId: record.id } }, tx);
					})
				);
			}
		}
		if (query.data.activityEntries) {
			if (query.data.activityEntries.connect) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.activityEntries.connect).map(async (connectWhere) => {
						await this.client.activityEntry.update(
							{ where: connectWhere, data: { userId: record.id } },
							tx
						);
					})
				);
			}
			if (query.data.activityEntries.disconnect) {
				throw new Error('Cannot disconnect required relation');
			}
			if (query.data.activityEntries.create) {
				const createData = Array.isArray(query.data.activityEntries.create)
					? query.data.activityEntries.create
					: [query.data.activityEntries.create];
				for (const elem of createData) {
					await this.client.activityEntry.create(
						{
							data: { ...elem, userId: record.id } as Prisma.Args<
								Prisma.ActivityEntryDelegate,
								'create'
							>['data']
						},
						tx
					);
				}
			}
			if (query.data.activityEntries.createMany) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.activityEntries.createMany.data).map(
						async (createData) => {
							await this.client.activityEntry.create(
								{ data: { ...createData, userId: record.id } },
								tx
							);
						}
					)
				);
			}
			if (query.data.activityEntries.update) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.activityEntries.update).map(async (updateData) => {
						await this.client.activityEntry.update(updateData, tx);
					})
				);
			}
			if (query.data.activityEntries.updateMany) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.activityEntries.updateMany).map(async (updateData) => {
						await this.client.activityEntry.updateMany(updateData, tx);
					})
				);
			}
			if (query.data.activityEntries.upsert) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.activityEntries.upsert).map(async (upsertData) => {
						await this.client.activityEntry.upsert(
							{
								...upsertData,
								where: { ...upsertData.where, userId: record.id },
								create: { ...upsertData.create, userId: record.id } as Prisma.Args<
									Prisma.ActivityEntryDelegate,
									'upsert'
								>['create']
							},
							tx
						);
					})
				);
			}
			if (query.data.activityEntries.delete) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.activityEntries.delete).map(async (deleteData) => {
						await this.client.activityEntry.delete(
							{ where: { ...deleteData, userId: record.id } },
							tx
						);
					})
				);
			}
			if (query.data.activityEntries.deleteMany) {
				await Promise.all(
					IDBUtils.convertToArray(query.data.activityEntries.deleteMany).map(async (deleteData) => {
						await this.client.activityEntry.deleteMany(
							{ where: { ...deleteData, userId: record.id } },
							tx
						);
					})
				);
			}
			if (query.data.activityEntries.set) {
				const existing = await this.client.activityEntry.findMany(
					{ where: { userId: record.id } },
					tx
				);
				if (existing.length > 0) {
					throw new Error('Cannot set required relation');
				}
				await Promise.all(
					IDBUtils.convertToArray(query.data.activityEntries.set).map(async (setData) => {
						await this.client.activityEntry.update(
							{ where: setData, data: { userId: record.id } },
							tx
						);
					})
				);
			}
		}
		const endKeyPath: PrismaIDBSchema['User']['key'] = [record.id];
		for (let i = 0; i < startKeyPath.length; i++) {
			if (startKeyPath[i] !== endKeyPath[i]) {
				if ((await tx.objectStore('User').get(endKeyPath)) !== undefined) {
					throw new Error('Record with the same keyPath already exists');
				}
				await tx.objectStore('User').delete(startKeyPath);
				break;
			}
		}
		const keyPath = await tx.objectStore('User').put(record);
		this.emit('update', keyPath, startKeyPath);
		for (let i = 0; i < startKeyPath.length; i++) {
			if (startKeyPath[i] !== endKeyPath[i]) {
				await this.client.exerciseSplit.updateMany(
					{
						where: { userId: startKeyPath[0] },
						data: { userId: endKeyPath[0] }
					},
					tx
				);
				await this.client.macroTargets.updateMany(
					{
						where: { userId: startKeyPath[0] },
						data: { userId: endKeyPath[0] }
					},
					tx
				);
				await this.client.macroMetrics.updateMany(
					{
						where: { userId: startKeyPath[0] },
						data: { userId: endKeyPath[0] }
					},
					tx
				);
				await this.client.macroActivityTrackingPreferences.updateMany(
					{
						where: { userId: startKeyPath[0] },
						data: { userId: endKeyPath[0] }
					},
					tx
				);
				await this.client.foodEntry.updateMany(
					{
						where: { userId: startKeyPath[0] },
						data: { userId: endKeyPath[0] }
					},
					tx
				);
				await this.client.activityEntry.updateMany(
					{
						where: { userId: startKeyPath[0] },
						data: { userId: endKeyPath[0] }
					},
					tx
				);
				await this.client.gettingStartedAnswers.updateMany(
					{
						where: { userId: startKeyPath[0] },
						data: { userId: endKeyPath[0] }
					},
					tx
				);
				await this.client.dashboardItem.updateMany(
					{
						where: { userId: startKeyPath[0] },
						data: { userId: endKeyPath[0] }
					},
					tx
				);
				await this.client.session.updateMany(
					{
						where: { userId: startKeyPath[0] },
						data: { userId: endKeyPath[0] }
					},
					tx
				);
				await this.client.account.updateMany(
					{
						where: { userId: startKeyPath[0] },
						data: { userId: endKeyPath[0] }
					},
					tx
				);
				break;
			}
		}
		const recordWithRelations = (await this.findUnique(
			{
				where: { id: keyPath[0] }
			},
			tx
		))!;
		return recordWithRelations as Prisma.Result<Prisma.UserDelegate, Q, 'update'>;
	}
	async updateMany<Q extends Prisma.Args<Prisma.UserDelegate, 'updateMany'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.UserDelegate, Q, 'updateMany'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readwrite');
		const records = await this.findMany({ where: query.where }, tx);
		await Promise.all(
			records.map(async (record) => {
				await this.update({ where: { id: record.id }, data: query.data }, tx);
			})
		);
		return { count: records.length };
	}
	async upsert<Q extends Prisma.Args<Prisma.UserDelegate, 'upsert'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.UserDelegate, Q, 'upsert'>> {
		const neededStores = this._getNeededStoresForUpdate({
			...query,
			data: { ...query.update, ...query.create } as Prisma.Args<
				Prisma.UserDelegate,
				'update'
			>['data']
		});
		tx = tx ?? this.client._db.transaction(Array.from(neededStores), 'readwrite');
		let record = await this.findUnique({ where: query.where }, tx);
		if (!record) record = await this.create({ data: query.create }, tx);
		else record = await this.update({ where: query.where, data: query.update }, tx);
		record = await this.findUniqueOrThrow(
			{ where: { id: record.id }, select: query.select, include: query.include },
			tx
		);
		return record as Prisma.Result<Prisma.UserDelegate, Q, 'upsert'>;
	}
	async aggregate<Q extends Prisma.Args<Prisma.UserDelegate, 'aggregate'>>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.UserDelegate, Q, 'aggregate'>> {
		tx = tx ?? this.client._db.transaction(['User'], 'readonly');
		const records = await this.findMany({ where: query?.where }, tx);
		const result: Partial<Prisma.Result<Prisma.UserDelegate, Q, 'aggregate'>> = {};
		if (query?._count) {
			if (query._count === true) {
				(result._count as number) = records.length;
			} else {
				for (const key of Object.keys(query._count)) {
					const typedKey = key as keyof typeof query._count;
					if (typedKey === '_all') {
						(result._count as Record<string, number>)[typedKey] = records.length;
						continue;
					}
					(result._count as Record<string, number>)[typedKey] = (
						await this.findMany({ where: { [`${typedKey}`]: { not: null } } }, tx)
					).length;
				}
			}
		}
		if (query?._min) {
			const minResult = {} as Prisma.Result<Prisma.UserDelegate, Q, 'aggregate'>['_min'];
			const dateTimeFields = ['createdAt', 'updatedAt'] as const;
			for (const field of dateTimeFields) {
				if (!query._min[field]) continue;
				const values = records
					.map((record) => record[field]?.getTime())
					.filter((value) => value !== undefined);
				(minResult[field as keyof typeof minResult] as Date) = new Date(Math.min(...values));
			}
			const stringFields = ['id', 'email', 'name', 'image'] as const;
			for (const field of stringFields) {
				if (!query._min[field]) continue;
				const values = records
					.map((record) => record[field] as string)
					.filter((value) => value !== undefined);
				(minResult[field as keyof typeof minResult] as string) = values.sort()[0];
			}
			const booleanFields = ['emailVerified', 'isAnonymous'] as const;
			for (const field of booleanFields) {
				if (!query._min[field]) continue;
				const values = records
					.map((record) => record[field] as boolean)
					.filter((value) => value !== undefined);
				(minResult[field as keyof typeof minResult] as boolean) = values.includes(true);
			}
			result._min = minResult;
		}
		if (query?._max) {
			const maxResult = {} as Prisma.Result<Prisma.UserDelegate, Q, 'aggregate'>['_max'];
			const dateTimeFields = ['createdAt', 'updatedAt'] as const;
			for (const field of dateTimeFields) {
				if (!query._max[field]) continue;
				const values = records
					.map((record) => record[field]?.getTime())
					.filter((value) => value !== undefined);
				(maxResult[field as keyof typeof maxResult] as Date) = new Date(Math.max(...values));
			}
			const stringFields = ['id', 'email', 'name', 'image'] as const;
			for (const field of stringFields) {
				if (!query._max[field]) continue;
				const values = records
					.map((record) => record[field] as string)
					.filter((value) => value !== undefined);
				(maxResult[field as keyof typeof maxResult] as string) = values.sort().reverse()[0];
			}
			const booleanFields = ['emailVerified', 'isAnonymous'] as const;
			for (const field of booleanFields) {
				if (!query._max[field]) continue;
				const values = records
					.map((record) => record[field] as boolean)
					.filter((value) => value !== undefined);
				(maxResult[field as keyof typeof maxResult] as boolean) = values.includes(true);
			}
			result._max = maxResult;
			result._max = maxResult;
		}
		return result as unknown as Prisma.Result<Prisma.UserDelegate, Q, 'aggregate'>;
	}
}
class SessionIDBClass extends BaseIDBModelClass<'Session'> {
	private async _applyWhereClause<
		W extends Prisma.Args<Prisma.SessionDelegate, 'findFirstOrThrow'>['where'],
		R extends Prisma.Result<Prisma.SessionDelegate, object, 'findFirstOrThrow'>
	>(records: R[], whereClause: W, tx: IDBUtils.TransactionType): Promise<R[]> {
		if (!whereClause) return records;
		records = await IDBUtils.applyLogicalFilters<Prisma.SessionDelegate, R, W>(
			records,
			whereClause,
			tx,
			this.keyPath,
			this._applyWhereClause.bind(this)
		);
		return (
			await Promise.all(
				records.map(async (record) => {
					const stringFields = ['id', 'token', 'ipAddress', 'userAgent', 'userId'] as const;
					for (const field of stringFields) {
						if (!IDBUtils.whereStringFilter(record, field, whereClause[field])) return null;
					}
					const dateTimeFields = ['expiresAt', 'createdAt', 'updatedAt'] as const;
					for (const field of dateTimeFields) {
						if (!IDBUtils.whereDateTimeFilter(record, field, whereClause[field])) return null;
					}
					if (whereClause.user) {
						const { is, isNot, ...rest } = whereClause.user;
						if (is !== null && is !== undefined) {
							const relatedRecord = await this.client.user.findFirst(
								{ where: { ...is, id: record.userId } },
								tx
							);
							if (!relatedRecord) return null;
						}
						if (isNot !== null && isNot !== undefined) {
							const relatedRecord = await this.client.user.findFirst(
								{ where: { ...isNot, id: record.userId } },
								tx
							);
							if (relatedRecord) return null;
						}
						if (Object.keys(rest).length) {
							const relatedRecord = await this.client.user.findFirst(
								{ where: { ...whereClause.user, id: record.userId } },
								tx
							);
							if (!relatedRecord) return null;
						}
					}
					return record;
				})
			)
		).filter((result) => result !== null);
	}
	private _applySelectClause<S extends Prisma.Args<Prisma.SessionDelegate, 'findMany'>['select']>(
		records: Prisma.Result<Prisma.SessionDelegate, object, 'findFirstOrThrow'>[],
		selectClause: S
	): Prisma.Result<Prisma.SessionDelegate, { select: S }, 'findFirstOrThrow'>[] {
		if (!selectClause) {
			return records as Prisma.Result<Prisma.SessionDelegate, { select: S }, 'findFirstOrThrow'>[];
		}
		return records.map((record) => {
			const partialRecord: Partial<typeof record> = record;
			for (const untypedKey of [
				'id',
				'expiresAt',
				'token',
				'createdAt',
				'updatedAt',
				'ipAddress',
				'userAgent',
				'userId',
				'user'
			]) {
				const key = untypedKey as keyof typeof record & keyof S;
				if (!selectClause[key]) delete partialRecord[key];
			}
			return partialRecord;
		}) as Prisma.Result<Prisma.SessionDelegate, { select: S }, 'findFirstOrThrow'>[];
	}
	private async _applyRelations<Q extends Prisma.Args<Prisma.SessionDelegate, 'findMany'>>(
		records: Prisma.Result<Prisma.SessionDelegate, object, 'findFirstOrThrow'>[],
		tx: IDBUtils.TransactionType,
		query?: Q
	): Promise<Prisma.Result<Prisma.SessionDelegate, Q, 'findFirstOrThrow'>[]> {
		if (!query) return records as Prisma.Result<Prisma.SessionDelegate, Q, 'findFirstOrThrow'>[];
		const recordsWithRelations = records.map(async (record) => {
			const unsafeRecord = record as Record<string, unknown>;
			const attach_user = query.select?.user || query.include?.user;
			if (attach_user) {
				unsafeRecord['user'] = await this.client.user.findUnique(
					{
						...(attach_user === true ? {} : attach_user),
						where: { id: record.userId! }
					},
					tx
				);
			}
			return unsafeRecord;
		});
		return (await Promise.all(recordsWithRelations)) as Prisma.Result<
			Prisma.SessionDelegate,
			Q,
			'findFirstOrThrow'
		>[];
	}
	async _applyOrderByClause<
		O extends Prisma.Args<Prisma.SessionDelegate, 'findMany'>['orderBy'],
		R extends Prisma.Result<Prisma.SessionDelegate, object, 'findFirstOrThrow'>
	>(records: R[], orderByClause: O, tx: IDBUtils.TransactionType): Promise<void> {
		if (orderByClause === undefined) return;
		const orderByClauses = IDBUtils.convertToArray(orderByClause);
		const indexedKeys = await Promise.all(
			records.map(async (record) => {
				const keys = await Promise.all(
					orderByClauses.map(async (clause) => await this._resolveOrderByKey(record, clause, tx))
				);
				return { keys, record };
			})
		);
		indexedKeys.sort((a, b) => {
			for (let i = 0; i < orderByClauses.length; i++) {
				const clause = orderByClauses[i];
				const comparison = IDBUtils.genericComparator(
					a.keys[i],
					b.keys[i],
					this._resolveSortOrder(clause)
				);
				if (comparison !== 0) return comparison;
			}
			return 0;
		});
		for (let i = 0; i < records.length; i++) {
			records[i] = indexedKeys[i].record;
		}
	}
	async _resolveOrderByKey(
		record: Prisma.Result<Prisma.SessionDelegate, object, 'findFirstOrThrow'>,
		orderByInput: Prisma.SessionOrderByWithRelationInput,
		tx: IDBUtils.TransactionType
	): Promise<unknown> {
		const scalarFields = [
			'id',
			'expiresAt',
			'token',
			'createdAt',
			'updatedAt',
			'ipAddress',
			'userAgent',
			'userId'
		] as const;
		for (const field of scalarFields) if (orderByInput[field]) return record[field];
		if (orderByInput.user) {
			return await this.client.user._resolveOrderByKey(
				await this.client.user.findFirstOrThrow({ where: { id: record.userId } }),
				orderByInput.user,
				tx
			);
		}
	}
	_resolveSortOrder(
		orderByInput: Prisma.SessionOrderByWithRelationInput
	): Prisma.SortOrder | { sort: Prisma.SortOrder; nulls?: 'first' | 'last' } {
		const scalarFields = [
			'id',
			'expiresAt',
			'token',
			'createdAt',
			'updatedAt',
			'ipAddress',
			'userAgent',
			'userId'
		] as const;
		for (const field of scalarFields) if (orderByInput[field]) return orderByInput[field];
		if (orderByInput.user) {
			return this.client.user._resolveSortOrder(orderByInput.user);
		}
		throw new Error('No field in orderBy clause');
	}
	private async _fillDefaults<D extends Prisma.Args<Prisma.SessionDelegate, 'create'>['data']>(
		data: D,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<D> {
		if (data === undefined) data = {} as NonNullable<D>;
		if (data.ipAddress === undefined) {
			data.ipAddress = null;
		}
		if (data.userAgent === undefined) {
			data.userAgent = null;
		}
		if (typeof data.expiresAt === 'string') {
			data.expiresAt = new Date(data.expiresAt);
		}
		if (typeof data.createdAt === 'string') {
			data.createdAt = new Date(data.createdAt);
		}
		if (typeof data.updatedAt === 'string') {
			data.updatedAt = new Date(data.updatedAt);
		}
		return data;
	}
	_getNeededStoresForWhere<W extends Prisma.Args<Prisma.SessionDelegate, 'findMany'>['where']>(
		whereClause: W,
		neededStores: Set<StoreNames<PrismaIDBSchema>>
	) {
		if (whereClause === undefined) return;
		for (const param of IDBUtils.LogicalParams) {
			if (whereClause[param]) {
				for (const clause of IDBUtils.convertToArray(whereClause[param])) {
					this._getNeededStoresForWhere(clause, neededStores);
				}
			}
		}
		if (whereClause.user) {
			neededStores.add('User');
			this.client.user._getNeededStoresForWhere(whereClause.user, neededStores);
		}
	}
	_getNeededStoresForFind<Q extends Prisma.Args<Prisma.SessionDelegate, 'findMany'>>(
		query?: Q
	): Set<StoreNames<PrismaIDBSchema>> {
		const neededStores: Set<StoreNames<PrismaIDBSchema>> = new Set();
		neededStores.add('Session');
		this._getNeededStoresForWhere(query?.where, neededStores);
		if (query?.orderBy) {
			const orderBy = IDBUtils.convertToArray(query.orderBy);
			const orderBy_user = orderBy.find((clause) => clause.user);
			if (orderBy_user) {
				this.client.user
					._getNeededStoresForFind({ orderBy: orderBy_user.user })
					.forEach((storeName) => neededStores.add(storeName));
			}
		}
		if (query?.select?.user || query?.include?.user) {
			neededStores.add('User');
			if (typeof query.select?.user === 'object') {
				this.client.user
					._getNeededStoresForFind(query.select.user)
					.forEach((storeName) => neededStores.add(storeName));
			}
			if (typeof query.include?.user === 'object') {
				this.client.user
					._getNeededStoresForFind(query.include.user)
					.forEach((storeName) => neededStores.add(storeName));
			}
		}
		return neededStores;
	}
	_getNeededStoresForCreate<
		D extends Partial<Prisma.Args<Prisma.SessionDelegate, 'create'>['data']>
	>(data: D): Set<StoreNames<PrismaIDBSchema>> {
		const neededStores: Set<StoreNames<PrismaIDBSchema>> = new Set();
		neededStores.add('Session');
		if (data?.user) {
			neededStores.add('User');
			if (data.user.create) {
				const createData = Array.isArray(data.user.create) ? data.user.create : [data.user.create];
				createData.forEach((record) =>
					this.client.user
						._getNeededStoresForCreate(record)
						.forEach((storeName) => neededStores.add(storeName))
				);
			}
			if (data.user.connectOrCreate) {
				IDBUtils.convertToArray(data.user.connectOrCreate).forEach((record) =>
					this.client.user
						._getNeededStoresForCreate(record.create)
						.forEach((storeName) => neededStores.add(storeName))
				);
			}
		}
		if (data?.userId !== undefined) {
			neededStores.add('User');
		}
		return neededStores;
	}
	_getNeededStoresForUpdate<Q extends Prisma.Args<Prisma.SessionDelegate, 'update'>>(
		query: Partial<Q>
	): Set<StoreNames<PrismaIDBSchema>> {
		const neededStores = this._getNeededStoresForFind(query).union(
			this._getNeededStoresForCreate(
				query.data as Prisma.Args<Prisma.SessionDelegate, 'create'>['data']
			)
		);
		if (query.data?.user?.connect) {
			neededStores.add('User');
			IDBUtils.convertToArray(query.data.user.connect).forEach((connect) => {
				this.client.user._getNeededStoresForWhere(connect, neededStores);
			});
		}
		if (query.data?.user?.update) {
			neededStores.add('User');
			IDBUtils.convertToArray(query.data.user.update).forEach((update) => {
				this.client.user
					._getNeededStoresForUpdate(update as Prisma.Args<Prisma.UserDelegate, 'update'>)
					.forEach((store) => neededStores.add(store));
			});
		}
		if (query.data?.user?.upsert) {
			neededStores.add('User');
			IDBUtils.convertToArray(query.data.user.upsert).forEach((upsert) => {
				const update = {
					where: upsert.where,
					data: { ...upsert.update, ...upsert.create }
				} as Prisma.Args<Prisma.UserDelegate, 'update'>;
				this.client.user
					._getNeededStoresForUpdate(update)
					.forEach((store) => neededStores.add(store));
			});
		}
		return neededStores;
	}
	_getNeededStoresForNestedDelete(neededStores: Set<StoreNames<PrismaIDBSchema>>): void {
		neededStores.add('Session');
	}
	private _removeNestedCreateData<D extends Prisma.Args<Prisma.SessionDelegate, 'create'>['data']>(
		data: D
	): Prisma.Result<Prisma.SessionDelegate, object, 'findFirstOrThrow'> {
		const recordWithoutNestedCreate = structuredClone(data);
		delete recordWithoutNestedCreate?.user;
		return recordWithoutNestedCreate as Prisma.Result<
			Prisma.SessionDelegate,
			object,
			'findFirstOrThrow'
		>;
	}
	private _preprocessListFields(
		records: Prisma.Result<Prisma.SessionDelegate, object, 'findMany'>
	): void {}
	async findMany<Q extends Prisma.Args<Prisma.SessionDelegate, 'findMany'>>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.SessionDelegate, Q, 'findMany'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		const records = await this._applyWhereClause(
			await tx.objectStore('Session').getAll(),
			query?.where,
			tx
		);
		await this._applyOrderByClause(records, query?.orderBy, tx);
		const relationAppliedRecords = (await this._applyRelations(
			records,
			tx,
			query
		)) as Prisma.Result<Prisma.SessionDelegate, object, 'findFirstOrThrow'>[];
		const selectClause = query?.select;
		let selectAppliedRecords = this._applySelectClause(relationAppliedRecords, selectClause);
		if (query?.distinct) {
			const distinctFields = IDBUtils.convertToArray(query.distinct);
			const seen = new Set<string>();
			selectAppliedRecords = selectAppliedRecords.filter((record) => {
				const key = distinctFields.map((field) => record[field]).join('|');
				if (seen.has(key)) return false;
				seen.add(key);
				return true;
			});
		}
		this._preprocessListFields(selectAppliedRecords);
		return selectAppliedRecords as Prisma.Result<Prisma.SessionDelegate, Q, 'findMany'>;
	}
	async findFirst<Q extends Prisma.Args<Prisma.SessionDelegate, 'findFirst'>>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.SessionDelegate, Q, 'findFirst'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		return (await this.findMany(query, tx))[0] ?? null;
	}
	async findFirstOrThrow<Q extends Prisma.Args<Prisma.SessionDelegate, 'findFirstOrThrow'>>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.SessionDelegate, Q, 'findFirstOrThrow'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		const record = await this.findFirst(query, tx);
		if (!record) {
			tx.abort();
			throw new Error('Record not found');
		}
		return record;
	}
	async findUnique<Q extends Prisma.Args<Prisma.SessionDelegate, 'findUnique'>>(
		query: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.SessionDelegate, Q, 'findUnique'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		let record;
		if (query.where.id !== undefined) {
			record = await tx.objectStore('Session').get([query.where.id]);
		} else if (query.where.token !== undefined) {
			record = await tx.objectStore('Session').index('tokenIndex').get([query.where.token]);
		}
		if (!record) return null;

		const recordWithRelations = this._applySelectClause(
			await this._applyRelations(
				await this._applyWhereClause([record], query.where, tx),
				tx,
				query
			),
			query.select
		)[0];
		this._preprocessListFields([recordWithRelations]);
		return recordWithRelations as Prisma.Result<Prisma.SessionDelegate, Q, 'findUnique'>;
	}
	async findUniqueOrThrow<Q extends Prisma.Args<Prisma.SessionDelegate, 'findUniqueOrThrow'>>(
		query: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.SessionDelegate, Q, 'findUniqueOrThrow'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		const record = await this.findUnique(query, tx);
		if (!record) {
			tx.abort();
			throw new Error('Record not found');
		}
		return record;
	}
	async count<Q extends Prisma.Args<Prisma.SessionDelegate, 'count'>>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.SessionDelegate, Q, 'count'>> {
		tx = tx ?? this.client._db.transaction(['Session'], 'readonly');
		if (!query?.select || query.select === true) {
			const records = await this.findMany({ where: query?.where }, tx);
			return records.length as Prisma.Result<Prisma.SessionDelegate, Q, 'count'>;
		}
		const result: Partial<Record<keyof Prisma.SessionCountAggregateInputType, number>> = {};
		for (const key of Object.keys(query.select)) {
			const typedKey = key as keyof typeof query.select;
			if (typedKey === '_all') {
				result[typedKey] = (await this.findMany({ where: query.where }, tx)).length;
				continue;
			}
			result[typedKey] = (
				await this.findMany({ where: { [`${typedKey}`]: { not: null } } }, tx)
			).length;
		}
		return result as Prisma.Result<Prisma.SessionDelegate, Q, 'count'>;
	}
	async create<Q extends Prisma.Args<Prisma.SessionDelegate, 'create'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.SessionDelegate, Q, 'create'>> {
		const storesNeeded = this._getNeededStoresForCreate(query.data);
		tx = tx ?? this.client._db.transaction(Array.from(storesNeeded), 'readwrite');
		if (query.data.user) {
			const fk: Partial<PrismaIDBSchema['User']['key']> = [];
			if (query.data.user?.create) {
				const record = await this.client.user.create({ data: query.data.user.create }, tx);
				fk[0] = record.id;
			}
			if (query.data.user?.connect) {
				const record = await this.client.user.findUniqueOrThrow(
					{ where: query.data.user.connect },
					tx
				);
				delete query.data.user.connect;
				fk[0] = record.id;
			}
			if (query.data.user?.connectOrCreate) {
				const record = await this.client.user.upsert(
					{
						where: query.data.user.connectOrCreate.where,
						create: query.data.user.connectOrCreate.create,
						update: {}
					},
					tx
				);
				fk[0] = record.id;
			}
			const unsafeData = query.data as Record<string, unknown>;
			unsafeData.userId = fk[0];
			delete unsafeData.user;
		} else if (query.data?.userId !== undefined && query.data.userId !== null) {
			await this.client.user.findUniqueOrThrow(
				{
					where: { id: query.data.userId }
				},
				tx
			);
		}
		const record = this._removeNestedCreateData(await this._fillDefaults(query.data, tx));
		const keyPath = await tx.objectStore('Session').add(record);
		const data = (await tx.objectStore('Session').get(keyPath))!;
		const recordsWithRelations = this._applySelectClause(
			await this._applyRelations<object>([data], tx, query),
			query.select
		)[0];
		this._preprocessListFields([recordsWithRelations]);
		this.emit('create', keyPath);
		return recordsWithRelations as Prisma.Result<Prisma.SessionDelegate, Q, 'create'>;
	}
	async createMany<Q extends Prisma.Args<Prisma.SessionDelegate, 'createMany'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.SessionDelegate, Q, 'createMany'>> {
		const createManyData = IDBUtils.convertToArray(query.data);
		tx = tx ?? this.client._db.transaction(['Session'], 'readwrite');
		for (const createData of createManyData) {
			const record = this._removeNestedCreateData(await this._fillDefaults(createData, tx));
			const keyPath = await tx.objectStore('Session').add(record);
			this.emit('create', keyPath);
		}
		return { count: createManyData.length };
	}
	async createManyAndReturn<Q extends Prisma.Args<Prisma.SessionDelegate, 'createManyAndReturn'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.SessionDelegate, Q, 'createManyAndReturn'>> {
		const createManyData = IDBUtils.convertToArray(query.data);
		const records: Prisma.Result<Prisma.SessionDelegate, object, 'findMany'> = [];
		tx = tx ?? this.client._db.transaction(['Session'], 'readwrite');
		for (const createData of createManyData) {
			const record = this._removeNestedCreateData(await this._fillDefaults(createData, tx));
			const keyPath = await tx.objectStore('Session').add(record);
			this.emit('create', keyPath);
			records.push(this._applySelectClause([record], query.select)[0]);
		}
		this._preprocessListFields(records);
		return records as Prisma.Result<Prisma.SessionDelegate, Q, 'createManyAndReturn'>;
	}
	async delete<Q extends Prisma.Args<Prisma.SessionDelegate, 'delete'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.SessionDelegate, Q, 'delete'>> {
		const storesNeeded = this._getNeededStoresForFind(query);
		this._getNeededStoresForNestedDelete(storesNeeded);
		tx = tx ?? this.client._db.transaction(Array.from(storesNeeded), 'readwrite');
		const record = await this.findUnique(query, tx);
		if (!record) throw new Error('Record not found');
		await tx.objectStore('Session').delete([record.id]);
		this.emit('delete', [record.id]);
		return record;
	}
	async deleteMany<Q extends Prisma.Args<Prisma.SessionDelegate, 'deleteMany'>>(
		query?: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.SessionDelegate, Q, 'deleteMany'>> {
		const storesNeeded = this._getNeededStoresForFind(query);
		this._getNeededStoresForNestedDelete(storesNeeded);
		tx = tx ?? this.client._db.transaction(Array.from(storesNeeded), 'readwrite');
		const records = await this.findMany(query, tx);
		for (const record of records) {
			await this.delete({ where: { id: record.id } }, tx);
		}
		return { count: records.length };
	}
	async update<Q extends Prisma.Args<Prisma.SessionDelegate, 'update'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.SessionDelegate, Q, 'update'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForUpdate(query)), 'readwrite');
		const record = await this.findUnique({ where: query.where }, tx);
		if (record === null) {
			tx.abort();
			throw new Error('Record not found');
		}
		const startKeyPath: PrismaIDBSchema['Session']['key'] = [record.id];
		const stringFields = ['id', 'token', 'ipAddress', 'userAgent', 'userId'] as const;
		for (const field of stringFields) {
			IDBUtils.handleStringUpdateField(record, field, query.data[field]);
		}
		const dateTimeFields = ['expiresAt', 'createdAt', 'updatedAt'] as const;
		for (const field of dateTimeFields) {
			IDBUtils.handleDateTimeUpdateField(record, field, query.data[field]);
		}
		if (query.data.user) {
			if (query.data.user.connect) {
				const other = await this.client.user.findUniqueOrThrow(
					{ where: query.data.user.connect },
					tx
				);
				record.userId = other.id;
			}
			if (query.data.user.create) {
				const other = await this.client.user.create({ data: query.data.user.create }, tx);
				record.userId = other.id;
			}
			if (query.data.user.update) {
				const updateData = query.data.user.update.data ?? query.data.user.update;
				await this.client.user.update(
					{
						where: {
							...query.data.user.update.where,
							id: record.userId!
						} as Prisma.UserWhereUniqueInput,
						data: updateData
					},
					tx
				);
			}
			if (query.data.user.upsert) {
				await this.client.user.upsert(
					{
						where: {
							...query.data.user.upsert.where,
							id: record.userId!
						} as Prisma.UserWhereUniqueInput,
						create: { ...query.data.user.upsert.create, id: record.userId! } as Prisma.Args<
							Prisma.UserDelegate,
							'upsert'
						>['create'],
						update: query.data.user.upsert.update
					},
					tx
				);
			}
			if (query.data.user.connectOrCreate) {
				await this.client.user.upsert(
					{
						where: { ...query.data.user.connectOrCreate.where, id: record.userId! },
						create: {
							...query.data.user.connectOrCreate.create,
							id: record.userId!
						} as Prisma.Args<Prisma.UserDelegate, 'upsert'>['create'],
						update: { id: record.userId! }
					},
					tx
				);
			}
		}
		if (query.data.userId !== undefined) {
			const related = await this.client.user.findUnique({ where: { id: record.userId } }, tx);
			if (!related) throw new Error('Related record not found');
		}
		const endKeyPath: PrismaIDBSchema['Session']['key'] = [record.id];
		for (let i = 0; i < startKeyPath.length; i++) {
			if (startKeyPath[i] !== endKeyPath[i]) {
				if ((await tx.objectStore('Session').get(endKeyPath)) !== undefined) {
					throw new Error('Record with the same keyPath already exists');
				}
				await tx.objectStore('Session').delete(startKeyPath);
				break;
			}
		}
		const keyPath = await tx.objectStore('Session').put(record);
		this.emit('update', keyPath, startKeyPath);
		for (let i = 0; i < startKeyPath.length; i++) {
			if (startKeyPath[i] !== endKeyPath[i]) {
				break;
			}
		}
		const recordWithRelations = (await this.findUnique(
			{
				where: { id: keyPath[0] }
			},
			tx
		))!;
		return recordWithRelations as Prisma.Result<Prisma.SessionDelegate, Q, 'update'>;
	}
	async updateMany<Q extends Prisma.Args<Prisma.SessionDelegate, 'updateMany'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.SessionDelegate, Q, 'updateMany'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readwrite');
		const records = await this.findMany({ where: query.where }, tx);
		await Promise.all(
			records.map(async (record) => {
				await this.update({ where: { id: record.id }, data: query.data }, tx);
			})
		);
		return { count: records.length };
	}
	async upsert<Q extends Prisma.Args<Prisma.SessionDelegate, 'upsert'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.SessionDelegate, Q, 'upsert'>> {
		const neededStores = this._getNeededStoresForUpdate({
			...query,
			data: { ...query.update, ...query.create } as Prisma.Args<
				Prisma.SessionDelegate,
				'update'
			>['data']
		});
		tx = tx ?? this.client._db.transaction(Array.from(neededStores), 'readwrite');
		let record = await this.findUnique({ where: query.where }, tx);
		if (!record) record = await this.create({ data: query.create }, tx);
		else record = await this.update({ where: query.where, data: query.update }, tx);
		record = await this.findUniqueOrThrow(
			{ where: { id: record.id }, select: query.select, include: query.include },
			tx
		);
		return record as Prisma.Result<Prisma.SessionDelegate, Q, 'upsert'>;
	}
	async aggregate<Q extends Prisma.Args<Prisma.SessionDelegate, 'aggregate'>>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.SessionDelegate, Q, 'aggregate'>> {
		tx = tx ?? this.client._db.transaction(['Session'], 'readonly');
		const records = await this.findMany({ where: query?.where }, tx);
		const result: Partial<Prisma.Result<Prisma.SessionDelegate, Q, 'aggregate'>> = {};
		if (query?._count) {
			if (query._count === true) {
				(result._count as number) = records.length;
			} else {
				for (const key of Object.keys(query._count)) {
					const typedKey = key as keyof typeof query._count;
					if (typedKey === '_all') {
						(result._count as Record<string, number>)[typedKey] = records.length;
						continue;
					}
					(result._count as Record<string, number>)[typedKey] = (
						await this.findMany({ where: { [`${typedKey}`]: { not: null } } }, tx)
					).length;
				}
			}
		}
		if (query?._min) {
			const minResult = {} as Prisma.Result<Prisma.SessionDelegate, Q, 'aggregate'>['_min'];
			const dateTimeFields = ['expiresAt', 'createdAt', 'updatedAt'] as const;
			for (const field of dateTimeFields) {
				if (!query._min[field]) continue;
				const values = records
					.map((record) => record[field]?.getTime())
					.filter((value) => value !== undefined);
				(minResult[field as keyof typeof minResult] as Date) = new Date(Math.min(...values));
			}
			const stringFields = ['id', 'token', 'ipAddress', 'userAgent', 'userId'] as const;
			for (const field of stringFields) {
				if (!query._min[field]) continue;
				const values = records
					.map((record) => record[field] as string)
					.filter((value) => value !== undefined);
				(minResult[field as keyof typeof minResult] as string) = values.sort()[0];
			}
			result._min = minResult;
		}
		if (query?._max) {
			const maxResult = {} as Prisma.Result<Prisma.SessionDelegate, Q, 'aggregate'>['_max'];
			const dateTimeFields = ['expiresAt', 'createdAt', 'updatedAt'] as const;
			for (const field of dateTimeFields) {
				if (!query._max[field]) continue;
				const values = records
					.map((record) => record[field]?.getTime())
					.filter((value) => value !== undefined);
				(maxResult[field as keyof typeof maxResult] as Date) = new Date(Math.max(...values));
			}
			const stringFields = ['id', 'token', 'ipAddress', 'userAgent', 'userId'] as const;
			for (const field of stringFields) {
				if (!query._max[field]) continue;
				const values = records
					.map((record) => record[field] as string)
					.filter((value) => value !== undefined);
				(maxResult[field as keyof typeof maxResult] as string) = values.sort().reverse()[0];
			}
			result._max = maxResult;
		}
		return result as unknown as Prisma.Result<Prisma.SessionDelegate, Q, 'aggregate'>;
	}
}
class AccountIDBClass extends BaseIDBModelClass<'Account'> {
	private async _applyWhereClause<
		W extends Prisma.Args<Prisma.AccountDelegate, 'findFirstOrThrow'>['where'],
		R extends Prisma.Result<Prisma.AccountDelegate, object, 'findFirstOrThrow'>
	>(records: R[], whereClause: W, tx: IDBUtils.TransactionType): Promise<R[]> {
		if (!whereClause) return records;
		records = await IDBUtils.applyLogicalFilters<Prisma.AccountDelegate, R, W>(
			records,
			whereClause,
			tx,
			this.keyPath,
			this._applyWhereClause.bind(this)
		);
		return (
			await Promise.all(
				records.map(async (record) => {
					const stringFields = [
						'id',
						'accountId',
						'providerId',
						'userId',
						'accessToken',
						'refreshToken',
						'idToken',
						'scope',
						'password'
					] as const;
					for (const field of stringFields) {
						if (!IDBUtils.whereStringFilter(record, field, whereClause[field])) return null;
					}
					const dateTimeFields = [
						'accessTokenExpiresAt',
						'refreshTokenExpiresAt',
						'createdAt',
						'updatedAt'
					] as const;
					for (const field of dateTimeFields) {
						if (!IDBUtils.whereDateTimeFilter(record, field, whereClause[field])) return null;
					}
					if (whereClause.user) {
						const { is, isNot, ...rest } = whereClause.user;
						if (is !== null && is !== undefined) {
							const relatedRecord = await this.client.user.findFirst(
								{ where: { ...is, id: record.userId } },
								tx
							);
							if (!relatedRecord) return null;
						}
						if (isNot !== null && isNot !== undefined) {
							const relatedRecord = await this.client.user.findFirst(
								{ where: { ...isNot, id: record.userId } },
								tx
							);
							if (relatedRecord) return null;
						}
						if (Object.keys(rest).length) {
							const relatedRecord = await this.client.user.findFirst(
								{ where: { ...whereClause.user, id: record.userId } },
								tx
							);
							if (!relatedRecord) return null;
						}
					}
					return record;
				})
			)
		).filter((result) => result !== null);
	}
	private _applySelectClause<S extends Prisma.Args<Prisma.AccountDelegate, 'findMany'>['select']>(
		records: Prisma.Result<Prisma.AccountDelegate, object, 'findFirstOrThrow'>[],
		selectClause: S
	): Prisma.Result<Prisma.AccountDelegate, { select: S }, 'findFirstOrThrow'>[] {
		if (!selectClause) {
			return records as Prisma.Result<Prisma.AccountDelegate, { select: S }, 'findFirstOrThrow'>[];
		}
		return records.map((record) => {
			const partialRecord: Partial<typeof record> = record;
			for (const untypedKey of [
				'id',
				'accountId',
				'providerId',
				'userId',
				'user',
				'accessToken',
				'refreshToken',
				'idToken',
				'accessTokenExpiresAt',
				'refreshTokenExpiresAt',
				'scope',
				'password',
				'createdAt',
				'updatedAt'
			]) {
				const key = untypedKey as keyof typeof record & keyof S;
				if (!selectClause[key]) delete partialRecord[key];
			}
			return partialRecord;
		}) as Prisma.Result<Prisma.AccountDelegate, { select: S }, 'findFirstOrThrow'>[];
	}
	private async _applyRelations<Q extends Prisma.Args<Prisma.AccountDelegate, 'findMany'>>(
		records: Prisma.Result<Prisma.AccountDelegate, object, 'findFirstOrThrow'>[],
		tx: IDBUtils.TransactionType,
		query?: Q
	): Promise<Prisma.Result<Prisma.AccountDelegate, Q, 'findFirstOrThrow'>[]> {
		if (!query) return records as Prisma.Result<Prisma.AccountDelegate, Q, 'findFirstOrThrow'>[];
		const recordsWithRelations = records.map(async (record) => {
			const unsafeRecord = record as Record<string, unknown>;
			const attach_user = query.select?.user || query.include?.user;
			if (attach_user) {
				unsafeRecord['user'] = await this.client.user.findUnique(
					{
						...(attach_user === true ? {} : attach_user),
						where: { id: record.userId! }
					},
					tx
				);
			}
			return unsafeRecord;
		});
		return (await Promise.all(recordsWithRelations)) as Prisma.Result<
			Prisma.AccountDelegate,
			Q,
			'findFirstOrThrow'
		>[];
	}
	async _applyOrderByClause<
		O extends Prisma.Args<Prisma.AccountDelegate, 'findMany'>['orderBy'],
		R extends Prisma.Result<Prisma.AccountDelegate, object, 'findFirstOrThrow'>
	>(records: R[], orderByClause: O, tx: IDBUtils.TransactionType): Promise<void> {
		if (orderByClause === undefined) return;
		const orderByClauses = IDBUtils.convertToArray(orderByClause);
		const indexedKeys = await Promise.all(
			records.map(async (record) => {
				const keys = await Promise.all(
					orderByClauses.map(async (clause) => await this._resolveOrderByKey(record, clause, tx))
				);
				return { keys, record };
			})
		);
		indexedKeys.sort((a, b) => {
			for (let i = 0; i < orderByClauses.length; i++) {
				const clause = orderByClauses[i];
				const comparison = IDBUtils.genericComparator(
					a.keys[i],
					b.keys[i],
					this._resolveSortOrder(clause)
				);
				if (comparison !== 0) return comparison;
			}
			return 0;
		});
		for (let i = 0; i < records.length; i++) {
			records[i] = indexedKeys[i].record;
		}
	}
	async _resolveOrderByKey(
		record: Prisma.Result<Prisma.AccountDelegate, object, 'findFirstOrThrow'>,
		orderByInput: Prisma.AccountOrderByWithRelationInput,
		tx: IDBUtils.TransactionType
	): Promise<unknown> {
		const scalarFields = [
			'id',
			'accountId',
			'providerId',
			'userId',
			'accessToken',
			'refreshToken',
			'idToken',
			'accessTokenExpiresAt',
			'refreshTokenExpiresAt',
			'scope',
			'password',
			'createdAt',
			'updatedAt'
		] as const;
		for (const field of scalarFields) if (orderByInput[field]) return record[field];
		if (orderByInput.user) {
			return await this.client.user._resolveOrderByKey(
				await this.client.user.findFirstOrThrow({ where: { id: record.userId } }),
				orderByInput.user,
				tx
			);
		}
	}
	_resolveSortOrder(
		orderByInput: Prisma.AccountOrderByWithRelationInput
	): Prisma.SortOrder | { sort: Prisma.SortOrder; nulls?: 'first' | 'last' } {
		const scalarFields = [
			'id',
			'accountId',
			'providerId',
			'userId',
			'accessToken',
			'refreshToken',
			'idToken',
			'accessTokenExpiresAt',
			'refreshTokenExpiresAt',
			'scope',
			'password',
			'createdAt',
			'updatedAt'
		] as const;
		for (const field of scalarFields) if (orderByInput[field]) return orderByInput[field];
		if (orderByInput.user) {
			return this.client.user._resolveSortOrder(orderByInput.user);
		}
		throw new Error('No field in orderBy clause');
	}
	private async _fillDefaults<D extends Prisma.Args<Prisma.AccountDelegate, 'create'>['data']>(
		data: D,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<D> {
		if (data === undefined) data = {} as NonNullable<D>;
		if (data.accessToken === undefined) {
			data.accessToken = null;
		}
		if (data.refreshToken === undefined) {
			data.refreshToken = null;
		}
		if (data.idToken === undefined) {
			data.idToken = null;
		}
		if (data.accessTokenExpiresAt === undefined) {
			data.accessTokenExpiresAt = null;
		}
		if (data.refreshTokenExpiresAt === undefined) {
			data.refreshTokenExpiresAt = null;
		}
		if (data.scope === undefined) {
			data.scope = null;
		}
		if (data.password === undefined) {
			data.password = null;
		}
		if (typeof data.accessTokenExpiresAt === 'string') {
			data.accessTokenExpiresAt = new Date(data.accessTokenExpiresAt);
		}
		if (typeof data.refreshTokenExpiresAt === 'string') {
			data.refreshTokenExpiresAt = new Date(data.refreshTokenExpiresAt);
		}
		if (typeof data.createdAt === 'string') {
			data.createdAt = new Date(data.createdAt);
		}
		if (typeof data.updatedAt === 'string') {
			data.updatedAt = new Date(data.updatedAt);
		}
		return data;
	}
	_getNeededStoresForWhere<W extends Prisma.Args<Prisma.AccountDelegate, 'findMany'>['where']>(
		whereClause: W,
		neededStores: Set<StoreNames<PrismaIDBSchema>>
	) {
		if (whereClause === undefined) return;
		for (const param of IDBUtils.LogicalParams) {
			if (whereClause[param]) {
				for (const clause of IDBUtils.convertToArray(whereClause[param])) {
					this._getNeededStoresForWhere(clause, neededStores);
				}
			}
		}
		if (whereClause.user) {
			neededStores.add('User');
			this.client.user._getNeededStoresForWhere(whereClause.user, neededStores);
		}
	}
	_getNeededStoresForFind<Q extends Prisma.Args<Prisma.AccountDelegate, 'findMany'>>(
		query?: Q
	): Set<StoreNames<PrismaIDBSchema>> {
		const neededStores: Set<StoreNames<PrismaIDBSchema>> = new Set();
		neededStores.add('Account');
		this._getNeededStoresForWhere(query?.where, neededStores);
		if (query?.orderBy) {
			const orderBy = IDBUtils.convertToArray(query.orderBy);
			const orderBy_user = orderBy.find((clause) => clause.user);
			if (orderBy_user) {
				this.client.user
					._getNeededStoresForFind({ orderBy: orderBy_user.user })
					.forEach((storeName) => neededStores.add(storeName));
			}
		}
		if (query?.select?.user || query?.include?.user) {
			neededStores.add('User');
			if (typeof query.select?.user === 'object') {
				this.client.user
					._getNeededStoresForFind(query.select.user)
					.forEach((storeName) => neededStores.add(storeName));
			}
			if (typeof query.include?.user === 'object') {
				this.client.user
					._getNeededStoresForFind(query.include.user)
					.forEach((storeName) => neededStores.add(storeName));
			}
		}
		return neededStores;
	}
	_getNeededStoresForCreate<
		D extends Partial<Prisma.Args<Prisma.AccountDelegate, 'create'>['data']>
	>(data: D): Set<StoreNames<PrismaIDBSchema>> {
		const neededStores: Set<StoreNames<PrismaIDBSchema>> = new Set();
		neededStores.add('Account');
		if (data?.user) {
			neededStores.add('User');
			if (data.user.create) {
				const createData = Array.isArray(data.user.create) ? data.user.create : [data.user.create];
				createData.forEach((record) =>
					this.client.user
						._getNeededStoresForCreate(record)
						.forEach((storeName) => neededStores.add(storeName))
				);
			}
			if (data.user.connectOrCreate) {
				IDBUtils.convertToArray(data.user.connectOrCreate).forEach((record) =>
					this.client.user
						._getNeededStoresForCreate(record.create)
						.forEach((storeName) => neededStores.add(storeName))
				);
			}
		}
		if (data?.userId !== undefined) {
			neededStores.add('User');
		}
		return neededStores;
	}
	_getNeededStoresForUpdate<Q extends Prisma.Args<Prisma.AccountDelegate, 'update'>>(
		query: Partial<Q>
	): Set<StoreNames<PrismaIDBSchema>> {
		const neededStores = this._getNeededStoresForFind(query).union(
			this._getNeededStoresForCreate(
				query.data as Prisma.Args<Prisma.AccountDelegate, 'create'>['data']
			)
		);
		if (query.data?.user?.connect) {
			neededStores.add('User');
			IDBUtils.convertToArray(query.data.user.connect).forEach((connect) => {
				this.client.user._getNeededStoresForWhere(connect, neededStores);
			});
		}
		if (query.data?.user?.update) {
			neededStores.add('User');
			IDBUtils.convertToArray(query.data.user.update).forEach((update) => {
				this.client.user
					._getNeededStoresForUpdate(update as Prisma.Args<Prisma.UserDelegate, 'update'>)
					.forEach((store) => neededStores.add(store));
			});
		}
		if (query.data?.user?.upsert) {
			neededStores.add('User');
			IDBUtils.convertToArray(query.data.user.upsert).forEach((upsert) => {
				const update = {
					where: upsert.where,
					data: { ...upsert.update, ...upsert.create }
				} as Prisma.Args<Prisma.UserDelegate, 'update'>;
				this.client.user
					._getNeededStoresForUpdate(update)
					.forEach((store) => neededStores.add(store));
			});
		}
		return neededStores;
	}
	_getNeededStoresForNestedDelete(neededStores: Set<StoreNames<PrismaIDBSchema>>): void {
		neededStores.add('Account');
	}
	private _removeNestedCreateData<D extends Prisma.Args<Prisma.AccountDelegate, 'create'>['data']>(
		data: D
	): Prisma.Result<Prisma.AccountDelegate, object, 'findFirstOrThrow'> {
		const recordWithoutNestedCreate = structuredClone(data);
		delete recordWithoutNestedCreate?.user;
		return recordWithoutNestedCreate as Prisma.Result<
			Prisma.AccountDelegate,
			object,
			'findFirstOrThrow'
		>;
	}
	private _preprocessListFields(
		records: Prisma.Result<Prisma.AccountDelegate, object, 'findMany'>
	): void {}
	async findMany<Q extends Prisma.Args<Prisma.AccountDelegate, 'findMany'>>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.AccountDelegate, Q, 'findMany'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		const records = await this._applyWhereClause(
			await tx.objectStore('Account').getAll(),
			query?.where,
			tx
		);
		await this._applyOrderByClause(records, query?.orderBy, tx);
		const relationAppliedRecords = (await this._applyRelations(
			records,
			tx,
			query
		)) as Prisma.Result<Prisma.AccountDelegate, object, 'findFirstOrThrow'>[];
		const selectClause = query?.select;
		let selectAppliedRecords = this._applySelectClause(relationAppliedRecords, selectClause);
		if (query?.distinct) {
			const distinctFields = IDBUtils.convertToArray(query.distinct);
			const seen = new Set<string>();
			selectAppliedRecords = selectAppliedRecords.filter((record) => {
				const key = distinctFields.map((field) => record[field]).join('|');
				if (seen.has(key)) return false;
				seen.add(key);
				return true;
			});
		}
		this._preprocessListFields(selectAppliedRecords);
		return selectAppliedRecords as Prisma.Result<Prisma.AccountDelegate, Q, 'findMany'>;
	}
	async findFirst<Q extends Prisma.Args<Prisma.AccountDelegate, 'findFirst'>>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.AccountDelegate, Q, 'findFirst'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		return (await this.findMany(query, tx))[0] ?? null;
	}
	async findFirstOrThrow<Q extends Prisma.Args<Prisma.AccountDelegate, 'findFirstOrThrow'>>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.AccountDelegate, Q, 'findFirstOrThrow'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		const record = await this.findFirst(query, tx);
		if (!record) {
			tx.abort();
			throw new Error('Record not found');
		}
		return record;
	}
	async findUnique<Q extends Prisma.Args<Prisma.AccountDelegate, 'findUnique'>>(
		query: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.AccountDelegate, Q, 'findUnique'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		let record;
		if (query.where.id !== undefined) {
			record = await tx.objectStore('Account').get([query.where.id]);
		}
		if (!record) return null;

		const recordWithRelations = this._applySelectClause(
			await this._applyRelations(
				await this._applyWhereClause([record], query.where, tx),
				tx,
				query
			),
			query.select
		)[0];
		this._preprocessListFields([recordWithRelations]);
		return recordWithRelations as Prisma.Result<Prisma.AccountDelegate, Q, 'findUnique'>;
	}
	async findUniqueOrThrow<Q extends Prisma.Args<Prisma.AccountDelegate, 'findUniqueOrThrow'>>(
		query: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.AccountDelegate, Q, 'findUniqueOrThrow'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		const record = await this.findUnique(query, tx);
		if (!record) {
			tx.abort();
			throw new Error('Record not found');
		}
		return record;
	}
	async count<Q extends Prisma.Args<Prisma.AccountDelegate, 'count'>>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.AccountDelegate, Q, 'count'>> {
		tx = tx ?? this.client._db.transaction(['Account'], 'readonly');
		if (!query?.select || query.select === true) {
			const records = await this.findMany({ where: query?.where }, tx);
			return records.length as Prisma.Result<Prisma.AccountDelegate, Q, 'count'>;
		}
		const result: Partial<Record<keyof Prisma.AccountCountAggregateInputType, number>> = {};
		for (const key of Object.keys(query.select)) {
			const typedKey = key as keyof typeof query.select;
			if (typedKey === '_all') {
				result[typedKey] = (await this.findMany({ where: query.where }, tx)).length;
				continue;
			}
			result[typedKey] = (
				await this.findMany({ where: { [`${typedKey}`]: { not: null } } }, tx)
			).length;
		}
		return result as Prisma.Result<Prisma.AccountDelegate, Q, 'count'>;
	}
	async create<Q extends Prisma.Args<Prisma.AccountDelegate, 'create'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.AccountDelegate, Q, 'create'>> {
		const storesNeeded = this._getNeededStoresForCreate(query.data);
		tx = tx ?? this.client._db.transaction(Array.from(storesNeeded), 'readwrite');
		if (query.data.user) {
			const fk: Partial<PrismaIDBSchema['User']['key']> = [];
			if (query.data.user?.create) {
				const record = await this.client.user.create({ data: query.data.user.create }, tx);
				fk[0] = record.id;
			}
			if (query.data.user?.connect) {
				const record = await this.client.user.findUniqueOrThrow(
					{ where: query.data.user.connect },
					tx
				);
				delete query.data.user.connect;
				fk[0] = record.id;
			}
			if (query.data.user?.connectOrCreate) {
				const record = await this.client.user.upsert(
					{
						where: query.data.user.connectOrCreate.where,
						create: query.data.user.connectOrCreate.create,
						update: {}
					},
					tx
				);
				fk[0] = record.id;
			}
			const unsafeData = query.data as Record<string, unknown>;
			unsafeData.userId = fk[0];
			delete unsafeData.user;
		} else if (query.data?.userId !== undefined && query.data.userId !== null) {
			await this.client.user.findUniqueOrThrow(
				{
					where: { id: query.data.userId }
				},
				tx
			);
		}
		const record = this._removeNestedCreateData(await this._fillDefaults(query.data, tx));
		const keyPath = await tx.objectStore('Account').add(record);
		const data = (await tx.objectStore('Account').get(keyPath))!;
		const recordsWithRelations = this._applySelectClause(
			await this._applyRelations<object>([data], tx, query),
			query.select
		)[0];
		this._preprocessListFields([recordsWithRelations]);
		this.emit('create', keyPath);
		return recordsWithRelations as Prisma.Result<Prisma.AccountDelegate, Q, 'create'>;
	}
	async createMany<Q extends Prisma.Args<Prisma.AccountDelegate, 'createMany'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.AccountDelegate, Q, 'createMany'>> {
		const createManyData = IDBUtils.convertToArray(query.data);
		tx = tx ?? this.client._db.transaction(['Account'], 'readwrite');
		for (const createData of createManyData) {
			const record = this._removeNestedCreateData(await this._fillDefaults(createData, tx));
			const keyPath = await tx.objectStore('Account').add(record);
			this.emit('create', keyPath);
		}
		return { count: createManyData.length };
	}
	async createManyAndReturn<Q extends Prisma.Args<Prisma.AccountDelegate, 'createManyAndReturn'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.AccountDelegate, Q, 'createManyAndReturn'>> {
		const createManyData = IDBUtils.convertToArray(query.data);
		const records: Prisma.Result<Prisma.AccountDelegate, object, 'findMany'> = [];
		tx = tx ?? this.client._db.transaction(['Account'], 'readwrite');
		for (const createData of createManyData) {
			const record = this._removeNestedCreateData(await this._fillDefaults(createData, tx));
			const keyPath = await tx.objectStore('Account').add(record);
			this.emit('create', keyPath);
			records.push(this._applySelectClause([record], query.select)[0]);
		}
		this._preprocessListFields(records);
		return records as Prisma.Result<Prisma.AccountDelegate, Q, 'createManyAndReturn'>;
	}
	async delete<Q extends Prisma.Args<Prisma.AccountDelegate, 'delete'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.AccountDelegate, Q, 'delete'>> {
		const storesNeeded = this._getNeededStoresForFind(query);
		this._getNeededStoresForNestedDelete(storesNeeded);
		tx = tx ?? this.client._db.transaction(Array.from(storesNeeded), 'readwrite');
		const record = await this.findUnique(query, tx);
		if (!record) throw new Error('Record not found');
		await tx.objectStore('Account').delete([record.id]);
		this.emit('delete', [record.id]);
		return record;
	}
	async deleteMany<Q extends Prisma.Args<Prisma.AccountDelegate, 'deleteMany'>>(
		query?: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.AccountDelegate, Q, 'deleteMany'>> {
		const storesNeeded = this._getNeededStoresForFind(query);
		this._getNeededStoresForNestedDelete(storesNeeded);
		tx = tx ?? this.client._db.transaction(Array.from(storesNeeded), 'readwrite');
		const records = await this.findMany(query, tx);
		for (const record of records) {
			await this.delete({ where: { id: record.id } }, tx);
		}
		return { count: records.length };
	}
	async update<Q extends Prisma.Args<Prisma.AccountDelegate, 'update'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.AccountDelegate, Q, 'update'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForUpdate(query)), 'readwrite');
		const record = await this.findUnique({ where: query.where }, tx);
		if (record === null) {
			tx.abort();
			throw new Error('Record not found');
		}
		const startKeyPath: PrismaIDBSchema['Account']['key'] = [record.id];
		const stringFields = [
			'id',
			'accountId',
			'providerId',
			'userId',
			'accessToken',
			'refreshToken',
			'idToken',
			'scope',
			'password'
		] as const;
		for (const field of stringFields) {
			IDBUtils.handleStringUpdateField(record, field, query.data[field]);
		}
		const dateTimeFields = [
			'accessTokenExpiresAt',
			'refreshTokenExpiresAt',
			'createdAt',
			'updatedAt'
		] as const;
		for (const field of dateTimeFields) {
			IDBUtils.handleDateTimeUpdateField(record, field, query.data[field]);
		}
		if (query.data.user) {
			if (query.data.user.connect) {
				const other = await this.client.user.findUniqueOrThrow(
					{ where: query.data.user.connect },
					tx
				);
				record.userId = other.id;
			}
			if (query.data.user.create) {
				const other = await this.client.user.create({ data: query.data.user.create }, tx);
				record.userId = other.id;
			}
			if (query.data.user.update) {
				const updateData = query.data.user.update.data ?? query.data.user.update;
				await this.client.user.update(
					{
						where: {
							...query.data.user.update.where,
							id: record.userId!
						} as Prisma.UserWhereUniqueInput,
						data: updateData
					},
					tx
				);
			}
			if (query.data.user.upsert) {
				await this.client.user.upsert(
					{
						where: {
							...query.data.user.upsert.where,
							id: record.userId!
						} as Prisma.UserWhereUniqueInput,
						create: { ...query.data.user.upsert.create, id: record.userId! } as Prisma.Args<
							Prisma.UserDelegate,
							'upsert'
						>['create'],
						update: query.data.user.upsert.update
					},
					tx
				);
			}
			if (query.data.user.connectOrCreate) {
				await this.client.user.upsert(
					{
						where: { ...query.data.user.connectOrCreate.where, id: record.userId! },
						create: {
							...query.data.user.connectOrCreate.create,
							id: record.userId!
						} as Prisma.Args<Prisma.UserDelegate, 'upsert'>['create'],
						update: { id: record.userId! }
					},
					tx
				);
			}
		}
		if (query.data.userId !== undefined) {
			const related = await this.client.user.findUnique({ where: { id: record.userId } }, tx);
			if (!related) throw new Error('Related record not found');
		}
		const endKeyPath: PrismaIDBSchema['Account']['key'] = [record.id];
		for (let i = 0; i < startKeyPath.length; i++) {
			if (startKeyPath[i] !== endKeyPath[i]) {
				if ((await tx.objectStore('Account').get(endKeyPath)) !== undefined) {
					throw new Error('Record with the same keyPath already exists');
				}
				await tx.objectStore('Account').delete(startKeyPath);
				break;
			}
		}
		const keyPath = await tx.objectStore('Account').put(record);
		this.emit('update', keyPath, startKeyPath);
		for (let i = 0; i < startKeyPath.length; i++) {
			if (startKeyPath[i] !== endKeyPath[i]) {
				break;
			}
		}
		const recordWithRelations = (await this.findUnique(
			{
				where: { id: keyPath[0] }
			},
			tx
		))!;
		return recordWithRelations as Prisma.Result<Prisma.AccountDelegate, Q, 'update'>;
	}
	async updateMany<Q extends Prisma.Args<Prisma.AccountDelegate, 'updateMany'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.AccountDelegate, Q, 'updateMany'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readwrite');
		const records = await this.findMany({ where: query.where }, tx);
		await Promise.all(
			records.map(async (record) => {
				await this.update({ where: { id: record.id }, data: query.data }, tx);
			})
		);
		return { count: records.length };
	}
	async upsert<Q extends Prisma.Args<Prisma.AccountDelegate, 'upsert'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.AccountDelegate, Q, 'upsert'>> {
		const neededStores = this._getNeededStoresForUpdate({
			...query,
			data: { ...query.update, ...query.create } as Prisma.Args<
				Prisma.AccountDelegate,
				'update'
			>['data']
		});
		tx = tx ?? this.client._db.transaction(Array.from(neededStores), 'readwrite');
		let record = await this.findUnique({ where: query.where }, tx);
		if (!record) record = await this.create({ data: query.create }, tx);
		else record = await this.update({ where: query.where, data: query.update }, tx);
		record = await this.findUniqueOrThrow(
			{ where: { id: record.id }, select: query.select, include: query.include },
			tx
		);
		return record as Prisma.Result<Prisma.AccountDelegate, Q, 'upsert'>;
	}
	async aggregate<Q extends Prisma.Args<Prisma.AccountDelegate, 'aggregate'>>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.AccountDelegate, Q, 'aggregate'>> {
		tx = tx ?? this.client._db.transaction(['Account'], 'readonly');
		const records = await this.findMany({ where: query?.where }, tx);
		const result: Partial<Prisma.Result<Prisma.AccountDelegate, Q, 'aggregate'>> = {};
		if (query?._count) {
			if (query._count === true) {
				(result._count as number) = records.length;
			} else {
				for (const key of Object.keys(query._count)) {
					const typedKey = key as keyof typeof query._count;
					if (typedKey === '_all') {
						(result._count as Record<string, number>)[typedKey] = records.length;
						continue;
					}
					(result._count as Record<string, number>)[typedKey] = (
						await this.findMany({ where: { [`${typedKey}`]: { not: null } } }, tx)
					).length;
				}
			}
		}
		if (query?._min) {
			const minResult = {} as Prisma.Result<Prisma.AccountDelegate, Q, 'aggregate'>['_min'];
			const dateTimeFields = [
				'accessTokenExpiresAt',
				'refreshTokenExpiresAt',
				'createdAt',
				'updatedAt'
			] as const;
			for (const field of dateTimeFields) {
				if (!query._min[field]) continue;
				const values = records
					.map((record) => record[field]?.getTime())
					.filter((value) => value !== undefined);
				(minResult[field as keyof typeof minResult] as Date) = new Date(Math.min(...values));
			}
			const stringFields = [
				'id',
				'accountId',
				'providerId',
				'userId',
				'accessToken',
				'refreshToken',
				'idToken',
				'scope',
				'password'
			] as const;
			for (const field of stringFields) {
				if (!query._min[field]) continue;
				const values = records
					.map((record) => record[field] as string)
					.filter((value) => value !== undefined);
				(minResult[field as keyof typeof minResult] as string) = values.sort()[0];
			}
			result._min = minResult;
		}
		if (query?._max) {
			const maxResult = {} as Prisma.Result<Prisma.AccountDelegate, Q, 'aggregate'>['_max'];
			const dateTimeFields = [
				'accessTokenExpiresAt',
				'refreshTokenExpiresAt',
				'createdAt',
				'updatedAt'
			] as const;
			for (const field of dateTimeFields) {
				if (!query._max[field]) continue;
				const values = records
					.map((record) => record[field]?.getTime())
					.filter((value) => value !== undefined);
				(maxResult[field as keyof typeof maxResult] as Date) = new Date(Math.max(...values));
			}
			const stringFields = [
				'id',
				'accountId',
				'providerId',
				'userId',
				'accessToken',
				'refreshToken',
				'idToken',
				'scope',
				'password'
			] as const;
			for (const field of stringFields) {
				if (!query._max[field]) continue;
				const values = records
					.map((record) => record[field] as string)
					.filter((value) => value !== undefined);
				(maxResult[field as keyof typeof maxResult] as string) = values.sort().reverse()[0];
			}
			result._max = maxResult;
		}
		return result as unknown as Prisma.Result<Prisma.AccountDelegate, Q, 'aggregate'>;
	}
}
class VerificationIDBClass extends BaseIDBModelClass<'Verification'> {
	private async _applyWhereClause<
		W extends Prisma.Args<Prisma.VerificationDelegate, 'findFirstOrThrow'>['where'],
		R extends Prisma.Result<Prisma.VerificationDelegate, object, 'findFirstOrThrow'>
	>(records: R[], whereClause: W, tx: IDBUtils.TransactionType): Promise<R[]> {
		if (!whereClause) return records;
		records = await IDBUtils.applyLogicalFilters<Prisma.VerificationDelegate, R, W>(
			records,
			whereClause,
			tx,
			this.keyPath,
			this._applyWhereClause.bind(this)
		);
		return (
			await Promise.all(
				records.map(async (record) => {
					const stringFields = ['id', 'identifier', 'value'] as const;
					for (const field of stringFields) {
						if (!IDBUtils.whereStringFilter(record, field, whereClause[field])) return null;
					}
					const dateTimeFields = ['expiresAt', 'createdAt', 'updatedAt'] as const;
					for (const field of dateTimeFields) {
						if (!IDBUtils.whereDateTimeFilter(record, field, whereClause[field])) return null;
					}
					return record;
				})
			)
		).filter((result) => result !== null);
	}
	private _applySelectClause<
		S extends Prisma.Args<Prisma.VerificationDelegate, 'findMany'>['select']
	>(
		records: Prisma.Result<Prisma.VerificationDelegate, object, 'findFirstOrThrow'>[],
		selectClause: S
	): Prisma.Result<Prisma.VerificationDelegate, { select: S }, 'findFirstOrThrow'>[] {
		if (!selectClause) {
			return records as Prisma.Result<
				Prisma.VerificationDelegate,
				{ select: S },
				'findFirstOrThrow'
			>[];
		}
		return records.map((record) => {
			const partialRecord: Partial<typeof record> = record;
			for (const untypedKey of [
				'id',
				'identifier',
				'value',
				'expiresAt',
				'createdAt',
				'updatedAt'
			]) {
				const key = untypedKey as keyof typeof record & keyof S;
				if (!selectClause[key]) delete partialRecord[key];
			}
			return partialRecord;
		}) as Prisma.Result<Prisma.VerificationDelegate, { select: S }, 'findFirstOrThrow'>[];
	}
	private async _applyRelations<Q extends Prisma.Args<Prisma.VerificationDelegate, 'findMany'>>(
		records: Prisma.Result<Prisma.VerificationDelegate, object, 'findFirstOrThrow'>[],
		tx: IDBUtils.TransactionType,
		query?: Q
	): Promise<Prisma.Result<Prisma.VerificationDelegate, Q, 'findFirstOrThrow'>[]> {
		if (!query)
			return records as Prisma.Result<Prisma.VerificationDelegate, Q, 'findFirstOrThrow'>[];
		const recordsWithRelations = records.map(async (record) => {
			const unsafeRecord = record as Record<string, unknown>;
			return unsafeRecord;
		});
		return (await Promise.all(recordsWithRelations)) as Prisma.Result<
			Prisma.VerificationDelegate,
			Q,
			'findFirstOrThrow'
		>[];
	}
	async _applyOrderByClause<
		O extends Prisma.Args<Prisma.VerificationDelegate, 'findMany'>['orderBy'],
		R extends Prisma.Result<Prisma.VerificationDelegate, object, 'findFirstOrThrow'>
	>(records: R[], orderByClause: O, tx: IDBUtils.TransactionType): Promise<void> {
		if (orderByClause === undefined) return;
		const orderByClauses = IDBUtils.convertToArray(orderByClause);
		const indexedKeys = await Promise.all(
			records.map(async (record) => {
				const keys = await Promise.all(
					orderByClauses.map(async (clause) => await this._resolveOrderByKey(record, clause, tx))
				);
				return { keys, record };
			})
		);
		indexedKeys.sort((a, b) => {
			for (let i = 0; i < orderByClauses.length; i++) {
				const clause = orderByClauses[i];
				const comparison = IDBUtils.genericComparator(
					a.keys[i],
					b.keys[i],
					this._resolveSortOrder(clause)
				);
				if (comparison !== 0) return comparison;
			}
			return 0;
		});
		for (let i = 0; i < records.length; i++) {
			records[i] = indexedKeys[i].record;
		}
	}
	async _resolveOrderByKey(
		record: Prisma.Result<Prisma.VerificationDelegate, object, 'findFirstOrThrow'>,
		orderByInput: Prisma.VerificationOrderByWithRelationInput,
		tx: IDBUtils.TransactionType
	): Promise<unknown> {
		const scalarFields = [
			'id',
			'identifier',
			'value',
			'expiresAt',
			'createdAt',
			'updatedAt'
		] as const;
		for (const field of scalarFields) if (orderByInput[field]) return record[field];
	}
	_resolveSortOrder(
		orderByInput: Prisma.VerificationOrderByWithRelationInput
	): Prisma.SortOrder | { sort: Prisma.SortOrder; nulls?: 'first' | 'last' } {
		const scalarFields = [
			'id',
			'identifier',
			'value',
			'expiresAt',
			'createdAt',
			'updatedAt'
		] as const;
		for (const field of scalarFields) if (orderByInput[field]) return orderByInput[field];
		throw new Error('No field in orderBy clause');
	}
	private async _fillDefaults<D extends Prisma.Args<Prisma.VerificationDelegate, 'create'>['data']>(
		data: D,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<D> {
		if (data === undefined) data = {} as NonNullable<D>;
		if (data.createdAt === undefined) {
			data.createdAt = null;
		}
		if (data.updatedAt === undefined) {
			data.updatedAt = null;
		}
		if (typeof data.expiresAt === 'string') {
			data.expiresAt = new Date(data.expiresAt);
		}
		if (typeof data.createdAt === 'string') {
			data.createdAt = new Date(data.createdAt);
		}
		if (typeof data.updatedAt === 'string') {
			data.updatedAt = new Date(data.updatedAt);
		}
		return data;
	}
	_getNeededStoresForWhere<W extends Prisma.Args<Prisma.VerificationDelegate, 'findMany'>['where']>(
		whereClause: W,
		neededStores: Set<StoreNames<PrismaIDBSchema>>
	) {
		if (whereClause === undefined) return;
		for (const param of IDBUtils.LogicalParams) {
			if (whereClause[param]) {
				for (const clause of IDBUtils.convertToArray(whereClause[param])) {
					this._getNeededStoresForWhere(clause, neededStores);
				}
			}
		}
	}
	_getNeededStoresForFind<Q extends Prisma.Args<Prisma.VerificationDelegate, 'findMany'>>(
		query?: Q
	): Set<StoreNames<PrismaIDBSchema>> {
		const neededStores: Set<StoreNames<PrismaIDBSchema>> = new Set();
		neededStores.add('Verification');
		this._getNeededStoresForWhere(query?.where, neededStores);
		if (query?.orderBy) {
			const orderBy = IDBUtils.convertToArray(query.orderBy);
		}
		return neededStores;
	}
	_getNeededStoresForCreate<
		D extends Partial<Prisma.Args<Prisma.VerificationDelegate, 'create'>['data']>
	>(data: D): Set<StoreNames<PrismaIDBSchema>> {
		const neededStores: Set<StoreNames<PrismaIDBSchema>> = new Set();
		neededStores.add('Verification');
		return neededStores;
	}
	_getNeededStoresForUpdate<Q extends Prisma.Args<Prisma.VerificationDelegate, 'update'>>(
		query: Partial<Q>
	): Set<StoreNames<PrismaIDBSchema>> {
		const neededStores = this._getNeededStoresForFind(query).union(
			this._getNeededStoresForCreate(
				query.data as Prisma.Args<Prisma.VerificationDelegate, 'create'>['data']
			)
		);
		return neededStores;
	}
	_getNeededStoresForNestedDelete(neededStores: Set<StoreNames<PrismaIDBSchema>>): void {
		neededStores.add('Verification');
	}
	private _removeNestedCreateData<
		D extends Prisma.Args<Prisma.VerificationDelegate, 'create'>['data']
	>(data: D): Prisma.Result<Prisma.VerificationDelegate, object, 'findFirstOrThrow'> {
		const recordWithoutNestedCreate = structuredClone(data);
		return recordWithoutNestedCreate as Prisma.Result<
			Prisma.VerificationDelegate,
			object,
			'findFirstOrThrow'
		>;
	}
	private _preprocessListFields(
		records: Prisma.Result<Prisma.VerificationDelegate, object, 'findMany'>
	): void {}
	async findMany<Q extends Prisma.Args<Prisma.VerificationDelegate, 'findMany'>>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.VerificationDelegate, Q, 'findMany'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		const records = await this._applyWhereClause(
			await tx.objectStore('Verification').getAll(),
			query?.where,
			tx
		);
		await this._applyOrderByClause(records, query?.orderBy, tx);
		const relationAppliedRecords = (await this._applyRelations(
			records,
			tx,
			query
		)) as Prisma.Result<Prisma.VerificationDelegate, object, 'findFirstOrThrow'>[];
		const selectClause = query?.select;
		let selectAppliedRecords = this._applySelectClause(relationAppliedRecords, selectClause);
		if (query?.distinct) {
			const distinctFields = IDBUtils.convertToArray(query.distinct);
			const seen = new Set<string>();
			selectAppliedRecords = selectAppliedRecords.filter((record) => {
				const key = distinctFields.map((field) => record[field]).join('|');
				if (seen.has(key)) return false;
				seen.add(key);
				return true;
			});
		}
		this._preprocessListFields(selectAppliedRecords);
		return selectAppliedRecords as Prisma.Result<Prisma.VerificationDelegate, Q, 'findMany'>;
	}
	async findFirst<Q extends Prisma.Args<Prisma.VerificationDelegate, 'findFirst'>>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.VerificationDelegate, Q, 'findFirst'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		return (await this.findMany(query, tx))[0] ?? null;
	}
	async findFirstOrThrow<Q extends Prisma.Args<Prisma.VerificationDelegate, 'findFirstOrThrow'>>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.VerificationDelegate, Q, 'findFirstOrThrow'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		const record = await this.findFirst(query, tx);
		if (!record) {
			tx.abort();
			throw new Error('Record not found');
		}
		return record;
	}
	async findUnique<Q extends Prisma.Args<Prisma.VerificationDelegate, 'findUnique'>>(
		query: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.VerificationDelegate, Q, 'findUnique'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		let record;
		if (query.where.id !== undefined) {
			record = await tx.objectStore('Verification').get([query.where.id]);
		}
		if (!record) return null;

		const recordWithRelations = this._applySelectClause(
			await this._applyRelations(
				await this._applyWhereClause([record], query.where, tx),
				tx,
				query
			),
			query.select
		)[0];
		this._preprocessListFields([recordWithRelations]);
		return recordWithRelations as Prisma.Result<Prisma.VerificationDelegate, Q, 'findUnique'>;
	}
	async findUniqueOrThrow<Q extends Prisma.Args<Prisma.VerificationDelegate, 'findUniqueOrThrow'>>(
		query: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.VerificationDelegate, Q, 'findUniqueOrThrow'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readonly');
		const record = await this.findUnique(query, tx);
		if (!record) {
			tx.abort();
			throw new Error('Record not found');
		}
		return record;
	}
	async count<Q extends Prisma.Args<Prisma.VerificationDelegate, 'count'>>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.VerificationDelegate, Q, 'count'>> {
		tx = tx ?? this.client._db.transaction(['Verification'], 'readonly');
		if (!query?.select || query.select === true) {
			const records = await this.findMany({ where: query?.where }, tx);
			return records.length as Prisma.Result<Prisma.VerificationDelegate, Q, 'count'>;
		}
		const result: Partial<Record<keyof Prisma.VerificationCountAggregateInputType, number>> = {};
		for (const key of Object.keys(query.select)) {
			const typedKey = key as keyof typeof query.select;
			if (typedKey === '_all') {
				result[typedKey] = (await this.findMany({ where: query.where }, tx)).length;
				continue;
			}
			result[typedKey] = (
				await this.findMany({ where: { [`${typedKey}`]: { not: null } } }, tx)
			).length;
		}
		return result as Prisma.Result<Prisma.VerificationDelegate, Q, 'count'>;
	}
	async create<Q extends Prisma.Args<Prisma.VerificationDelegate, 'create'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.VerificationDelegate, Q, 'create'>> {
		const storesNeeded = this._getNeededStoresForCreate(query.data);
		tx = tx ?? this.client._db.transaction(Array.from(storesNeeded), 'readwrite');
		const record = this._removeNestedCreateData(await this._fillDefaults(query.data, tx));
		const keyPath = await tx.objectStore('Verification').add(record);
		const data = (await tx.objectStore('Verification').get(keyPath))!;
		const recordsWithRelations = this._applySelectClause(
			await this._applyRelations<object>([data], tx, query),
			query.select
		)[0];
		this._preprocessListFields([recordsWithRelations]);
		this.emit('create', keyPath);
		return recordsWithRelations as Prisma.Result<Prisma.VerificationDelegate, Q, 'create'>;
	}
	async createMany<Q extends Prisma.Args<Prisma.VerificationDelegate, 'createMany'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.VerificationDelegate, Q, 'createMany'>> {
		const createManyData = IDBUtils.convertToArray(query.data);
		tx = tx ?? this.client._db.transaction(['Verification'], 'readwrite');
		for (const createData of createManyData) {
			const record = this._removeNestedCreateData(await this._fillDefaults(createData, tx));
			const keyPath = await tx.objectStore('Verification').add(record);
			this.emit('create', keyPath);
		}
		return { count: createManyData.length };
	}
	async createManyAndReturn<
		Q extends Prisma.Args<Prisma.VerificationDelegate, 'createManyAndReturn'>
	>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.VerificationDelegate, Q, 'createManyAndReturn'>> {
		const createManyData = IDBUtils.convertToArray(query.data);
		const records: Prisma.Result<Prisma.VerificationDelegate, object, 'findMany'> = [];
		tx = tx ?? this.client._db.transaction(['Verification'], 'readwrite');
		for (const createData of createManyData) {
			const record = this._removeNestedCreateData(await this._fillDefaults(createData, tx));
			const keyPath = await tx.objectStore('Verification').add(record);
			this.emit('create', keyPath);
			records.push(this._applySelectClause([record], query.select)[0]);
		}
		this._preprocessListFields(records);
		return records as Prisma.Result<Prisma.VerificationDelegate, Q, 'createManyAndReturn'>;
	}
	async delete<Q extends Prisma.Args<Prisma.VerificationDelegate, 'delete'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.VerificationDelegate, Q, 'delete'>> {
		const storesNeeded = this._getNeededStoresForFind(query);
		this._getNeededStoresForNestedDelete(storesNeeded);
		tx = tx ?? this.client._db.transaction(Array.from(storesNeeded), 'readwrite');
		const record = await this.findUnique(query, tx);
		if (!record) throw new Error('Record not found');
		await tx.objectStore('Verification').delete([record.id]);
		this.emit('delete', [record.id]);
		return record;
	}
	async deleteMany<Q extends Prisma.Args<Prisma.VerificationDelegate, 'deleteMany'>>(
		query?: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.VerificationDelegate, Q, 'deleteMany'>> {
		const storesNeeded = this._getNeededStoresForFind(query);
		this._getNeededStoresForNestedDelete(storesNeeded);
		tx = tx ?? this.client._db.transaction(Array.from(storesNeeded), 'readwrite');
		const records = await this.findMany(query, tx);
		for (const record of records) {
			await this.delete({ where: { id: record.id } }, tx);
		}
		return { count: records.length };
	}
	async update<Q extends Prisma.Args<Prisma.VerificationDelegate, 'update'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.VerificationDelegate, Q, 'update'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForUpdate(query)), 'readwrite');
		const record = await this.findUnique({ where: query.where }, tx);
		if (record === null) {
			tx.abort();
			throw new Error('Record not found');
		}
		const startKeyPath: PrismaIDBSchema['Verification']['key'] = [record.id];
		const stringFields = ['id', 'identifier', 'value'] as const;
		for (const field of stringFields) {
			IDBUtils.handleStringUpdateField(record, field, query.data[field]);
		}
		const dateTimeFields = ['expiresAt', 'createdAt', 'updatedAt'] as const;
		for (const field of dateTimeFields) {
			IDBUtils.handleDateTimeUpdateField(record, field, query.data[field]);
		}
		const endKeyPath: PrismaIDBSchema['Verification']['key'] = [record.id];
		for (let i = 0; i < startKeyPath.length; i++) {
			if (startKeyPath[i] !== endKeyPath[i]) {
				if ((await tx.objectStore('Verification').get(endKeyPath)) !== undefined) {
					throw new Error('Record with the same keyPath already exists');
				}
				await tx.objectStore('Verification').delete(startKeyPath);
				break;
			}
		}
		const keyPath = await tx.objectStore('Verification').put(record);
		this.emit('update', keyPath, startKeyPath);
		for (let i = 0; i < startKeyPath.length; i++) {
			if (startKeyPath[i] !== endKeyPath[i]) {
				break;
			}
		}
		const recordWithRelations = (await this.findUnique(
			{
				where: { id: keyPath[0] }
			},
			tx
		))!;
		return recordWithRelations as Prisma.Result<Prisma.VerificationDelegate, Q, 'update'>;
	}
	async updateMany<Q extends Prisma.Args<Prisma.VerificationDelegate, 'updateMany'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.VerificationDelegate, Q, 'updateMany'>> {
		tx =
			tx ??
			this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), 'readwrite');
		const records = await this.findMany({ where: query.where }, tx);
		await Promise.all(
			records.map(async (record) => {
				await this.update({ where: { id: record.id }, data: query.data }, tx);
			})
		);
		return { count: records.length };
	}
	async upsert<Q extends Prisma.Args<Prisma.VerificationDelegate, 'upsert'>>(
		query: Q,
		tx?: IDBUtils.ReadwriteTransactionType
	): Promise<Prisma.Result<Prisma.VerificationDelegate, Q, 'upsert'>> {
		const neededStores = this._getNeededStoresForUpdate({
			...query,
			data: { ...query.update, ...query.create } as Prisma.Args<
				Prisma.VerificationDelegate,
				'update'
			>['data']
		});
		tx = tx ?? this.client._db.transaction(Array.from(neededStores), 'readwrite');
		let record = await this.findUnique({ where: query.where }, tx);
		if (!record) record = await this.create({ data: query.create }, tx);
		else record = await this.update({ where: query.where, data: query.update }, tx);
		record = await this.findUniqueOrThrow({ where: { id: record.id }, select: query.select }, tx);
		return record as Prisma.Result<Prisma.VerificationDelegate, Q, 'upsert'>;
	}
	async aggregate<Q extends Prisma.Args<Prisma.VerificationDelegate, 'aggregate'>>(
		query?: Q,
		tx?: IDBUtils.TransactionType
	): Promise<Prisma.Result<Prisma.VerificationDelegate, Q, 'aggregate'>> {
		tx = tx ?? this.client._db.transaction(['Verification'], 'readonly');
		const records = await this.findMany({ where: query?.where }, tx);
		const result: Partial<Prisma.Result<Prisma.VerificationDelegate, Q, 'aggregate'>> = {};
		if (query?._count) {
			if (query._count === true) {
				(result._count as number) = records.length;
			} else {
				for (const key of Object.keys(query._count)) {
					const typedKey = key as keyof typeof query._count;
					if (typedKey === '_all') {
						(result._count as Record<string, number>)[typedKey] = records.length;
						continue;
					}
					(result._count as Record<string, number>)[typedKey] = (
						await this.findMany({ where: { [`${typedKey}`]: { not: null } } }, tx)
					).length;
				}
			}
		}
		if (query?._min) {
			const minResult = {} as Prisma.Result<Prisma.VerificationDelegate, Q, 'aggregate'>['_min'];
			const dateTimeFields = ['expiresAt', 'createdAt', 'updatedAt'] as const;
			for (const field of dateTimeFields) {
				if (!query._min[field]) continue;
				const values = records
					.map((record) => record[field]?.getTime())
					.filter((value) => value !== undefined);
				(minResult[field as keyof typeof minResult] as Date) = new Date(Math.min(...values));
			}
			const stringFields = ['id', 'identifier', 'value'] as const;
			for (const field of stringFields) {
				if (!query._min[field]) continue;
				const values = records
					.map((record) => record[field] as string)
					.filter((value) => value !== undefined);
				(minResult[field as keyof typeof minResult] as string) = values.sort()[0];
			}
			result._min = minResult;
		}
		if (query?._max) {
			const maxResult = {} as Prisma.Result<Prisma.VerificationDelegate, Q, 'aggregate'>['_max'];
			const dateTimeFields = ['expiresAt', 'createdAt', 'updatedAt'] as const;
			for (const field of dateTimeFields) {
				if (!query._max[field]) continue;
				const values = records
					.map((record) => record[field]?.getTime())
					.filter((value) => value !== undefined);
				(maxResult[field as keyof typeof maxResult] as Date) = new Date(Math.max(...values));
			}
			const stringFields = ['id', 'identifier', 'value'] as const;
			for (const field of stringFields) {
				if (!query._max[field]) continue;
				const values = records
					.map((record) => record[field] as string)
					.filter((value) => value !== undefined);
				(maxResult[field as keyof typeof maxResult] as string) = values.sort().reverse()[0];
			}
			result._max = maxResult;
		}
		return result as unknown as Prisma.Result<Prisma.VerificationDelegate, Q, 'aggregate'>;
	}
}
