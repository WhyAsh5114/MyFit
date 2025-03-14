import type { Prisma } from '@prisma/client';
import type { IDBPDatabase, StoreNames } from 'idb';
import { openDB } from 'idb';
import type { PrismaIDBSchema } from './idb-interface';
import * as IDBUtils from './idb-utils';

/* eslint-disable @typescript-eslint/no-unused-vars */
const IDB_VERSION = 1;

export class PrismaIDBClient {
	private static instance: PrismaIDBClient;
	_db!: IDBPDatabase<PrismaIDBSchema>;

	private constructor() {}

	exerciseSplit!: ExerciseSplitIDBClass;
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

	private async initialize() {
		this._db = await openDB<PrismaIDBSchema>('prisma-idb', IDB_VERSION, {
			upgrade(db) {
				db.createObjectStore('ExerciseSplit', { keyPath: ['id'] });
				const UserStore = db.createObjectStore('User', { keyPath: ['id'] });
				UserStore.createIndex('emailIndex', ['email'], { unique: true });
				const SessionStore = db.createObjectStore('Session', { keyPath: ['id'] });
				SessionStore.createIndex('tokenIndex', ['token'], { unique: true });
				db.createObjectStore('Account', { keyPath: ['id'] });
				db.createObjectStore('Verification', { keyPath: ['id'] });
			}
		});
		this.exerciseSplit = new ExerciseSplitIDBClass(this, ['id']);
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
			for (const untypedKey of ['id', 'user', 'name', 'userId']) {
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
	}

	_resolveSortOrder(
		orderByInput: Prisma.ExerciseSplitOrderByWithRelationInput
	): Prisma.SortOrder | { sort: Prisma.SortOrder; nulls?: 'first' | 'last' } {
		const scalarFields = ['id', 'name', 'userId'] as const;
		for (const field of scalarFields) if (orderByInput[field]) return orderByInput[field];
		if (orderByInput.user) {
			return this.client.user._resolveSortOrder(orderByInput.user);
		}
		throw new Error('No field in orderBy clause');
	}

	private async _fillDefaults<
		D extends Prisma.Args<Prisma.ExerciseSplitDelegate, 'create'>['data']
	>(data: D, tx?: IDBUtils.ReadwriteTransactionType): Promise<D> {
		if (data === undefined) data = {} as NonNullable<D>;
		if (data.id === undefined) {
			data.id = crypto.randomUUID();
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
		if (data.userId !== undefined) {
			neededStores.add('User');
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
		return neededStores;
	}

	_getNeededStoresForNestedDelete(neededStores: Set<StoreNames<PrismaIDBSchema>>): void {
		neededStores.add('ExerciseSplit');
	}

	private _removeNestedCreateData<
		D extends Prisma.Args<Prisma.ExerciseSplitDelegate, 'create'>['data']
	>(data: D): Prisma.Result<Prisma.ExerciseSplitDelegate, object, 'findFirstOrThrow'> {
		const recordWithoutNestedCreate = structuredClone(data);
		delete recordWithoutNestedCreate?.user;
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
					const booleanFields = ['emailVerified'] as const;
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
				'sessions',
				'accounts',
				'exerciseSplits'
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
			'updatedAt'
		] as const;
		for (const field of scalarFields) if (orderByInput[field]) return record[field];
		if (orderByInput.sessions) {
			return await this.client.session.count({ where: { userId: record.id } }, tx);
		}
		if (orderByInput.accounts) {
			return await this.client.account.count({ where: { userId: record.id } }, tx);
		}
		if (orderByInput.exerciseSplits) {
			return await this.client.exerciseSplit.count({ where: { userId: record.id } }, tx);
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
			'updatedAt'
		] as const;
		for (const field of scalarFields) if (orderByInput[field]) return orderByInput[field];
		if (orderByInput.sessions?._count) {
			return orderByInput.sessions._count;
		}
		if (orderByInput.accounts?._count) {
			return orderByInput.accounts._count;
		}
		if (orderByInput.exerciseSplits?._count) {
			return orderByInput.exerciseSplits._count;
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
		if (query.data?.sessions?.delete || query.data?.sessions?.deleteMany) {
			this.client.session._getNeededStoresForNestedDelete(neededStores);
		}
		if (query.data?.accounts?.delete || query.data?.accounts?.deleteMany) {
			this.client.account._getNeededStoresForNestedDelete(neededStores);
		}
		if (query.data?.exerciseSplits?.delete || query.data?.exerciseSplits?.deleteMany) {
			this.client.exerciseSplit._getNeededStoresForNestedDelete(neededStores);
		}
		if (query.data?.id !== undefined) {
			neededStores.add('ExerciseSplit');
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
	}

	private _removeNestedCreateData<D extends Prisma.Args<Prisma.UserDelegate, 'create'>['data']>(
		data: D
	): Prisma.Result<Prisma.UserDelegate, object, 'findFirstOrThrow'> {
		const recordWithoutNestedCreate = structuredClone(data);
		delete recordWithoutNestedCreate?.sessions;
		delete recordWithoutNestedCreate?.accounts;
		delete recordWithoutNestedCreate?.exerciseSplits;
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
								create: { ...connectOrCreate.create, userId: keyPath[0] } as Prisma.Args<
									Prisma.SessionDelegate,
									'create'
								>['data'],
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
								create: { ...connectOrCreate.create, userId: keyPath[0] } as Prisma.Args<
									Prisma.AccountDelegate,
									'create'
								>['data'],
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
								create: { ...connectOrCreate.create, userId: keyPath[0] } as Prisma.Args<
									Prisma.ExerciseSplitDelegate,
									'create'
								>['data'],
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
		const booleanFields = ['emailVerified'] as const;
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
			const booleanFields = ['emailVerified'] as const;
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
			const booleanFields = ['emailVerified'] as const;
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
		if (data.userId !== undefined) {
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
		if (data.userId !== undefined) {
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
