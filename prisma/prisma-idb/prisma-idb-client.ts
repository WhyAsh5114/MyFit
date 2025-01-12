import { createId } from "@paralleldrive/cuid2";
import type { Prisma } from "@prisma/client";
import type { IDBPDatabase, StoreNames } from "idb";
import { openDB } from "idb";
import type { PrismaIDBSchema } from "./idb-interface";
import * as IDBUtils from "./idb-utils";

/* eslint-disable @typescript-eslint/no-unused-vars */
const IDB_VERSION = 1;

export class PrismaIDBClient {
    private static instance: PrismaIDBClient;
    _db!: IDBPDatabase<PrismaIDBSchema>;

    private constructor() {
    }

    exerciseSplit!: ExerciseSplitIDBClass;
    exerciseSplitDay!: ExerciseSplitDayIDBClass;
    exerciseSplitDaySession!: ExerciseSplitDaySessionIDBClass;
    exercise!: ExerciseIDBClass;
    user!: UserIDBClass;
    session!: SessionIDBClass;
    account!: AccountIDBClass;
    verification!: VerificationIDBClass;

    public static async createClient(): Promise<PrismaIDBClient> {
        if (!PrismaIDBClient.instance)
        {
            const client = new PrismaIDBClient();
            await client.initialize();
            PrismaIDBClient.instance = client;
        }
        return PrismaIDBClient.instance;
    }

    private async initialize() {
        this._db = await openDB<PrismaIDBSchema>('prisma-idb', IDB_VERSION, 
        {
            upgrade(db)
            {
                db.createObjectStore('ExerciseSplit', { keyPath: ["name","userId"] });
                db.createObjectStore('ExerciseSplitDay', { keyPath: ["exerciseSplitName","dayIndex","userId"] });
                db.createObjectStore('ExerciseSplitDaySession', { keyPath: ["exerciseSplitName","dayIndex","sessionIndex","userId"] });
                db.createObjectStore('Exercise', { keyPath: ["splitName","splitDayIndex","sessionIndex","exerciseIndex","userId"] });
                const UserStore = db.createObjectStore('User', { keyPath: ["id"] });
                UserStore.createIndex("emailIndex", ["email"], { unique: true });
                const SessionStore = db.createObjectStore('Session', { keyPath: ["id"] });
                SessionStore.createIndex("tokenIndex", ["token"], { unique: true });
                db.createObjectStore('Account', { keyPath: ["id"] });
                db.createObjectStore('Verification', { keyPath: ["id"] });
            }
        }
        );
        this.exerciseSplit = new ExerciseSplitIDBClass(this, ["name","userId"]);
        this.exerciseSplitDay = new ExerciseSplitDayIDBClass(this, ["exerciseSplitName","dayIndex","userId"]);
        this.exerciseSplitDaySession = new ExerciseSplitDaySessionIDBClass(this, ["exerciseSplitName","dayIndex","sessionIndex","userId"]);
        this.exercise = new ExerciseIDBClass(this, ["splitName","splitDayIndex","sessionIndex","exerciseIndex","userId"]);
        this.user = new UserIDBClass(this, ["id"]);
        this.session = new SessionIDBClass(this, ["id"]);
        this.account = new AccountIDBClass(this, ["id"]);
        this.verification = new VerificationIDBClass(this, ["id"]);
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

    subscribe(event: "create" | "update" | "delete" | ("create" | "update" | "delete")[], callback: (e: CustomEventInit<{ keyPath: PrismaIDBSchema[T]["key"]; oldKeyPath?: PrismaIDBSchema[T]["key"] }>) => void) {
        if (Array.isArray(event))
        {
            event.forEach((event) => this.eventEmitter.addEventListener(event, callback));
            return;
        }
        this.eventEmitter.addEventListener(event, callback);
    }

    unsubscribe(event: "create" | "update" | "delete" | ("create" | "update" | "delete")[], callback: (e: CustomEventInit<{ keyPath: PrismaIDBSchema[T]["key"]; oldKeyPath?: PrismaIDBSchema[T]["key"] }>) => void) {
        if (Array.isArray(event))
        {
            event.forEach((event) => this.eventEmitter.removeEventListener(event, callback));
            return;
        }
        this.eventEmitter.removeEventListener(event, callback);
    }

    protected emit(event: "create" | "update" | "delete", keyPath: PrismaIDBSchema[T]["key"], oldKeyPath?: PrismaIDBSchema[T]["key"]) {
        if (event === "update")
        {
            this.eventEmitter.dispatchEvent(new CustomEvent(event, { detail: { keyPath, oldKeyPath } }));
            return;
        }
        this.eventEmitter.dispatchEvent(new CustomEvent(event, { detail: { keyPath } }));
    }
}

class ExerciseSplitIDBClass extends BaseIDBModelClass<"ExerciseSplit"> {
    private async _applyWhereClause<W extends Prisma.Args<Prisma.ExerciseSplitDelegate, 'findFirstOrThrow'>['where'], R extends Prisma.Result<Prisma.ExerciseSplitDelegate, object, 'findFirstOrThrow'>>(records: R[], whereClause: W, tx: IDBUtils.TransactionType): Promise<R[]> {
        if (!whereClause) return records;
        records = await IDBUtils.applyLogicalFilters<Prisma.ExerciseSplitDelegate, R, W>(
        records, whereClause, tx, this.keyPath, this._applyWhereClause.bind(this),
        )
        return (await Promise.all(records.map(async (record) =>
        {
            const stringFields = ["userId","name","description"] as const;
            for (const field of stringFields)
            {
                if (!IDBUtils.whereStringFilter(record, field, whereClause[field])) return null;
            }
            if (whereClause.user)
            {
                const { is, isNot, ...rest } = whereClause.user
                if (is !== null && is !== undefined)
                {
                    const relatedRecord = await this.client.user.findFirst({ where: { ...is, id: record.userId } }, tx)
                    if (!relatedRecord) return null;
                }
                if (isNot !== null && isNot !== undefined)
                {
                    const relatedRecord = await this.client.user.findFirst({ where: { ...isNot, id: record.userId } }, tx)
                    if (relatedRecord) return null;
                }
                if (Object.keys(rest).length)
                {
                    const relatedRecord = await this.client.user.findFirst({ where: { ...whereClause.user, id: record.userId } }, tx);
                    if (!relatedRecord) return null;
                }
            }
            if (whereClause.splitDays)
            {
                if (whereClause.splitDays.every)
                {
                    const violatingRecord = await this.client.exerciseSplitDay.findFirst(
                    {
                        where: { NOT: { ...whereClause.splitDays.every }, exerciseSplitName: record.name, userId: record.userId }, tx
                    }
                    );
                    if (violatingRecord !== null) return null;
                }
                if (whereClause.splitDays.some)
                {
                    const relatedRecords = await this.client.exerciseSplitDay.findMany(
                    {
                        where: { ...whereClause.splitDays.some, exerciseSplitName: record.name, userId: record.userId }, tx
                    }
                    );
                    if (relatedRecords.length === 0) return null;
                }
                if (whereClause.splitDays.none)
                {
                    const violatingRecord = await this.client.exerciseSplitDay.findFirst(
                    {
                        where: { ...whereClause.splitDays.none, exerciseSplitName: record.name, userId: record.userId }, tx
                    }
                    );
                    if (violatingRecord !== null) return null;
                }
            }
            return record;
        }
        ))).filter((result) => result !== null);;
    }

    private _applySelectClause<S extends Prisma.Args<Prisma.ExerciseSplitDelegate, 'findMany'>['select']>(records: Prisma.Result<Prisma.ExerciseSplitDelegate, object, 'findFirstOrThrow'>[], selectClause: S): Prisma.Result<Prisma.ExerciseSplitDelegate, { select: S }, 'findFirstOrThrow'>[] {
        if (!selectClause)
        {
            return records as Prisma.Result<Prisma.ExerciseSplitDelegate, { select: S }, 'findFirstOrThrow'>[];
        }
        return records.map((record) => 
        {
            const partialRecord: Partial<typeof record> = record;
            for (const untypedKey of ["user","userId","name","description","splitDays"]) 
            {
                const key = untypedKey as keyof typeof record & keyof S;
                if (!selectClause[key]) delete partialRecord[key];
            }
            return partialRecord;
        }
        ) as Prisma.Result<Prisma.ExerciseSplitDelegate, { select: S }, 'findFirstOrThrow'>[];
    }

    private async _applyRelations<Q extends Prisma.Args<Prisma.ExerciseSplitDelegate, 'findMany'>>(records: Prisma.Result<Prisma.ExerciseSplitDelegate, object, 'findFirstOrThrow'>[], tx: IDBUtils.TransactionType, query?: Q): Promise<Prisma.Result<Prisma.ExerciseSplitDelegate, Q, 'findFirstOrThrow'>[]> {
        if (!query) return records as Prisma.Result<Prisma.ExerciseSplitDelegate, Q, 'findFirstOrThrow'>[];
        const recordsWithRelations = records.map(async (record) => 
        {
            const unsafeRecord = record as Record<string, unknown>;
            const attach_user = query.select?.user || query.include?.user;
            if (attach_user)
            {
                unsafeRecord['user'] = 
                await this.client.user.findUnique(
                {
                    ...(attach_user === true ? {} : attach_user),
                    where: { id: record.userId! }
                }
                , tx)
            }
            const attach_splitDays = query.select?.splitDays || query.include?.splitDays;
            if (attach_splitDays)
            {
                unsafeRecord['splitDays'] = await this.client.exerciseSplitDay.findMany(
                {
                    ...(attach_splitDays === true ? {} : attach_splitDays),
                    where: { exerciseSplitName: record.name!, userId: record.userId! }
                }
                , tx)
            }
            return unsafeRecord;
        }
        );
        return (await Promise.all(recordsWithRelations)) as Prisma.Result<Prisma.ExerciseSplitDelegate, Q, 'findFirstOrThrow'>[];
    }

    async _applyOrderByClause<O extends Prisma.Args<Prisma.ExerciseSplitDelegate, 'findMany'>['orderBy'], R extends Prisma.Result<Prisma.ExerciseSplitDelegate, object, "findFirstOrThrow">>(records: R[], orderByClause: O, tx: IDBUtils.TransactionType): Promise<void> {
        if (orderByClause === undefined) return;
        const orderByClauses = IDBUtils.convertToArray(orderByClause);
        const indexedKeys = await Promise.all(
        records.map(async (record) => 
        {
            const keys = await Promise.all(
            orderByClauses.map(async (clause) => await this._resolveOrderByKey(record, clause, tx)),
            );
            return { keys, record };
        }
        ));
        indexedKeys.sort((a, b) => 
        {
            for (let i = 0; i < orderByClauses.length; i++)
            {
                const clause = orderByClauses[i];
                const comparison = IDBUtils.genericComparator(a.keys[i], b.keys[i], this._resolveSortOrder(clause));
                if (comparison !== 0) return comparison;
            }
            return 0;
        }
        );
        for (let i = 0; i < records.length; i++)
        {
            records[i] = indexedKeys[i].record;
        }
    }

    async _resolveOrderByKey(record: Prisma.Result<Prisma.ExerciseSplitDelegate, object, "findFirstOrThrow">, orderByInput: Prisma.ExerciseSplitOrderByWithRelationInput, tx: IDBUtils.TransactionType): Promise<unknown> {
        const scalarFields = ["userId","name","description"] as const;
        for (const field of scalarFields) if (orderByInput[field]) return record[field];
        if (orderByInput.user)
        {
            return await this.client.user._resolveOrderByKey(await this.client.user.findFirstOrThrow({ where: { id: record.userId } }), orderByInput.user, tx);
        }
        if (orderByInput.splitDays)
        {
            return await this.client.exerciseSplitDay.count({ where: { exerciseSplitName: record.name, userId: record.userId } }, tx);
        }
    }

    _resolveSortOrder(orderByInput: Prisma.ExerciseSplitOrderByWithRelationInput): Prisma.SortOrder | { sort: Prisma.SortOrder, nulls?: 'first' | 'last' } {
        const scalarFields = ["userId","name","description"] as const;
        for (const field of scalarFields) if (orderByInput[field]) return orderByInput[field];
        if (orderByInput.user)
        {
            return this.client.user._resolveSortOrder(orderByInput.user);
        }
        if (orderByInput.splitDays?._count)
        {
            return orderByInput.splitDays._count;
        }
        throw new Error("No field in orderBy clause");
    }

    private async _fillDefaults<D extends Prisma.Args<Prisma.ExerciseSplitDelegate, "create">["data"]>(data: D, tx?: IDBUtils.ReadwriteTransactionType): Promise<D> {
        if (data === undefined) data = {} as NonNullable<D>;
        if (data.description === undefined) 
        {
            data.description = null;
        }
        return data;
    }

    _getNeededStoresForWhere<W extends Prisma.Args<Prisma.ExerciseSplitDelegate, "findMany">['where']>(whereClause: W, neededStores: Set<StoreNames<PrismaIDBSchema>>) {
        if (whereClause === undefined) return;
        for (const param of IDBUtils.LogicalParams)
        {
            if (whereClause[param])
            {
                for (const clause of IDBUtils.convertToArray(whereClause[param]))
                {
                    this._getNeededStoresForWhere(clause, neededStores);
                }
            }
        }
        if (whereClause.user)
        {
            neededStores.add("User");
            this.client.user._getNeededStoresForWhere(whereClause.user, neededStores)
        }
        if (whereClause.splitDays)
        {
            neededStores.add("ExerciseSplitDay");
            this.client.exerciseSplitDay._getNeededStoresForWhere(whereClause.splitDays.every, neededStores)
            this.client.exerciseSplitDay._getNeededStoresForWhere(whereClause.splitDays.some, neededStores)
            this.client.exerciseSplitDay._getNeededStoresForWhere(whereClause.splitDays.none, neededStores)
        }
    }

    _getNeededStoresForFind<Q extends Prisma.Args<Prisma.ExerciseSplitDelegate, "findMany">>(query?: Q): Set<StoreNames<PrismaIDBSchema>> {
        const neededStores: Set<StoreNames<PrismaIDBSchema>> = new Set();
        neededStores.add("ExerciseSplit");
        this._getNeededStoresForWhere(query?.where, neededStores);
        if (query?.orderBy)
        {
            const orderBy = IDBUtils.convertToArray(query.orderBy);
            const orderBy_user = orderBy.find((clause) => clause.user);
            if (orderBy_user)
            {
                this.client.user
                ._getNeededStoresForFind({ orderBy: orderBy_user.user })
                .forEach((storeName) => neededStores.add(storeName));
            }
            const orderBy_splitDays = orderBy.find((clause) => clause.splitDays);
            if (orderBy_splitDays)
            {
                neededStores.add("ExerciseSplitDay")
            }
        }
        if (query?.select?.user || query?.include?.user)
        {
            neededStores.add("User");
            if (typeof query.select?.user === "object")
            {
                this.client.user._getNeededStoresForFind(query.select.user).forEach((storeName) => neededStores.add(storeName));
            }
            if (typeof query.include?.user === "object")
            {
                this.client.user._getNeededStoresForFind(query.include.user).forEach((storeName) => neededStores.add(storeName));
            }
        }
        if (query?.select?.splitDays || query?.include?.splitDays)
        {
            neededStores.add("ExerciseSplitDay");
            if (typeof query.select?.splitDays === "object")
            {
                this.client.exerciseSplitDay._getNeededStoresForFind(query.select.splitDays).forEach((storeName) => neededStores.add(storeName));
            }
            if (typeof query.include?.splitDays === "object")
            {
                this.client.exerciseSplitDay._getNeededStoresForFind(query.include.splitDays).forEach((storeName) => neededStores.add(storeName));
            }
        }
        return neededStores;
    }

    _getNeededStoresForCreate<D extends Partial<Prisma.Args<Prisma.ExerciseSplitDelegate, "create">['data']>>(data: D): Set<StoreNames<PrismaIDBSchema>> {
        const neededStores: Set<StoreNames<PrismaIDBSchema>> = new Set();
        neededStores.add("ExerciseSplit");
        if (data?.user)
        {
            neededStores.add('User')
            if (data.user.create)
            {
                const createData = Array.isArray(data.user.create) ? data.user.create : [data.user.create];
                createData.forEach((record) => 
                this.client.user._getNeededStoresForCreate(record).forEach((storeName) => neededStores.add(storeName))
                );
            }
            if (data.user.connectOrCreate)
            {
                IDBUtils.convertToArray(data.user.connectOrCreate).forEach((record) => 
                this.client.user._getNeededStoresForCreate(record.create).forEach((storeName) => neededStores.add(storeName))
                );
            }
        }
        if (data.userId !== undefined)
        {
            neededStores.add("User")
        }
        if (data?.splitDays)
        {
            neededStores.add('ExerciseSplitDay')
            if (data.splitDays.create)
            {
                const createData = Array.isArray(data.splitDays.create) ? data.splitDays.create : [data.splitDays.create];
                createData.forEach((record) => 
                this.client.exerciseSplitDay._getNeededStoresForCreate(record).forEach((storeName) => neededStores.add(storeName))
                );
            }
            if (data.splitDays.connectOrCreate)
            {
                IDBUtils.convertToArray(data.splitDays.connectOrCreate).forEach((record) => 
                this.client.exerciseSplitDay._getNeededStoresForCreate(record.create).forEach((storeName) => neededStores.add(storeName))
                );
            }
            if (data.splitDays.createMany)
            {
                IDBUtils.convertToArray(data.splitDays.createMany.data).forEach((record) => 
                this.client.exerciseSplitDay._getNeededStoresForCreate(record).forEach((storeName) => neededStores.add(storeName))
                );
            }
        }
        return neededStores;
    }

    _getNeededStoresForUpdate<Q extends Prisma.Args<Prisma.ExerciseSplitDelegate, "update">>(query: Partial<Q>): Set<StoreNames<PrismaIDBSchema>> {
        const neededStores = this._getNeededStoresForFind(query).union(this._getNeededStoresForCreate(query.data as Prisma.Args<Prisma.ExerciseSplitDelegate, "create">["data"]));
        if (query.data?.user?.connect)
        {
            neededStores.add("User");
            IDBUtils.convertToArray(query.data.user.connect).forEach((connect) => 
            {
                this.client.user._getNeededStoresForWhere(connect, neededStores);
            }
            );
        }
        if (query.data?.user?.update)
        {
            neededStores.add("User");
            IDBUtils.convertToArray(query.data.user.update).forEach((update) => 
            {
                this.client.user._getNeededStoresForUpdate(update as Prisma.Args<Prisma.UserDelegate, "update">).forEach((store) => neededStores.add(store));
            }
            )
        }
        if (query.data?.user?.upsert)
        {
            neededStores.add("User");
            IDBUtils.convertToArray(query.data.user.upsert).forEach((upsert) => 
            {
                const update = { where: upsert.where, data: { ...upsert.update, ...upsert.create } } as Prisma.Args<Prisma.UserDelegate, "update">;
                this.client.user._getNeededStoresForUpdate(update).forEach((store) => neededStores.add(store));
            }
            )
        }
        if (query.data?.splitDays?.connect)
        {
            neededStores.add("ExerciseSplitDay");
            IDBUtils.convertToArray(query.data.splitDays.connect).forEach((connect) => 
            {
                this.client.exerciseSplitDay._getNeededStoresForWhere(connect, neededStores);
            }
            );
        }
        if (query.data?.splitDays?.set)
        {
            neededStores.add("ExerciseSplitDay");
            IDBUtils.convertToArray(query.data.splitDays.set).forEach((setWhere) => 
            {
                this.client.exerciseSplitDay._getNeededStoresForWhere(setWhere, neededStores);
            }
            )
        }
        if (query.data?.splitDays?.updateMany)
        {
            neededStores.add("ExerciseSplitDay");
            IDBUtils.convertToArray(query.data.splitDays.updateMany).forEach((update) => 
            {
                this.client.exerciseSplitDay._getNeededStoresForUpdate(update as Prisma.Args<Prisma.ExerciseSplitDayDelegate, "update">).forEach((store) => neededStores.add(store));
            }
            )
        }
        if (query.data?.splitDays?.update)
        {
            neededStores.add("ExerciseSplitDay");
            IDBUtils.convertToArray(query.data.splitDays.update).forEach((update) => 
            {
                this.client.exerciseSplitDay._getNeededStoresForUpdate(update as Prisma.Args<Prisma.ExerciseSplitDayDelegate, "update">).forEach((store) => neededStores.add(store));
            }
            )
        }
        if (query.data?.splitDays?.upsert)
        {
            neededStores.add("ExerciseSplitDay");
            IDBUtils.convertToArray(query.data.splitDays.upsert).forEach((upsert) => 
            {
                const update = { where: upsert.where, data: { ...upsert.update, ...upsert.create } } as Prisma.Args<Prisma.ExerciseSplitDayDelegate, "update">;
                this.client.exerciseSplitDay._getNeededStoresForUpdate(update).forEach((store) => neededStores.add(store));
            }
            )
        }
        if (query.data?.splitDays?.delete || query.data?.splitDays?.deleteMany)
        {
            this.client.exerciseSplitDay._getNeededStoresForNestedDelete(neededStores);
        }
        if (query.data?.name !== undefined || query.data?.userId !== undefined)
        {
            neededStores.add("ExerciseSplitDay");
        }
        return neededStores;
    }

    _getNeededStoresForNestedDelete(neededStores: Set<StoreNames<PrismaIDBSchema>>): void {
        neededStores.add("ExerciseSplit");
        this.client.exerciseSplitDay._getNeededStoresForNestedDelete(neededStores);
    }

    private _removeNestedCreateData<D extends Prisma.Args<Prisma.ExerciseSplitDelegate, "create">["data"]>(data: D): Prisma.Result<Prisma.ExerciseSplitDelegate, object, "findFirstOrThrow"> {
        const recordWithoutNestedCreate = structuredClone(data);
        delete recordWithoutNestedCreate?.user;
        delete recordWithoutNestedCreate?.splitDays;
        return recordWithoutNestedCreate as Prisma.Result<Prisma.ExerciseSplitDelegate, object, "findFirstOrThrow">;
    }

    private _preprocessListFields(records: Prisma.Result<Prisma.ExerciseSplitDelegate, object, "findMany">): void {
    }

    async findMany<Q extends Prisma.Args<Prisma.ExerciseSplitDelegate, 'findMany'>>(query?: Q, tx?: IDBUtils.TransactionType): Promise<Prisma.Result<Prisma.ExerciseSplitDelegate, Q, 'findMany'>> {
        tx = tx ?? this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), "readonly");
        const records = await this._applyWhereClause(await tx.objectStore("ExerciseSplit").getAll(), query?.where, tx);
        await this._applyOrderByClause(records, query?.orderBy, tx);
        const relationAppliedRecords = (await this._applyRelations(records, tx, query)) as Prisma.Result<Prisma.ExerciseSplitDelegate, object, 'findFirstOrThrow'>[];
        const selectClause = query?.select;
        let selectAppliedRecords = this._applySelectClause(relationAppliedRecords, selectClause);
        if (query?.distinct)
        {
            const distinctFields = IDBUtils.convertToArray(query.distinct);
            const seen = new Set<string>();
            selectAppliedRecords = selectAppliedRecords.filter((record) => 
            {
                const key = distinctFields.map((field) => record[field]).join("|");
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            }
            );
        }
        this._preprocessListFields(selectAppliedRecords);
        return selectAppliedRecords as Prisma.Result<Prisma.ExerciseSplitDelegate, Q, 'findMany'>;
    }

    async findFirst<Q extends Prisma.Args<Prisma.ExerciseSplitDelegate, 'findFirst'>>(query?: Q, tx?: IDBUtils.TransactionType): Promise<Prisma.Result<Prisma.ExerciseSplitDelegate, Q, 'findFirst'>> {
        tx = tx ?? this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), "readonly");
        return (await this.findMany(query, tx))[0] ?? null;
    }

    async findFirstOrThrow<Q extends Prisma.Args<Prisma.ExerciseSplitDelegate, "findFirstOrThrow">>(query?: Q, tx?: IDBUtils.TransactionType): Promise<Prisma.Result<Prisma.ExerciseSplitDelegate, Q, "findFirstOrThrow">> {
        tx = tx ?? this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), "readonly");
        const record = await this.findFirst(query, tx);
        if (!record)
        {
            tx.abort();
            throw new Error("Record not found");
        }
        return record;
    }

    async findUnique<Q extends Prisma.Args<Prisma.ExerciseSplitDelegate, 'findUnique'>>(query: Q, tx?: IDBUtils.TransactionType): Promise<Prisma.Result<Prisma.ExerciseSplitDelegate, Q, 'findUnique'>> {
        tx = tx ?? this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), "readonly");
        let record;
        if (query.where.name_userId !== undefined)
        {
            record = await tx.objectStore("ExerciseSplit").get([query.where.name_userId.name,query.where.name_userId.userId]);
        }
        if (!record) return null;

        const recordWithRelations = this._applySelectClause(await this._applyRelations(await this._applyWhereClause([record], query.where, tx), tx, query), query.select)[0];
        this._preprocessListFields([recordWithRelations]);
        return recordWithRelations as Prisma.Result<Prisma.ExerciseSplitDelegate, Q, "findUnique">;
    }

    async findUniqueOrThrow<Q extends Prisma.Args<Prisma.ExerciseSplitDelegate, "findUniqueOrThrow">>(query: Q, tx?: IDBUtils.TransactionType): Promise<Prisma.Result<Prisma.ExerciseSplitDelegate, Q, "findUniqueOrThrow">> {
        tx = tx ?? this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), "readonly");
        const record = await this.findUnique(query, tx);
        if (!record)
        {
            tx.abort();
            throw new Error("Record not found");
        }
        return record;
    }

    async count<Q extends Prisma.Args<Prisma.ExerciseSplitDelegate, 'count'>>(query?: Q, tx?: IDBUtils.TransactionType): Promise<Prisma.Result<Prisma.ExerciseSplitDelegate, Q, 'count'>> {
        tx = tx ?? this.client._db.transaction(["ExerciseSplit"], "readonly");
        if (!query?.select || query.select === true)
        {
            const records = await this.findMany({ where: query?.where }, tx);
            return records.length as Prisma.Result<Prisma.ExerciseSplitDelegate, Q, "count">;
        }
        const result: Partial<Record<keyof Prisma.ExerciseSplitCountAggregateInputType, number>> = {};
        for (const key of Object.keys(query.select))
        {
            const typedKey = key as keyof typeof query.select;
            if (typedKey === "_all")
            {
                result[typedKey] = (await this.findMany({ where: query.where }, tx)).length;
                continue;
            }
            result[typedKey] = (await this.findMany({ where: { [`${typedKey}`]: { not: null } } }, tx)).length;
        }
        return result as Prisma.Result<Prisma.ExerciseSplitDelegate, Q, "count">;
    }

    async create<Q extends Prisma.Args<Prisma.ExerciseSplitDelegate, "create">>(query: Q, tx?: IDBUtils.ReadwriteTransactionType): Promise<Prisma.Result<Prisma.ExerciseSplitDelegate, Q, "create">> {
        const storesNeeded = this._getNeededStoresForCreate(query.data);
        tx = tx ?? this.client._db.transaction(Array.from(storesNeeded), "readwrite");
        if (query.data.user)
        {
            const fk: Partial<PrismaIDBSchema['User']['key']> = [];
            if (query.data.user?.create)
            {
                const record = await this.client.user.create({ data: query.data.user.create }, tx);
                fk[0] = record.id
            }
            if (query.data.user?.connect)
            {
                const record = await this.client.user.findUniqueOrThrow({ where: query.data.user.connect }, tx);
                delete query.data.user.connect;
                fk[0] = record.id;
            }
            if (query.data.user?.connectOrCreate)
            {
                const record = await this.client.user.upsert({
                where: query.data.user.connectOrCreate.where,
                create: query.data.user.connectOrCreate.create,
                update: {},
                }, tx);
                fk[0] = record.id;
            }
            const unsafeData = query.data as Record<string, unknown>;
            unsafeData.userId = fk[0];
            delete unsafeData.user;
        }
        else if (query.data?.userId !== undefined && query.data.userId !== null)
        {
            await this.client.user.findUniqueOrThrow(
            {
                where: { id: query.data.userId }
            }
            , tx);
        }
        const record = this._removeNestedCreateData(await this._fillDefaults(query.data, tx));
        const keyPath = await tx.objectStore("ExerciseSplit").add(record);
        if (query.data?.splitDays?.create)
        {
            for (const elem of IDBUtils.convertToArray(query.data.splitDays.create))
            {
                await this.client.exerciseSplitDay.create({ data: { ...elem, exerciseSplit: { connect: { name_userId: { name: keyPath[0], userId: keyPath[1] } } } } as Prisma.Args<Prisma.ExerciseSplitDayDelegate, "create">['data'] }, tx);
            }
        }
        if (query.data?.splitDays?.connect)
        {
            await Promise.all(
                IDBUtils.convertToArray(query.data.splitDays.connect).map(async (connectWhere) => 
                {
                    await this.client.exerciseSplitDay.update({ where: connectWhere, data: { exerciseSplitName: keyPath[0], userId: keyPath[1] } }, tx);
                }
                ),
            );
        }
        if (query.data?.splitDays?.connectOrCreate)
        {
            await Promise.all(
                IDBUtils.convertToArray(query.data.splitDays.connectOrCreate).map(async (connectOrCreate) => 
                {
                    await this.client.exerciseSplitDay.upsert({
                    where: connectOrCreate.where,
                    create: { ...connectOrCreate.create, exerciseSplitName: keyPath[0], userId: keyPath[1] } as Prisma.Args<Prisma.ExerciseSplitDayDelegate, "create">["data"],
                    update: { exerciseSplitName: keyPath[0], userId: keyPath[1] },
                    }, tx);
                }
                ),
            );
        }
        if (query.data?.splitDays?.createMany)
        {
            await this.client.exerciseSplitDay.createMany( {
                data: IDBUtils.convertToArray(query.data.splitDays.createMany.data).map((createData) => (
                {
                    ...createData, exerciseSplitName: keyPath[0], userId: keyPath[1]
                }
                )),
            }
            , tx)
        }
        const data = (await tx.objectStore("ExerciseSplit").get(keyPath))!;
        const recordsWithRelations = this._applySelectClause(await this._applyRelations<object>([data], tx, query), query.select)[0];
        this._preprocessListFields([recordsWithRelations]);
        this.emit("create", keyPath);
        return recordsWithRelations as Prisma.Result<Prisma.ExerciseSplitDelegate, Q, "create">;
    }

    async createMany<Q extends Prisma.Args<Prisma.ExerciseSplitDelegate, "createMany">>(query: Q, tx?: IDBUtils.ReadwriteTransactionType): Promise<Prisma.Result<Prisma.ExerciseSplitDelegate, Q, "createMany">> {
        const createManyData = IDBUtils.convertToArray(query.data);
        tx = tx ?? this.client._db.transaction(["ExerciseSplit"], "readwrite");
        for (const createData of createManyData)
        {
            const record = this._removeNestedCreateData(await this._fillDefaults(createData, tx));
            const keyPath = await tx.objectStore("ExerciseSplit").add(record);
            this.emit("create", keyPath);
        }
        return { count: createManyData.length };
    }

    async createManyAndReturn<Q extends Prisma.Args<Prisma.ExerciseSplitDelegate, "createManyAndReturn">>(query: Q, tx?: IDBUtils.ReadwriteTransactionType): Promise<Prisma.Result<Prisma.ExerciseSplitDelegate, Q, "createManyAndReturn">> {
        const createManyData = IDBUtils.convertToArray(query.data);
        const records: Prisma.Result<Prisma.ExerciseSplitDelegate, object, "findMany"> = [];
        tx = tx ?? this.client._db.transaction(["ExerciseSplit"], "readwrite");
        for (const createData of createManyData)
        {
            const record = this._removeNestedCreateData(await this._fillDefaults(createData, tx));
            const keyPath = await tx.objectStore("ExerciseSplit").add(record);
            this.emit("create", keyPath);
            records.push(this._applySelectClause([record], query.select)[0]);
        }
        this._preprocessListFields(records);
        return records as Prisma.Result<Prisma.ExerciseSplitDelegate, Q, "createManyAndReturn">;
    }

    async delete<Q extends Prisma.Args<Prisma.ExerciseSplitDelegate, 'delete'>>(query: Q, tx?: IDBUtils.ReadwriteTransactionType): Promise<Prisma.Result<Prisma.ExerciseSplitDelegate, Q, 'delete'>> {
        const storesNeeded = this._getNeededStoresForFind(query);
        this._getNeededStoresForNestedDelete(storesNeeded);
        tx = tx ?? this.client._db.transaction(Array.from(storesNeeded), "readwrite");
        const record = await this.findUnique(query, tx);
        if (!record) throw new Error("Record not found");
        const relatedExerciseSplitDay = await this.client.exerciseSplitDay.findMany({ where: { exerciseSplitName: record.name, userId: record.userId } }, tx);
        if (relatedExerciseSplitDay.length) throw new Error("Cannot delete record, other records depend on it");
        await tx.objectStore("ExerciseSplit").delete([record.name, record.userId]);
        this.emit("delete", [record.name, record.userId]);
        return record;
    }

    async deleteMany<Q extends Prisma.Args<Prisma.ExerciseSplitDelegate, 'deleteMany'>>(query?: Q, tx?: IDBUtils.ReadwriteTransactionType): Promise<Prisma.Result<Prisma.ExerciseSplitDelegate, Q, 'deleteMany'>> {
        const storesNeeded = this._getNeededStoresForFind(query);
        this._getNeededStoresForNestedDelete(storesNeeded);
        tx = tx ?? this.client._db.transaction(Array.from(storesNeeded), "readwrite");
        const records = await this.findMany(query, tx);
        for (const record of records)
        {
            await this.delete({ where: { name_userId: { name: record.name, userId: record.userId } } }, tx);
        }
        return { count: records.length };
    }

    async update<Q extends Prisma.Args<Prisma.ExerciseSplitDelegate, 'update'>>(query: Q, tx?: IDBUtils.ReadwriteTransactionType): Promise<Prisma.Result<Prisma.ExerciseSplitDelegate, Q, 'update'>> {
        tx = tx ?? this.client._db.transaction(
        Array.from(this._getNeededStoresForUpdate(query)), "readwrite");
        const record = await this.findUnique({ where: query.where }, tx);
        if (record === null)
        {
            tx.abort();
            throw new Error("Record not found");
        }
        const startKeyPath: PrismaIDBSchema["ExerciseSplit"]["key"] = [record.name,record.userId];
        const stringFields = ["userId","name","description"] as const;
        for (const field of stringFields)
        {
            IDBUtils.handleStringUpdateField(record, field, query.data[field]);
        }
        if (query.data.user)
        {
            if (query.data.user.connect)
            {
                const other = await this.client.user.findUniqueOrThrow({ where: query.data.user.connect }, tx);
                record.userId = other.id;
            }
            if (query.data.user.create)
            {
                const other = await this.client.user.create({ data: query.data.user.create }, tx);
                record.userId = other.id;
            }
            if (query.data.user.update)
            {
                const updateData = query.data.user.update.data ?? query.data.user.update;
                await this.client.user.update({ where: { ...query.data.user.update.where, id: record.userId! } as Prisma.UserWhereUniqueInput, data: updateData }, tx);
            }
            if (query.data.user.upsert)
            {
                await this.client.user.upsert({ where: { ...query.data.user.upsert.where, id: record.userId! } as Prisma.UserWhereUniqueInput, create: { ...query.data.user.upsert.create, id: record.userId! } as Prisma.Args<Prisma.UserDelegate, "upsert">['create'], update: query.data.user.upsert.update, }, tx);
            }
            if (query.data.user.connectOrCreate)
            {
                await this.client.user.upsert(
                {
                    where: { ...query.data.user.connectOrCreate.where, id: record.userId! },
                    create: { ...query.data.user.connectOrCreate.create, id: record.userId! } as Prisma.Args<Prisma.UserDelegate, "upsert">['create'],
                    update: { id: record.userId! },
                }
                , tx);
            }
        }
        if (query.data.splitDays)
        {
            if (query.data.splitDays.connect)
            {
                await Promise.all(
                IDBUtils.convertToArray(query.data.splitDays.connect).map(async (connectWhere) => 
                {
                    await this.client.exerciseSplitDay.update({ where: connectWhere, data: { exerciseSplitName: record.name, userId: record.userId } }, tx);
                }
                ))
            }
            if (query.data.splitDays.disconnect)
            {
                throw new Error("Cannot disconnect required relation");
            }
            if (query.data.splitDays.create)
            {
                const createData = Array.isArray(query.data.splitDays.create)
                ? query.data.splitDays.create
                : [query.data.splitDays.create];
                for (const elem of createData)
                {
                    await this.client.exerciseSplitDay.create({ data: { ...elem, exerciseSplitName: record.name, userId: record.userId }as Prisma.Args<Prisma.ExerciseSplitDayDelegate, "create">["data"] }, tx);
                }
            }
            if (query.data.splitDays.createMany)
            {
                await Promise.all(
                IDBUtils.convertToArray(query.data.splitDays.createMany.data).map(async (createData) => 
                {
                    await this.client.exerciseSplitDay.create({ data: { ...createData, exerciseSplitName: record.name, userId: record.userId } }, tx);
                }
                ))
            }
            if (query.data.splitDays.update)
            {
                await Promise.all(
                IDBUtils.convertToArray(query.data.splitDays.update).map(async (updateData) => 
                {
                    await this.client.exerciseSplitDay.update(updateData, tx);
                }
                ))
            }
            if (query.data.splitDays.updateMany)
            {
                await Promise.all(
                IDBUtils.convertToArray(query.data.splitDays.updateMany).map(async (updateData) => 
                {
                    await this.client.exerciseSplitDay.updateMany(updateData, tx);
                }
                ))
            }
            if (query.data.splitDays.upsert)
            {
                await Promise.all(
                IDBUtils.convertToArray(query.data.splitDays.upsert).map(async (upsertData) => 
                {
                    await this.client.exerciseSplitDay.upsert({ ...upsertData, where: { ...upsertData.where, exerciseSplitName: record.name, userId: record.userId }, create: { ...upsertData.create, exerciseSplitName: record.name, userId: record.userId } as Prisma.Args<Prisma.ExerciseSplitDayDelegate, "upsert">['create'] }, tx);
                }
                ))
            }
            if (query.data.splitDays.delete)
            {
                await Promise.all(
                IDBUtils.convertToArray(query.data.splitDays.delete).map(async (deleteData) => 
                {
                    await this.client.exerciseSplitDay.delete({ where: { ...deleteData, exerciseSplitName: record.name, userId: record.userId } }, tx);
                }
                ))
            }
            if (query.data.splitDays.deleteMany)
            {
                await Promise.all(
                IDBUtils.convertToArray(query.data.splitDays.deleteMany).map(async (deleteData) => 
                {
                    await this.client.exerciseSplitDay.deleteMany({ where: { ...deleteData, exerciseSplitName: record.name, userId: record.userId } }, tx);
                }
                ))
            }
            if (query.data.splitDays.set)
            {
                const existing = await this.client.exerciseSplitDay.findMany({ where: { exerciseSplitName: record.name, userId: record.userId } }, tx);
                if (existing.length > 0)
                {
                    throw new Error("Cannot set required relation");
                }
                await Promise.all(
                IDBUtils.convertToArray(query.data.splitDays.set).map(async (setData) => 
                {
                    await this.client.exerciseSplitDay.update({ where: setData, data: { exerciseSplitName: record.name, userId: record.userId } }, tx);
                }
                ))
            }
        }
        if (query.data.userId !== undefined)
        {
            const related = await this.client.user.findUnique({ where: { id: record.userId } }, tx);
            if (!related) throw new Error("Related record not found");
        }
        const endKeyPath: PrismaIDBSchema["ExerciseSplit"]["key"] = [record.name,record.userId];
        for (let i = 0; i < startKeyPath.length; i++)
        {
            if (startKeyPath[i] !== endKeyPath[i])
            {
                if (await tx.objectStore("ExerciseSplit").get(endKeyPath) !== undefined)
                {
                    throw new Error("Record with the same keyPath already exists");
                }
                await tx.objectStore("ExerciseSplit").delete(startKeyPath);
                break;
            }
        }
        const keyPath = await tx.objectStore("ExerciseSplit").put(record);
        this.emit("update", keyPath, startKeyPath);
        for (let i = 0; i < startKeyPath.length; i++)
        {
            if (startKeyPath[i] !== endKeyPath[i])
            {
                await this.client.exerciseSplitDay.updateMany(
                {
                    where: { exerciseSplitName: startKeyPath[0], userId: startKeyPath[1] },
                    data: { exerciseSplitName: endKeyPath[0], userId: endKeyPath[1] },
                }
                , tx);
                break;
            }
        }
        const recordWithRelations = (await this.findUnique(
        {
            where: { name_userId: { name: keyPath[0], userId: keyPath[1] } },
        }
        , tx))!;
        return recordWithRelations as Prisma.Result<Prisma.ExerciseSplitDelegate, Q, "update">;
    }

    async updateMany<Q extends Prisma.Args<Prisma.ExerciseSplitDelegate, "updateMany">>(query: Q, tx?: IDBUtils.ReadwriteTransactionType): Promise<Prisma.Result<Prisma.ExerciseSplitDelegate, Q, "updateMany">> {
        tx = tx ?? this.client._db.transaction(
        Array.from(this._getNeededStoresForFind(query)), "readwrite");
        const records = await this.findMany({ where: query.where }, tx);
        await Promise.all(
        records.map(async (record) =>
        {
            await this.update({ where: { name_userId: { name: record.name, userId: record.userId } }, data: query.data }, tx);
        }
        ));
        return { count: records.length };
    }

    async upsert<Q extends Prisma.Args<Prisma.ExerciseSplitDelegate, "upsert">>(query: Q, tx?: IDBUtils.ReadwriteTransactionType): Promise<Prisma.Result<Prisma.ExerciseSplitDelegate, Q, "upsert">> {
        const neededStores = this._getNeededStoresForUpdate({ ...query, data: { ...query.update, ...query.create } as Prisma.Args<Prisma.ExerciseSplitDelegate, "update">["data"] });
        tx = tx ?? this.client._db.transaction(Array.from(neededStores), "readwrite");
        let record = await this.findUnique({ where: query.where }, tx);
        if (!record) record = await this.create({ data: query.create }, tx);
        else record = await this.update({ where: query.where, data: query.update }, tx);
        record = await this.findUniqueOrThrow({ where: { name_userId: { name: record.name, userId: record.userId } }, select: query.select, include: query.include }, tx);
        return record as Prisma.Result<Prisma.ExerciseSplitDelegate, Q, "upsert">;
    }

    async aggregate<Q extends Prisma.Args<Prisma.ExerciseSplitDelegate, 'aggregate'>>(query?: Q, tx?: IDBUtils.TransactionType): Promise<Prisma.Result<Prisma.ExerciseSplitDelegate, Q, 'aggregate'>> {
        tx = tx ?? this.client._db.transaction(["ExerciseSplit"], "readonly");
        const records = await this.findMany({ where: query?.where }, tx);
        const result: Partial<Prisma.Result<Prisma.ExerciseSplitDelegate, Q, "aggregate">> = {};
        if (query?._count)
        {
            if (query._count === true)
            {
                (result._count as number) = records.length;
            }
            else
            {
                for (const key of Object.keys(query._count))
                {
                    const typedKey = key as keyof typeof query._count;
                    if (typedKey === "_all")
                    {
                        (result._count as Record<string, number>)[typedKey] = records.length;
                        continue;
                    }
                    (result._count as Record<string, number>)[typedKey] = (
                    await this.findMany({ where: { [`${typedKey}`]: { not: null } } }, tx)
                    ).length;
                }
            }
        }
        if (query?._min)
        {
            const minResult = {} as Prisma.Result<Prisma.ExerciseSplitDelegate, Q, "aggregate">["_min"];
            const stringFields = ["userId","name","description"] as const;
            for (const field of stringFields)
            {
                if (!query._min[field]) continue;
                const values = records.map((record) => record[field] as string).filter((value) => value !== undefined);
                (minResult[field as keyof typeof minResult] as string) = values.sort()[0];
            }
            result._min = minResult;
        }
        if (query?._max)
        {
            const maxResult = {} as Prisma.Result<Prisma.ExerciseSplitDelegate, Q, "aggregate">["_max"];
            const stringFields = ["userId","name","description"] as const;
            for (const field of stringFields)
            {
                if (!query._max[field]) continue;
                const values = records.map((record) => record[field] as string).filter((value) => value !== undefined);
                (maxResult[field as keyof typeof maxResult] as string) = values.sort().reverse()[0];
            }
            result._max = maxResult;
        }
        return result as unknown as Prisma.Result<Prisma.ExerciseSplitDelegate, Q, "aggregate">;
    }
}

class ExerciseSplitDayIDBClass extends BaseIDBModelClass<"ExerciseSplitDay"> {
    private async _applyWhereClause<W extends Prisma.Args<Prisma.ExerciseSplitDayDelegate, 'findFirstOrThrow'>['where'], R extends Prisma.Result<Prisma.ExerciseSplitDayDelegate, object, 'findFirstOrThrow'>>(records: R[], whereClause: W, tx: IDBUtils.TransactionType): Promise<R[]> {
        if (!whereClause) return records;
        records = await IDBUtils.applyLogicalFilters<Prisma.ExerciseSplitDayDelegate, R, W>(
        records, whereClause, tx, this.keyPath, this._applyWhereClause.bind(this),
        )
        return (await Promise.all(records.map(async (record) =>
        {
            const stringFields = ["exerciseSplitName","userId"] as const;
            for (const field of stringFields)
            {
                if (!IDBUtils.whereStringFilter(record, field, whereClause[field])) return null;
            }
            const numberFields = ["dayIndex"] as const;
            for (const field of numberFields)
            {
                if (!IDBUtils.whereNumberFilter(record, field, whereClause[field])) return null;
            }
            if (whereClause.exerciseSplit)
            {
                const { is, isNot, ...rest } = whereClause.exerciseSplit
                if (is !== null && is !== undefined)
                {
                    const relatedRecord = await this.client.exerciseSplit.findFirst({ where: { ...is, name: record.exerciseSplitName, userId: record.userId } }, tx)
                    if (!relatedRecord) return null;
                }
                if (isNot !== null && isNot !== undefined)
                {
                    const relatedRecord = await this.client.exerciseSplit.findFirst({ where: { ...isNot, name: record.exerciseSplitName, userId: record.userId } }, tx)
                    if (relatedRecord) return null;
                }
                if (Object.keys(rest).length)
                {
                    const relatedRecord = await this.client.exerciseSplit.findFirst({ where: { ...whereClause.exerciseSplit, name: record.exerciseSplitName, userId: record.userId } }, tx);
                    if (!relatedRecord) return null;
                }
            }
            if (whereClause.sessions)
            {
                if (whereClause.sessions.every)
                {
                    const violatingRecord = await this.client.exerciseSplitDaySession.findFirst(
                    {
                        where: { NOT: { ...whereClause.sessions.every }, exerciseSplitName: record.exerciseSplitName, dayIndex: record.dayIndex, userId: record.userId }, tx
                    }
                    );
                    if (violatingRecord !== null) return null;
                }
                if (whereClause.sessions.some)
                {
                    const relatedRecords = await this.client.exerciseSplitDaySession.findMany(
                    {
                        where: { ...whereClause.sessions.some, exerciseSplitName: record.exerciseSplitName, dayIndex: record.dayIndex, userId: record.userId }, tx
                    }
                    );
                    if (relatedRecords.length === 0) return null;
                }
                if (whereClause.sessions.none)
                {
                    const violatingRecord = await this.client.exerciseSplitDaySession.findFirst(
                    {
                        where: { ...whereClause.sessions.none, exerciseSplitName: record.exerciseSplitName, dayIndex: record.dayIndex, userId: record.userId }, tx
                    }
                    );
                    if (violatingRecord !== null) return null;
                }
            }
            return record;
        }
        ))).filter((result) => result !== null);;
    }

    private _applySelectClause<S extends Prisma.Args<Prisma.ExerciseSplitDayDelegate, 'findMany'>['select']>(records: Prisma.Result<Prisma.ExerciseSplitDayDelegate, object, 'findFirstOrThrow'>[], selectClause: S): Prisma.Result<Prisma.ExerciseSplitDayDelegate, { select: S }, 'findFirstOrThrow'>[] {
        if (!selectClause)
        {
            return records as Prisma.Result<Prisma.ExerciseSplitDayDelegate, { select: S }, 'findFirstOrThrow'>[];
        }
        return records.map((record) => 
        {
            const partialRecord: Partial<typeof record> = record;
            for (const untypedKey of ["exerciseSplit","exerciseSplitName","userId","dayIndex","sessions"]) 
            {
                const key = untypedKey as keyof typeof record & keyof S;
                if (!selectClause[key]) delete partialRecord[key];
            }
            return partialRecord;
        }
        ) as Prisma.Result<Prisma.ExerciseSplitDayDelegate, { select: S }, 'findFirstOrThrow'>[];
    }

    private async _applyRelations<Q extends Prisma.Args<Prisma.ExerciseSplitDayDelegate, 'findMany'>>(records: Prisma.Result<Prisma.ExerciseSplitDayDelegate, object, 'findFirstOrThrow'>[], tx: IDBUtils.TransactionType, query?: Q): Promise<Prisma.Result<Prisma.ExerciseSplitDayDelegate, Q, 'findFirstOrThrow'>[]> {
        if (!query) return records as Prisma.Result<Prisma.ExerciseSplitDayDelegate, Q, 'findFirstOrThrow'>[];
        const recordsWithRelations = records.map(async (record) => 
        {
            const unsafeRecord = record as Record<string, unknown>;
            const attach_exerciseSplit = query.select?.exerciseSplit || query.include?.exerciseSplit;
            if (attach_exerciseSplit)
            {
                unsafeRecord['exerciseSplit'] = 
                await this.client.exerciseSplit.findUnique(
                {
                    ...(attach_exerciseSplit === true ? {} : attach_exerciseSplit),
                    where: { name_userId: { name: record.exerciseSplitName!, userId: record.userId! } }
                }
                , tx)
            }
            const attach_sessions = query.select?.sessions || query.include?.sessions;
            if (attach_sessions)
            {
                unsafeRecord['sessions'] = await this.client.exerciseSplitDaySession.findMany(
                {
                    ...(attach_sessions === true ? {} : attach_sessions),
                    where: { exerciseSplitName: record.exerciseSplitName!, dayIndex: record.dayIndex!, userId: record.userId! }
                }
                , tx)
            }
            return unsafeRecord;
        }
        );
        return (await Promise.all(recordsWithRelations)) as Prisma.Result<Prisma.ExerciseSplitDayDelegate, Q, 'findFirstOrThrow'>[];
    }

    async _applyOrderByClause<O extends Prisma.Args<Prisma.ExerciseSplitDayDelegate, 'findMany'>['orderBy'], R extends Prisma.Result<Prisma.ExerciseSplitDayDelegate, object, "findFirstOrThrow">>(records: R[], orderByClause: O, tx: IDBUtils.TransactionType): Promise<void> {
        if (orderByClause === undefined) return;
        const orderByClauses = IDBUtils.convertToArray(orderByClause);
        const indexedKeys = await Promise.all(
        records.map(async (record) => 
        {
            const keys = await Promise.all(
            orderByClauses.map(async (clause) => await this._resolveOrderByKey(record, clause, tx)),
            );
            return { keys, record };
        }
        ));
        indexedKeys.sort((a, b) => 
        {
            for (let i = 0; i < orderByClauses.length; i++)
            {
                const clause = orderByClauses[i];
                const comparison = IDBUtils.genericComparator(a.keys[i], b.keys[i], this._resolveSortOrder(clause));
                if (comparison !== 0) return comparison;
            }
            return 0;
        }
        );
        for (let i = 0; i < records.length; i++)
        {
            records[i] = indexedKeys[i].record;
        }
    }

    async _resolveOrderByKey(record: Prisma.Result<Prisma.ExerciseSplitDayDelegate, object, "findFirstOrThrow">, orderByInput: Prisma.ExerciseSplitDayOrderByWithRelationInput, tx: IDBUtils.TransactionType): Promise<unknown> {
        const scalarFields = ["exerciseSplitName","userId","dayIndex"] as const;
        for (const field of scalarFields) if (orderByInput[field]) return record[field];
        if (orderByInput.exerciseSplit)
        {
            return await this.client.exerciseSplit._resolveOrderByKey(await this.client.exerciseSplit.findFirstOrThrow({ where: { name: record.exerciseSplitName } }), orderByInput.exerciseSplit, tx);
        }
        if (orderByInput.sessions)
        {
            return await this.client.exerciseSplitDaySession.count({ where: { exerciseSplitName: record.exerciseSplitName, dayIndex: record.dayIndex, userId: record.userId } }, tx);
        }
    }

    _resolveSortOrder(orderByInput: Prisma.ExerciseSplitDayOrderByWithRelationInput): Prisma.SortOrder | { sort: Prisma.SortOrder, nulls?: 'first' | 'last' } {
        const scalarFields = ["exerciseSplitName","userId","dayIndex"] as const;
        for (const field of scalarFields) if (orderByInput[field]) return orderByInput[field];
        if (orderByInput.exerciseSplit)
        {
            return this.client.exerciseSplit._resolveSortOrder(orderByInput.exerciseSplit);
        }
        if (orderByInput.sessions?._count)
        {
            return orderByInput.sessions._count;
        }
        throw new Error("No field in orderBy clause");
    }

    private async _fillDefaults<D extends Prisma.Args<Prisma.ExerciseSplitDayDelegate, "create">["data"]>(data: D, tx?: IDBUtils.ReadwriteTransactionType): Promise<D> {
        if (data === undefined) data = {} as NonNullable<D>;
        return data;
    }

    _getNeededStoresForWhere<W extends Prisma.Args<Prisma.ExerciseSplitDayDelegate, "findMany">['where']>(whereClause: W, neededStores: Set<StoreNames<PrismaIDBSchema>>) {
        if (whereClause === undefined) return;
        for (const param of IDBUtils.LogicalParams)
        {
            if (whereClause[param])
            {
                for (const clause of IDBUtils.convertToArray(whereClause[param]))
                {
                    this._getNeededStoresForWhere(clause, neededStores);
                }
            }
        }
        if (whereClause.exerciseSplit)
        {
            neededStores.add("ExerciseSplit");
            this.client.exerciseSplit._getNeededStoresForWhere(whereClause.exerciseSplit, neededStores)
        }
        if (whereClause.sessions)
        {
            neededStores.add("ExerciseSplitDaySession");
            this.client.exerciseSplitDaySession._getNeededStoresForWhere(whereClause.sessions.every, neededStores)
            this.client.exerciseSplitDaySession._getNeededStoresForWhere(whereClause.sessions.some, neededStores)
            this.client.exerciseSplitDaySession._getNeededStoresForWhere(whereClause.sessions.none, neededStores)
        }
    }

    _getNeededStoresForFind<Q extends Prisma.Args<Prisma.ExerciseSplitDayDelegate, "findMany">>(query?: Q): Set<StoreNames<PrismaIDBSchema>> {
        const neededStores: Set<StoreNames<PrismaIDBSchema>> = new Set();
        neededStores.add("ExerciseSplitDay");
        this._getNeededStoresForWhere(query?.where, neededStores);
        if (query?.orderBy)
        {
            const orderBy = IDBUtils.convertToArray(query.orderBy);
            const orderBy_exerciseSplit = orderBy.find((clause) => clause.exerciseSplit);
            if (orderBy_exerciseSplit)
            {
                this.client.exerciseSplit
                ._getNeededStoresForFind({ orderBy: orderBy_exerciseSplit.exerciseSplit })
                .forEach((storeName) => neededStores.add(storeName));
            }
            const orderBy_sessions = orderBy.find((clause) => clause.sessions);
            if (orderBy_sessions)
            {
                neededStores.add("ExerciseSplitDaySession")
            }
        }
        if (query?.select?.exerciseSplit || query?.include?.exerciseSplit)
        {
            neededStores.add("ExerciseSplit");
            if (typeof query.select?.exerciseSplit === "object")
            {
                this.client.exerciseSplit._getNeededStoresForFind(query.select.exerciseSplit).forEach((storeName) => neededStores.add(storeName));
            }
            if (typeof query.include?.exerciseSplit === "object")
            {
                this.client.exerciseSplit._getNeededStoresForFind(query.include.exerciseSplit).forEach((storeName) => neededStores.add(storeName));
            }
        }
        if (query?.select?.sessions || query?.include?.sessions)
        {
            neededStores.add("ExerciseSplitDaySession");
            if (typeof query.select?.sessions === "object")
            {
                this.client.exerciseSplitDaySession._getNeededStoresForFind(query.select.sessions).forEach((storeName) => neededStores.add(storeName));
            }
            if (typeof query.include?.sessions === "object")
            {
                this.client.exerciseSplitDaySession._getNeededStoresForFind(query.include.sessions).forEach((storeName) => neededStores.add(storeName));
            }
        }
        return neededStores;
    }

    _getNeededStoresForCreate<D extends Partial<Prisma.Args<Prisma.ExerciseSplitDayDelegate, "create">['data']>>(data: D): Set<StoreNames<PrismaIDBSchema>> {
        const neededStores: Set<StoreNames<PrismaIDBSchema>> = new Set();
        neededStores.add("ExerciseSplitDay");
        if (data?.exerciseSplit)
        {
            neededStores.add('ExerciseSplit')
            if (data.exerciseSplit.create)
            {
                const createData = Array.isArray(data.exerciseSplit.create) ? data.exerciseSplit.create : [data.exerciseSplit.create];
                createData.forEach((record) => 
                this.client.exerciseSplit._getNeededStoresForCreate(record).forEach((storeName) => neededStores.add(storeName))
                );
            }
            if (data.exerciseSplit.connectOrCreate)
            {
                IDBUtils.convertToArray(data.exerciseSplit.connectOrCreate).forEach((record) => 
                this.client.exerciseSplit._getNeededStoresForCreate(record.create).forEach((storeName) => neededStores.add(storeName))
                );
            }
        }
        if (data.exerciseSplitName !== undefined)
        {
            neededStores.add("ExerciseSplit")
        }
        if (data?.sessions)
        {
            neededStores.add('ExerciseSplitDaySession')
            if (data.sessions.create)
            {
                const createData = Array.isArray(data.sessions.create) ? data.sessions.create : [data.sessions.create];
                createData.forEach((record) => 
                this.client.exerciseSplitDaySession._getNeededStoresForCreate(record).forEach((storeName) => neededStores.add(storeName))
                );
            }
            if (data.sessions.connectOrCreate)
            {
                IDBUtils.convertToArray(data.sessions.connectOrCreate).forEach((record) => 
                this.client.exerciseSplitDaySession._getNeededStoresForCreate(record.create).forEach((storeName) => neededStores.add(storeName))
                );
            }
            if (data.sessions.createMany)
            {
                IDBUtils.convertToArray(data.sessions.createMany.data).forEach((record) => 
                this.client.exerciseSplitDaySession._getNeededStoresForCreate(record).forEach((storeName) => neededStores.add(storeName))
                );
            }
        }
        return neededStores;
    }

    _getNeededStoresForUpdate<Q extends Prisma.Args<Prisma.ExerciseSplitDayDelegate, "update">>(query: Partial<Q>): Set<StoreNames<PrismaIDBSchema>> {
        const neededStores = this._getNeededStoresForFind(query).union(this._getNeededStoresForCreate(query.data as Prisma.Args<Prisma.ExerciseSplitDayDelegate, "create">["data"]));
        if (query.data?.exerciseSplit?.connect)
        {
            neededStores.add("ExerciseSplit");
            IDBUtils.convertToArray(query.data.exerciseSplit.connect).forEach((connect) => 
            {
                this.client.exerciseSplit._getNeededStoresForWhere(connect, neededStores);
            }
            );
        }
        if (query.data?.exerciseSplit?.update)
        {
            neededStores.add("ExerciseSplit");
            IDBUtils.convertToArray(query.data.exerciseSplit.update).forEach((update) => 
            {
                this.client.exerciseSplit._getNeededStoresForUpdate(update as Prisma.Args<Prisma.ExerciseSplitDelegate, "update">).forEach((store) => neededStores.add(store));
            }
            )
        }
        if (query.data?.exerciseSplit?.upsert)
        {
            neededStores.add("ExerciseSplit");
            IDBUtils.convertToArray(query.data.exerciseSplit.upsert).forEach((upsert) => 
            {
                const update = { where: upsert.where, data: { ...upsert.update, ...upsert.create } } as Prisma.Args<Prisma.ExerciseSplitDelegate, "update">;
                this.client.exerciseSplit._getNeededStoresForUpdate(update).forEach((store) => neededStores.add(store));
            }
            )
        }
        if (query.data?.sessions?.connect)
        {
            neededStores.add("ExerciseSplitDaySession");
            IDBUtils.convertToArray(query.data.sessions.connect).forEach((connect) => 
            {
                this.client.exerciseSplitDaySession._getNeededStoresForWhere(connect, neededStores);
            }
            );
        }
        if (query.data?.sessions?.set)
        {
            neededStores.add("ExerciseSplitDaySession");
            IDBUtils.convertToArray(query.data.sessions.set).forEach((setWhere) => 
            {
                this.client.exerciseSplitDaySession._getNeededStoresForWhere(setWhere, neededStores);
            }
            )
        }
        if (query.data?.sessions?.updateMany)
        {
            neededStores.add("ExerciseSplitDaySession");
            IDBUtils.convertToArray(query.data.sessions.updateMany).forEach((update) => 
            {
                this.client.exerciseSplitDaySession._getNeededStoresForUpdate(update as Prisma.Args<Prisma.ExerciseSplitDaySessionDelegate, "update">).forEach((store) => neededStores.add(store));
            }
            )
        }
        if (query.data?.sessions?.update)
        {
            neededStores.add("ExerciseSplitDaySession");
            IDBUtils.convertToArray(query.data.sessions.update).forEach((update) => 
            {
                this.client.exerciseSplitDaySession._getNeededStoresForUpdate(update as Prisma.Args<Prisma.ExerciseSplitDaySessionDelegate, "update">).forEach((store) => neededStores.add(store));
            }
            )
        }
        if (query.data?.sessions?.upsert)
        {
            neededStores.add("ExerciseSplitDaySession");
            IDBUtils.convertToArray(query.data.sessions.upsert).forEach((upsert) => 
            {
                const update = { where: upsert.where, data: { ...upsert.update, ...upsert.create } } as Prisma.Args<Prisma.ExerciseSplitDaySessionDelegate, "update">;
                this.client.exerciseSplitDaySession._getNeededStoresForUpdate(update).forEach((store) => neededStores.add(store));
            }
            )
        }
        if (query.data?.sessions?.delete || query.data?.sessions?.deleteMany)
        {
            this.client.exerciseSplitDaySession._getNeededStoresForNestedDelete(neededStores);
        }
        if (query.data?.exerciseSplitName !== undefined || query.data?.dayIndex !== undefined || query.data?.userId !== undefined)
        {
            neededStores.add("ExerciseSplitDaySession");
        }
        return neededStores;
    }

    _getNeededStoresForNestedDelete(neededStores: Set<StoreNames<PrismaIDBSchema>>): void {
        neededStores.add("ExerciseSplitDay");
        this.client.exerciseSplitDaySession._getNeededStoresForNestedDelete(neededStores);
    }

    private _removeNestedCreateData<D extends Prisma.Args<Prisma.ExerciseSplitDayDelegate, "create">["data"]>(data: D): Prisma.Result<Prisma.ExerciseSplitDayDelegate, object, "findFirstOrThrow"> {
        const recordWithoutNestedCreate = structuredClone(data);
        delete recordWithoutNestedCreate?.exerciseSplit;
        delete recordWithoutNestedCreate?.sessions;
        return recordWithoutNestedCreate as Prisma.Result<Prisma.ExerciseSplitDayDelegate, object, "findFirstOrThrow">;
    }

    private _preprocessListFields(records: Prisma.Result<Prisma.ExerciseSplitDayDelegate, object, "findMany">): void {
    }

    async findMany<Q extends Prisma.Args<Prisma.ExerciseSplitDayDelegate, 'findMany'>>(query?: Q, tx?: IDBUtils.TransactionType): Promise<Prisma.Result<Prisma.ExerciseSplitDayDelegate, Q, 'findMany'>> {
        tx = tx ?? this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), "readonly");
        const records = await this._applyWhereClause(await tx.objectStore("ExerciseSplitDay").getAll(), query?.where, tx);
        await this._applyOrderByClause(records, query?.orderBy, tx);
        const relationAppliedRecords = (await this._applyRelations(records, tx, query)) as Prisma.Result<Prisma.ExerciseSplitDayDelegate, object, 'findFirstOrThrow'>[];
        const selectClause = query?.select;
        let selectAppliedRecords = this._applySelectClause(relationAppliedRecords, selectClause);
        if (query?.distinct)
        {
            const distinctFields = IDBUtils.convertToArray(query.distinct);
            const seen = new Set<string>();
            selectAppliedRecords = selectAppliedRecords.filter((record) => 
            {
                const key = distinctFields.map((field) => record[field]).join("|");
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            }
            );
        }
        this._preprocessListFields(selectAppliedRecords);
        return selectAppliedRecords as Prisma.Result<Prisma.ExerciseSplitDayDelegate, Q, 'findMany'>;
    }

    async findFirst<Q extends Prisma.Args<Prisma.ExerciseSplitDayDelegate, 'findFirst'>>(query?: Q, tx?: IDBUtils.TransactionType): Promise<Prisma.Result<Prisma.ExerciseSplitDayDelegate, Q, 'findFirst'>> {
        tx = tx ?? this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), "readonly");
        return (await this.findMany(query, tx))[0] ?? null;
    }

    async findFirstOrThrow<Q extends Prisma.Args<Prisma.ExerciseSplitDayDelegate, "findFirstOrThrow">>(query?: Q, tx?: IDBUtils.TransactionType): Promise<Prisma.Result<Prisma.ExerciseSplitDayDelegate, Q, "findFirstOrThrow">> {
        tx = tx ?? this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), "readonly");
        const record = await this.findFirst(query, tx);
        if (!record)
        {
            tx.abort();
            throw new Error("Record not found");
        }
        return record;
    }

    async findUnique<Q extends Prisma.Args<Prisma.ExerciseSplitDayDelegate, 'findUnique'>>(query: Q, tx?: IDBUtils.TransactionType): Promise<Prisma.Result<Prisma.ExerciseSplitDayDelegate, Q, 'findUnique'>> {
        tx = tx ?? this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), "readonly");
        let record;
        if (query.where.exerciseSplitName_dayIndex_userId !== undefined)
        {
            record = await tx.objectStore("ExerciseSplitDay").get([query.where.exerciseSplitName_dayIndex_userId.exerciseSplitName,query.where.exerciseSplitName_dayIndex_userId.dayIndex,query.where.exerciseSplitName_dayIndex_userId.userId]);
        }
        if (!record) return null;

        const recordWithRelations = this._applySelectClause(await this._applyRelations(await this._applyWhereClause([record], query.where, tx), tx, query), query.select)[0];
        this._preprocessListFields([recordWithRelations]);
        return recordWithRelations as Prisma.Result<Prisma.ExerciseSplitDayDelegate, Q, "findUnique">;
    }

    async findUniqueOrThrow<Q extends Prisma.Args<Prisma.ExerciseSplitDayDelegate, "findUniqueOrThrow">>(query: Q, tx?: IDBUtils.TransactionType): Promise<Prisma.Result<Prisma.ExerciseSplitDayDelegate, Q, "findUniqueOrThrow">> {
        tx = tx ?? this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), "readonly");
        const record = await this.findUnique(query, tx);
        if (!record)
        {
            tx.abort();
            throw new Error("Record not found");
        }
        return record;
    }

    async count<Q extends Prisma.Args<Prisma.ExerciseSplitDayDelegate, 'count'>>(query?: Q, tx?: IDBUtils.TransactionType): Promise<Prisma.Result<Prisma.ExerciseSplitDayDelegate, Q, 'count'>> {
        tx = tx ?? this.client._db.transaction(["ExerciseSplitDay"], "readonly");
        if (!query?.select || query.select === true)
        {
            const records = await this.findMany({ where: query?.where }, tx);
            return records.length as Prisma.Result<Prisma.ExerciseSplitDayDelegate, Q, "count">;
        }
        const result: Partial<Record<keyof Prisma.ExerciseSplitDayCountAggregateInputType, number>> = {};
        for (const key of Object.keys(query.select))
        {
            const typedKey = key as keyof typeof query.select;
            if (typedKey === "_all")
            {
                result[typedKey] = (await this.findMany({ where: query.where }, tx)).length;
                continue;
            }
            result[typedKey] = (await this.findMany({ where: { [`${typedKey}`]: { not: null } } }, tx)).length;
        }
        return result as Prisma.Result<Prisma.ExerciseSplitDayDelegate, Q, "count">;
    }

    async create<Q extends Prisma.Args<Prisma.ExerciseSplitDayDelegate, "create">>(query: Q, tx?: IDBUtils.ReadwriteTransactionType): Promise<Prisma.Result<Prisma.ExerciseSplitDayDelegate, Q, "create">> {
        const storesNeeded = this._getNeededStoresForCreate(query.data);
        tx = tx ?? this.client._db.transaction(Array.from(storesNeeded), "readwrite");
        if (query.data.exerciseSplit)
        {
            const fk: Partial<PrismaIDBSchema['ExerciseSplit']['key']> = [];
            if (query.data.exerciseSplit?.create)
            {
                const record = await this.client.exerciseSplit.create({ data: query.data.exerciseSplit.create }, tx);
                fk[0] = record.name
                fk[1] = record.userId
            }
            if (query.data.exerciseSplit?.connect)
            {
                const record = await this.client.exerciseSplit.findUniqueOrThrow({ where: query.data.exerciseSplit.connect }, tx);
                delete query.data.exerciseSplit.connect;
                fk[0] = record.name;
                fk[1] = record.userId;
            }
            if (query.data.exerciseSplit?.connectOrCreate)
            {
                const record = await this.client.exerciseSplit.upsert({
                where: query.data.exerciseSplit.connectOrCreate.where,
                create: query.data.exerciseSplit.connectOrCreate.create,
                update: {},
                }, tx);
                fk[0] = record.name;
                fk[1] = record.userId;
            }
            const unsafeData = query.data as Record<string, unknown>;
            unsafeData.exerciseSplitName = fk[0];
            unsafeData.userId = fk[1];
            delete unsafeData.exerciseSplit;
        }
        else if (query.data?.exerciseSplitName !== undefined && query.data.exerciseSplitName !== null)
        {
            await this.client.exerciseSplit.findUniqueOrThrow(
            {
                where: { name_userId: { name: query.data.exerciseSplitName, userId: query.data.userId } }
            }
            , tx);
        }
        const record = this._removeNestedCreateData(await this._fillDefaults(query.data, tx));
        const keyPath = await tx.objectStore("ExerciseSplitDay").add(record);
        if (query.data?.sessions?.create)
        {
            for (const elem of IDBUtils.convertToArray(query.data.sessions.create))
            {
                await this.client.exerciseSplitDaySession.create({ data: { ...elem, exerciseSplitDay: { connect: { exerciseSplitName_dayIndex_userId: { exerciseSplitName: keyPath[0], dayIndex: keyPath[1], userId: keyPath[2] } } } } as Prisma.Args<Prisma.ExerciseSplitDaySessionDelegate, "create">['data'] }, tx);
            }
        }
        if (query.data?.sessions?.connect)
        {
            await Promise.all(
                IDBUtils.convertToArray(query.data.sessions.connect).map(async (connectWhere) => 
                {
                    await this.client.exerciseSplitDaySession.update({ where: connectWhere, data: { exerciseSplitName: keyPath[0], dayIndex: keyPath[1], userId: keyPath[2] } }, tx);
                }
                ),
            );
        }
        if (query.data?.sessions?.connectOrCreate)
        {
            await Promise.all(
                IDBUtils.convertToArray(query.data.sessions.connectOrCreate).map(async (connectOrCreate) => 
                {
                    await this.client.exerciseSplitDaySession.upsert({
                    where: connectOrCreate.where,
                    create: { ...connectOrCreate.create, exerciseSplitName: keyPath[0], dayIndex: keyPath[1], userId: keyPath[2] } as Prisma.Args<Prisma.ExerciseSplitDaySessionDelegate, "create">["data"],
                    update: { exerciseSplitName: keyPath[0], dayIndex: keyPath[1], userId: keyPath[2] },
                    }, tx);
                }
                ),
            );
        }
        if (query.data?.sessions?.createMany)
        {
            await this.client.exerciseSplitDaySession.createMany( {
                data: IDBUtils.convertToArray(query.data.sessions.createMany.data).map((createData) => (
                {
                    ...createData, exerciseSplitName: keyPath[0], dayIndex: keyPath[1], userId: keyPath[2]
                }
                )),
            }
            , tx)
        }
        const data = (await tx.objectStore("ExerciseSplitDay").get(keyPath))!;
        const recordsWithRelations = this._applySelectClause(await this._applyRelations<object>([data], tx, query), query.select)[0];
        this._preprocessListFields([recordsWithRelations]);
        this.emit("create", keyPath);
        return recordsWithRelations as Prisma.Result<Prisma.ExerciseSplitDayDelegate, Q, "create">;
    }

    async createMany<Q extends Prisma.Args<Prisma.ExerciseSplitDayDelegate, "createMany">>(query: Q, tx?: IDBUtils.ReadwriteTransactionType): Promise<Prisma.Result<Prisma.ExerciseSplitDayDelegate, Q, "createMany">> {
        const createManyData = IDBUtils.convertToArray(query.data);
        tx = tx ?? this.client._db.transaction(["ExerciseSplitDay"], "readwrite");
        for (const createData of createManyData)
        {
            const record = this._removeNestedCreateData(await this._fillDefaults(createData, tx));
            const keyPath = await tx.objectStore("ExerciseSplitDay").add(record);
            this.emit("create", keyPath);
        }
        return { count: createManyData.length };
    }

    async createManyAndReturn<Q extends Prisma.Args<Prisma.ExerciseSplitDayDelegate, "createManyAndReturn">>(query: Q, tx?: IDBUtils.ReadwriteTransactionType): Promise<Prisma.Result<Prisma.ExerciseSplitDayDelegate, Q, "createManyAndReturn">> {
        const createManyData = IDBUtils.convertToArray(query.data);
        const records: Prisma.Result<Prisma.ExerciseSplitDayDelegate, object, "findMany"> = [];
        tx = tx ?? this.client._db.transaction(["ExerciseSplitDay"], "readwrite");
        for (const createData of createManyData)
        {
            const record = this._removeNestedCreateData(await this._fillDefaults(createData, tx));
            const keyPath = await tx.objectStore("ExerciseSplitDay").add(record);
            this.emit("create", keyPath);
            records.push(this._applySelectClause([record], query.select)[0]);
        }
        this._preprocessListFields(records);
        return records as Prisma.Result<Prisma.ExerciseSplitDayDelegate, Q, "createManyAndReturn">;
    }

    async delete<Q extends Prisma.Args<Prisma.ExerciseSplitDayDelegate, 'delete'>>(query: Q, tx?: IDBUtils.ReadwriteTransactionType): Promise<Prisma.Result<Prisma.ExerciseSplitDayDelegate, Q, 'delete'>> {
        const storesNeeded = this._getNeededStoresForFind(query);
        this._getNeededStoresForNestedDelete(storesNeeded);
        tx = tx ?? this.client._db.transaction(Array.from(storesNeeded), "readwrite");
        const record = await this.findUnique(query, tx);
        if (!record) throw new Error("Record not found");
        const relatedExerciseSplitDaySession = await this.client.exerciseSplitDaySession.findMany({ where: { exerciseSplitName: record.exerciseSplitName, dayIndex: record.dayIndex, userId: record.userId } }, tx);
        if (relatedExerciseSplitDaySession.length) throw new Error("Cannot delete record, other records depend on it");
        await tx.objectStore("ExerciseSplitDay").delete([record.exerciseSplitName, record.dayIndex, record.userId]);
        this.emit("delete", [record.exerciseSplitName, record.dayIndex, record.userId]);
        return record;
    }

    async deleteMany<Q extends Prisma.Args<Prisma.ExerciseSplitDayDelegate, 'deleteMany'>>(query?: Q, tx?: IDBUtils.ReadwriteTransactionType): Promise<Prisma.Result<Prisma.ExerciseSplitDayDelegate, Q, 'deleteMany'>> {
        const storesNeeded = this._getNeededStoresForFind(query);
        this._getNeededStoresForNestedDelete(storesNeeded);
        tx = tx ?? this.client._db.transaction(Array.from(storesNeeded), "readwrite");
        const records = await this.findMany(query, tx);
        for (const record of records)
        {
            await this.delete({ where: { exerciseSplitName_dayIndex_userId: { exerciseSplitName: record.exerciseSplitName, dayIndex: record.dayIndex, userId: record.userId } } }, tx);
        }
        return { count: records.length };
    }

    async update<Q extends Prisma.Args<Prisma.ExerciseSplitDayDelegate, 'update'>>(query: Q, tx?: IDBUtils.ReadwriteTransactionType): Promise<Prisma.Result<Prisma.ExerciseSplitDayDelegate, Q, 'update'>> {
        tx = tx ?? this.client._db.transaction(
        Array.from(this._getNeededStoresForUpdate(query)), "readwrite");
        const record = await this.findUnique({ where: query.where }, tx);
        if (record === null)
        {
            tx.abort();
            throw new Error("Record not found");
        }
        const startKeyPath: PrismaIDBSchema["ExerciseSplitDay"]["key"] = [record.exerciseSplitName,record.dayIndex,record.userId];
        const stringFields = ["exerciseSplitName","userId"] as const;
        for (const field of stringFields)
        {
            IDBUtils.handleStringUpdateField(record, field, query.data[field]);
        }
        const intFields = ["dayIndex"] as const;
        for (const field of intFields)
        {
            IDBUtils.handleIntUpdateField(record, field, query.data[field]);
        }
        if (query.data.exerciseSplit)
        {
            if (query.data.exerciseSplit.connect)
            {
                const other = await this.client.exerciseSplit.findUniqueOrThrow({ where: query.data.exerciseSplit.connect }, tx);
                record.exerciseSplitName = other.name;
                record.userId = other.userId;
            }
            if (query.data.exerciseSplit.create)
            {
                const other = await this.client.exerciseSplit.create({ data: query.data.exerciseSplit.create }, tx);
                record.exerciseSplitName = other.name;
                record.userId = other.userId;
            }
            if (query.data.exerciseSplit.update)
            {
                const updateData = query.data.exerciseSplit.update.data ?? query.data.exerciseSplit.update;
                await this.client.exerciseSplit.update({ where: { ...query.data.exerciseSplit.update.where, name_userId : { name: record.exerciseSplitName, userId: record.userId } } as Prisma.ExerciseSplitWhereUniqueInput, data: updateData }, tx);
            }
            if (query.data.exerciseSplit.upsert)
            {
                await this.client.exerciseSplit.upsert({ where: { ...query.data.exerciseSplit.upsert.where, name_userId : { name: record.exerciseSplitName, userId: record.userId } } as Prisma.ExerciseSplitWhereUniqueInput, create: { ...query.data.exerciseSplit.upsert.create, name: record.exerciseSplitName!, userId: record.userId! } as Prisma.Args<Prisma.ExerciseSplitDelegate, "upsert">['create'], update: query.data.exerciseSplit.upsert.update, }, tx);
            }
            if (query.data.exerciseSplit.connectOrCreate)
            {
                await this.client.exerciseSplit.upsert(
                {
                    where: { ...query.data.exerciseSplit.connectOrCreate.where, name_userId : { name: record.exerciseSplitName, userId: record.userId } },
                    create: { ...query.data.exerciseSplit.connectOrCreate.create, name: record.exerciseSplitName!, userId: record.userId! } as Prisma.Args<Prisma.ExerciseSplitDelegate, "upsert">['create'],
                    update: { name: record.exerciseSplitName!, userId: record.userId! },
                }
                , tx);
            }
        }
        if (query.data.sessions)
        {
            if (query.data.sessions.connect)
            {
                await Promise.all(
                IDBUtils.convertToArray(query.data.sessions.connect).map(async (connectWhere) => 
                {
                    await this.client.exerciseSplitDaySession.update({ where: connectWhere, data: { exerciseSplitName: record.exerciseSplitName, dayIndex: record.dayIndex, userId: record.userId } }, tx);
                }
                ))
            }
            if (query.data.sessions.disconnect)
            {
                throw new Error("Cannot disconnect required relation");
            }
            if (query.data.sessions.create)
            {
                const createData = Array.isArray(query.data.sessions.create)
                ? query.data.sessions.create
                : [query.data.sessions.create];
                for (const elem of createData)
                {
                    await this.client.exerciseSplitDaySession.create({ data: { ...elem, exerciseSplitName: record.exerciseSplitName, dayIndex: record.dayIndex, userId: record.userId }as Prisma.Args<Prisma.ExerciseSplitDaySessionDelegate, "create">["data"] }, tx);
                }
            }
            if (query.data.sessions.createMany)
            {
                await Promise.all(
                IDBUtils.convertToArray(query.data.sessions.createMany.data).map(async (createData) => 
                {
                    await this.client.exerciseSplitDaySession.create({ data: { ...createData, exerciseSplitName: record.exerciseSplitName, dayIndex: record.dayIndex, userId: record.userId } }, tx);
                }
                ))
            }
            if (query.data.sessions.update)
            {
                await Promise.all(
                IDBUtils.convertToArray(query.data.sessions.update).map(async (updateData) => 
                {
                    await this.client.exerciseSplitDaySession.update(updateData, tx);
                }
                ))
            }
            if (query.data.sessions.updateMany)
            {
                await Promise.all(
                IDBUtils.convertToArray(query.data.sessions.updateMany).map(async (updateData) => 
                {
                    await this.client.exerciseSplitDaySession.updateMany(updateData, tx);
                }
                ))
            }
            if (query.data.sessions.upsert)
            {
                await Promise.all(
                IDBUtils.convertToArray(query.data.sessions.upsert).map(async (upsertData) => 
                {
                    await this.client.exerciseSplitDaySession.upsert({ ...upsertData, where: { ...upsertData.where, exerciseSplitName: record.exerciseSplitName, dayIndex: record.dayIndex, userId: record.userId }, create: { ...upsertData.create, exerciseSplitName: record.exerciseSplitName, dayIndex: record.dayIndex, userId: record.userId } as Prisma.Args<Prisma.ExerciseSplitDaySessionDelegate, "upsert">['create'] }, tx);
                }
                ))
            }
            if (query.data.sessions.delete)
            {
                await Promise.all(
                IDBUtils.convertToArray(query.data.sessions.delete).map(async (deleteData) => 
                {
                    await this.client.exerciseSplitDaySession.delete({ where: { ...deleteData, exerciseSplitName: record.exerciseSplitName, dayIndex: record.dayIndex, userId: record.userId } }, tx);
                }
                ))
            }
            if (query.data.sessions.deleteMany)
            {
                await Promise.all(
                IDBUtils.convertToArray(query.data.sessions.deleteMany).map(async (deleteData) => 
                {
                    await this.client.exerciseSplitDaySession.deleteMany({ where: { ...deleteData, exerciseSplitName: record.exerciseSplitName, dayIndex: record.dayIndex, userId: record.userId } }, tx);
                }
                ))
            }
            if (query.data.sessions.set)
            {
                const existing = await this.client.exerciseSplitDaySession.findMany({ where: { exerciseSplitName: record.exerciseSplitName, dayIndex: record.dayIndex, userId: record.userId } }, tx);
                if (existing.length > 0)
                {
                    throw new Error("Cannot set required relation");
                }
                await Promise.all(
                IDBUtils.convertToArray(query.data.sessions.set).map(async (setData) => 
                {
                    await this.client.exerciseSplitDaySession.update({ where: setData, data: { exerciseSplitName: record.exerciseSplitName, dayIndex: record.dayIndex, userId: record.userId } }, tx);
                }
                ))
            }
        }
        if (query.data.exerciseSplitName !== undefined || query.data.userId !== undefined)
        {
            const related = await this.client.exerciseSplit.findUnique({ where: { name_userId: { name: record.exerciseSplitName, userId: record.userId } } }, tx);
            if (!related) throw new Error("Related record not found");
        }
        const endKeyPath: PrismaIDBSchema["ExerciseSplitDay"]["key"] = [record.exerciseSplitName,record.dayIndex,record.userId];
        for (let i = 0; i < startKeyPath.length; i++)
        {
            if (startKeyPath[i] !== endKeyPath[i])
            {
                if (await tx.objectStore("ExerciseSplitDay").get(endKeyPath) !== undefined)
                {
                    throw new Error("Record with the same keyPath already exists");
                }
                await tx.objectStore("ExerciseSplitDay").delete(startKeyPath);
                break;
            }
        }
        const keyPath = await tx.objectStore("ExerciseSplitDay").put(record);
        this.emit("update", keyPath, startKeyPath);
        for (let i = 0; i < startKeyPath.length; i++)
        {
            if (startKeyPath[i] !== endKeyPath[i])
            {
                await this.client.exerciseSplitDaySession.updateMany(
                {
                    where: { exerciseSplitName: startKeyPath[0], dayIndex: startKeyPath[1], userId: startKeyPath[2] },
                    data: { exerciseSplitName: endKeyPath[0], dayIndex: endKeyPath[1], userId: endKeyPath[2] },
                }
                , tx);
                break;
            }
        }
        const recordWithRelations = (await this.findUnique(
        {
            where: { exerciseSplitName_dayIndex_userId: { exerciseSplitName: keyPath[0], dayIndex: keyPath[1], userId: keyPath[2] } },
        }
        , tx))!;
        return recordWithRelations as Prisma.Result<Prisma.ExerciseSplitDayDelegate, Q, "update">;
    }

    async updateMany<Q extends Prisma.Args<Prisma.ExerciseSplitDayDelegate, "updateMany">>(query: Q, tx?: IDBUtils.ReadwriteTransactionType): Promise<Prisma.Result<Prisma.ExerciseSplitDayDelegate, Q, "updateMany">> {
        tx = tx ?? this.client._db.transaction(
        Array.from(this._getNeededStoresForFind(query)), "readwrite");
        const records = await this.findMany({ where: query.where }, tx);
        await Promise.all(
        records.map(async (record) =>
        {
            await this.update({ where: { exerciseSplitName_dayIndex_userId: { exerciseSplitName: record.exerciseSplitName, dayIndex: record.dayIndex, userId: record.userId } }, data: query.data }, tx);
        }
        ));
        return { count: records.length };
    }

    async upsert<Q extends Prisma.Args<Prisma.ExerciseSplitDayDelegate, "upsert">>(query: Q, tx?: IDBUtils.ReadwriteTransactionType): Promise<Prisma.Result<Prisma.ExerciseSplitDayDelegate, Q, "upsert">> {
        const neededStores = this._getNeededStoresForUpdate({ ...query, data: { ...query.update, ...query.create } as Prisma.Args<Prisma.ExerciseSplitDayDelegate, "update">["data"] });
        tx = tx ?? this.client._db.transaction(Array.from(neededStores), "readwrite");
        let record = await this.findUnique({ where: query.where }, tx);
        if (!record) record = await this.create({ data: query.create }, tx);
        else record = await this.update({ where: query.where, data: query.update }, tx);
        record = await this.findUniqueOrThrow({ where: { exerciseSplitName_dayIndex_userId: { exerciseSplitName: record.exerciseSplitName, dayIndex: record.dayIndex, userId: record.userId } }, select: query.select, include: query.include }, tx);
        return record as Prisma.Result<Prisma.ExerciseSplitDayDelegate, Q, "upsert">;
    }

    async aggregate<Q extends Prisma.Args<Prisma.ExerciseSplitDayDelegate, 'aggregate'>>(query?: Q, tx?: IDBUtils.TransactionType): Promise<Prisma.Result<Prisma.ExerciseSplitDayDelegate, Q, 'aggregate'>> {
        tx = tx ?? this.client._db.transaction(["ExerciseSplitDay"], "readonly");
        const records = await this.findMany({ where: query?.where }, tx);
        const result: Partial<Prisma.Result<Prisma.ExerciseSplitDayDelegate, Q, "aggregate">> = {};
        if (query?._count)
        {
            if (query._count === true)
            {
                (result._count as number) = records.length;
            }
            else
            {
                for (const key of Object.keys(query._count))
                {
                    const typedKey = key as keyof typeof query._count;
                    if (typedKey === "_all")
                    {
                        (result._count as Record<string, number>)[typedKey] = records.length;
                        continue;
                    }
                    (result._count as Record<string, number>)[typedKey] = (
                    await this.findMany({ where: { [`${typedKey}`]: { not: null } } }, tx)
                    ).length;
                }
            }
        }
        if (query?._min)
        {
            const minResult = {} as Prisma.Result<Prisma.ExerciseSplitDayDelegate, Q, "aggregate">["_min"];
            const numericFields = ["dayIndex"] as const;
            for (const field of numericFields)
            {
                if (!query._min[field]) continue;
                const values = records.map((record) => record[field] as number).filter((value) => value !== undefined);
                (minResult[field as keyof typeof minResult] as number) = Math.min(...values);
            }
            const stringFields = ["exerciseSplitName","userId"] as const;
            for (const field of stringFields)
            {
                if (!query._min[field]) continue;
                const values = records.map((record) => record[field] as string).filter((value) => value !== undefined);
                (minResult[field as keyof typeof minResult] as string) = values.sort()[0];
            }
            result._min = minResult;
        }
        if (query?._max)
        {
            const maxResult = {} as Prisma.Result<Prisma.ExerciseSplitDayDelegate, Q, "aggregate">["_max"];
            const numericFields = ["dayIndex"] as const;
            for (const field of numericFields)
            {
                if (!query._max[field]) continue;
                const values = records.map((record) => record[field] as number).filter((value) => value !== undefined);
                (maxResult[field as keyof typeof maxResult] as number) = Math.max(...values);
            }
            const stringFields = ["exerciseSplitName","userId"] as const;
            for (const field of stringFields)
            {
                if (!query._max[field]) continue;
                const values = records.map((record) => record[field] as string).filter((value) => value !== undefined);
                (maxResult[field as keyof typeof maxResult] as string) = values.sort().reverse()[0];
            }
            result._max = maxResult;
        }
        if (query?._avg)
        {
            const avgResult = {} as Prisma.Result<Prisma.ExerciseSplitDayDelegate, Q, "aggregate">["_avg"];
            for (const untypedField of Object.keys(query._avg))
            {
                const field = untypedField as keyof (typeof records)[number];
                const values = records.map((record) => record[field] as number);
                (avgResult[field as keyof typeof avgResult] as number) = values.reduce((a, b) => a + b, 0) / values.length;
            }
            result._avg = avgResult;
        }
        if (query?._sum)
        {
            const sumResult = {} as Prisma.Result<Prisma.ExerciseSplitDayDelegate, Q, "aggregate">["_sum"];
            for (const untypedField of Object.keys(query._sum))
            {
                const field = untypedField as keyof (typeof records)[number];
                const values = records.map((record) => record[field] as number);
                (sumResult[field as keyof typeof sumResult] as number) = values.reduce((a, b) => a + b, 0);
            }
            result._sum = sumResult;
        }
        return result as unknown as Prisma.Result<Prisma.ExerciseSplitDayDelegate, Q, "aggregate">;
    }
}

class ExerciseSplitDaySessionIDBClass extends BaseIDBModelClass<"ExerciseSplitDaySession"> {
    private async _applyWhereClause<W extends Prisma.Args<Prisma.ExerciseSplitDaySessionDelegate, 'findFirstOrThrow'>['where'], R extends Prisma.Result<Prisma.ExerciseSplitDaySessionDelegate, object, 'findFirstOrThrow'>>(records: R[], whereClause: W, tx: IDBUtils.TransactionType): Promise<R[]> {
        if (!whereClause) return records;
        records = await IDBUtils.applyLogicalFilters<Prisma.ExerciseSplitDaySessionDelegate, R, W>(
        records, whereClause, tx, this.keyPath, this._applyWhereClause.bind(this),
        )
        return (await Promise.all(records.map(async (record) =>
        {
            const stringFields = ["exerciseSplitName","userId","name"] as const;
            for (const field of stringFields)
            {
                if (!IDBUtils.whereStringFilter(record, field, whereClause[field])) return null;
            }
            const numberFields = ["dayIndex","sessionIndex"] as const;
            for (const field of numberFields)
            {
                if (!IDBUtils.whereNumberFilter(record, field, whereClause[field])) return null;
            }
            if (whereClause.exerciseSplitDay)
            {
                const { is, isNot, ...rest } = whereClause.exerciseSplitDay
                if (is !== null && is !== undefined)
                {
                    const relatedRecord = await this.client.exerciseSplitDay.findFirst({ where: { ...is, exerciseSplitName: record.exerciseSplitName, dayIndex: record.dayIndex, userId: record.userId } }, tx)
                    if (!relatedRecord) return null;
                }
                if (isNot !== null && isNot !== undefined)
                {
                    const relatedRecord = await this.client.exerciseSplitDay.findFirst({ where: { ...isNot, exerciseSplitName: record.exerciseSplitName, dayIndex: record.dayIndex, userId: record.userId } }, tx)
                    if (relatedRecord) return null;
                }
                if (Object.keys(rest).length)
                {
                    const relatedRecord = await this.client.exerciseSplitDay.findFirst({ where: { ...whereClause.exerciseSplitDay, exerciseSplitName: record.exerciseSplitName, dayIndex: record.dayIndex, userId: record.userId } }, tx);
                    if (!relatedRecord) return null;
                }
            }
            if (whereClause.Exercise)
            {
                if (whereClause.Exercise.every)
                {
                    const violatingRecord = await this.client.exercise.findFirst(
                    {
                        where: { NOT: { ...whereClause.Exercise.every }, splitName: record.exerciseSplitName, splitDayIndex: record.dayIndex, sessionIndex: record.sessionIndex, userId: record.userId }, tx
                    }
                    );
                    if (violatingRecord !== null) return null;
                }
                if (whereClause.Exercise.some)
                {
                    const relatedRecords = await this.client.exercise.findMany(
                    {
                        where: { ...whereClause.Exercise.some, splitName: record.exerciseSplitName, splitDayIndex: record.dayIndex, sessionIndex: record.sessionIndex, userId: record.userId }, tx
                    }
                    );
                    if (relatedRecords.length === 0) return null;
                }
                if (whereClause.Exercise.none)
                {
                    const violatingRecord = await this.client.exercise.findFirst(
                    {
                        where: { ...whereClause.Exercise.none, splitName: record.exerciseSplitName, splitDayIndex: record.dayIndex, sessionIndex: record.sessionIndex, userId: record.userId }, tx
                    }
                    );
                    if (violatingRecord !== null) return null;
                }
            }
            return record;
        }
        ))).filter((result) => result !== null);;
    }

    private _applySelectClause<S extends Prisma.Args<Prisma.ExerciseSplitDaySessionDelegate, 'findMany'>['select']>(records: Prisma.Result<Prisma.ExerciseSplitDaySessionDelegate, object, 'findFirstOrThrow'>[], selectClause: S): Prisma.Result<Prisma.ExerciseSplitDaySessionDelegate, { select: S }, 'findFirstOrThrow'>[] {
        if (!selectClause)
        {
            return records as Prisma.Result<Prisma.ExerciseSplitDaySessionDelegate, { select: S }, 'findFirstOrThrow'>[];
        }
        return records.map((record) => 
        {
            const partialRecord: Partial<typeof record> = record;
            for (const untypedKey of ["exerciseSplitDay","exerciseSplitName","dayIndex","userId","sessionIndex","name","Exercise"]) 
            {
                const key = untypedKey as keyof typeof record & keyof S;
                if (!selectClause[key]) delete partialRecord[key];
            }
            return partialRecord;
        }
        ) as Prisma.Result<Prisma.ExerciseSplitDaySessionDelegate, { select: S }, 'findFirstOrThrow'>[];
    }

    private async _applyRelations<Q extends Prisma.Args<Prisma.ExerciseSplitDaySessionDelegate, 'findMany'>>(records: Prisma.Result<Prisma.ExerciseSplitDaySessionDelegate, object, 'findFirstOrThrow'>[], tx: IDBUtils.TransactionType, query?: Q): Promise<Prisma.Result<Prisma.ExerciseSplitDaySessionDelegate, Q, 'findFirstOrThrow'>[]> {
        if (!query) return records as Prisma.Result<Prisma.ExerciseSplitDaySessionDelegate, Q, 'findFirstOrThrow'>[];
        const recordsWithRelations = records.map(async (record) => 
        {
            const unsafeRecord = record as Record<string, unknown>;
            const attach_exerciseSplitDay = query.select?.exerciseSplitDay || query.include?.exerciseSplitDay;
            if (attach_exerciseSplitDay)
            {
                unsafeRecord['exerciseSplitDay'] = 
                await this.client.exerciseSplitDay.findUnique(
                {
                    ...(attach_exerciseSplitDay === true ? {} : attach_exerciseSplitDay),
                    where: { exerciseSplitName_dayIndex_userId: { exerciseSplitName: record.exerciseSplitName!, dayIndex: record.dayIndex!, userId: record.userId! } }
                }
                , tx)
            }
            const attach_Exercise = query.select?.Exercise || query.include?.Exercise;
            if (attach_Exercise)
            {
                unsafeRecord['Exercise'] = await this.client.exercise.findMany(
                {
                    ...(attach_Exercise === true ? {} : attach_Exercise),
                    where: { splitName: record.exerciseSplitName!, splitDayIndex: record.dayIndex!, sessionIndex: record.sessionIndex!, userId: record.userId! }
                }
                , tx)
            }
            return unsafeRecord;
        }
        );
        return (await Promise.all(recordsWithRelations)) as Prisma.Result<Prisma.ExerciseSplitDaySessionDelegate, Q, 'findFirstOrThrow'>[];
    }

    async _applyOrderByClause<O extends Prisma.Args<Prisma.ExerciseSplitDaySessionDelegate, 'findMany'>['orderBy'], R extends Prisma.Result<Prisma.ExerciseSplitDaySessionDelegate, object, "findFirstOrThrow">>(records: R[], orderByClause: O, tx: IDBUtils.TransactionType): Promise<void> {
        if (orderByClause === undefined) return;
        const orderByClauses = IDBUtils.convertToArray(orderByClause);
        const indexedKeys = await Promise.all(
        records.map(async (record) => 
        {
            const keys = await Promise.all(
            orderByClauses.map(async (clause) => await this._resolveOrderByKey(record, clause, tx)),
            );
            return { keys, record };
        }
        ));
        indexedKeys.sort((a, b) => 
        {
            for (let i = 0; i < orderByClauses.length; i++)
            {
                const clause = orderByClauses[i];
                const comparison = IDBUtils.genericComparator(a.keys[i], b.keys[i], this._resolveSortOrder(clause));
                if (comparison !== 0) return comparison;
            }
            return 0;
        }
        );
        for (let i = 0; i < records.length; i++)
        {
            records[i] = indexedKeys[i].record;
        }
    }

    async _resolveOrderByKey(record: Prisma.Result<Prisma.ExerciseSplitDaySessionDelegate, object, "findFirstOrThrow">, orderByInput: Prisma.ExerciseSplitDaySessionOrderByWithRelationInput, tx: IDBUtils.TransactionType): Promise<unknown> {
        const scalarFields = ["exerciseSplitName","dayIndex","userId","sessionIndex","name"] as const;
        for (const field of scalarFields) if (orderByInput[field]) return record[field];
        if (orderByInput.exerciseSplitDay)
        {
            return await this.client.exerciseSplitDay._resolveOrderByKey(await this.client.exerciseSplitDay.findFirstOrThrow({ where: { exerciseSplitName: record.exerciseSplitName } }), orderByInput.exerciseSplitDay, tx);
        }
        if (orderByInput.Exercise)
        {
            return await this.client.exercise.count({ where: { splitName: record.exerciseSplitName, splitDayIndex: record.dayIndex, sessionIndex: record.sessionIndex, userId: record.userId } }, tx);
        }
    }

    _resolveSortOrder(orderByInput: Prisma.ExerciseSplitDaySessionOrderByWithRelationInput): Prisma.SortOrder | { sort: Prisma.SortOrder, nulls?: 'first' | 'last' } {
        const scalarFields = ["exerciseSplitName","dayIndex","userId","sessionIndex","name"] as const;
        for (const field of scalarFields) if (orderByInput[field]) return orderByInput[field];
        if (orderByInput.exerciseSplitDay)
        {
            return this.client.exerciseSplitDay._resolveSortOrder(orderByInput.exerciseSplitDay);
        }
        if (orderByInput.Exercise?._count)
        {
            return orderByInput.Exercise._count;
        }
        throw new Error("No field in orderBy clause");
    }

    private async _fillDefaults<D extends Prisma.Args<Prisma.ExerciseSplitDaySessionDelegate, "create">["data"]>(data: D, tx?: IDBUtils.ReadwriteTransactionType): Promise<D> {
        if (data === undefined) data = {} as NonNullable<D>;
        return data;
    }

    _getNeededStoresForWhere<W extends Prisma.Args<Prisma.ExerciseSplitDaySessionDelegate, "findMany">['where']>(whereClause: W, neededStores: Set<StoreNames<PrismaIDBSchema>>) {
        if (whereClause === undefined) return;
        for (const param of IDBUtils.LogicalParams)
        {
            if (whereClause[param])
            {
                for (const clause of IDBUtils.convertToArray(whereClause[param]))
                {
                    this._getNeededStoresForWhere(clause, neededStores);
                }
            }
        }
        if (whereClause.exerciseSplitDay)
        {
            neededStores.add("ExerciseSplitDay");
            this.client.exerciseSplitDay._getNeededStoresForWhere(whereClause.exerciseSplitDay, neededStores)
        }
        if (whereClause.Exercise)
        {
            neededStores.add("Exercise");
            this.client.exercise._getNeededStoresForWhere(whereClause.Exercise.every, neededStores)
            this.client.exercise._getNeededStoresForWhere(whereClause.Exercise.some, neededStores)
            this.client.exercise._getNeededStoresForWhere(whereClause.Exercise.none, neededStores)
        }
    }

    _getNeededStoresForFind<Q extends Prisma.Args<Prisma.ExerciseSplitDaySessionDelegate, "findMany">>(query?: Q): Set<StoreNames<PrismaIDBSchema>> {
        const neededStores: Set<StoreNames<PrismaIDBSchema>> = new Set();
        neededStores.add("ExerciseSplitDaySession");
        this._getNeededStoresForWhere(query?.where, neededStores);
        if (query?.orderBy)
        {
            const orderBy = IDBUtils.convertToArray(query.orderBy);
            const orderBy_exerciseSplitDay = orderBy.find((clause) => clause.exerciseSplitDay);
            if (orderBy_exerciseSplitDay)
            {
                this.client.exerciseSplitDay
                ._getNeededStoresForFind({ orderBy: orderBy_exerciseSplitDay.exerciseSplitDay })
                .forEach((storeName) => neededStores.add(storeName));
            }
            const orderBy_Exercise = orderBy.find((clause) => clause.Exercise);
            if (orderBy_Exercise)
            {
                neededStores.add("Exercise")
            }
        }
        if (query?.select?.exerciseSplitDay || query?.include?.exerciseSplitDay)
        {
            neededStores.add("ExerciseSplitDay");
            if (typeof query.select?.exerciseSplitDay === "object")
            {
                this.client.exerciseSplitDay._getNeededStoresForFind(query.select.exerciseSplitDay).forEach((storeName) => neededStores.add(storeName));
            }
            if (typeof query.include?.exerciseSplitDay === "object")
            {
                this.client.exerciseSplitDay._getNeededStoresForFind(query.include.exerciseSplitDay).forEach((storeName) => neededStores.add(storeName));
            }
        }
        if (query?.select?.Exercise || query?.include?.Exercise)
        {
            neededStores.add("Exercise");
            if (typeof query.select?.Exercise === "object")
            {
                this.client.exercise._getNeededStoresForFind(query.select.Exercise).forEach((storeName) => neededStores.add(storeName));
            }
            if (typeof query.include?.Exercise === "object")
            {
                this.client.exercise._getNeededStoresForFind(query.include.Exercise).forEach((storeName) => neededStores.add(storeName));
            }
        }
        return neededStores;
    }

    _getNeededStoresForCreate<D extends Partial<Prisma.Args<Prisma.ExerciseSplitDaySessionDelegate, "create">['data']>>(data: D): Set<StoreNames<PrismaIDBSchema>> {
        const neededStores: Set<StoreNames<PrismaIDBSchema>> = new Set();
        neededStores.add("ExerciseSplitDaySession");
        if (data?.exerciseSplitDay)
        {
            neededStores.add('ExerciseSplitDay')
            if (data.exerciseSplitDay.create)
            {
                const createData = Array.isArray(data.exerciseSplitDay.create) ? data.exerciseSplitDay.create : [data.exerciseSplitDay.create];
                createData.forEach((record) => 
                this.client.exerciseSplitDay._getNeededStoresForCreate(record).forEach((storeName) => neededStores.add(storeName))
                );
            }
            if (data.exerciseSplitDay.connectOrCreate)
            {
                IDBUtils.convertToArray(data.exerciseSplitDay.connectOrCreate).forEach((record) => 
                this.client.exerciseSplitDay._getNeededStoresForCreate(record.create).forEach((storeName) => neededStores.add(storeName))
                );
            }
        }
        if (data.exerciseSplitName !== undefined)
        {
            neededStores.add("ExerciseSplitDay")
        }
        if (data?.Exercise)
        {
            neededStores.add('Exercise')
            if (data.Exercise.create)
            {
                const createData = Array.isArray(data.Exercise.create) ? data.Exercise.create : [data.Exercise.create];
                createData.forEach((record) => 
                this.client.exercise._getNeededStoresForCreate(record).forEach((storeName) => neededStores.add(storeName))
                );
            }
            if (data.Exercise.connectOrCreate)
            {
                IDBUtils.convertToArray(data.Exercise.connectOrCreate).forEach((record) => 
                this.client.exercise._getNeededStoresForCreate(record.create).forEach((storeName) => neededStores.add(storeName))
                );
            }
            if (data.Exercise.createMany)
            {
                IDBUtils.convertToArray(data.Exercise.createMany.data).forEach((record) => 
                this.client.exercise._getNeededStoresForCreate(record).forEach((storeName) => neededStores.add(storeName))
                );
            }
        }
        return neededStores;
    }

    _getNeededStoresForUpdate<Q extends Prisma.Args<Prisma.ExerciseSplitDaySessionDelegate, "update">>(query: Partial<Q>): Set<StoreNames<PrismaIDBSchema>> {
        const neededStores = this._getNeededStoresForFind(query).union(this._getNeededStoresForCreate(query.data as Prisma.Args<Prisma.ExerciseSplitDaySessionDelegate, "create">["data"]));
        if (query.data?.exerciseSplitDay?.connect)
        {
            neededStores.add("ExerciseSplitDay");
            IDBUtils.convertToArray(query.data.exerciseSplitDay.connect).forEach((connect) => 
            {
                this.client.exerciseSplitDay._getNeededStoresForWhere(connect, neededStores);
            }
            );
        }
        if (query.data?.exerciseSplitDay?.update)
        {
            neededStores.add("ExerciseSplitDay");
            IDBUtils.convertToArray(query.data.exerciseSplitDay.update).forEach((update) => 
            {
                this.client.exerciseSplitDay._getNeededStoresForUpdate(update as Prisma.Args<Prisma.ExerciseSplitDayDelegate, "update">).forEach((store) => neededStores.add(store));
            }
            )
        }
        if (query.data?.exerciseSplitDay?.upsert)
        {
            neededStores.add("ExerciseSplitDay");
            IDBUtils.convertToArray(query.data.exerciseSplitDay.upsert).forEach((upsert) => 
            {
                const update = { where: upsert.where, data: { ...upsert.update, ...upsert.create } } as Prisma.Args<Prisma.ExerciseSplitDayDelegate, "update">;
                this.client.exerciseSplitDay._getNeededStoresForUpdate(update).forEach((store) => neededStores.add(store));
            }
            )
        }
        if (query.data?.Exercise?.connect)
        {
            neededStores.add("Exercise");
            IDBUtils.convertToArray(query.data.Exercise.connect).forEach((connect) => 
            {
                this.client.exercise._getNeededStoresForWhere(connect, neededStores);
            }
            );
        }
        if (query.data?.Exercise?.set)
        {
            neededStores.add("Exercise");
            IDBUtils.convertToArray(query.data.Exercise.set).forEach((setWhere) => 
            {
                this.client.exercise._getNeededStoresForWhere(setWhere, neededStores);
            }
            )
        }
        if (query.data?.Exercise?.updateMany)
        {
            neededStores.add("Exercise");
            IDBUtils.convertToArray(query.data.Exercise.updateMany).forEach((update) => 
            {
                this.client.exercise._getNeededStoresForUpdate(update as Prisma.Args<Prisma.ExerciseDelegate, "update">).forEach((store) => neededStores.add(store));
            }
            )
        }
        if (query.data?.Exercise?.update)
        {
            neededStores.add("Exercise");
            IDBUtils.convertToArray(query.data.Exercise.update).forEach((update) => 
            {
                this.client.exercise._getNeededStoresForUpdate(update as Prisma.Args<Prisma.ExerciseDelegate, "update">).forEach((store) => neededStores.add(store));
            }
            )
        }
        if (query.data?.Exercise?.upsert)
        {
            neededStores.add("Exercise");
            IDBUtils.convertToArray(query.data.Exercise.upsert).forEach((upsert) => 
            {
                const update = { where: upsert.where, data: { ...upsert.update, ...upsert.create } } as Prisma.Args<Prisma.ExerciseDelegate, "update">;
                this.client.exercise._getNeededStoresForUpdate(update).forEach((store) => neededStores.add(store));
            }
            )
        }
        if (query.data?.Exercise?.delete || query.data?.Exercise?.deleteMany)
        {
            this.client.exercise._getNeededStoresForNestedDelete(neededStores);
        }
        if (query.data?.exerciseSplitName !== undefined || query.data?.dayIndex !== undefined || query.data?.sessionIndex !== undefined || query.data?.userId !== undefined)
        {
            neededStores.add("Exercise");
        }
        return neededStores;
    }

    _getNeededStoresForNestedDelete(neededStores: Set<StoreNames<PrismaIDBSchema>>): void {
        neededStores.add("ExerciseSplitDaySession");
        this.client.exercise._getNeededStoresForNestedDelete(neededStores);
    }

    private _removeNestedCreateData<D extends Prisma.Args<Prisma.ExerciseSplitDaySessionDelegate, "create">["data"]>(data: D): Prisma.Result<Prisma.ExerciseSplitDaySessionDelegate, object, "findFirstOrThrow"> {
        const recordWithoutNestedCreate = structuredClone(data);
        delete recordWithoutNestedCreate?.exerciseSplitDay;
        delete recordWithoutNestedCreate?.Exercise;
        return recordWithoutNestedCreate as Prisma.Result<Prisma.ExerciseSplitDaySessionDelegate, object, "findFirstOrThrow">;
    }

    private _preprocessListFields(records: Prisma.Result<Prisma.ExerciseSplitDaySessionDelegate, object, "findMany">): void {
    }

    async findMany<Q extends Prisma.Args<Prisma.ExerciseSplitDaySessionDelegate, 'findMany'>>(query?: Q, tx?: IDBUtils.TransactionType): Promise<Prisma.Result<Prisma.ExerciseSplitDaySessionDelegate, Q, 'findMany'>> {
        tx = tx ?? this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), "readonly");
        const records = await this._applyWhereClause(await tx.objectStore("ExerciseSplitDaySession").getAll(), query?.where, tx);
        await this._applyOrderByClause(records, query?.orderBy, tx);
        const relationAppliedRecords = (await this._applyRelations(records, tx, query)) as Prisma.Result<Prisma.ExerciseSplitDaySessionDelegate, object, 'findFirstOrThrow'>[];
        const selectClause = query?.select;
        let selectAppliedRecords = this._applySelectClause(relationAppliedRecords, selectClause);
        if (query?.distinct)
        {
            const distinctFields = IDBUtils.convertToArray(query.distinct);
            const seen = new Set<string>();
            selectAppliedRecords = selectAppliedRecords.filter((record) => 
            {
                const key = distinctFields.map((field) => record[field]).join("|");
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            }
            );
        }
        this._preprocessListFields(selectAppliedRecords);
        return selectAppliedRecords as Prisma.Result<Prisma.ExerciseSplitDaySessionDelegate, Q, 'findMany'>;
    }

    async findFirst<Q extends Prisma.Args<Prisma.ExerciseSplitDaySessionDelegate, 'findFirst'>>(query?: Q, tx?: IDBUtils.TransactionType): Promise<Prisma.Result<Prisma.ExerciseSplitDaySessionDelegate, Q, 'findFirst'>> {
        tx = tx ?? this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), "readonly");
        return (await this.findMany(query, tx))[0] ?? null;
    }

    async findFirstOrThrow<Q extends Prisma.Args<Prisma.ExerciseSplitDaySessionDelegate, "findFirstOrThrow">>(query?: Q, tx?: IDBUtils.TransactionType): Promise<Prisma.Result<Prisma.ExerciseSplitDaySessionDelegate, Q, "findFirstOrThrow">> {
        tx = tx ?? this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), "readonly");
        const record = await this.findFirst(query, tx);
        if (!record)
        {
            tx.abort();
            throw new Error("Record not found");
        }
        return record;
    }

    async findUnique<Q extends Prisma.Args<Prisma.ExerciseSplitDaySessionDelegate, 'findUnique'>>(query: Q, tx?: IDBUtils.TransactionType): Promise<Prisma.Result<Prisma.ExerciseSplitDaySessionDelegate, Q, 'findUnique'>> {
        tx = tx ?? this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), "readonly");
        let record;
        if (query.where.exerciseSplitName_dayIndex_sessionIndex_userId !== undefined)
        {
            record = await tx.objectStore("ExerciseSplitDaySession").get([query.where.exerciseSplitName_dayIndex_sessionIndex_userId.exerciseSplitName,query.where.exerciseSplitName_dayIndex_sessionIndex_userId.dayIndex,query.where.exerciseSplitName_dayIndex_sessionIndex_userId.sessionIndex,query.where.exerciseSplitName_dayIndex_sessionIndex_userId.userId]);
        }
        if (!record) return null;

        const recordWithRelations = this._applySelectClause(await this._applyRelations(await this._applyWhereClause([record], query.where, tx), tx, query), query.select)[0];
        this._preprocessListFields([recordWithRelations]);
        return recordWithRelations as Prisma.Result<Prisma.ExerciseSplitDaySessionDelegate, Q, "findUnique">;
    }

    async findUniqueOrThrow<Q extends Prisma.Args<Prisma.ExerciseSplitDaySessionDelegate, "findUniqueOrThrow">>(query: Q, tx?: IDBUtils.TransactionType): Promise<Prisma.Result<Prisma.ExerciseSplitDaySessionDelegate, Q, "findUniqueOrThrow">> {
        tx = tx ?? this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), "readonly");
        const record = await this.findUnique(query, tx);
        if (!record)
        {
            tx.abort();
            throw new Error("Record not found");
        }
        return record;
    }

    async count<Q extends Prisma.Args<Prisma.ExerciseSplitDaySessionDelegate, 'count'>>(query?: Q, tx?: IDBUtils.TransactionType): Promise<Prisma.Result<Prisma.ExerciseSplitDaySessionDelegate, Q, 'count'>> {
        tx = tx ?? this.client._db.transaction(["ExerciseSplitDaySession"], "readonly");
        if (!query?.select || query.select === true)
        {
            const records = await this.findMany({ where: query?.where }, tx);
            return records.length as Prisma.Result<Prisma.ExerciseSplitDaySessionDelegate, Q, "count">;
        }
        const result: Partial<Record<keyof Prisma.ExerciseSplitDaySessionCountAggregateInputType, number>> = {};
        for (const key of Object.keys(query.select))
        {
            const typedKey = key as keyof typeof query.select;
            if (typedKey === "_all")
            {
                result[typedKey] = (await this.findMany({ where: query.where }, tx)).length;
                continue;
            }
            result[typedKey] = (await this.findMany({ where: { [`${typedKey}`]: { not: null } } }, tx)).length;
        }
        return result as Prisma.Result<Prisma.ExerciseSplitDaySessionDelegate, Q, "count">;
    }

    async create<Q extends Prisma.Args<Prisma.ExerciseSplitDaySessionDelegate, "create">>(query: Q, tx?: IDBUtils.ReadwriteTransactionType): Promise<Prisma.Result<Prisma.ExerciseSplitDaySessionDelegate, Q, "create">> {
        const storesNeeded = this._getNeededStoresForCreate(query.data);
        tx = tx ?? this.client._db.transaction(Array.from(storesNeeded), "readwrite");
        if (query.data.exerciseSplitDay)
        {
            const fk: Partial<PrismaIDBSchema['ExerciseSplitDay']['key']> = [];
            if (query.data.exerciseSplitDay?.create)
            {
                const record = await this.client.exerciseSplitDay.create({ data: query.data.exerciseSplitDay.create }, tx);
                fk[0] = record.exerciseSplitName
                fk[1] = record.dayIndex
                fk[2] = record.userId
            }
            if (query.data.exerciseSplitDay?.connect)
            {
                const record = await this.client.exerciseSplitDay.findUniqueOrThrow({ where: query.data.exerciseSplitDay.connect }, tx);
                delete query.data.exerciseSplitDay.connect;
                fk[0] = record.exerciseSplitName;
                fk[1] = record.dayIndex;
                fk[2] = record.userId;
            }
            if (query.data.exerciseSplitDay?.connectOrCreate)
            {
                const record = await this.client.exerciseSplitDay.upsert({
                where: query.data.exerciseSplitDay.connectOrCreate.where,
                create: query.data.exerciseSplitDay.connectOrCreate.create,
                update: {},
                }, tx);
                fk[0] = record.exerciseSplitName;
                fk[1] = record.dayIndex;
                fk[2] = record.userId;
            }
            const unsafeData = query.data as Record<string, unknown>;
            unsafeData.exerciseSplitName = fk[0];
            unsafeData.dayIndex = fk[1];
            unsafeData.userId = fk[2];
            delete unsafeData.exerciseSplitDay;
        }
        else if (query.data?.exerciseSplitName !== undefined && query.data.exerciseSplitName !== null)
        {
            await this.client.exerciseSplitDay.findUniqueOrThrow(
            {
                where: { exerciseSplitName_dayIndex_userId: { exerciseSplitName: query.data.exerciseSplitName, dayIndex: query.data.dayIndex, userId: query.data.userId } }
            }
            , tx);
        }
        const record = this._removeNestedCreateData(await this._fillDefaults(query.data, tx));
        const keyPath = await tx.objectStore("ExerciseSplitDaySession").add(record);
        if (query.data?.Exercise?.create)
        {
            for (const elem of IDBUtils.convertToArray(query.data.Exercise.create))
            {
                await this.client.exercise.create({ data: { ...elem, session: { connect: { exerciseSplitName_dayIndex_sessionIndex_userId: { exerciseSplitName: keyPath[0], dayIndex: keyPath[1], sessionIndex: keyPath[2], userId: keyPath[3] } } } } as Prisma.Args<Prisma.ExerciseDelegate, "create">['data'] }, tx);
            }
        }
        if (query.data?.Exercise?.connect)
        {
            await Promise.all(
                IDBUtils.convertToArray(query.data.Exercise.connect).map(async (connectWhere) => 
                {
                    await this.client.exercise.update({ where: connectWhere, data: { splitName: keyPath[0], splitDayIndex: keyPath[1], sessionIndex: keyPath[2], userId: keyPath[3] } }, tx);
                }
                ),
            );
        }
        if (query.data?.Exercise?.connectOrCreate)
        {
            await Promise.all(
                IDBUtils.convertToArray(query.data.Exercise.connectOrCreate).map(async (connectOrCreate) => 
                {
                    await this.client.exercise.upsert({
                    where: connectOrCreate.where,
                    create: { ...connectOrCreate.create, splitName: keyPath[0], splitDayIndex: keyPath[1], sessionIndex: keyPath[2], userId: keyPath[3] } as Prisma.Args<Prisma.ExerciseDelegate, "create">["data"],
                    update: { splitName: keyPath[0], splitDayIndex: keyPath[1], sessionIndex: keyPath[2], userId: keyPath[3] },
                    }, tx);
                }
                ),
            );
        }
        if (query.data?.Exercise?.createMany)
        {
            await this.client.exercise.createMany( {
                data: IDBUtils.convertToArray(query.data.Exercise.createMany.data).map((createData) => (
                {
                    ...createData, splitName: keyPath[0], splitDayIndex: keyPath[1], sessionIndex: keyPath[2], userId: keyPath[3]
                }
                )),
            }
            , tx)
        }
        const data = (await tx.objectStore("ExerciseSplitDaySession").get(keyPath))!;
        const recordsWithRelations = this._applySelectClause(await this._applyRelations<object>([data], tx, query), query.select)[0];
        this._preprocessListFields([recordsWithRelations]);
        this.emit("create", keyPath);
        return recordsWithRelations as Prisma.Result<Prisma.ExerciseSplitDaySessionDelegate, Q, "create">;
    }

    async createMany<Q extends Prisma.Args<Prisma.ExerciseSplitDaySessionDelegate, "createMany">>(query: Q, tx?: IDBUtils.ReadwriteTransactionType): Promise<Prisma.Result<Prisma.ExerciseSplitDaySessionDelegate, Q, "createMany">> {
        const createManyData = IDBUtils.convertToArray(query.data);
        tx = tx ?? this.client._db.transaction(["ExerciseSplitDaySession"], "readwrite");
        for (const createData of createManyData)
        {
            const record = this._removeNestedCreateData(await this._fillDefaults(createData, tx));
            const keyPath = await tx.objectStore("ExerciseSplitDaySession").add(record);
            this.emit("create", keyPath);
        }
        return { count: createManyData.length };
    }

    async createManyAndReturn<Q extends Prisma.Args<Prisma.ExerciseSplitDaySessionDelegate, "createManyAndReturn">>(query: Q, tx?: IDBUtils.ReadwriteTransactionType): Promise<Prisma.Result<Prisma.ExerciseSplitDaySessionDelegate, Q, "createManyAndReturn">> {
        const createManyData = IDBUtils.convertToArray(query.data);
        const records: Prisma.Result<Prisma.ExerciseSplitDaySessionDelegate, object, "findMany"> = [];
        tx = tx ?? this.client._db.transaction(["ExerciseSplitDaySession"], "readwrite");
        for (const createData of createManyData)
        {
            const record = this._removeNestedCreateData(await this._fillDefaults(createData, tx));
            const keyPath = await tx.objectStore("ExerciseSplitDaySession").add(record);
            this.emit("create", keyPath);
            records.push(this._applySelectClause([record], query.select)[0]);
        }
        this._preprocessListFields(records);
        return records as Prisma.Result<Prisma.ExerciseSplitDaySessionDelegate, Q, "createManyAndReturn">;
    }

    async delete<Q extends Prisma.Args<Prisma.ExerciseSplitDaySessionDelegate, 'delete'>>(query: Q, tx?: IDBUtils.ReadwriteTransactionType): Promise<Prisma.Result<Prisma.ExerciseSplitDaySessionDelegate, Q, 'delete'>> {
        const storesNeeded = this._getNeededStoresForFind(query);
        this._getNeededStoresForNestedDelete(storesNeeded);
        tx = tx ?? this.client._db.transaction(Array.from(storesNeeded), "readwrite");
        const record = await this.findUnique(query, tx);
        if (!record) throw new Error("Record not found");
        const relatedExercise = await this.client.exercise.findMany({ where: { splitName: record.exerciseSplitName, splitDayIndex: record.dayIndex, sessionIndex: record.sessionIndex, userId: record.userId } }, tx);
        if (relatedExercise.length) throw new Error("Cannot delete record, other records depend on it");
        await tx.objectStore("ExerciseSplitDaySession").delete([record.exerciseSplitName, record.dayIndex, record.sessionIndex, record.userId]);
        this.emit("delete", [record.exerciseSplitName, record.dayIndex, record.sessionIndex, record.userId]);
        return record;
    }

    async deleteMany<Q extends Prisma.Args<Prisma.ExerciseSplitDaySessionDelegate, 'deleteMany'>>(query?: Q, tx?: IDBUtils.ReadwriteTransactionType): Promise<Prisma.Result<Prisma.ExerciseSplitDaySessionDelegate, Q, 'deleteMany'>> {
        const storesNeeded = this._getNeededStoresForFind(query);
        this._getNeededStoresForNestedDelete(storesNeeded);
        tx = tx ?? this.client._db.transaction(Array.from(storesNeeded), "readwrite");
        const records = await this.findMany(query, tx);
        for (const record of records)
        {
            await this.delete({ where: { exerciseSplitName_dayIndex_sessionIndex_userId: { exerciseSplitName: record.exerciseSplitName, dayIndex: record.dayIndex, sessionIndex: record.sessionIndex, userId: record.userId } } }, tx);
        }
        return { count: records.length };
    }

    async update<Q extends Prisma.Args<Prisma.ExerciseSplitDaySessionDelegate, 'update'>>(query: Q, tx?: IDBUtils.ReadwriteTransactionType): Promise<Prisma.Result<Prisma.ExerciseSplitDaySessionDelegate, Q, 'update'>> {
        tx = tx ?? this.client._db.transaction(
        Array.from(this._getNeededStoresForUpdate(query)), "readwrite");
        const record = await this.findUnique({ where: query.where }, tx);
        if (record === null)
        {
            tx.abort();
            throw new Error("Record not found");
        }
        const startKeyPath: PrismaIDBSchema["ExerciseSplitDaySession"]["key"] = [record.exerciseSplitName,record.dayIndex,record.sessionIndex,record.userId];
        const stringFields = ["exerciseSplitName","userId","name"] as const;
        for (const field of stringFields)
        {
            IDBUtils.handleStringUpdateField(record, field, query.data[field]);
        }
        const intFields = ["dayIndex","sessionIndex"] as const;
        for (const field of intFields)
        {
            IDBUtils.handleIntUpdateField(record, field, query.data[field]);
        }
        if (query.data.exerciseSplitDay)
        {
            if (query.data.exerciseSplitDay.connect)
            {
                const other = await this.client.exerciseSplitDay.findUniqueOrThrow({ where: query.data.exerciseSplitDay.connect }, tx);
                record.exerciseSplitName = other.exerciseSplitName;
                record.dayIndex = other.dayIndex;
                record.userId = other.userId;
            }
            if (query.data.exerciseSplitDay.create)
            {
                const other = await this.client.exerciseSplitDay.create({ data: query.data.exerciseSplitDay.create }, tx);
                record.exerciseSplitName = other.exerciseSplitName;
                record.dayIndex = other.dayIndex;
                record.userId = other.userId;
            }
            if (query.data.exerciseSplitDay.update)
            {
                const updateData = query.data.exerciseSplitDay.update.data ?? query.data.exerciseSplitDay.update;
                await this.client.exerciseSplitDay.update({ where: { ...query.data.exerciseSplitDay.update.where, exerciseSplitName_dayIndex_userId : { exerciseSplitName: record.exerciseSplitName, dayIndex: record.dayIndex, userId: record.userId } } as Prisma.ExerciseSplitDayWhereUniqueInput, data: updateData }, tx);
            }
            if (query.data.exerciseSplitDay.upsert)
            {
                await this.client.exerciseSplitDay.upsert({ where: { ...query.data.exerciseSplitDay.upsert.where, exerciseSplitName_dayIndex_userId : { exerciseSplitName: record.exerciseSplitName, dayIndex: record.dayIndex, userId: record.userId } } as Prisma.ExerciseSplitDayWhereUniqueInput, create: { ...query.data.exerciseSplitDay.upsert.create, exerciseSplitName: record.exerciseSplitName!, dayIndex: record.dayIndex!, userId: record.userId! } as Prisma.Args<Prisma.ExerciseSplitDayDelegate, "upsert">['create'], update: query.data.exerciseSplitDay.upsert.update, }, tx);
            }
            if (query.data.exerciseSplitDay.connectOrCreate)
            {
                await this.client.exerciseSplitDay.upsert(
                {
                    where: { ...query.data.exerciseSplitDay.connectOrCreate.where, exerciseSplitName_dayIndex_userId : { exerciseSplitName: record.exerciseSplitName, dayIndex: record.dayIndex, userId: record.userId } },
                    create: { ...query.data.exerciseSplitDay.connectOrCreate.create, exerciseSplitName: record.exerciseSplitName!, dayIndex: record.dayIndex!, userId: record.userId! } as Prisma.Args<Prisma.ExerciseSplitDayDelegate, "upsert">['create'],
                    update: { exerciseSplitName: record.exerciseSplitName!, dayIndex: record.dayIndex!, userId: record.userId! },
                }
                , tx);
            }
        }
        if (query.data.Exercise)
        {
            if (query.data.Exercise.connect)
            {
                await Promise.all(
                IDBUtils.convertToArray(query.data.Exercise.connect).map(async (connectWhere) => 
                {
                    await this.client.exercise.update({ where: connectWhere, data: { splitName: record.exerciseSplitName, splitDayIndex: record.dayIndex, sessionIndex: record.sessionIndex, userId: record.userId } }, tx);
                }
                ))
            }
            if (query.data.Exercise.disconnect)
            {
                throw new Error("Cannot disconnect required relation");
            }
            if (query.data.Exercise.create)
            {
                const createData = Array.isArray(query.data.Exercise.create)
                ? query.data.Exercise.create
                : [query.data.Exercise.create];
                for (const elem of createData)
                {
                    await this.client.exercise.create({ data: { ...elem, splitName: record.exerciseSplitName, splitDayIndex: record.dayIndex, sessionIndex: record.sessionIndex, userId: record.userId }as Prisma.Args<Prisma.ExerciseDelegate, "create">["data"] }, tx);
                }
            }
            if (query.data.Exercise.createMany)
            {
                await Promise.all(
                IDBUtils.convertToArray(query.data.Exercise.createMany.data).map(async (createData) => 
                {
                    await this.client.exercise.create({ data: { ...createData, splitName: record.exerciseSplitName, splitDayIndex: record.dayIndex, sessionIndex: record.sessionIndex, userId: record.userId } }, tx);
                }
                ))
            }
            if (query.data.Exercise.update)
            {
                await Promise.all(
                IDBUtils.convertToArray(query.data.Exercise.update).map(async (updateData) => 
                {
                    await this.client.exercise.update(updateData, tx);
                }
                ))
            }
            if (query.data.Exercise.updateMany)
            {
                await Promise.all(
                IDBUtils.convertToArray(query.data.Exercise.updateMany).map(async (updateData) => 
                {
                    await this.client.exercise.updateMany(updateData, tx);
                }
                ))
            }
            if (query.data.Exercise.upsert)
            {
                await Promise.all(
                IDBUtils.convertToArray(query.data.Exercise.upsert).map(async (upsertData) => 
                {
                    await this.client.exercise.upsert({ ...upsertData, where: { ...upsertData.where, splitName: record.exerciseSplitName, splitDayIndex: record.dayIndex, sessionIndex: record.sessionIndex, userId: record.userId }, create: { ...upsertData.create, splitName: record.exerciseSplitName, splitDayIndex: record.dayIndex, sessionIndex: record.sessionIndex, userId: record.userId } as Prisma.Args<Prisma.ExerciseDelegate, "upsert">['create'] }, tx);
                }
                ))
            }
            if (query.data.Exercise.delete)
            {
                await Promise.all(
                IDBUtils.convertToArray(query.data.Exercise.delete).map(async (deleteData) => 
                {
                    await this.client.exercise.delete({ where: { ...deleteData, splitName: record.exerciseSplitName, splitDayIndex: record.dayIndex, sessionIndex: record.sessionIndex, userId: record.userId } }, tx);
                }
                ))
            }
            if (query.data.Exercise.deleteMany)
            {
                await Promise.all(
                IDBUtils.convertToArray(query.data.Exercise.deleteMany).map(async (deleteData) => 
                {
                    await this.client.exercise.deleteMany({ where: { ...deleteData, splitName: record.exerciseSplitName, splitDayIndex: record.dayIndex, sessionIndex: record.sessionIndex, userId: record.userId } }, tx);
                }
                ))
            }
            if (query.data.Exercise.set)
            {
                const existing = await this.client.exercise.findMany({ where: { splitName: record.exerciseSplitName, splitDayIndex: record.dayIndex, sessionIndex: record.sessionIndex, userId: record.userId } }, tx);
                if (existing.length > 0)
                {
                    throw new Error("Cannot set required relation");
                }
                await Promise.all(
                IDBUtils.convertToArray(query.data.Exercise.set).map(async (setData) => 
                {
                    await this.client.exercise.update({ where: setData, data: { splitName: record.exerciseSplitName, splitDayIndex: record.dayIndex, sessionIndex: record.sessionIndex, userId: record.userId } }, tx);
                }
                ))
            }
        }
        if (query.data.exerciseSplitName !== undefined || query.data.dayIndex !== undefined || query.data.userId !== undefined)
        {
            const related = await this.client.exerciseSplitDay.findUnique({ where: { exerciseSplitName_dayIndex_userId: { exerciseSplitName: record.exerciseSplitName, dayIndex: record.dayIndex, userId: record.userId } } }, tx);
            if (!related) throw new Error("Related record not found");
        }
        const endKeyPath: PrismaIDBSchema["ExerciseSplitDaySession"]["key"] = [record.exerciseSplitName,record.dayIndex,record.sessionIndex,record.userId];
        for (let i = 0; i < startKeyPath.length; i++)
        {
            if (startKeyPath[i] !== endKeyPath[i])
            {
                if (await tx.objectStore("ExerciseSplitDaySession").get(endKeyPath) !== undefined)
                {
                    throw new Error("Record with the same keyPath already exists");
                }
                await tx.objectStore("ExerciseSplitDaySession").delete(startKeyPath);
                break;
            }
        }
        const keyPath = await tx.objectStore("ExerciseSplitDaySession").put(record);
        this.emit("update", keyPath, startKeyPath);
        for (let i = 0; i < startKeyPath.length; i++)
        {
            if (startKeyPath[i] !== endKeyPath[i])
            {
                await this.client.exercise.updateMany(
                {
                    where: { splitName: startKeyPath[0], splitDayIndex: startKeyPath[1], sessionIndex: startKeyPath[2], userId: startKeyPath[3] },
                    data: { splitName: endKeyPath[0], splitDayIndex: endKeyPath[1], sessionIndex: endKeyPath[2], userId: endKeyPath[3] },
                }
                , tx);
                break;
            }
        }
        const recordWithRelations = (await this.findUnique(
        {
            where: { exerciseSplitName_dayIndex_sessionIndex_userId: { exerciseSplitName: keyPath[0], dayIndex: keyPath[1], sessionIndex: keyPath[2], userId: keyPath[3] } },
        }
        , tx))!;
        return recordWithRelations as Prisma.Result<Prisma.ExerciseSplitDaySessionDelegate, Q, "update">;
    }

    async updateMany<Q extends Prisma.Args<Prisma.ExerciseSplitDaySessionDelegate, "updateMany">>(query: Q, tx?: IDBUtils.ReadwriteTransactionType): Promise<Prisma.Result<Prisma.ExerciseSplitDaySessionDelegate, Q, "updateMany">> {
        tx = tx ?? this.client._db.transaction(
        Array.from(this._getNeededStoresForFind(query)), "readwrite");
        const records = await this.findMany({ where: query.where }, tx);
        await Promise.all(
        records.map(async (record) =>
        {
            await this.update({ where: { exerciseSplitName_dayIndex_sessionIndex_userId: { exerciseSplitName: record.exerciseSplitName, dayIndex: record.dayIndex, sessionIndex: record.sessionIndex, userId: record.userId } }, data: query.data }, tx);
        }
        ));
        return { count: records.length };
    }

    async upsert<Q extends Prisma.Args<Prisma.ExerciseSplitDaySessionDelegate, "upsert">>(query: Q, tx?: IDBUtils.ReadwriteTransactionType): Promise<Prisma.Result<Prisma.ExerciseSplitDaySessionDelegate, Q, "upsert">> {
        const neededStores = this._getNeededStoresForUpdate({ ...query, data: { ...query.update, ...query.create } as Prisma.Args<Prisma.ExerciseSplitDaySessionDelegate, "update">["data"] });
        tx = tx ?? this.client._db.transaction(Array.from(neededStores), "readwrite");
        let record = await this.findUnique({ where: query.where }, tx);
        if (!record) record = await this.create({ data: query.create }, tx);
        else record = await this.update({ where: query.where, data: query.update }, tx);
        record = await this.findUniqueOrThrow({ where: { exerciseSplitName_dayIndex_sessionIndex_userId: { exerciseSplitName: record.exerciseSplitName, dayIndex: record.dayIndex, sessionIndex: record.sessionIndex, userId: record.userId } }, select: query.select, include: query.include }, tx);
        return record as Prisma.Result<Prisma.ExerciseSplitDaySessionDelegate, Q, "upsert">;
    }

    async aggregate<Q extends Prisma.Args<Prisma.ExerciseSplitDaySessionDelegate, 'aggregate'>>(query?: Q, tx?: IDBUtils.TransactionType): Promise<Prisma.Result<Prisma.ExerciseSplitDaySessionDelegate, Q, 'aggregate'>> {
        tx = tx ?? this.client._db.transaction(["ExerciseSplitDaySession"], "readonly");
        const records = await this.findMany({ where: query?.where }, tx);
        const result: Partial<Prisma.Result<Prisma.ExerciseSplitDaySessionDelegate, Q, "aggregate">> = {};
        if (query?._count)
        {
            if (query._count === true)
            {
                (result._count as number) = records.length;
            }
            else
            {
                for (const key of Object.keys(query._count))
                {
                    const typedKey = key as keyof typeof query._count;
                    if (typedKey === "_all")
                    {
                        (result._count as Record<string, number>)[typedKey] = records.length;
                        continue;
                    }
                    (result._count as Record<string, number>)[typedKey] = (
                    await this.findMany({ where: { [`${typedKey}`]: { not: null } } }, tx)
                    ).length;
                }
            }
        }
        if (query?._min)
        {
            const minResult = {} as Prisma.Result<Prisma.ExerciseSplitDaySessionDelegate, Q, "aggregate">["_min"];
            const numericFields = ["dayIndex","sessionIndex"] as const;
            for (const field of numericFields)
            {
                if (!query._min[field]) continue;
                const values = records.map((record) => record[field] as number).filter((value) => value !== undefined);
                (minResult[field as keyof typeof minResult] as number) = Math.min(...values);
            }
            const stringFields = ["exerciseSplitName","userId","name"] as const;
            for (const field of stringFields)
            {
                if (!query._min[field]) continue;
                const values = records.map((record) => record[field] as string).filter((value) => value !== undefined);
                (minResult[field as keyof typeof minResult] as string) = values.sort()[0];
            }
            result._min = minResult;
        }
        if (query?._max)
        {
            const maxResult = {} as Prisma.Result<Prisma.ExerciseSplitDaySessionDelegate, Q, "aggregate">["_max"];
            const numericFields = ["dayIndex","sessionIndex"] as const;
            for (const field of numericFields)
            {
                if (!query._max[field]) continue;
                const values = records.map((record) => record[field] as number).filter((value) => value !== undefined);
                (maxResult[field as keyof typeof maxResult] as number) = Math.max(...values);
            }
            const stringFields = ["exerciseSplitName","userId","name"] as const;
            for (const field of stringFields)
            {
                if (!query._max[field]) continue;
                const values = records.map((record) => record[field] as string).filter((value) => value !== undefined);
                (maxResult[field as keyof typeof maxResult] as string) = values.sort().reverse()[0];
            }
            result._max = maxResult;
        }
        if (query?._avg)
        {
            const avgResult = {} as Prisma.Result<Prisma.ExerciseSplitDaySessionDelegate, Q, "aggregate">["_avg"];
            for (const untypedField of Object.keys(query._avg))
            {
                const field = untypedField as keyof (typeof records)[number];
                const values = records.map((record) => record[field] as number);
                (avgResult[field as keyof typeof avgResult] as number) = values.reduce((a, b) => a + b, 0) / values.length;
            }
            result._avg = avgResult;
        }
        if (query?._sum)
        {
            const sumResult = {} as Prisma.Result<Prisma.ExerciseSplitDaySessionDelegate, Q, "aggregate">["_sum"];
            for (const untypedField of Object.keys(query._sum))
            {
                const field = untypedField as keyof (typeof records)[number];
                const values = records.map((record) => record[field] as number);
                (sumResult[field as keyof typeof sumResult] as number) = values.reduce((a, b) => a + b, 0);
            }
            result._sum = sumResult;
        }
        return result as unknown as Prisma.Result<Prisma.ExerciseSplitDaySessionDelegate, Q, "aggregate">;
    }
}

class ExerciseIDBClass extends BaseIDBModelClass<"Exercise"> {
    private async _applyWhereClause<W extends Prisma.Args<Prisma.ExerciseDelegate, 'findFirstOrThrow'>['where'], R extends Prisma.Result<Prisma.ExerciseDelegate, object, 'findFirstOrThrow'>>(records: R[], whereClause: W, tx: IDBUtils.TransactionType): Promise<R[]> {
        if (!whereClause) return records;
        records = await IDBUtils.applyLogicalFilters<Prisma.ExerciseDelegate, R, W>(
        records, whereClause, tx, this.keyPath, this._applyWhereClause.bind(this),
        )
        return (await Promise.all(records.map(async (record) =>
        {
            const stringFields = ["splitName","userId","name","primaryMuscleGroup"] as const;
            for (const field of stringFields)
            {
                if (!IDBUtils.whereStringFilter(record, field, whereClause[field])) return null;
            }
            const stringListFields = ["secondaryMuscleGroups","notes"] as const;
            for (const field of stringListFields)
            {
                if (!IDBUtils.whereStringListFilter(record, field, whereClause[field])) return null;
            }
            const numberFields = ["sessionIndex","splitDayIndex","exerciseIndex","repRangeStart","repRangeEnd"] as const;
            for (const field of numberFields)
            {
                if (!IDBUtils.whereNumberFilter(record, field, whereClause[field])) return null;
            }
            const booleanFields = ["forceRIRMatching","lastSetToFailure"] as const;
            for (const field of booleanFields)
            {
                if (!IDBUtils.whereBoolFilter(record, field, whereClause[field])) return null;
            }
            if (whereClause.session)
            {
                const { is, isNot, ...rest } = whereClause.session
                if (is !== null && is !== undefined)
                {
                    const relatedRecord = await this.client.exerciseSplitDaySession.findFirst({ where: { ...is, exerciseSplitName: record.splitName, dayIndex: record.splitDayIndex, sessionIndex: record.sessionIndex, userId: record.userId } }, tx)
                    if (!relatedRecord) return null;
                }
                if (isNot !== null && isNot !== undefined)
                {
                    const relatedRecord = await this.client.exerciseSplitDaySession.findFirst({ where: { ...isNot, exerciseSplitName: record.splitName, dayIndex: record.splitDayIndex, sessionIndex: record.sessionIndex, userId: record.userId } }, tx)
                    if (relatedRecord) return null;
                }
                if (Object.keys(rest).length)
                {
                    const relatedRecord = await this.client.exerciseSplitDaySession.findFirst({ where: { ...whereClause.session, exerciseSplitName: record.splitName, dayIndex: record.splitDayIndex, sessionIndex: record.sessionIndex, userId: record.userId } }, tx);
                    if (!relatedRecord) return null;
                }
            }
            return record;
        }
        ))).filter((result) => result !== null);;
    }

    private _applySelectClause<S extends Prisma.Args<Prisma.ExerciseDelegate, 'findMany'>['select']>(records: Prisma.Result<Prisma.ExerciseDelegate, object, 'findFirstOrThrow'>[], selectClause: S): Prisma.Result<Prisma.ExerciseDelegate, { select: S }, 'findFirstOrThrow'>[] {
        if (!selectClause)
        {
            return records as Prisma.Result<Prisma.ExerciseDelegate, { select: S }, 'findFirstOrThrow'>[];
        }
        return records.map((record) => 
        {
            const partialRecord: Partial<typeof record> = record;
            for (const untypedKey of ["sessionIndex","splitDayIndex","splitName","userId","exerciseIndex","session","name","primaryMuscleGroup","secondaryMuscleGroups","bodyweightFraction","repRangeStart","repRangeEnd","setType","notes","preferredOverloadPercentage","forceRIRMatching","lastSetToFailure","minimumWeightChange"]) 
            {
                const key = untypedKey as keyof typeof record & keyof S;
                if (!selectClause[key]) delete partialRecord[key];
            }
            return partialRecord;
        }
        ) as Prisma.Result<Prisma.ExerciseDelegate, { select: S }, 'findFirstOrThrow'>[];
    }

    private async _applyRelations<Q extends Prisma.Args<Prisma.ExerciseDelegate, 'findMany'>>(records: Prisma.Result<Prisma.ExerciseDelegate, object, 'findFirstOrThrow'>[], tx: IDBUtils.TransactionType, query?: Q): Promise<Prisma.Result<Prisma.ExerciseDelegate, Q, 'findFirstOrThrow'>[]> {
        if (!query) return records as Prisma.Result<Prisma.ExerciseDelegate, Q, 'findFirstOrThrow'>[];
        const recordsWithRelations = records.map(async (record) => 
        {
            const unsafeRecord = record as Record<string, unknown>;
            const attach_session = query.select?.session || query.include?.session;
            if (attach_session)
            {
                unsafeRecord['session'] = 
                await this.client.exerciseSplitDaySession.findUnique(
                {
                    ...(attach_session === true ? {} : attach_session),
                    where: { exerciseSplitName_dayIndex_sessionIndex_userId: { exerciseSplitName: record.splitName!, dayIndex: record.splitDayIndex!, sessionIndex: record.sessionIndex!, userId: record.userId! } }
                }
                , tx)
            }
            return unsafeRecord;
        }
        );
        return (await Promise.all(recordsWithRelations)) as Prisma.Result<Prisma.ExerciseDelegate, Q, 'findFirstOrThrow'>[];
    }

    async _applyOrderByClause<O extends Prisma.Args<Prisma.ExerciseDelegate, 'findMany'>['orderBy'], R extends Prisma.Result<Prisma.ExerciseDelegate, object, "findFirstOrThrow">>(records: R[], orderByClause: O, tx: IDBUtils.TransactionType): Promise<void> {
        if (orderByClause === undefined) return;
        const orderByClauses = IDBUtils.convertToArray(orderByClause);
        const indexedKeys = await Promise.all(
        records.map(async (record) => 
        {
            const keys = await Promise.all(
            orderByClauses.map(async (clause) => await this._resolveOrderByKey(record, clause, tx)),
            );
            return { keys, record };
        }
        ));
        indexedKeys.sort((a, b) => 
        {
            for (let i = 0; i < orderByClauses.length; i++)
            {
                const clause = orderByClauses[i];
                const comparison = IDBUtils.genericComparator(a.keys[i], b.keys[i], this._resolveSortOrder(clause));
                if (comparison !== 0) return comparison;
            }
            return 0;
        }
        );
        for (let i = 0; i < records.length; i++)
        {
            records[i] = indexedKeys[i].record;
        }
    }

    async _resolveOrderByKey(record: Prisma.Result<Prisma.ExerciseDelegate, object, "findFirstOrThrow">, orderByInput: Prisma.ExerciseOrderByWithRelationInput, tx: IDBUtils.TransactionType): Promise<unknown> {
        const scalarFields = ["sessionIndex","splitDayIndex","splitName","userId","exerciseIndex","name","primaryMuscleGroup","secondaryMuscleGroups","bodyweightFraction","repRangeStart","repRangeEnd","setType","notes","preferredOverloadPercentage","forceRIRMatching","lastSetToFailure","minimumWeightChange"] as const;
        for (const field of scalarFields) if (orderByInput[field]) return record[field];
        if (orderByInput.session)
        {
            return await this.client.exerciseSplitDaySession._resolveOrderByKey(await this.client.exerciseSplitDaySession.findFirstOrThrow({ where: { exerciseSplitName: record.splitName } }), orderByInput.session, tx);
        }
    }

    _resolveSortOrder(orderByInput: Prisma.ExerciseOrderByWithRelationInput): Prisma.SortOrder | { sort: Prisma.SortOrder, nulls?: 'first' | 'last' } {
        const scalarFields = ["sessionIndex","splitDayIndex","splitName","userId","exerciseIndex","name","primaryMuscleGroup","secondaryMuscleGroups","bodyweightFraction","repRangeStart","repRangeEnd","setType","notes","preferredOverloadPercentage","forceRIRMatching","lastSetToFailure","minimumWeightChange"] as const;
        for (const field of scalarFields) if (orderByInput[field]) return orderByInput[field];
        if (orderByInput.session)
        {
            return this.client.exerciseSplitDaySession._resolveSortOrder(orderByInput.session);
        }
        throw new Error("No field in orderBy clause");
    }

    private async _fillDefaults<D extends Prisma.Args<Prisma.ExerciseDelegate, "create">["data"]>(data: D, tx?: IDBUtils.ReadwriteTransactionType): Promise<D> {
        if (data === undefined) data = {} as NonNullable<D>;
        if (data.preferredOverloadPercentage === undefined) 
        {
            data.preferredOverloadPercentage = null;
        }
        if (data.forceRIRMatching === undefined) 
        {
            data.forceRIRMatching = null;
        }
        if (data.lastSetToFailure === undefined) 
        {
            data.lastSetToFailure = null;
        }
        if (data.minimumWeightChange === undefined) 
        {
            data.minimumWeightChange = null;
        }
        if (!Array.isArray(data.secondaryMuscleGroups))
        {
            data.secondaryMuscleGroups = data.secondaryMuscleGroups?.set;
        }
        if (!Array.isArray(data.notes))
        {
            data.notes = data.notes?.set;
        }
        return data;
    }

    _getNeededStoresForWhere<W extends Prisma.Args<Prisma.ExerciseDelegate, "findMany">['where']>(whereClause: W, neededStores: Set<StoreNames<PrismaIDBSchema>>) {
        if (whereClause === undefined) return;
        for (const param of IDBUtils.LogicalParams)
        {
            if (whereClause[param])
            {
                for (const clause of IDBUtils.convertToArray(whereClause[param]))
                {
                    this._getNeededStoresForWhere(clause, neededStores);
                }
            }
        }
        if (whereClause.session)
        {
            neededStores.add("ExerciseSplitDaySession");
            this.client.exerciseSplitDaySession._getNeededStoresForWhere(whereClause.session, neededStores)
        }
    }

    _getNeededStoresForFind<Q extends Prisma.Args<Prisma.ExerciseDelegate, "findMany">>(query?: Q): Set<StoreNames<PrismaIDBSchema>> {
        const neededStores: Set<StoreNames<PrismaIDBSchema>> = new Set();
        neededStores.add("Exercise");
        this._getNeededStoresForWhere(query?.where, neededStores);
        if (query?.orderBy)
        {
            const orderBy = IDBUtils.convertToArray(query.orderBy);
            const orderBy_session = orderBy.find((clause) => clause.session);
            if (orderBy_session)
            {
                this.client.exerciseSplitDaySession
                ._getNeededStoresForFind({ orderBy: orderBy_session.session })
                .forEach((storeName) => neededStores.add(storeName));
            }
        }
        if (query?.select?.session || query?.include?.session)
        {
            neededStores.add("ExerciseSplitDaySession");
            if (typeof query.select?.session === "object")
            {
                this.client.exerciseSplitDaySession._getNeededStoresForFind(query.select.session).forEach((storeName) => neededStores.add(storeName));
            }
            if (typeof query.include?.session === "object")
            {
                this.client.exerciseSplitDaySession._getNeededStoresForFind(query.include.session).forEach((storeName) => neededStores.add(storeName));
            }
        }
        return neededStores;
    }

    _getNeededStoresForCreate<D extends Partial<Prisma.Args<Prisma.ExerciseDelegate, "create">['data']>>(data: D): Set<StoreNames<PrismaIDBSchema>> {
        const neededStores: Set<StoreNames<PrismaIDBSchema>> = new Set();
        neededStores.add("Exercise");
        if (data?.session)
        {
            neededStores.add('ExerciseSplitDaySession')
            if (data.session.create)
            {
                const createData = Array.isArray(data.session.create) ? data.session.create : [data.session.create];
                createData.forEach((record) => 
                this.client.exerciseSplitDaySession._getNeededStoresForCreate(record).forEach((storeName) => neededStores.add(storeName))
                );
            }
            if (data.session.connectOrCreate)
            {
                IDBUtils.convertToArray(data.session.connectOrCreate).forEach((record) => 
                this.client.exerciseSplitDaySession._getNeededStoresForCreate(record.create).forEach((storeName) => neededStores.add(storeName))
                );
            }
        }
        if (data.splitName !== undefined)
        {
            neededStores.add("ExerciseSplitDaySession")
        }
        return neededStores;
    }

    _getNeededStoresForUpdate<Q extends Prisma.Args<Prisma.ExerciseDelegate, "update">>(query: Partial<Q>): Set<StoreNames<PrismaIDBSchema>> {
        const neededStores = this._getNeededStoresForFind(query).union(this._getNeededStoresForCreate(query.data as Prisma.Args<Prisma.ExerciseDelegate, "create">["data"]));
        if (query.data?.session?.connect)
        {
            neededStores.add("ExerciseSplitDaySession");
            IDBUtils.convertToArray(query.data.session.connect).forEach((connect) => 
            {
                this.client.exerciseSplitDaySession._getNeededStoresForWhere(connect, neededStores);
            }
            );
        }
        if (query.data?.session?.update)
        {
            neededStores.add("ExerciseSplitDaySession");
            IDBUtils.convertToArray(query.data.session.update).forEach((update) => 
            {
                this.client.exerciseSplitDaySession._getNeededStoresForUpdate(update as Prisma.Args<Prisma.ExerciseSplitDaySessionDelegate, "update">).forEach((store) => neededStores.add(store));
            }
            )
        }
        if (query.data?.session?.upsert)
        {
            neededStores.add("ExerciseSplitDaySession");
            IDBUtils.convertToArray(query.data.session.upsert).forEach((upsert) => 
            {
                const update = { where: upsert.where, data: { ...upsert.update, ...upsert.create } } as Prisma.Args<Prisma.ExerciseSplitDaySessionDelegate, "update">;
                this.client.exerciseSplitDaySession._getNeededStoresForUpdate(update).forEach((store) => neededStores.add(store));
            }
            )
        }
        return neededStores;
    }

    _getNeededStoresForNestedDelete(neededStores: Set<StoreNames<PrismaIDBSchema>>): void {
        neededStores.add("Exercise");
    }

    private _removeNestedCreateData<D extends Prisma.Args<Prisma.ExerciseDelegate, "create">["data"]>(data: D): Prisma.Result<Prisma.ExerciseDelegate, object, "findFirstOrThrow"> {
        const recordWithoutNestedCreate = structuredClone(data);
        delete recordWithoutNestedCreate?.session;
        return recordWithoutNestedCreate as Prisma.Result<Prisma.ExerciseDelegate, object, "findFirstOrThrow">;
    }

    private _preprocessListFields(records: Prisma.Result<Prisma.ExerciseDelegate, object, "findMany">): void {
        for (const record of records)
        {
            record.secondaryMuscleGroups = record.secondaryMuscleGroups ?? [];
            record.notes = record.notes ?? [];
        }
    }

    async findMany<Q extends Prisma.Args<Prisma.ExerciseDelegate, 'findMany'>>(query?: Q, tx?: IDBUtils.TransactionType): Promise<Prisma.Result<Prisma.ExerciseDelegate, Q, 'findMany'>> {
        tx = tx ?? this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), "readonly");
        const records = await this._applyWhereClause(await tx.objectStore("Exercise").getAll(), query?.where, tx);
        await this._applyOrderByClause(records, query?.orderBy, tx);
        const relationAppliedRecords = (await this._applyRelations(records, tx, query)) as Prisma.Result<Prisma.ExerciseDelegate, object, 'findFirstOrThrow'>[];
        const selectClause = query?.select;
        let selectAppliedRecords = this._applySelectClause(relationAppliedRecords, selectClause);
        if (query?.distinct)
        {
            const distinctFields = IDBUtils.convertToArray(query.distinct);
            const seen = new Set<string>();
            selectAppliedRecords = selectAppliedRecords.filter((record) => 
            {
                const key = distinctFields.map((field) => record[field]).join("|");
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            }
            );
        }
        this._preprocessListFields(selectAppliedRecords);
        return selectAppliedRecords as Prisma.Result<Prisma.ExerciseDelegate, Q, 'findMany'>;
    }

    async findFirst<Q extends Prisma.Args<Prisma.ExerciseDelegate, 'findFirst'>>(query?: Q, tx?: IDBUtils.TransactionType): Promise<Prisma.Result<Prisma.ExerciseDelegate, Q, 'findFirst'>> {
        tx = tx ?? this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), "readonly");
        return (await this.findMany(query, tx))[0] ?? null;
    }

    async findFirstOrThrow<Q extends Prisma.Args<Prisma.ExerciseDelegate, "findFirstOrThrow">>(query?: Q, tx?: IDBUtils.TransactionType): Promise<Prisma.Result<Prisma.ExerciseDelegate, Q, "findFirstOrThrow">> {
        tx = tx ?? this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), "readonly");
        const record = await this.findFirst(query, tx);
        if (!record)
        {
            tx.abort();
            throw new Error("Record not found");
        }
        return record;
    }

    async findUnique<Q extends Prisma.Args<Prisma.ExerciseDelegate, 'findUnique'>>(query: Q, tx?: IDBUtils.TransactionType): Promise<Prisma.Result<Prisma.ExerciseDelegate, Q, 'findUnique'>> {
        tx = tx ?? this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), "readonly");
        let record;
        if (query.where.splitName_splitDayIndex_sessionIndex_exerciseIndex_userId !== undefined)
        {
            record = await tx.objectStore("Exercise").get([query.where.splitName_splitDayIndex_sessionIndex_exerciseIndex_userId.splitName,query.where.splitName_splitDayIndex_sessionIndex_exerciseIndex_userId.splitDayIndex,query.where.splitName_splitDayIndex_sessionIndex_exerciseIndex_userId.sessionIndex,query.where.splitName_splitDayIndex_sessionIndex_exerciseIndex_userId.exerciseIndex,query.where.splitName_splitDayIndex_sessionIndex_exerciseIndex_userId.userId]);
        }
        if (!record) return null;

        const recordWithRelations = this._applySelectClause(await this._applyRelations(await this._applyWhereClause([record], query.where, tx), tx, query), query.select)[0];
        this._preprocessListFields([recordWithRelations]);
        return recordWithRelations as Prisma.Result<Prisma.ExerciseDelegate, Q, "findUnique">;
    }

    async findUniqueOrThrow<Q extends Prisma.Args<Prisma.ExerciseDelegate, "findUniqueOrThrow">>(query: Q, tx?: IDBUtils.TransactionType): Promise<Prisma.Result<Prisma.ExerciseDelegate, Q, "findUniqueOrThrow">> {
        tx = tx ?? this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), "readonly");
        const record = await this.findUnique(query, tx);
        if (!record)
        {
            tx.abort();
            throw new Error("Record not found");
        }
        return record;
    }

    async count<Q extends Prisma.Args<Prisma.ExerciseDelegate, 'count'>>(query?: Q, tx?: IDBUtils.TransactionType): Promise<Prisma.Result<Prisma.ExerciseDelegate, Q, 'count'>> {
        tx = tx ?? this.client._db.transaction(["Exercise"], "readonly");
        if (!query?.select || query.select === true)
        {
            const records = await this.findMany({ where: query?.where }, tx);
            return records.length as Prisma.Result<Prisma.ExerciseDelegate, Q, "count">;
        }
        const result: Partial<Record<keyof Prisma.ExerciseCountAggregateInputType, number>> = {};
        for (const key of Object.keys(query.select))
        {
            const typedKey = key as keyof typeof query.select;
            if (typedKey === "_all")
            {
                result[typedKey] = (await this.findMany({ where: query.where }, tx)).length;
                continue;
            }
            result[typedKey] = (await this.findMany({ where: { [`${typedKey}`]: { not: null } } }, tx)).length;
        }
        return result as Prisma.Result<Prisma.ExerciseDelegate, Q, "count">;
    }

    async create<Q extends Prisma.Args<Prisma.ExerciseDelegate, "create">>(query: Q, tx?: IDBUtils.ReadwriteTransactionType): Promise<Prisma.Result<Prisma.ExerciseDelegate, Q, "create">> {
        const storesNeeded = this._getNeededStoresForCreate(query.data);
        tx = tx ?? this.client._db.transaction(Array.from(storesNeeded), "readwrite");
        if (query.data.session)
        {
            const fk: Partial<PrismaIDBSchema['ExerciseSplitDaySession']['key']> = [];
            if (query.data.session?.create)
            {
                const record = await this.client.exerciseSplitDaySession.create({ data: query.data.session.create }, tx);
                fk[0] = record.exerciseSplitName
                fk[1] = record.dayIndex
                fk[2] = record.sessionIndex
                fk[3] = record.userId
            }
            if (query.data.session?.connect)
            {
                const record = await this.client.exerciseSplitDaySession.findUniqueOrThrow({ where: query.data.session.connect }, tx);
                delete query.data.session.connect;
                fk[0] = record.exerciseSplitName;
                fk[1] = record.dayIndex;
                fk[2] = record.sessionIndex;
                fk[3] = record.userId;
            }
            if (query.data.session?.connectOrCreate)
            {
                const record = await this.client.exerciseSplitDaySession.upsert({
                where: query.data.session.connectOrCreate.where,
                create: query.data.session.connectOrCreate.create,
                update: {},
                }, tx);
                fk[0] = record.exerciseSplitName;
                fk[1] = record.dayIndex;
                fk[2] = record.sessionIndex;
                fk[3] = record.userId;
            }
            const unsafeData = query.data as Record<string, unknown>;
            unsafeData.splitName = fk[0];
            unsafeData.splitDayIndex = fk[1];
            unsafeData.sessionIndex = fk[2];
            unsafeData.userId = fk[3];
            delete unsafeData.session;
        }
        else if (query.data?.splitName !== undefined && query.data.splitName !== null)
        {
            await this.client.exerciseSplitDaySession.findUniqueOrThrow(
            {
                where: { exerciseSplitName_dayIndex_sessionIndex_userId: { exerciseSplitName: query.data.splitName, dayIndex: query.data.splitDayIndex, sessionIndex: query.data.sessionIndex, userId: query.data.userId } }
            }
            , tx);
        }
        const record = this._removeNestedCreateData(await this._fillDefaults(query.data, tx));
        const keyPath = await tx.objectStore("Exercise").add(record);
        const data = (await tx.objectStore("Exercise").get(keyPath))!;
        const recordsWithRelations = this._applySelectClause(await this._applyRelations<object>([data], tx, query), query.select)[0];
        this._preprocessListFields([recordsWithRelations]);
        this.emit("create", keyPath);
        return recordsWithRelations as Prisma.Result<Prisma.ExerciseDelegate, Q, "create">;
    }

    async createMany<Q extends Prisma.Args<Prisma.ExerciseDelegate, "createMany">>(query: Q, tx?: IDBUtils.ReadwriteTransactionType): Promise<Prisma.Result<Prisma.ExerciseDelegate, Q, "createMany">> {
        const createManyData = IDBUtils.convertToArray(query.data);
        tx = tx ?? this.client._db.transaction(["Exercise"], "readwrite");
        for (const createData of createManyData)
        {
            const record = this._removeNestedCreateData(await this._fillDefaults(createData, tx));
            const keyPath = await tx.objectStore("Exercise").add(record);
            this.emit("create", keyPath);
        }
        return { count: createManyData.length };
    }

    async createManyAndReturn<Q extends Prisma.Args<Prisma.ExerciseDelegate, "createManyAndReturn">>(query: Q, tx?: IDBUtils.ReadwriteTransactionType): Promise<Prisma.Result<Prisma.ExerciseDelegate, Q, "createManyAndReturn">> {
        const createManyData = IDBUtils.convertToArray(query.data);
        const records: Prisma.Result<Prisma.ExerciseDelegate, object, "findMany"> = [];
        tx = tx ?? this.client._db.transaction(["Exercise"], "readwrite");
        for (const createData of createManyData)
        {
            const record = this._removeNestedCreateData(await this._fillDefaults(createData, tx));
            const keyPath = await tx.objectStore("Exercise").add(record);
            this.emit("create", keyPath);
            records.push(this._applySelectClause([record], query.select)[0]);
        }
        this._preprocessListFields(records);
        return records as Prisma.Result<Prisma.ExerciseDelegate, Q, "createManyAndReturn">;
    }

    async delete<Q extends Prisma.Args<Prisma.ExerciseDelegate, 'delete'>>(query: Q, tx?: IDBUtils.ReadwriteTransactionType): Promise<Prisma.Result<Prisma.ExerciseDelegate, Q, 'delete'>> {
        const storesNeeded = this._getNeededStoresForFind(query);
        this._getNeededStoresForNestedDelete(storesNeeded);
        tx = tx ?? this.client._db.transaction(Array.from(storesNeeded), "readwrite");
        const record = await this.findUnique(query, tx);
        if (!record) throw new Error("Record not found");
        await tx.objectStore("Exercise").delete([record.splitName, record.splitDayIndex, record.sessionIndex, record.exerciseIndex, record.userId]);
        this.emit("delete", [record.splitName, record.splitDayIndex, record.sessionIndex, record.exerciseIndex, record.userId]);
        return record;
    }

    async deleteMany<Q extends Prisma.Args<Prisma.ExerciseDelegate, 'deleteMany'>>(query?: Q, tx?: IDBUtils.ReadwriteTransactionType): Promise<Prisma.Result<Prisma.ExerciseDelegate, Q, 'deleteMany'>> {
        const storesNeeded = this._getNeededStoresForFind(query);
        this._getNeededStoresForNestedDelete(storesNeeded);
        tx = tx ?? this.client._db.transaction(Array.from(storesNeeded), "readwrite");
        const records = await this.findMany(query, tx);
        for (const record of records)
        {
            await this.delete({ where: { splitName_splitDayIndex_sessionIndex_exerciseIndex_userId: { splitName: record.splitName, splitDayIndex: record.splitDayIndex, sessionIndex: record.sessionIndex, exerciseIndex: record.exerciseIndex, userId: record.userId } } }, tx);
        }
        return { count: records.length };
    }

    async update<Q extends Prisma.Args<Prisma.ExerciseDelegate, 'update'>>(query: Q, tx?: IDBUtils.ReadwriteTransactionType): Promise<Prisma.Result<Prisma.ExerciseDelegate, Q, 'update'>> {
        tx = tx ?? this.client._db.transaction(
        Array.from(this._getNeededStoresForUpdate(query)), "readwrite");
        const record = await this.findUnique({ where: query.where }, tx);
        if (record === null)
        {
            tx.abort();
            throw new Error("Record not found");
        }
        const startKeyPath: PrismaIDBSchema["Exercise"]["key"] = [record.splitName,record.splitDayIndex,record.sessionIndex,record.exerciseIndex,record.userId];
        const stringFields = ["splitName","userId","name","primaryMuscleGroup"] as const;
        for (const field of stringFields)
        {
            IDBUtils.handleStringUpdateField(record, field, query.data[field]);
        }
        const booleanFields = ["forceRIRMatching","lastSetToFailure"] as const;
        for (const field of booleanFields)
        {
            IDBUtils.handleBooleanUpdateField(record, field, query.data[field]);
        }
        const intFields = ["sessionIndex","splitDayIndex","exerciseIndex","repRangeStart","repRangeEnd"] as const;
        for (const field of intFields)
        {
            IDBUtils.handleIntUpdateField(record, field, query.data[field]);
        }
        const listFields = ["secondaryMuscleGroups","notes"] as const;
        for (const field of listFields)
        {
            IDBUtils.handleScalarListUpdateField(record, field, query.data[field]);
        }
        if (query.data.session)
        {
            if (query.data.session.connect)
            {
                const other = await this.client.exerciseSplitDaySession.findUniqueOrThrow({ where: query.data.session.connect }, tx);
                record.splitName = other.exerciseSplitName;
                record.splitDayIndex = other.dayIndex;
                record.sessionIndex = other.sessionIndex;
                record.userId = other.userId;
            }
            if (query.data.session.create)
            {
                const other = await this.client.exerciseSplitDaySession.create({ data: query.data.session.create }, tx);
                record.splitName = other.exerciseSplitName;
                record.splitDayIndex = other.dayIndex;
                record.sessionIndex = other.sessionIndex;
                record.userId = other.userId;
            }
            if (query.data.session.update)
            {
                const updateData = query.data.session.update.data ?? query.data.session.update;
                await this.client.exerciseSplitDaySession.update({ where: { ...query.data.session.update.where, exerciseSplitName_dayIndex_sessionIndex_userId : { exerciseSplitName: record.splitName, dayIndex: record.splitDayIndex, sessionIndex: record.sessionIndex, userId: record.userId } } as Prisma.ExerciseSplitDaySessionWhereUniqueInput, data: updateData }, tx);
            }
            if (query.data.session.upsert)
            {
                await this.client.exerciseSplitDaySession.upsert({ where: { ...query.data.session.upsert.where, exerciseSplitName_dayIndex_sessionIndex_userId : { exerciseSplitName: record.splitName, dayIndex: record.splitDayIndex, sessionIndex: record.sessionIndex, userId: record.userId } } as Prisma.ExerciseSplitDaySessionWhereUniqueInput, create: { ...query.data.session.upsert.create, exerciseSplitName: record.splitName!, dayIndex: record.splitDayIndex!, sessionIndex: record.sessionIndex!, userId: record.userId! } as Prisma.Args<Prisma.ExerciseSplitDaySessionDelegate, "upsert">['create'], update: query.data.session.upsert.update, }, tx);
            }
            if (query.data.session.connectOrCreate)
            {
                await this.client.exerciseSplitDaySession.upsert(
                {
                    where: { ...query.data.session.connectOrCreate.where, exerciseSplitName_dayIndex_sessionIndex_userId : { exerciseSplitName: record.splitName, dayIndex: record.splitDayIndex, sessionIndex: record.sessionIndex, userId: record.userId } },
                    create: { ...query.data.session.connectOrCreate.create, exerciseSplitName: record.splitName!, dayIndex: record.splitDayIndex!, sessionIndex: record.sessionIndex!, userId: record.userId! } as Prisma.Args<Prisma.ExerciseSplitDaySessionDelegate, "upsert">['create'],
                    update: { exerciseSplitName: record.splitName!, dayIndex: record.splitDayIndex!, sessionIndex: record.sessionIndex!, userId: record.userId! },
                }
                , tx);
            }
        }
        if (query.data.splitName !== undefined || query.data.splitDayIndex !== undefined || query.data.sessionIndex !== undefined || query.data.userId !== undefined)
        {
            const related = await this.client.exerciseSplitDaySession.findUnique({ where: { exerciseSplitName_dayIndex_sessionIndex_userId: { exerciseSplitName: record.splitName, dayIndex: record.splitDayIndex, sessionIndex: record.sessionIndex, userId: record.userId } } }, tx);
            if (!related) throw new Error("Related record not found");
        }
        const endKeyPath: PrismaIDBSchema["Exercise"]["key"] = [record.splitName,record.splitDayIndex,record.sessionIndex,record.exerciseIndex,record.userId];
        for (let i = 0; i < startKeyPath.length; i++)
        {
            if (startKeyPath[i] !== endKeyPath[i])
            {
                if (await tx.objectStore("Exercise").get(endKeyPath) !== undefined)
                {
                    throw new Error("Record with the same keyPath already exists");
                }
                await tx.objectStore("Exercise").delete(startKeyPath);
                break;
            }
        }
        const keyPath = await tx.objectStore("Exercise").put(record);
        this.emit("update", keyPath, startKeyPath);
        for (let i = 0; i < startKeyPath.length; i++)
        {
            if (startKeyPath[i] !== endKeyPath[i])
            {
                break;
            }
        }
        const recordWithRelations = (await this.findUnique(
        {
            where: { splitName_splitDayIndex_sessionIndex_exerciseIndex_userId: { splitName: keyPath[0], splitDayIndex: keyPath[1], sessionIndex: keyPath[2], exerciseIndex: keyPath[3], userId: keyPath[4] } },
        }
        , tx))!;
        return recordWithRelations as Prisma.Result<Prisma.ExerciseDelegate, Q, "update">;
    }

    async updateMany<Q extends Prisma.Args<Prisma.ExerciseDelegate, "updateMany">>(query: Q, tx?: IDBUtils.ReadwriteTransactionType): Promise<Prisma.Result<Prisma.ExerciseDelegate, Q, "updateMany">> {
        tx = tx ?? this.client._db.transaction(
        Array.from(this._getNeededStoresForFind(query)), "readwrite");
        const records = await this.findMany({ where: query.where }, tx);
        await Promise.all(
        records.map(async (record) =>
        {
            await this.update({ where: { splitName_splitDayIndex_sessionIndex_exerciseIndex_userId: { splitName: record.splitName, splitDayIndex: record.splitDayIndex, sessionIndex: record.sessionIndex, exerciseIndex: record.exerciseIndex, userId: record.userId } }, data: query.data }, tx);
        }
        ));
        return { count: records.length };
    }

    async upsert<Q extends Prisma.Args<Prisma.ExerciseDelegate, "upsert">>(query: Q, tx?: IDBUtils.ReadwriteTransactionType): Promise<Prisma.Result<Prisma.ExerciseDelegate, Q, "upsert">> {
        const neededStores = this._getNeededStoresForUpdate({ ...query, data: { ...query.update, ...query.create } as Prisma.Args<Prisma.ExerciseDelegate, "update">["data"] });
        tx = tx ?? this.client._db.transaction(Array.from(neededStores), "readwrite");
        let record = await this.findUnique({ where: query.where }, tx);
        if (!record) record = await this.create({ data: query.create }, tx);
        else record = await this.update({ where: query.where, data: query.update }, tx);
        record = await this.findUniqueOrThrow({ where: { splitName_splitDayIndex_sessionIndex_exerciseIndex_userId: { splitName: record.splitName, splitDayIndex: record.splitDayIndex, sessionIndex: record.sessionIndex, exerciseIndex: record.exerciseIndex, userId: record.userId } }, select: query.select, include: query.include }, tx);
        return record as Prisma.Result<Prisma.ExerciseDelegate, Q, "upsert">;
    }

    async aggregate<Q extends Prisma.Args<Prisma.ExerciseDelegate, 'aggregate'>>(query?: Q, tx?: IDBUtils.TransactionType): Promise<Prisma.Result<Prisma.ExerciseDelegate, Q, 'aggregate'>> {
        tx = tx ?? this.client._db.transaction(["Exercise"], "readonly");
        const records = await this.findMany({ where: query?.where }, tx);
        const result: Partial<Prisma.Result<Prisma.ExerciseDelegate, Q, "aggregate">> = {};
        if (query?._count)
        {
            if (query._count === true)
            {
                (result._count as number) = records.length;
            }
            else
            {
                for (const key of Object.keys(query._count))
                {
                    const typedKey = key as keyof typeof query._count;
                    if (typedKey === "_all")
                    {
                        (result._count as Record<string, number>)[typedKey] = records.length;
                        continue;
                    }
                    (result._count as Record<string, number>)[typedKey] = (
                    await this.findMany({ where: { [`${typedKey}`]: { not: null } } }, tx)
                    ).length;
                }
            }
        }
        if (query?._min)
        {
            const minResult = {} as Prisma.Result<Prisma.ExerciseDelegate, Q, "aggregate">["_min"];
            const numericFields = ["sessionIndex","splitDayIndex","exerciseIndex","bodyweightFraction","repRangeStart","repRangeEnd","preferredOverloadPercentage","minimumWeightChange"] as const;
            for (const field of numericFields)
            {
                if (!query._min[field]) continue;
                const values = records.map((record) => record[field] as number).filter((value) => value !== undefined);
                (minResult[field as keyof typeof minResult] as number) = Math.min(...values);
            }
            const stringFields = ["splitName","userId","name","primaryMuscleGroup"] as const;
            for (const field of stringFields)
            {
                if (!query._min[field]) continue;
                const values = records.map((record) => record[field] as string).filter((value) => value !== undefined);
                (minResult[field as keyof typeof minResult] as string) = values.sort()[0];
            }
            const booleanFields = ["forceRIRMatching","lastSetToFailure"] as const;
            for (const field of booleanFields)
            {
                if (!query._min[field]) continue;
                const values = records.map((record) => record[field] as boolean).filter((value) => value !== undefined);
                (minResult[field as keyof typeof minResult] as boolean) = values.includes(true);
            }
            result._min = minResult;
        }
        if (query?._max)
        {
            const maxResult = {} as Prisma.Result<Prisma.ExerciseDelegate, Q, "aggregate">["_max"];
            const numericFields = ["sessionIndex","splitDayIndex","exerciseIndex","bodyweightFraction","repRangeStart","repRangeEnd","preferredOverloadPercentage","minimumWeightChange"] as const;
            for (const field of numericFields)
            {
                if (!query._max[field]) continue;
                const values = records.map((record) => record[field] as number).filter((value) => value !== undefined);
                (maxResult[field as keyof typeof maxResult] as number) = Math.max(...values);
            }
            const stringFields = ["splitName","userId","name","primaryMuscleGroup"] as const;
            for (const field of stringFields)
            {
                if (!query._max[field]) continue;
                const values = records.map((record) => record[field] as string).filter((value) => value !== undefined);
                (maxResult[field as keyof typeof maxResult] as string) = values.sort().reverse()[0];
            }
            const booleanFields = ["forceRIRMatching","lastSetToFailure"] as const;
            for (const field of booleanFields)
            {
                if (!query._max[field]) continue;
                const values = records.map((record) => record[field] as boolean).filter((value) => value !== undefined);
                (maxResult[field as keyof typeof maxResult] as boolean) = values.includes(true);
            }
            result._max = maxResult;
            result._max = maxResult;
        }
        if (query?._avg)
        {
            const avgResult = {} as Prisma.Result<Prisma.ExerciseDelegate, Q, "aggregate">["_avg"];
            for (const untypedField of Object.keys(query._avg))
            {
                const field = untypedField as keyof (typeof records)[number];
                const values = records.map((record) => record[field] as number);
                (avgResult[field as keyof typeof avgResult] as number) = values.reduce((a, b) => a + b, 0) / values.length;
            }
            result._avg = avgResult;
        }
        if (query?._sum)
        {
            const sumResult = {} as Prisma.Result<Prisma.ExerciseDelegate, Q, "aggregate">["_sum"];
            for (const untypedField of Object.keys(query._sum))
            {
                const field = untypedField as keyof (typeof records)[number];
                const values = records.map((record) => record[field] as number);
                (sumResult[field as keyof typeof sumResult] as number) = values.reduce((a, b) => a + b, 0);
            }
            result._sum = sumResult;
        }
        return result as unknown as Prisma.Result<Prisma.ExerciseDelegate, Q, "aggregate">;
    }
}

class UserIDBClass extends BaseIDBModelClass<"User"> {
    private async _applyWhereClause<W extends Prisma.Args<Prisma.UserDelegate, 'findFirstOrThrow'>['where'], R extends Prisma.Result<Prisma.UserDelegate, object, 'findFirstOrThrow'>>(records: R[], whereClause: W, tx: IDBUtils.TransactionType): Promise<R[]> {
        if (!whereClause) return records;
        records = await IDBUtils.applyLogicalFilters<Prisma.UserDelegate, R, W>(
        records, whereClause, tx, this.keyPath, this._applyWhereClause.bind(this),
        )
        return (await Promise.all(records.map(async (record) =>
        {
            const stringFields = ["id","email","name","password","image"] as const;
            for (const field of stringFields)
            {
                if (!IDBUtils.whereStringFilter(record, field, whereClause[field])) return null;
            }
            const booleanFields = ["emailVerified"] as const;
            for (const field of booleanFields)
            {
                if (!IDBUtils.whereBoolFilter(record, field, whereClause[field])) return null;
            }
            const dateTimeFields = ["createdAt","updatedAt"] as const;
            for (const field of dateTimeFields)
            {
                if (!IDBUtils.whereDateTimeFilter(record, field, whereClause[field])) return null;
            }
            if (whereClause.sessions)
            {
                if (whereClause.sessions.every)
                {
                    const violatingRecord = await this.client.session.findFirst(
                    {
                        where: { NOT: { ...whereClause.sessions.every }, userId: record.id }, tx
                    }
                    );
                    if (violatingRecord !== null) return null;
                }
                if (whereClause.sessions.some)
                {
                    const relatedRecords = await this.client.session.findMany(
                    {
                        where: { ...whereClause.sessions.some, userId: record.id }, tx
                    }
                    );
                    if (relatedRecords.length === 0) return null;
                }
                if (whereClause.sessions.none)
                {
                    const violatingRecord = await this.client.session.findFirst(
                    {
                        where: { ...whereClause.sessions.none, userId: record.id }, tx
                    }
                    );
                    if (violatingRecord !== null) return null;
                }
            }
            if (whereClause.accounts)
            {
                if (whereClause.accounts.every)
                {
                    const violatingRecord = await this.client.account.findFirst(
                    {
                        where: { NOT: { ...whereClause.accounts.every }, userId: record.id }, tx
                    }
                    );
                    if (violatingRecord !== null) return null;
                }
                if (whereClause.accounts.some)
                {
                    const relatedRecords = await this.client.account.findMany(
                    {
                        where: { ...whereClause.accounts.some, userId: record.id }, tx
                    }
                    );
                    if (relatedRecords.length === 0) return null;
                }
                if (whereClause.accounts.none)
                {
                    const violatingRecord = await this.client.account.findFirst(
                    {
                        where: { ...whereClause.accounts.none, userId: record.id }, tx
                    }
                    );
                    if (violatingRecord !== null) return null;
                }
            }
            if (whereClause.exerciseSplits)
            {
                if (whereClause.exerciseSplits.every)
                {
                    const violatingRecord = await this.client.exerciseSplit.findFirst(
                    {
                        where: { NOT: { ...whereClause.exerciseSplits.every }, userId: record.id }, tx
                    }
                    );
                    if (violatingRecord !== null) return null;
                }
                if (whereClause.exerciseSplits.some)
                {
                    const relatedRecords = await this.client.exerciseSplit.findMany(
                    {
                        where: { ...whereClause.exerciseSplits.some, userId: record.id }, tx
                    }
                    );
                    if (relatedRecords.length === 0) return null;
                }
                if (whereClause.exerciseSplits.none)
                {
                    const violatingRecord = await this.client.exerciseSplit.findFirst(
                    {
                        where: { ...whereClause.exerciseSplits.none, userId: record.id }, tx
                    }
                    );
                    if (violatingRecord !== null) return null;
                }
            }
            return record;
        }
        ))).filter((result) => result !== null);;
    }

    private _applySelectClause<S extends Prisma.Args<Prisma.UserDelegate, 'findMany'>['select']>(records: Prisma.Result<Prisma.UserDelegate, object, 'findFirstOrThrow'>[], selectClause: S): Prisma.Result<Prisma.UserDelegate, { select: S }, 'findFirstOrThrow'>[] {
        if (!selectClause)
        {
            return records as Prisma.Result<Prisma.UserDelegate, { select: S }, 'findFirstOrThrow'>[];
        }
        return records.map((record) => 
        {
            const partialRecord: Partial<typeof record> = record;
            for (const untypedKey of ["id","email","name","password","createdAt","updatedAt","emailVerified","image","sessions","accounts","exerciseSplits"]) 
            {
                const key = untypedKey as keyof typeof record & keyof S;
                if (!selectClause[key]) delete partialRecord[key];
            }
            return partialRecord;
        }
        ) as Prisma.Result<Prisma.UserDelegate, { select: S }, 'findFirstOrThrow'>[];
    }

    private async _applyRelations<Q extends Prisma.Args<Prisma.UserDelegate, 'findMany'>>(records: Prisma.Result<Prisma.UserDelegate, object, 'findFirstOrThrow'>[], tx: IDBUtils.TransactionType, query?: Q): Promise<Prisma.Result<Prisma.UserDelegate, Q, 'findFirstOrThrow'>[]> {
        if (!query) return records as Prisma.Result<Prisma.UserDelegate, Q, 'findFirstOrThrow'>[];
        const recordsWithRelations = records.map(async (record) => 
        {
            const unsafeRecord = record as Record<string, unknown>;
            const attach_sessions = query.select?.sessions || query.include?.sessions;
            if (attach_sessions)
            {
                unsafeRecord['sessions'] = await this.client.session.findMany(
                {
                    ...(attach_sessions === true ? {} : attach_sessions),
                    where: { userId: record.id! }
                }
                , tx)
            }
            const attach_accounts = query.select?.accounts || query.include?.accounts;
            if (attach_accounts)
            {
                unsafeRecord['accounts'] = await this.client.account.findMany(
                {
                    ...(attach_accounts === true ? {} : attach_accounts),
                    where: { userId: record.id! }
                }
                , tx)
            }
            const attach_exerciseSplits = query.select?.exerciseSplits || query.include?.exerciseSplits;
            if (attach_exerciseSplits)
            {
                unsafeRecord['exerciseSplits'] = await this.client.exerciseSplit.findMany(
                {
                    ...(attach_exerciseSplits === true ? {} : attach_exerciseSplits),
                    where: { userId: record.id! }
                }
                , tx)
            }
            return unsafeRecord;
        }
        );
        return (await Promise.all(recordsWithRelations)) as Prisma.Result<Prisma.UserDelegate, Q, 'findFirstOrThrow'>[];
    }

    async _applyOrderByClause<O extends Prisma.Args<Prisma.UserDelegate, 'findMany'>['orderBy'], R extends Prisma.Result<Prisma.UserDelegate, object, "findFirstOrThrow">>(records: R[], orderByClause: O, tx: IDBUtils.TransactionType): Promise<void> {
        if (orderByClause === undefined) return;
        const orderByClauses = IDBUtils.convertToArray(orderByClause);
        const indexedKeys = await Promise.all(
        records.map(async (record) => 
        {
            const keys = await Promise.all(
            orderByClauses.map(async (clause) => await this._resolveOrderByKey(record, clause, tx)),
            );
            return { keys, record };
        }
        ));
        indexedKeys.sort((a, b) => 
        {
            for (let i = 0; i < orderByClauses.length; i++)
            {
                const clause = orderByClauses[i];
                const comparison = IDBUtils.genericComparator(a.keys[i], b.keys[i], this._resolveSortOrder(clause));
                if (comparison !== 0) return comparison;
            }
            return 0;
        }
        );
        for (let i = 0; i < records.length; i++)
        {
            records[i] = indexedKeys[i].record;
        }
    }

    async _resolveOrderByKey(record: Prisma.Result<Prisma.UserDelegate, object, "findFirstOrThrow">, orderByInput: Prisma.UserOrderByWithRelationInput, tx: IDBUtils.TransactionType): Promise<unknown> {
        const scalarFields = ["id","email","name","password","createdAt","updatedAt","emailVerified","image"] as const;
        for (const field of scalarFields) if (orderByInput[field]) return record[field];
        if (orderByInput.sessions)
        {
            return await this.client.session.count({ where: { userId: record.id } }, tx);
        }
        if (orderByInput.accounts)
        {
            return await this.client.account.count({ where: { userId: record.id } }, tx);
        }
        if (orderByInput.exerciseSplits)
        {
            return await this.client.exerciseSplit.count({ where: { userId: record.id } }, tx);
        }
    }

    _resolveSortOrder(orderByInput: Prisma.UserOrderByWithRelationInput): Prisma.SortOrder | { sort: Prisma.SortOrder, nulls?: 'first' | 'last' } {
        const scalarFields = ["id","email","name","password","createdAt","updatedAt","emailVerified","image"] as const;
        for (const field of scalarFields) if (orderByInput[field]) return orderByInput[field];
        if (orderByInput.sessions?._count)
        {
            return orderByInput.sessions._count;
        }
        if (orderByInput.accounts?._count)
        {
            return orderByInput.accounts._count;
        }
        if (orderByInput.exerciseSplits?._count)
        {
            return orderByInput.exerciseSplits._count;
        }
        throw new Error("No field in orderBy clause");
    }

    private async _fillDefaults<D extends Prisma.Args<Prisma.UserDelegate, "create">["data"]>(data: D, tx?: IDBUtils.ReadwriteTransactionType): Promise<D> {
        if (data === undefined) data = {} as NonNullable<D>;
        if (data.id === undefined) 
        {
            data.id = createId();
        }
        if (data.name === undefined) 
        {
            data.name = null;
        }
        if (data.createdAt === undefined) 
        {
            data.createdAt = new Date();
        }
        if (data.image === undefined) 
        {
            data.image = null;
        }
        if (typeof data.createdAt === 'string')
        {
            data.createdAt = new Date(data.createdAt)
        }
        if (typeof data.updatedAt === 'string')
        {
            data.updatedAt = new Date(data.updatedAt)
        }
        return data;
    }

    _getNeededStoresForWhere<W extends Prisma.Args<Prisma.UserDelegate, "findMany">['where']>(whereClause: W, neededStores: Set<StoreNames<PrismaIDBSchema>>) {
        if (whereClause === undefined) return;
        for (const param of IDBUtils.LogicalParams)
        {
            if (whereClause[param])
            {
                for (const clause of IDBUtils.convertToArray(whereClause[param]))
                {
                    this._getNeededStoresForWhere(clause, neededStores);
                }
            }
        }
        if (whereClause.sessions)
        {
            neededStores.add("Session");
            this.client.session._getNeededStoresForWhere(whereClause.sessions.every, neededStores)
            this.client.session._getNeededStoresForWhere(whereClause.sessions.some, neededStores)
            this.client.session._getNeededStoresForWhere(whereClause.sessions.none, neededStores)
        }
        if (whereClause.accounts)
        {
            neededStores.add("Account");
            this.client.account._getNeededStoresForWhere(whereClause.accounts.every, neededStores)
            this.client.account._getNeededStoresForWhere(whereClause.accounts.some, neededStores)
            this.client.account._getNeededStoresForWhere(whereClause.accounts.none, neededStores)
        }
        if (whereClause.exerciseSplits)
        {
            neededStores.add("ExerciseSplit");
            this.client.exerciseSplit._getNeededStoresForWhere(whereClause.exerciseSplits.every, neededStores)
            this.client.exerciseSplit._getNeededStoresForWhere(whereClause.exerciseSplits.some, neededStores)
            this.client.exerciseSplit._getNeededStoresForWhere(whereClause.exerciseSplits.none, neededStores)
        }
    }

    _getNeededStoresForFind<Q extends Prisma.Args<Prisma.UserDelegate, "findMany">>(query?: Q): Set<StoreNames<PrismaIDBSchema>> {
        const neededStores: Set<StoreNames<PrismaIDBSchema>> = new Set();
        neededStores.add("User");
        this._getNeededStoresForWhere(query?.where, neededStores);
        if (query?.orderBy)
        {
            const orderBy = IDBUtils.convertToArray(query.orderBy);
            const orderBy_sessions = orderBy.find((clause) => clause.sessions);
            if (orderBy_sessions)
            {
                neededStores.add("Session")
            }
            const orderBy_accounts = orderBy.find((clause) => clause.accounts);
            if (orderBy_accounts)
            {
                neededStores.add("Account")
            }
            const orderBy_exerciseSplits = orderBy.find((clause) => clause.exerciseSplits);
            if (orderBy_exerciseSplits)
            {
                neededStores.add("ExerciseSplit")
            }
        }
        if (query?.select?.sessions || query?.include?.sessions)
        {
            neededStores.add("Session");
            if (typeof query.select?.sessions === "object")
            {
                this.client.session._getNeededStoresForFind(query.select.sessions).forEach((storeName) => neededStores.add(storeName));
            }
            if (typeof query.include?.sessions === "object")
            {
                this.client.session._getNeededStoresForFind(query.include.sessions).forEach((storeName) => neededStores.add(storeName));
            }
        }
        if (query?.select?.accounts || query?.include?.accounts)
        {
            neededStores.add("Account");
            if (typeof query.select?.accounts === "object")
            {
                this.client.account._getNeededStoresForFind(query.select.accounts).forEach((storeName) => neededStores.add(storeName));
            }
            if (typeof query.include?.accounts === "object")
            {
                this.client.account._getNeededStoresForFind(query.include.accounts).forEach((storeName) => neededStores.add(storeName));
            }
        }
        if (query?.select?.exerciseSplits || query?.include?.exerciseSplits)
        {
            neededStores.add("ExerciseSplit");
            if (typeof query.select?.exerciseSplits === "object")
            {
                this.client.exerciseSplit._getNeededStoresForFind(query.select.exerciseSplits).forEach((storeName) => neededStores.add(storeName));
            }
            if (typeof query.include?.exerciseSplits === "object")
            {
                this.client.exerciseSplit._getNeededStoresForFind(query.include.exerciseSplits).forEach((storeName) => neededStores.add(storeName));
            }
        }
        return neededStores;
    }

    _getNeededStoresForCreate<D extends Partial<Prisma.Args<Prisma.UserDelegate, "create">['data']>>(data: D): Set<StoreNames<PrismaIDBSchema>> {
        const neededStores: Set<StoreNames<PrismaIDBSchema>> = new Set();
        neededStores.add("User");
        if (data?.sessions)
        {
            neededStores.add('Session')
            if (data.sessions.create)
            {
                const createData = Array.isArray(data.sessions.create) ? data.sessions.create : [data.sessions.create];
                createData.forEach((record) => 
                this.client.session._getNeededStoresForCreate(record).forEach((storeName) => neededStores.add(storeName))
                );
            }
            if (data.sessions.connectOrCreate)
            {
                IDBUtils.convertToArray(data.sessions.connectOrCreate).forEach((record) => 
                this.client.session._getNeededStoresForCreate(record.create).forEach((storeName) => neededStores.add(storeName))
                );
            }
            if (data.sessions.createMany)
            {
                IDBUtils.convertToArray(data.sessions.createMany.data).forEach((record) => 
                this.client.session._getNeededStoresForCreate(record).forEach((storeName) => neededStores.add(storeName))
                );
            }
        }
        if (data?.accounts)
        {
            neededStores.add('Account')
            if (data.accounts.create)
            {
                const createData = Array.isArray(data.accounts.create) ? data.accounts.create : [data.accounts.create];
                createData.forEach((record) => 
                this.client.account._getNeededStoresForCreate(record).forEach((storeName) => neededStores.add(storeName))
                );
            }
            if (data.accounts.connectOrCreate)
            {
                IDBUtils.convertToArray(data.accounts.connectOrCreate).forEach((record) => 
                this.client.account._getNeededStoresForCreate(record.create).forEach((storeName) => neededStores.add(storeName))
                );
            }
            if (data.accounts.createMany)
            {
                IDBUtils.convertToArray(data.accounts.createMany.data).forEach((record) => 
                this.client.account._getNeededStoresForCreate(record).forEach((storeName) => neededStores.add(storeName))
                );
            }
        }
        if (data?.exerciseSplits)
        {
            neededStores.add('ExerciseSplit')
            if (data.exerciseSplits.create)
            {
                const createData = Array.isArray(data.exerciseSplits.create) ? data.exerciseSplits.create : [data.exerciseSplits.create];
                createData.forEach((record) => 
                this.client.exerciseSplit._getNeededStoresForCreate(record).forEach((storeName) => neededStores.add(storeName))
                );
            }
            if (data.exerciseSplits.connectOrCreate)
            {
                IDBUtils.convertToArray(data.exerciseSplits.connectOrCreate).forEach((record) => 
                this.client.exerciseSplit._getNeededStoresForCreate(record.create).forEach((storeName) => neededStores.add(storeName))
                );
            }
            if (data.exerciseSplits.createMany)
            {
                IDBUtils.convertToArray(data.exerciseSplits.createMany.data).forEach((record) => 
                this.client.exerciseSplit._getNeededStoresForCreate(record).forEach((storeName) => neededStores.add(storeName))
                );
            }
        }
        return neededStores;
    }

    _getNeededStoresForUpdate<Q extends Prisma.Args<Prisma.UserDelegate, "update">>(query: Partial<Q>): Set<StoreNames<PrismaIDBSchema>> {
        const neededStores = this._getNeededStoresForFind(query).union(this._getNeededStoresForCreate(query.data as Prisma.Args<Prisma.UserDelegate, "create">["data"]));
        if (query.data?.sessions?.connect)
        {
            neededStores.add("Session");
            IDBUtils.convertToArray(query.data.sessions.connect).forEach((connect) => 
            {
                this.client.session._getNeededStoresForWhere(connect, neededStores);
            }
            );
        }
        if (query.data?.sessions?.set)
        {
            neededStores.add("Session");
            IDBUtils.convertToArray(query.data.sessions.set).forEach((setWhere) => 
            {
                this.client.session._getNeededStoresForWhere(setWhere, neededStores);
            }
            )
        }
        if (query.data?.sessions?.updateMany)
        {
            neededStores.add("Session");
            IDBUtils.convertToArray(query.data.sessions.updateMany).forEach((update) => 
            {
                this.client.session._getNeededStoresForUpdate(update as Prisma.Args<Prisma.SessionDelegate, "update">).forEach((store) => neededStores.add(store));
            }
            )
        }
        if (query.data?.sessions?.update)
        {
            neededStores.add("Session");
            IDBUtils.convertToArray(query.data.sessions.update).forEach((update) => 
            {
                this.client.session._getNeededStoresForUpdate(update as Prisma.Args<Prisma.SessionDelegate, "update">).forEach((store) => neededStores.add(store));
            }
            )
        }
        if (query.data?.sessions?.upsert)
        {
            neededStores.add("Session");
            IDBUtils.convertToArray(query.data.sessions.upsert).forEach((upsert) => 
            {
                const update = { where: upsert.where, data: { ...upsert.update, ...upsert.create } } as Prisma.Args<Prisma.SessionDelegate, "update">;
                this.client.session._getNeededStoresForUpdate(update).forEach((store) => neededStores.add(store));
            }
            )
        }
        if (query.data?.accounts?.connect)
        {
            neededStores.add("Account");
            IDBUtils.convertToArray(query.data.accounts.connect).forEach((connect) => 
            {
                this.client.account._getNeededStoresForWhere(connect, neededStores);
            }
            );
        }
        if (query.data?.accounts?.set)
        {
            neededStores.add("Account");
            IDBUtils.convertToArray(query.data.accounts.set).forEach((setWhere) => 
            {
                this.client.account._getNeededStoresForWhere(setWhere, neededStores);
            }
            )
        }
        if (query.data?.accounts?.updateMany)
        {
            neededStores.add("Account");
            IDBUtils.convertToArray(query.data.accounts.updateMany).forEach((update) => 
            {
                this.client.account._getNeededStoresForUpdate(update as Prisma.Args<Prisma.AccountDelegate, "update">).forEach((store) => neededStores.add(store));
            }
            )
        }
        if (query.data?.accounts?.update)
        {
            neededStores.add("Account");
            IDBUtils.convertToArray(query.data.accounts.update).forEach((update) => 
            {
                this.client.account._getNeededStoresForUpdate(update as Prisma.Args<Prisma.AccountDelegate, "update">).forEach((store) => neededStores.add(store));
            }
            )
        }
        if (query.data?.accounts?.upsert)
        {
            neededStores.add("Account");
            IDBUtils.convertToArray(query.data.accounts.upsert).forEach((upsert) => 
            {
                const update = { where: upsert.where, data: { ...upsert.update, ...upsert.create } } as Prisma.Args<Prisma.AccountDelegate, "update">;
                this.client.account._getNeededStoresForUpdate(update).forEach((store) => neededStores.add(store));
            }
            )
        }
        if (query.data?.exerciseSplits?.connect)
        {
            neededStores.add("ExerciseSplit");
            IDBUtils.convertToArray(query.data.exerciseSplits.connect).forEach((connect) => 
            {
                this.client.exerciseSplit._getNeededStoresForWhere(connect, neededStores);
            }
            );
        }
        if (query.data?.exerciseSplits?.set)
        {
            neededStores.add("ExerciseSplit");
            IDBUtils.convertToArray(query.data.exerciseSplits.set).forEach((setWhere) => 
            {
                this.client.exerciseSplit._getNeededStoresForWhere(setWhere, neededStores);
            }
            )
        }
        if (query.data?.exerciseSplits?.updateMany)
        {
            neededStores.add("ExerciseSplit");
            IDBUtils.convertToArray(query.data.exerciseSplits.updateMany).forEach((update) => 
            {
                this.client.exerciseSplit._getNeededStoresForUpdate(update as Prisma.Args<Prisma.ExerciseSplitDelegate, "update">).forEach((store) => neededStores.add(store));
            }
            )
        }
        if (query.data?.exerciseSplits?.update)
        {
            neededStores.add("ExerciseSplit");
            IDBUtils.convertToArray(query.data.exerciseSplits.update).forEach((update) => 
            {
                this.client.exerciseSplit._getNeededStoresForUpdate(update as Prisma.Args<Prisma.ExerciseSplitDelegate, "update">).forEach((store) => neededStores.add(store));
            }
            )
        }
        if (query.data?.exerciseSplits?.upsert)
        {
            neededStores.add("ExerciseSplit");
            IDBUtils.convertToArray(query.data.exerciseSplits.upsert).forEach((upsert) => 
            {
                const update = { where: upsert.where, data: { ...upsert.update, ...upsert.create } } as Prisma.Args<Prisma.ExerciseSplitDelegate, "update">;
                this.client.exerciseSplit._getNeededStoresForUpdate(update).forEach((store) => neededStores.add(store));
            }
            )
        }
        if (query.data?.sessions?.delete || query.data?.sessions?.deleteMany)
        {
            this.client.session._getNeededStoresForNestedDelete(neededStores);
        }
        if (query.data?.accounts?.delete || query.data?.accounts?.deleteMany)
        {
            this.client.account._getNeededStoresForNestedDelete(neededStores);
        }
        if (query.data?.exerciseSplits?.delete || query.data?.exerciseSplits?.deleteMany)
        {
            this.client.exerciseSplit._getNeededStoresForNestedDelete(neededStores);
        }
        if (query.data?.id !== undefined)
        {
            neededStores.add("ExerciseSplit");
            neededStores.add("Session");
            neededStores.add("Account");
        }
        return neededStores;
    }

    _getNeededStoresForNestedDelete(neededStores: Set<StoreNames<PrismaIDBSchema>>): void {
        neededStores.add("User");
        this.client.session._getNeededStoresForNestedDelete(neededStores);
        this.client.account._getNeededStoresForNestedDelete(neededStores);
        this.client.exerciseSplit._getNeededStoresForNestedDelete(neededStores);
    }

    private _removeNestedCreateData<D extends Prisma.Args<Prisma.UserDelegate, "create">["data"]>(data: D): Prisma.Result<Prisma.UserDelegate, object, "findFirstOrThrow"> {
        const recordWithoutNestedCreate = structuredClone(data);
        delete recordWithoutNestedCreate?.sessions;
        delete recordWithoutNestedCreate?.accounts;
        delete recordWithoutNestedCreate?.exerciseSplits;
        return recordWithoutNestedCreate as Prisma.Result<Prisma.UserDelegate, object, "findFirstOrThrow">;
    }

    private _preprocessListFields(records: Prisma.Result<Prisma.UserDelegate, object, "findMany">): void {
    }

    async findMany<Q extends Prisma.Args<Prisma.UserDelegate, 'findMany'>>(query?: Q, tx?: IDBUtils.TransactionType): Promise<Prisma.Result<Prisma.UserDelegate, Q, 'findMany'>> {
        tx = tx ?? this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), "readonly");
        const records = await this._applyWhereClause(await tx.objectStore("User").getAll(), query?.where, tx);
        await this._applyOrderByClause(records, query?.orderBy, tx);
        const relationAppliedRecords = (await this._applyRelations(records, tx, query)) as Prisma.Result<Prisma.UserDelegate, object, 'findFirstOrThrow'>[];
        const selectClause = query?.select;
        let selectAppliedRecords = this._applySelectClause(relationAppliedRecords, selectClause);
        if (query?.distinct)
        {
            const distinctFields = IDBUtils.convertToArray(query.distinct);
            const seen = new Set<string>();
            selectAppliedRecords = selectAppliedRecords.filter((record) => 
            {
                const key = distinctFields.map((field) => record[field]).join("|");
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            }
            );
        }
        this._preprocessListFields(selectAppliedRecords);
        return selectAppliedRecords as Prisma.Result<Prisma.UserDelegate, Q, 'findMany'>;
    }

    async findFirst<Q extends Prisma.Args<Prisma.UserDelegate, 'findFirst'>>(query?: Q, tx?: IDBUtils.TransactionType): Promise<Prisma.Result<Prisma.UserDelegate, Q, 'findFirst'>> {
        tx = tx ?? this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), "readonly");
        return (await this.findMany(query, tx))[0] ?? null;
    }

    async findFirstOrThrow<Q extends Prisma.Args<Prisma.UserDelegate, "findFirstOrThrow">>(query?: Q, tx?: IDBUtils.TransactionType): Promise<Prisma.Result<Prisma.UserDelegate, Q, "findFirstOrThrow">> {
        tx = tx ?? this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), "readonly");
        const record = await this.findFirst(query, tx);
        if (!record)
        {
            tx.abort();
            throw new Error("Record not found");
        }
        return record;
    }

    async findUnique<Q extends Prisma.Args<Prisma.UserDelegate, 'findUnique'>>(query: Q, tx?: IDBUtils.TransactionType): Promise<Prisma.Result<Prisma.UserDelegate, Q, 'findUnique'>> {
        tx = tx ?? this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), "readonly");
        let record;
        if (query.where.id !== undefined)
        {
            record = await tx.objectStore("User").get([query.where.id]);
        }
        else if (query.where.email !== undefined)
        {
            record = await tx.objectStore("User").index("emailIndex").get([query.where.email]);
        }
        if (!record) return null;

        const recordWithRelations = this._applySelectClause(await this._applyRelations(await this._applyWhereClause([record], query.where, tx), tx, query), query.select)[0];
        this._preprocessListFields([recordWithRelations]);
        return recordWithRelations as Prisma.Result<Prisma.UserDelegate, Q, "findUnique">;
    }

    async findUniqueOrThrow<Q extends Prisma.Args<Prisma.UserDelegate, "findUniqueOrThrow">>(query: Q, tx?: IDBUtils.TransactionType): Promise<Prisma.Result<Prisma.UserDelegate, Q, "findUniqueOrThrow">> {
        tx = tx ?? this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), "readonly");
        const record = await this.findUnique(query, tx);
        if (!record)
        {
            tx.abort();
            throw new Error("Record not found");
        }
        return record;
    }

    async count<Q extends Prisma.Args<Prisma.UserDelegate, 'count'>>(query?: Q, tx?: IDBUtils.TransactionType): Promise<Prisma.Result<Prisma.UserDelegate, Q, 'count'>> {
        tx = tx ?? this.client._db.transaction(["User"], "readonly");
        if (!query?.select || query.select === true)
        {
            const records = await this.findMany({ where: query?.where }, tx);
            return records.length as Prisma.Result<Prisma.UserDelegate, Q, "count">;
        }
        const result: Partial<Record<keyof Prisma.UserCountAggregateInputType, number>> = {};
        for (const key of Object.keys(query.select))
        {
            const typedKey = key as keyof typeof query.select;
            if (typedKey === "_all")
            {
                result[typedKey] = (await this.findMany({ where: query.where }, tx)).length;
                continue;
            }
            result[typedKey] = (await this.findMany({ where: { [`${typedKey}`]: { not: null } } }, tx)).length;
        }
        return result as Prisma.Result<Prisma.UserDelegate, Q, "count">;
    }

    async create<Q extends Prisma.Args<Prisma.UserDelegate, "create">>(query: Q, tx?: IDBUtils.ReadwriteTransactionType): Promise<Prisma.Result<Prisma.UserDelegate, Q, "create">> {
        const storesNeeded = this._getNeededStoresForCreate(query.data);
        tx = tx ?? this.client._db.transaction(Array.from(storesNeeded), "readwrite");
        const record = this._removeNestedCreateData(await this._fillDefaults(query.data, tx));
        const keyPath = await tx.objectStore("User").add(record);
        if (query.data?.sessions?.create)
        {
            for (const elem of IDBUtils.convertToArray(query.data.sessions.create))
            {
                await this.client.session.create({ data: { ...elem, user: { connect: { id: keyPath[0] } } } as Prisma.Args<Prisma.SessionDelegate, "create">['data'] }, tx);
            }
        }
        if (query.data?.sessions?.connect)
        {
            await Promise.all(
                IDBUtils.convertToArray(query.data.sessions.connect).map(async (connectWhere) => 
                {
                    await this.client.session.update({ where: connectWhere, data: { userId: keyPath[0] } }, tx);
                }
                ),
            );
        }
        if (query.data?.sessions?.connectOrCreate)
        {
            await Promise.all(
                IDBUtils.convertToArray(query.data.sessions.connectOrCreate).map(async (connectOrCreate) => 
                {
                    await this.client.session.upsert({
                    where: connectOrCreate.where,
                    create: { ...connectOrCreate.create, userId: keyPath[0] } as Prisma.Args<Prisma.SessionDelegate, "create">["data"],
                    update: { userId: keyPath[0] },
                    }, tx);
                }
                ),
            );
        }
        if (query.data?.sessions?.createMany)
        {
            await this.client.session.createMany( {
                data: IDBUtils.convertToArray(query.data.sessions.createMany.data).map((createData) => (
                {
                    ...createData, userId: keyPath[0]
                }
                )),
            }
            , tx)
        }
        if (query.data?.accounts?.create)
        {
            for (const elem of IDBUtils.convertToArray(query.data.accounts.create))
            {
                await this.client.account.create({ data: { ...elem, user: { connect: { id: keyPath[0] } } } as Prisma.Args<Prisma.AccountDelegate, "create">['data'] }, tx);
            }
        }
        if (query.data?.accounts?.connect)
        {
            await Promise.all(
                IDBUtils.convertToArray(query.data.accounts.connect).map(async (connectWhere) => 
                {
                    await this.client.account.update({ where: connectWhere, data: { userId: keyPath[0] } }, tx);
                }
                ),
            );
        }
        if (query.data?.accounts?.connectOrCreate)
        {
            await Promise.all(
                IDBUtils.convertToArray(query.data.accounts.connectOrCreate).map(async (connectOrCreate) => 
                {
                    await this.client.account.upsert({
                    where: connectOrCreate.where,
                    create: { ...connectOrCreate.create, userId: keyPath[0] } as Prisma.Args<Prisma.AccountDelegate, "create">["data"],
                    update: { userId: keyPath[0] },
                    }, tx);
                }
                ),
            );
        }
        if (query.data?.accounts?.createMany)
        {
            await this.client.account.createMany( {
                data: IDBUtils.convertToArray(query.data.accounts.createMany.data).map((createData) => (
                {
                    ...createData, userId: keyPath[0]
                }
                )),
            }
            , tx)
        }
        if (query.data?.exerciseSplits?.create)
        {
            for (const elem of IDBUtils.convertToArray(query.data.exerciseSplits.create))
            {
                await this.client.exerciseSplit.create({ data: { ...elem, user: { connect: { id: keyPath[0] } } } as Prisma.Args<Prisma.ExerciseSplitDelegate, "create">['data'] }, tx);
            }
        }
        if (query.data?.exerciseSplits?.connect)
        {
            await Promise.all(
                IDBUtils.convertToArray(query.data.exerciseSplits.connect).map(async (connectWhere) => 
                {
                    await this.client.exerciseSplit.update({ where: connectWhere, data: { userId: keyPath[0] } }, tx);
                }
                ),
            );
        }
        if (query.data?.exerciseSplits?.connectOrCreate)
        {
            await Promise.all(
                IDBUtils.convertToArray(query.data.exerciseSplits.connectOrCreate).map(async (connectOrCreate) => 
                {
                    await this.client.exerciseSplit.upsert({
                    where: connectOrCreate.where,
                    create: { ...connectOrCreate.create, userId: keyPath[0] } as Prisma.Args<Prisma.ExerciseSplitDelegate, "create">["data"],
                    update: { userId: keyPath[0] },
                    }, tx);
                }
                ),
            );
        }
        if (query.data?.exerciseSplits?.createMany)
        {
            await this.client.exerciseSplit.createMany( {
                data: IDBUtils.convertToArray(query.data.exerciseSplits.createMany.data).map((createData) => (
                {
                    ...createData, userId: keyPath[0]
                }
                )),
            }
            , tx)
        }
        const data = (await tx.objectStore("User").get(keyPath))!;
        const recordsWithRelations = this._applySelectClause(await this._applyRelations<object>([data], tx, query), query.select)[0];
        this._preprocessListFields([recordsWithRelations]);
        this.emit("create", keyPath);
        return recordsWithRelations as Prisma.Result<Prisma.UserDelegate, Q, "create">;
    }

    async createMany<Q extends Prisma.Args<Prisma.UserDelegate, "createMany">>(query: Q, tx?: IDBUtils.ReadwriteTransactionType): Promise<Prisma.Result<Prisma.UserDelegate, Q, "createMany">> {
        const createManyData = IDBUtils.convertToArray(query.data);
        tx = tx ?? this.client._db.transaction(["User"], "readwrite");
        for (const createData of createManyData)
        {
            const record = this._removeNestedCreateData(await this._fillDefaults(createData, tx));
            const keyPath = await tx.objectStore("User").add(record);
            this.emit("create", keyPath);
        }
        return { count: createManyData.length };
    }

    async createManyAndReturn<Q extends Prisma.Args<Prisma.UserDelegate, "createManyAndReturn">>(query: Q, tx?: IDBUtils.ReadwriteTransactionType): Promise<Prisma.Result<Prisma.UserDelegate, Q, "createManyAndReturn">> {
        const createManyData = IDBUtils.convertToArray(query.data);
        const records: Prisma.Result<Prisma.UserDelegate, object, "findMany"> = [];
        tx = tx ?? this.client._db.transaction(["User"], "readwrite");
        for (const createData of createManyData)
        {
            const record = this._removeNestedCreateData(await this._fillDefaults(createData, tx));
            const keyPath = await tx.objectStore("User").add(record);
            this.emit("create", keyPath);
            records.push(this._applySelectClause([record], query.select)[0]);
        }
        this._preprocessListFields(records);
        return records as Prisma.Result<Prisma.UserDelegate, Q, "createManyAndReturn">;
    }

    async delete<Q extends Prisma.Args<Prisma.UserDelegate, 'delete'>>(query: Q, tx?: IDBUtils.ReadwriteTransactionType): Promise<Prisma.Result<Prisma.UserDelegate, Q, 'delete'>> {
        const storesNeeded = this._getNeededStoresForFind(query);
        this._getNeededStoresForNestedDelete(storesNeeded);
        tx = tx ?? this.client._db.transaction(Array.from(storesNeeded), "readwrite");
        const record = await this.findUnique(query, tx);
        if (!record) throw new Error("Record not found");
        const relatedExerciseSplit = await this.client.exerciseSplit.findMany({ where: { userId: record.id } }, tx);
        if (relatedExerciseSplit.length) throw new Error("Cannot delete record, other records depend on it");
        await this.client.session.deleteMany( {
            where: { userId: record.id }
        }
        , tx)
        await this.client.account.deleteMany( {
            where: { userId: record.id }
        }
        , tx)
        await tx.objectStore("User").delete([record.id]);
        this.emit("delete", [record.id]);
        return record;
    }

    async deleteMany<Q extends Prisma.Args<Prisma.UserDelegate, 'deleteMany'>>(query?: Q, tx?: IDBUtils.ReadwriteTransactionType): Promise<Prisma.Result<Prisma.UserDelegate, Q, 'deleteMany'>> {
        const storesNeeded = this._getNeededStoresForFind(query);
        this._getNeededStoresForNestedDelete(storesNeeded);
        tx = tx ?? this.client._db.transaction(Array.from(storesNeeded), "readwrite");
        const records = await this.findMany(query, tx);
        for (const record of records)
        {
            await this.delete({ where: { id: record.id } }, tx);
        }
        return { count: records.length };
    }

    async update<Q extends Prisma.Args<Prisma.UserDelegate, 'update'>>(query: Q, tx?: IDBUtils.ReadwriteTransactionType): Promise<Prisma.Result<Prisma.UserDelegate, Q, 'update'>> {
        tx = tx ?? this.client._db.transaction(
        Array.from(this._getNeededStoresForUpdate(query)), "readwrite");
        const record = await this.findUnique({ where: query.where }, tx);
        if (record === null)
        {
            tx.abort();
            throw new Error("Record not found");
        }
        const startKeyPath: PrismaIDBSchema["User"]["key"] = [record.id];
        const stringFields = ["id","email","name","password","image"] as const;
        for (const field of stringFields)
        {
            IDBUtils.handleStringUpdateField(record, field, query.data[field]);
        }
        const dateTimeFields = ["createdAt","updatedAt"] as const;
        for (const field of dateTimeFields)
        {
            IDBUtils.handleDateTimeUpdateField(record, field, query.data[field]);
        }
        const booleanFields = ["emailVerified"] as const;
        for (const field of booleanFields)
        {
            IDBUtils.handleBooleanUpdateField(record, field, query.data[field]);
        }
        if (query.data.sessions)
        {
            if (query.data.sessions.connect)
            {
                await Promise.all(
                IDBUtils.convertToArray(query.data.sessions.connect).map(async (connectWhere) => 
                {
                    await this.client.session.update({ where: connectWhere, data: { userId: record.id } }, tx);
                }
                ))
            }
            if (query.data.sessions.disconnect)
            {
                throw new Error("Cannot disconnect required relation");
            }
            if (query.data.sessions.create)
            {
                const createData = Array.isArray(query.data.sessions.create)
                ? query.data.sessions.create
                : [query.data.sessions.create];
                for (const elem of createData)
                {
                    await this.client.session.create({ data: { ...elem, userId: record.id }as Prisma.Args<Prisma.SessionDelegate, "create">["data"] }, tx);
                }
            }
            if (query.data.sessions.createMany)
            {
                await Promise.all(
                IDBUtils.convertToArray(query.data.sessions.createMany.data).map(async (createData) => 
                {
                    await this.client.session.create({ data: { ...createData, userId: record.id } }, tx);
                }
                ))
            }
            if (query.data.sessions.update)
            {
                await Promise.all(
                IDBUtils.convertToArray(query.data.sessions.update).map(async (updateData) => 
                {
                    await this.client.session.update(updateData, tx);
                }
                ))
            }
            if (query.data.sessions.updateMany)
            {
                await Promise.all(
                IDBUtils.convertToArray(query.data.sessions.updateMany).map(async (updateData) => 
                {
                    await this.client.session.updateMany(updateData, tx);
                }
                ))
            }
            if (query.data.sessions.upsert)
            {
                await Promise.all(
                IDBUtils.convertToArray(query.data.sessions.upsert).map(async (upsertData) => 
                {
                    await this.client.session.upsert({ ...upsertData, where: { ...upsertData.where, userId: record.id }, create: { ...upsertData.create, userId: record.id } as Prisma.Args<Prisma.SessionDelegate, "upsert">['create'] }, tx);
                }
                ))
            }
            if (query.data.sessions.delete)
            {
                await Promise.all(
                IDBUtils.convertToArray(query.data.sessions.delete).map(async (deleteData) => 
                {
                    await this.client.session.delete({ where: { ...deleteData, userId: record.id } }, tx);
                }
                ))
            }
            if (query.data.sessions.deleteMany)
            {
                await Promise.all(
                IDBUtils.convertToArray(query.data.sessions.deleteMany).map(async (deleteData) => 
                {
                    await this.client.session.deleteMany({ where: { ...deleteData, userId: record.id } }, tx);
                }
                ))
            }
            if (query.data.sessions.set)
            {
                const existing = await this.client.session.findMany({ where: { userId: record.id } }, tx);
                if (existing.length > 0)
                {
                    throw new Error("Cannot set required relation");
                }
                await Promise.all(
                IDBUtils.convertToArray(query.data.sessions.set).map(async (setData) => 
                {
                    await this.client.session.update({ where: setData, data: { userId: record.id } }, tx);
                }
                ))
            }
        }
        if (query.data.accounts)
        {
            if (query.data.accounts.connect)
            {
                await Promise.all(
                IDBUtils.convertToArray(query.data.accounts.connect).map(async (connectWhere) => 
                {
                    await this.client.account.update({ where: connectWhere, data: { userId: record.id } }, tx);
                }
                ))
            }
            if (query.data.accounts.disconnect)
            {
                throw new Error("Cannot disconnect required relation");
            }
            if (query.data.accounts.create)
            {
                const createData = Array.isArray(query.data.accounts.create)
                ? query.data.accounts.create
                : [query.data.accounts.create];
                for (const elem of createData)
                {
                    await this.client.account.create({ data: { ...elem, userId: record.id }as Prisma.Args<Prisma.AccountDelegate, "create">["data"] }, tx);
                }
            }
            if (query.data.accounts.createMany)
            {
                await Promise.all(
                IDBUtils.convertToArray(query.data.accounts.createMany.data).map(async (createData) => 
                {
                    await this.client.account.create({ data: { ...createData, userId: record.id } }, tx);
                }
                ))
            }
            if (query.data.accounts.update)
            {
                await Promise.all(
                IDBUtils.convertToArray(query.data.accounts.update).map(async (updateData) => 
                {
                    await this.client.account.update(updateData, tx);
                }
                ))
            }
            if (query.data.accounts.updateMany)
            {
                await Promise.all(
                IDBUtils.convertToArray(query.data.accounts.updateMany).map(async (updateData) => 
                {
                    await this.client.account.updateMany(updateData, tx);
                }
                ))
            }
            if (query.data.accounts.upsert)
            {
                await Promise.all(
                IDBUtils.convertToArray(query.data.accounts.upsert).map(async (upsertData) => 
                {
                    await this.client.account.upsert({ ...upsertData, where: { ...upsertData.where, userId: record.id }, create: { ...upsertData.create, userId: record.id } as Prisma.Args<Prisma.AccountDelegate, "upsert">['create'] }, tx);
                }
                ))
            }
            if (query.data.accounts.delete)
            {
                await Promise.all(
                IDBUtils.convertToArray(query.data.accounts.delete).map(async (deleteData) => 
                {
                    await this.client.account.delete({ where: { ...deleteData, userId: record.id } }, tx);
                }
                ))
            }
            if (query.data.accounts.deleteMany)
            {
                await Promise.all(
                IDBUtils.convertToArray(query.data.accounts.deleteMany).map(async (deleteData) => 
                {
                    await this.client.account.deleteMany({ where: { ...deleteData, userId: record.id } }, tx);
                }
                ))
            }
            if (query.data.accounts.set)
            {
                const existing = await this.client.account.findMany({ where: { userId: record.id } }, tx);
                if (existing.length > 0)
                {
                    throw new Error("Cannot set required relation");
                }
                await Promise.all(
                IDBUtils.convertToArray(query.data.accounts.set).map(async (setData) => 
                {
                    await this.client.account.update({ where: setData, data: { userId: record.id } }, tx);
                }
                ))
            }
        }
        if (query.data.exerciseSplits)
        {
            if (query.data.exerciseSplits.connect)
            {
                await Promise.all(
                IDBUtils.convertToArray(query.data.exerciseSplits.connect).map(async (connectWhere) => 
                {
                    await this.client.exerciseSplit.update({ where: connectWhere, data: { userId: record.id } }, tx);
                }
                ))
            }
            if (query.data.exerciseSplits.disconnect)
            {
                throw new Error("Cannot disconnect required relation");
            }
            if (query.data.exerciseSplits.create)
            {
                const createData = Array.isArray(query.data.exerciseSplits.create)
                ? query.data.exerciseSplits.create
                : [query.data.exerciseSplits.create];
                for (const elem of createData)
                {
                    await this.client.exerciseSplit.create({ data: { ...elem, userId: record.id }as Prisma.Args<Prisma.ExerciseSplitDelegate, "create">["data"] }, tx);
                }
            }
            if (query.data.exerciseSplits.createMany)
            {
                await Promise.all(
                IDBUtils.convertToArray(query.data.exerciseSplits.createMany.data).map(async (createData) => 
                {
                    await this.client.exerciseSplit.create({ data: { ...createData, userId: record.id } }, tx);
                }
                ))
            }
            if (query.data.exerciseSplits.update)
            {
                await Promise.all(
                IDBUtils.convertToArray(query.data.exerciseSplits.update).map(async (updateData) => 
                {
                    await this.client.exerciseSplit.update(updateData, tx);
                }
                ))
            }
            if (query.data.exerciseSplits.updateMany)
            {
                await Promise.all(
                IDBUtils.convertToArray(query.data.exerciseSplits.updateMany).map(async (updateData) => 
                {
                    await this.client.exerciseSplit.updateMany(updateData, tx);
                }
                ))
            }
            if (query.data.exerciseSplits.upsert)
            {
                await Promise.all(
                IDBUtils.convertToArray(query.data.exerciseSplits.upsert).map(async (upsertData) => 
                {
                    await this.client.exerciseSplit.upsert({ ...upsertData, where: { ...upsertData.where, userId: record.id }, create: { ...upsertData.create, userId: record.id } as Prisma.Args<Prisma.ExerciseSplitDelegate, "upsert">['create'] }, tx);
                }
                ))
            }
            if (query.data.exerciseSplits.delete)
            {
                await Promise.all(
                IDBUtils.convertToArray(query.data.exerciseSplits.delete).map(async (deleteData) => 
                {
                    await this.client.exerciseSplit.delete({ where: { ...deleteData, userId: record.id } }, tx);
                }
                ))
            }
            if (query.data.exerciseSplits.deleteMany)
            {
                await Promise.all(
                IDBUtils.convertToArray(query.data.exerciseSplits.deleteMany).map(async (deleteData) => 
                {
                    await this.client.exerciseSplit.deleteMany({ where: { ...deleteData, userId: record.id } }, tx);
                }
                ))
            }
            if (query.data.exerciseSplits.set)
            {
                const existing = await this.client.exerciseSplit.findMany({ where: { userId: record.id } }, tx);
                if (existing.length > 0)
                {
                    throw new Error("Cannot set required relation");
                }
                await Promise.all(
                IDBUtils.convertToArray(query.data.exerciseSplits.set).map(async (setData) => 
                {
                    await this.client.exerciseSplit.update({ where: setData, data: { userId: record.id } }, tx);
                }
                ))
            }
        }
        const endKeyPath: PrismaIDBSchema["User"]["key"] = [record.id];
        for (let i = 0; i < startKeyPath.length; i++)
        {
            if (startKeyPath[i] !== endKeyPath[i])
            {
                if (await tx.objectStore("User").get(endKeyPath) !== undefined)
                {
                    throw new Error("Record with the same keyPath already exists");
                }
                await tx.objectStore("User").delete(startKeyPath);
                break;
            }
        }
        const keyPath = await tx.objectStore("User").put(record);
        this.emit("update", keyPath, startKeyPath);
        for (let i = 0; i < startKeyPath.length; i++)
        {
            if (startKeyPath[i] !== endKeyPath[i])
            {
                await this.client.exerciseSplit.updateMany(
                {
                    where: { userId: startKeyPath[0] },
                    data: { userId: endKeyPath[0] },
                }
                , tx);
                await this.client.session.updateMany(
                {
                    where: { userId: startKeyPath[0] },
                    data: { userId: endKeyPath[0] },
                }
                , tx);
                await this.client.account.updateMany(
                {
                    where: { userId: startKeyPath[0] },
                    data: { userId: endKeyPath[0] },
                }
                , tx);
                break;
            }
        }
        const recordWithRelations = (await this.findUnique(
        {
            where: { id: keyPath[0] },
        }
        , tx))!;
        return recordWithRelations as Prisma.Result<Prisma.UserDelegate, Q, "update">;
    }

    async updateMany<Q extends Prisma.Args<Prisma.UserDelegate, "updateMany">>(query: Q, tx?: IDBUtils.ReadwriteTransactionType): Promise<Prisma.Result<Prisma.UserDelegate, Q, "updateMany">> {
        tx = tx ?? this.client._db.transaction(
        Array.from(this._getNeededStoresForFind(query)), "readwrite");
        const records = await this.findMany({ where: query.where }, tx);
        await Promise.all(
        records.map(async (record) =>
        {
            await this.update({ where: { id: record.id }, data: query.data }, tx);
        }
        ));
        return { count: records.length };
    }

    async upsert<Q extends Prisma.Args<Prisma.UserDelegate, "upsert">>(query: Q, tx?: IDBUtils.ReadwriteTransactionType): Promise<Prisma.Result<Prisma.UserDelegate, Q, "upsert">> {
        const neededStores = this._getNeededStoresForUpdate({ ...query, data: { ...query.update, ...query.create } as Prisma.Args<Prisma.UserDelegate, "update">["data"] });
        tx = tx ?? this.client._db.transaction(Array.from(neededStores), "readwrite");
        let record = await this.findUnique({ where: query.where }, tx);
        if (!record) record = await this.create({ data: query.create }, tx);
        else record = await this.update({ where: query.where, data: query.update }, tx);
        record = await this.findUniqueOrThrow({ where: { id: record.id }, select: query.select, include: query.include }, tx);
        return record as Prisma.Result<Prisma.UserDelegate, Q, "upsert">;
    }

    async aggregate<Q extends Prisma.Args<Prisma.UserDelegate, 'aggregate'>>(query?: Q, tx?: IDBUtils.TransactionType): Promise<Prisma.Result<Prisma.UserDelegate, Q, 'aggregate'>> {
        tx = tx ?? this.client._db.transaction(["User"], "readonly");
        const records = await this.findMany({ where: query?.where }, tx);
        const result: Partial<Prisma.Result<Prisma.UserDelegate, Q, "aggregate">> = {};
        if (query?._count)
        {
            if (query._count === true)
            {
                (result._count as number) = records.length;
            }
            else
            {
                for (const key of Object.keys(query._count))
                {
                    const typedKey = key as keyof typeof query._count;
                    if (typedKey === "_all")
                    {
                        (result._count as Record<string, number>)[typedKey] = records.length;
                        continue;
                    }
                    (result._count as Record<string, number>)[typedKey] = (
                    await this.findMany({ where: { [`${typedKey}`]: { not: null } } }, tx)
                    ).length;
                }
            }
        }
        if (query?._min)
        {
            const minResult = {} as Prisma.Result<Prisma.UserDelegate, Q, "aggregate">["_min"];
            const dateTimeFields = ["createdAt","updatedAt"] as const;
            for (const field of dateTimeFields)
            {
                if (!query._min[field]) continue;
                const values = records.map((record) => record[field]?.getTime()).filter((value) => value !== undefined);
                (minResult[field as keyof typeof minResult] as Date) = new Date(Math.min(...values));
            }
            const stringFields = ["id","email","name","password","image"] as const;
            for (const field of stringFields)
            {
                if (!query._min[field]) continue;
                const values = records.map((record) => record[field] as string).filter((value) => value !== undefined);
                (minResult[field as keyof typeof minResult] as string) = values.sort()[0];
            }
            const booleanFields = ["emailVerified"] as const;
            for (const field of booleanFields)
            {
                if (!query._min[field]) continue;
                const values = records.map((record) => record[field] as boolean).filter((value) => value !== undefined);
                (minResult[field as keyof typeof minResult] as boolean) = values.includes(true);
            }
            result._min = minResult;
        }
        if (query?._max)
        {
            const maxResult = {} as Prisma.Result<Prisma.UserDelegate, Q, "aggregate">["_max"];
            const dateTimeFields = ["createdAt","updatedAt"] as const;
            for (const field of dateTimeFields)
            {
                if (!query._max[field]) continue;
                const values = records.map((record) => record[field]?.getTime()).filter((value) => value !== undefined);
                (maxResult[field as keyof typeof maxResult] as Date) = new Date(Math.max(...values));
            }
            const stringFields = ["id","email","name","password","image"] as const;
            for (const field of stringFields)
            {
                if (!query._max[field]) continue;
                const values = records.map((record) => record[field] as string).filter((value) => value !== undefined);
                (maxResult[field as keyof typeof maxResult] as string) = values.sort().reverse()[0];
            }
            const booleanFields = ["emailVerified"] as const;
            for (const field of booleanFields)
            {
                if (!query._max[field]) continue;
                const values = records.map((record) => record[field] as boolean).filter((value) => value !== undefined);
                (maxResult[field as keyof typeof maxResult] as boolean) = values.includes(true);
            }
            result._max = maxResult;
            result._max = maxResult;
        }
        return result as unknown as Prisma.Result<Prisma.UserDelegate, Q, "aggregate">;
    }
}

class SessionIDBClass extends BaseIDBModelClass<"Session"> {
    private async _applyWhereClause<W extends Prisma.Args<Prisma.SessionDelegate, 'findFirstOrThrow'>['where'], R extends Prisma.Result<Prisma.SessionDelegate, object, 'findFirstOrThrow'>>(records: R[], whereClause: W, tx: IDBUtils.TransactionType): Promise<R[]> {
        if (!whereClause) return records;
        records = await IDBUtils.applyLogicalFilters<Prisma.SessionDelegate, R, W>(
        records, whereClause, tx, this.keyPath, this._applyWhereClause.bind(this),
        )
        return (await Promise.all(records.map(async (record) =>
        {
            const stringFields = ["id","token","ipAddress","userAgent","userId"] as const;
            for (const field of stringFields)
            {
                if (!IDBUtils.whereStringFilter(record, field, whereClause[field])) return null;
            }
            const dateTimeFields = ["expiresAt","createdAt","updatedAt"] as const;
            for (const field of dateTimeFields)
            {
                if (!IDBUtils.whereDateTimeFilter(record, field, whereClause[field])) return null;
            }
            if (whereClause.user)
            {
                const { is, isNot, ...rest } = whereClause.user
                if (is !== null && is !== undefined)
                {
                    const relatedRecord = await this.client.user.findFirst({ where: { ...is, id: record.userId } }, tx)
                    if (!relatedRecord) return null;
                }
                if (isNot !== null && isNot !== undefined)
                {
                    const relatedRecord = await this.client.user.findFirst({ where: { ...isNot, id: record.userId } }, tx)
                    if (relatedRecord) return null;
                }
                if (Object.keys(rest).length)
                {
                    const relatedRecord = await this.client.user.findFirst({ where: { ...whereClause.user, id: record.userId } }, tx);
                    if (!relatedRecord) return null;
                }
            }
            return record;
        }
        ))).filter((result) => result !== null);;
    }

    private _applySelectClause<S extends Prisma.Args<Prisma.SessionDelegate, 'findMany'>['select']>(records: Prisma.Result<Prisma.SessionDelegate, object, 'findFirstOrThrow'>[], selectClause: S): Prisma.Result<Prisma.SessionDelegate, { select: S }, 'findFirstOrThrow'>[] {
        if (!selectClause)
        {
            return records as Prisma.Result<Prisma.SessionDelegate, { select: S }, 'findFirstOrThrow'>[];
        }
        return records.map((record) => 
        {
            const partialRecord: Partial<typeof record> = record;
            for (const untypedKey of ["id","expiresAt","token","createdAt","updatedAt","ipAddress","userAgent","userId","user"]) 
            {
                const key = untypedKey as keyof typeof record & keyof S;
                if (!selectClause[key]) delete partialRecord[key];
            }
            return partialRecord;
        }
        ) as Prisma.Result<Prisma.SessionDelegate, { select: S }, 'findFirstOrThrow'>[];
    }

    private async _applyRelations<Q extends Prisma.Args<Prisma.SessionDelegate, 'findMany'>>(records: Prisma.Result<Prisma.SessionDelegate, object, 'findFirstOrThrow'>[], tx: IDBUtils.TransactionType, query?: Q): Promise<Prisma.Result<Prisma.SessionDelegate, Q, 'findFirstOrThrow'>[]> {
        if (!query) return records as Prisma.Result<Prisma.SessionDelegate, Q, 'findFirstOrThrow'>[];
        const recordsWithRelations = records.map(async (record) => 
        {
            const unsafeRecord = record as Record<string, unknown>;
            const attach_user = query.select?.user || query.include?.user;
            if (attach_user)
            {
                unsafeRecord['user'] = 
                await this.client.user.findUnique(
                {
                    ...(attach_user === true ? {} : attach_user),
                    where: { id: record.userId! }
                }
                , tx)
            }
            return unsafeRecord;
        }
        );
        return (await Promise.all(recordsWithRelations)) as Prisma.Result<Prisma.SessionDelegate, Q, 'findFirstOrThrow'>[];
    }

    async _applyOrderByClause<O extends Prisma.Args<Prisma.SessionDelegate, 'findMany'>['orderBy'], R extends Prisma.Result<Prisma.SessionDelegate, object, "findFirstOrThrow">>(records: R[], orderByClause: O, tx: IDBUtils.TransactionType): Promise<void> {
        if (orderByClause === undefined) return;
        const orderByClauses = IDBUtils.convertToArray(orderByClause);
        const indexedKeys = await Promise.all(
        records.map(async (record) => 
        {
            const keys = await Promise.all(
            orderByClauses.map(async (clause) => await this._resolveOrderByKey(record, clause, tx)),
            );
            return { keys, record };
        }
        ));
        indexedKeys.sort((a, b) => 
        {
            for (let i = 0; i < orderByClauses.length; i++)
            {
                const clause = orderByClauses[i];
                const comparison = IDBUtils.genericComparator(a.keys[i], b.keys[i], this._resolveSortOrder(clause));
                if (comparison !== 0) return comparison;
            }
            return 0;
        }
        );
        for (let i = 0; i < records.length; i++)
        {
            records[i] = indexedKeys[i].record;
        }
    }

    async _resolveOrderByKey(record: Prisma.Result<Prisma.SessionDelegate, object, "findFirstOrThrow">, orderByInput: Prisma.SessionOrderByWithRelationInput, tx: IDBUtils.TransactionType): Promise<unknown> {
        const scalarFields = ["id","expiresAt","token","createdAt","updatedAt","ipAddress","userAgent","userId"] as const;
        for (const field of scalarFields) if (orderByInput[field]) return record[field];
        if (orderByInput.user)
        {
            return await this.client.user._resolveOrderByKey(await this.client.user.findFirstOrThrow({ where: { id: record.userId } }), orderByInput.user, tx);
        }
    }

    _resolveSortOrder(orderByInput: Prisma.SessionOrderByWithRelationInput): Prisma.SortOrder | { sort: Prisma.SortOrder, nulls?: 'first' | 'last' } {
        const scalarFields = ["id","expiresAt","token","createdAt","updatedAt","ipAddress","userAgent","userId"] as const;
        for (const field of scalarFields) if (orderByInput[field]) return orderByInput[field];
        if (orderByInput.user)
        {
            return this.client.user._resolveSortOrder(orderByInput.user);
        }
        throw new Error("No field in orderBy clause");
    }

    private async _fillDefaults<D extends Prisma.Args<Prisma.SessionDelegate, "create">["data"]>(data: D, tx?: IDBUtils.ReadwriteTransactionType): Promise<D> {
        if (data === undefined) data = {} as NonNullable<D>;
        if (data.ipAddress === undefined) 
        {
            data.ipAddress = null;
        }
        if (data.userAgent === undefined) 
        {
            data.userAgent = null;
        }
        if (typeof data.expiresAt === 'string')
        {
            data.expiresAt = new Date(data.expiresAt)
        }
        if (typeof data.createdAt === 'string')
        {
            data.createdAt = new Date(data.createdAt)
        }
        if (typeof data.updatedAt === 'string')
        {
            data.updatedAt = new Date(data.updatedAt)
        }
        return data;
    }

    _getNeededStoresForWhere<W extends Prisma.Args<Prisma.SessionDelegate, "findMany">['where']>(whereClause: W, neededStores: Set<StoreNames<PrismaIDBSchema>>) {
        if (whereClause === undefined) return;
        for (const param of IDBUtils.LogicalParams)
        {
            if (whereClause[param])
            {
                for (const clause of IDBUtils.convertToArray(whereClause[param]))
                {
                    this._getNeededStoresForWhere(clause, neededStores);
                }
            }
        }
        if (whereClause.user)
        {
            neededStores.add("User");
            this.client.user._getNeededStoresForWhere(whereClause.user, neededStores)
        }
    }

    _getNeededStoresForFind<Q extends Prisma.Args<Prisma.SessionDelegate, "findMany">>(query?: Q): Set<StoreNames<PrismaIDBSchema>> {
        const neededStores: Set<StoreNames<PrismaIDBSchema>> = new Set();
        neededStores.add("Session");
        this._getNeededStoresForWhere(query?.where, neededStores);
        if (query?.orderBy)
        {
            const orderBy = IDBUtils.convertToArray(query.orderBy);
            const orderBy_user = orderBy.find((clause) => clause.user);
            if (orderBy_user)
            {
                this.client.user
                ._getNeededStoresForFind({ orderBy: orderBy_user.user })
                .forEach((storeName) => neededStores.add(storeName));
            }
        }
        if (query?.select?.user || query?.include?.user)
        {
            neededStores.add("User");
            if (typeof query.select?.user === "object")
            {
                this.client.user._getNeededStoresForFind(query.select.user).forEach((storeName) => neededStores.add(storeName));
            }
            if (typeof query.include?.user === "object")
            {
                this.client.user._getNeededStoresForFind(query.include.user).forEach((storeName) => neededStores.add(storeName));
            }
        }
        return neededStores;
    }

    _getNeededStoresForCreate<D extends Partial<Prisma.Args<Prisma.SessionDelegate, "create">['data']>>(data: D): Set<StoreNames<PrismaIDBSchema>> {
        const neededStores: Set<StoreNames<PrismaIDBSchema>> = new Set();
        neededStores.add("Session");
        if (data?.user)
        {
            neededStores.add('User')
            if (data.user.create)
            {
                const createData = Array.isArray(data.user.create) ? data.user.create : [data.user.create];
                createData.forEach((record) => 
                this.client.user._getNeededStoresForCreate(record).forEach((storeName) => neededStores.add(storeName))
                );
            }
            if (data.user.connectOrCreate)
            {
                IDBUtils.convertToArray(data.user.connectOrCreate).forEach((record) => 
                this.client.user._getNeededStoresForCreate(record.create).forEach((storeName) => neededStores.add(storeName))
                );
            }
        }
        if (data.userId !== undefined)
        {
            neededStores.add("User")
        }
        return neededStores;
    }

    _getNeededStoresForUpdate<Q extends Prisma.Args<Prisma.SessionDelegate, "update">>(query: Partial<Q>): Set<StoreNames<PrismaIDBSchema>> {
        const neededStores = this._getNeededStoresForFind(query).union(this._getNeededStoresForCreate(query.data as Prisma.Args<Prisma.SessionDelegate, "create">["data"]));
        if (query.data?.user?.connect)
        {
            neededStores.add("User");
            IDBUtils.convertToArray(query.data.user.connect).forEach((connect) => 
            {
                this.client.user._getNeededStoresForWhere(connect, neededStores);
            }
            );
        }
        if (query.data?.user?.update)
        {
            neededStores.add("User");
            IDBUtils.convertToArray(query.data.user.update).forEach((update) => 
            {
                this.client.user._getNeededStoresForUpdate(update as Prisma.Args<Prisma.UserDelegate, "update">).forEach((store) => neededStores.add(store));
            }
            )
        }
        if (query.data?.user?.upsert)
        {
            neededStores.add("User");
            IDBUtils.convertToArray(query.data.user.upsert).forEach((upsert) => 
            {
                const update = { where: upsert.where, data: { ...upsert.update, ...upsert.create } } as Prisma.Args<Prisma.UserDelegate, "update">;
                this.client.user._getNeededStoresForUpdate(update).forEach((store) => neededStores.add(store));
            }
            )
        }
        return neededStores;
    }

    _getNeededStoresForNestedDelete(neededStores: Set<StoreNames<PrismaIDBSchema>>): void {
        neededStores.add("Session");
    }

    private _removeNestedCreateData<D extends Prisma.Args<Prisma.SessionDelegate, "create">["data"]>(data: D): Prisma.Result<Prisma.SessionDelegate, object, "findFirstOrThrow"> {
        const recordWithoutNestedCreate = structuredClone(data);
        delete recordWithoutNestedCreate?.user;
        return recordWithoutNestedCreate as Prisma.Result<Prisma.SessionDelegate, object, "findFirstOrThrow">;
    }

    private _preprocessListFields(records: Prisma.Result<Prisma.SessionDelegate, object, "findMany">): void {
    }

    async findMany<Q extends Prisma.Args<Prisma.SessionDelegate, 'findMany'>>(query?: Q, tx?: IDBUtils.TransactionType): Promise<Prisma.Result<Prisma.SessionDelegate, Q, 'findMany'>> {
        tx = tx ?? this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), "readonly");
        const records = await this._applyWhereClause(await tx.objectStore("Session").getAll(), query?.where, tx);
        await this._applyOrderByClause(records, query?.orderBy, tx);
        const relationAppliedRecords = (await this._applyRelations(records, tx, query)) as Prisma.Result<Prisma.SessionDelegate, object, 'findFirstOrThrow'>[];
        const selectClause = query?.select;
        let selectAppliedRecords = this._applySelectClause(relationAppliedRecords, selectClause);
        if (query?.distinct)
        {
            const distinctFields = IDBUtils.convertToArray(query.distinct);
            const seen = new Set<string>();
            selectAppliedRecords = selectAppliedRecords.filter((record) => 
            {
                const key = distinctFields.map((field) => record[field]).join("|");
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            }
            );
        }
        this._preprocessListFields(selectAppliedRecords);
        return selectAppliedRecords as Prisma.Result<Prisma.SessionDelegate, Q, 'findMany'>;
    }

    async findFirst<Q extends Prisma.Args<Prisma.SessionDelegate, 'findFirst'>>(query?: Q, tx?: IDBUtils.TransactionType): Promise<Prisma.Result<Prisma.SessionDelegate, Q, 'findFirst'>> {
        tx = tx ?? this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), "readonly");
        return (await this.findMany(query, tx))[0] ?? null;
    }

    async findFirstOrThrow<Q extends Prisma.Args<Prisma.SessionDelegate, "findFirstOrThrow">>(query?: Q, tx?: IDBUtils.TransactionType): Promise<Prisma.Result<Prisma.SessionDelegate, Q, "findFirstOrThrow">> {
        tx = tx ?? this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), "readonly");
        const record = await this.findFirst(query, tx);
        if (!record)
        {
            tx.abort();
            throw new Error("Record not found");
        }
        return record;
    }

    async findUnique<Q extends Prisma.Args<Prisma.SessionDelegate, 'findUnique'>>(query: Q, tx?: IDBUtils.TransactionType): Promise<Prisma.Result<Prisma.SessionDelegate, Q, 'findUnique'>> {
        tx = tx ?? this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), "readonly");
        let record;
        if (query.where.id !== undefined)
        {
            record = await tx.objectStore("Session").get([query.where.id]);
        }
        else if (query.where.token !== undefined)
        {
            record = await tx.objectStore("Session").index("tokenIndex").get([query.where.token]);
        }
        if (!record) return null;

        const recordWithRelations = this._applySelectClause(await this._applyRelations(await this._applyWhereClause([record], query.where, tx), tx, query), query.select)[0];
        this._preprocessListFields([recordWithRelations]);
        return recordWithRelations as Prisma.Result<Prisma.SessionDelegate, Q, "findUnique">;
    }

    async findUniqueOrThrow<Q extends Prisma.Args<Prisma.SessionDelegate, "findUniqueOrThrow">>(query: Q, tx?: IDBUtils.TransactionType): Promise<Prisma.Result<Prisma.SessionDelegate, Q, "findUniqueOrThrow">> {
        tx = tx ?? this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), "readonly");
        const record = await this.findUnique(query, tx);
        if (!record)
        {
            tx.abort();
            throw new Error("Record not found");
        }
        return record;
    }

    async count<Q extends Prisma.Args<Prisma.SessionDelegate, 'count'>>(query?: Q, tx?: IDBUtils.TransactionType): Promise<Prisma.Result<Prisma.SessionDelegate, Q, 'count'>> {
        tx = tx ?? this.client._db.transaction(["Session"], "readonly");
        if (!query?.select || query.select === true)
        {
            const records = await this.findMany({ where: query?.where }, tx);
            return records.length as Prisma.Result<Prisma.SessionDelegate, Q, "count">;
        }
        const result: Partial<Record<keyof Prisma.SessionCountAggregateInputType, number>> = {};
        for (const key of Object.keys(query.select))
        {
            const typedKey = key as keyof typeof query.select;
            if (typedKey === "_all")
            {
                result[typedKey] = (await this.findMany({ where: query.where }, tx)).length;
                continue;
            }
            result[typedKey] = (await this.findMany({ where: { [`${typedKey}`]: { not: null } } }, tx)).length;
        }
        return result as Prisma.Result<Prisma.SessionDelegate, Q, "count">;
    }

    async create<Q extends Prisma.Args<Prisma.SessionDelegate, "create">>(query: Q, tx?: IDBUtils.ReadwriteTransactionType): Promise<Prisma.Result<Prisma.SessionDelegate, Q, "create">> {
        const storesNeeded = this._getNeededStoresForCreate(query.data);
        tx = tx ?? this.client._db.transaction(Array.from(storesNeeded), "readwrite");
        if (query.data.user)
        {
            const fk: Partial<PrismaIDBSchema['User']['key']> = [];
            if (query.data.user?.create)
            {
                const record = await this.client.user.create({ data: query.data.user.create }, tx);
                fk[0] = record.id
            }
            if (query.data.user?.connect)
            {
                const record = await this.client.user.findUniqueOrThrow({ where: query.data.user.connect }, tx);
                delete query.data.user.connect;
                fk[0] = record.id;
            }
            if (query.data.user?.connectOrCreate)
            {
                const record = await this.client.user.upsert({
                where: query.data.user.connectOrCreate.where,
                create: query.data.user.connectOrCreate.create,
                update: {},
                }, tx);
                fk[0] = record.id;
            }
            const unsafeData = query.data as Record<string, unknown>;
            unsafeData.userId = fk[0];
            delete unsafeData.user;
        }
        else if (query.data?.userId !== undefined && query.data.userId !== null)
        {
            await this.client.user.findUniqueOrThrow(
            {
                where: { id: query.data.userId }
            }
            , tx);
        }
        const record = this._removeNestedCreateData(await this._fillDefaults(query.data, tx));
        const keyPath = await tx.objectStore("Session").add(record);
        const data = (await tx.objectStore("Session").get(keyPath))!;
        const recordsWithRelations = this._applySelectClause(await this._applyRelations<object>([data], tx, query), query.select)[0];
        this._preprocessListFields([recordsWithRelations]);
        this.emit("create", keyPath);
        return recordsWithRelations as Prisma.Result<Prisma.SessionDelegate, Q, "create">;
    }

    async createMany<Q extends Prisma.Args<Prisma.SessionDelegate, "createMany">>(query: Q, tx?: IDBUtils.ReadwriteTransactionType): Promise<Prisma.Result<Prisma.SessionDelegate, Q, "createMany">> {
        const createManyData = IDBUtils.convertToArray(query.data);
        tx = tx ?? this.client._db.transaction(["Session"], "readwrite");
        for (const createData of createManyData)
        {
            const record = this._removeNestedCreateData(await this._fillDefaults(createData, tx));
            const keyPath = await tx.objectStore("Session").add(record);
            this.emit("create", keyPath);
        }
        return { count: createManyData.length };
    }

    async createManyAndReturn<Q extends Prisma.Args<Prisma.SessionDelegate, "createManyAndReturn">>(query: Q, tx?: IDBUtils.ReadwriteTransactionType): Promise<Prisma.Result<Prisma.SessionDelegate, Q, "createManyAndReturn">> {
        const createManyData = IDBUtils.convertToArray(query.data);
        const records: Prisma.Result<Prisma.SessionDelegate, object, "findMany"> = [];
        tx = tx ?? this.client._db.transaction(["Session"], "readwrite");
        for (const createData of createManyData)
        {
            const record = this._removeNestedCreateData(await this._fillDefaults(createData, tx));
            const keyPath = await tx.objectStore("Session").add(record);
            this.emit("create", keyPath);
            records.push(this._applySelectClause([record], query.select)[0]);
        }
        this._preprocessListFields(records);
        return records as Prisma.Result<Prisma.SessionDelegate, Q, "createManyAndReturn">;
    }

    async delete<Q extends Prisma.Args<Prisma.SessionDelegate, 'delete'>>(query: Q, tx?: IDBUtils.ReadwriteTransactionType): Promise<Prisma.Result<Prisma.SessionDelegate, Q, 'delete'>> {
        const storesNeeded = this._getNeededStoresForFind(query);
        this._getNeededStoresForNestedDelete(storesNeeded);
        tx = tx ?? this.client._db.transaction(Array.from(storesNeeded), "readwrite");
        const record = await this.findUnique(query, tx);
        if (!record) throw new Error("Record not found");
        await tx.objectStore("Session").delete([record.id]);
        this.emit("delete", [record.id]);
        return record;
    }

    async deleteMany<Q extends Prisma.Args<Prisma.SessionDelegate, 'deleteMany'>>(query?: Q, tx?: IDBUtils.ReadwriteTransactionType): Promise<Prisma.Result<Prisma.SessionDelegate, Q, 'deleteMany'>> {
        const storesNeeded = this._getNeededStoresForFind(query);
        this._getNeededStoresForNestedDelete(storesNeeded);
        tx = tx ?? this.client._db.transaction(Array.from(storesNeeded), "readwrite");
        const records = await this.findMany(query, tx);
        for (const record of records)
        {
            await this.delete({ where: { id: record.id } }, tx);
        }
        return { count: records.length };
    }

    async update<Q extends Prisma.Args<Prisma.SessionDelegate, 'update'>>(query: Q, tx?: IDBUtils.ReadwriteTransactionType): Promise<Prisma.Result<Prisma.SessionDelegate, Q, 'update'>> {
        tx = tx ?? this.client._db.transaction(
        Array.from(this._getNeededStoresForUpdate(query)), "readwrite");
        const record = await this.findUnique({ where: query.where }, tx);
        if (record === null)
        {
            tx.abort();
            throw new Error("Record not found");
        }
        const startKeyPath: PrismaIDBSchema["Session"]["key"] = [record.id];
        const stringFields = ["id","token","ipAddress","userAgent","userId"] as const;
        for (const field of stringFields)
        {
            IDBUtils.handleStringUpdateField(record, field, query.data[field]);
        }
        const dateTimeFields = ["expiresAt","createdAt","updatedAt"] as const;
        for (const field of dateTimeFields)
        {
            IDBUtils.handleDateTimeUpdateField(record, field, query.data[field]);
        }
        if (query.data.user)
        {
            if (query.data.user.connect)
            {
                const other = await this.client.user.findUniqueOrThrow({ where: query.data.user.connect }, tx);
                record.userId = other.id;
            }
            if (query.data.user.create)
            {
                const other = await this.client.user.create({ data: query.data.user.create }, tx);
                record.userId = other.id;
            }
            if (query.data.user.update)
            {
                const updateData = query.data.user.update.data ?? query.data.user.update;
                await this.client.user.update({ where: { ...query.data.user.update.where, id: record.userId! } as Prisma.UserWhereUniqueInput, data: updateData }, tx);
            }
            if (query.data.user.upsert)
            {
                await this.client.user.upsert({ where: { ...query.data.user.upsert.where, id: record.userId! } as Prisma.UserWhereUniqueInput, create: { ...query.data.user.upsert.create, id: record.userId! } as Prisma.Args<Prisma.UserDelegate, "upsert">['create'], update: query.data.user.upsert.update, }, tx);
            }
            if (query.data.user.connectOrCreate)
            {
                await this.client.user.upsert(
                {
                    where: { ...query.data.user.connectOrCreate.where, id: record.userId! },
                    create: { ...query.data.user.connectOrCreate.create, id: record.userId! } as Prisma.Args<Prisma.UserDelegate, "upsert">['create'],
                    update: { id: record.userId! },
                }
                , tx);
            }
        }
        if (query.data.userId !== undefined)
        {
            const related = await this.client.user.findUnique({ where: { id: record.userId } }, tx);
            if (!related) throw new Error("Related record not found");
        }
        const endKeyPath: PrismaIDBSchema["Session"]["key"] = [record.id];
        for (let i = 0; i < startKeyPath.length; i++)
        {
            if (startKeyPath[i] !== endKeyPath[i])
            {
                if (await tx.objectStore("Session").get(endKeyPath) !== undefined)
                {
                    throw new Error("Record with the same keyPath already exists");
                }
                await tx.objectStore("Session").delete(startKeyPath);
                break;
            }
        }
        const keyPath = await tx.objectStore("Session").put(record);
        this.emit("update", keyPath, startKeyPath);
        for (let i = 0; i < startKeyPath.length; i++)
        {
            if (startKeyPath[i] !== endKeyPath[i])
            {
                break;
            }
        }
        const recordWithRelations = (await this.findUnique(
        {
            where: { id: keyPath[0] },
        }
        , tx))!;
        return recordWithRelations as Prisma.Result<Prisma.SessionDelegate, Q, "update">;
    }

    async updateMany<Q extends Prisma.Args<Prisma.SessionDelegate, "updateMany">>(query: Q, tx?: IDBUtils.ReadwriteTransactionType): Promise<Prisma.Result<Prisma.SessionDelegate, Q, "updateMany">> {
        tx = tx ?? this.client._db.transaction(
        Array.from(this._getNeededStoresForFind(query)), "readwrite");
        const records = await this.findMany({ where: query.where }, tx);
        await Promise.all(
        records.map(async (record) =>
        {
            await this.update({ where: { id: record.id }, data: query.data }, tx);
        }
        ));
        return { count: records.length };
    }

    async upsert<Q extends Prisma.Args<Prisma.SessionDelegate, "upsert">>(query: Q, tx?: IDBUtils.ReadwriteTransactionType): Promise<Prisma.Result<Prisma.SessionDelegate, Q, "upsert">> {
        const neededStores = this._getNeededStoresForUpdate({ ...query, data: { ...query.update, ...query.create } as Prisma.Args<Prisma.SessionDelegate, "update">["data"] });
        tx = tx ?? this.client._db.transaction(Array.from(neededStores), "readwrite");
        let record = await this.findUnique({ where: query.where }, tx);
        if (!record) record = await this.create({ data: query.create }, tx);
        else record = await this.update({ where: query.where, data: query.update }, tx);
        record = await this.findUniqueOrThrow({ where: { id: record.id }, select: query.select, include: query.include }, tx);
        return record as Prisma.Result<Prisma.SessionDelegate, Q, "upsert">;
    }

    async aggregate<Q extends Prisma.Args<Prisma.SessionDelegate, 'aggregate'>>(query?: Q, tx?: IDBUtils.TransactionType): Promise<Prisma.Result<Prisma.SessionDelegate, Q, 'aggregate'>> {
        tx = tx ?? this.client._db.transaction(["Session"], "readonly");
        const records = await this.findMany({ where: query?.where }, tx);
        const result: Partial<Prisma.Result<Prisma.SessionDelegate, Q, "aggregate">> = {};
        if (query?._count)
        {
            if (query._count === true)
            {
                (result._count as number) = records.length;
            }
            else
            {
                for (const key of Object.keys(query._count))
                {
                    const typedKey = key as keyof typeof query._count;
                    if (typedKey === "_all")
                    {
                        (result._count as Record<string, number>)[typedKey] = records.length;
                        continue;
                    }
                    (result._count as Record<string, number>)[typedKey] = (
                    await this.findMany({ where: { [`${typedKey}`]: { not: null } } }, tx)
                    ).length;
                }
            }
        }
        if (query?._min)
        {
            const minResult = {} as Prisma.Result<Prisma.SessionDelegate, Q, "aggregate">["_min"];
            const dateTimeFields = ["expiresAt","createdAt","updatedAt"] as const;
            for (const field of dateTimeFields)
            {
                if (!query._min[field]) continue;
                const values = records.map((record) => record[field]?.getTime()).filter((value) => value !== undefined);
                (minResult[field as keyof typeof minResult] as Date) = new Date(Math.min(...values));
            }
            const stringFields = ["id","token","ipAddress","userAgent","userId"] as const;
            for (const field of stringFields)
            {
                if (!query._min[field]) continue;
                const values = records.map((record) => record[field] as string).filter((value) => value !== undefined);
                (minResult[field as keyof typeof minResult] as string) = values.sort()[0];
            }
            result._min = minResult;
        }
        if (query?._max)
        {
            const maxResult = {} as Prisma.Result<Prisma.SessionDelegate, Q, "aggregate">["_max"];
            const dateTimeFields = ["expiresAt","createdAt","updatedAt"] as const;
            for (const field of dateTimeFields)
            {
                if (!query._max[field]) continue;
                const values = records.map((record) => record[field]?.getTime()).filter((value) => value !== undefined);
                (maxResult[field as keyof typeof maxResult] as Date) = new Date(Math.max(...values));
            }
            const stringFields = ["id","token","ipAddress","userAgent","userId"] as const;
            for (const field of stringFields)
            {
                if (!query._max[field]) continue;
                const values = records.map((record) => record[field] as string).filter((value) => value !== undefined);
                (maxResult[field as keyof typeof maxResult] as string) = values.sort().reverse()[0];
            }
            result._max = maxResult;
        }
        return result as unknown as Prisma.Result<Prisma.SessionDelegate, Q, "aggregate">;
    }
}

class AccountIDBClass extends BaseIDBModelClass<"Account"> {
    private async _applyWhereClause<W extends Prisma.Args<Prisma.AccountDelegate, 'findFirstOrThrow'>['where'], R extends Prisma.Result<Prisma.AccountDelegate, object, 'findFirstOrThrow'>>(records: R[], whereClause: W, tx: IDBUtils.TransactionType): Promise<R[]> {
        if (!whereClause) return records;
        records = await IDBUtils.applyLogicalFilters<Prisma.AccountDelegate, R, W>(
        records, whereClause, tx, this.keyPath, this._applyWhereClause.bind(this),
        )
        return (await Promise.all(records.map(async (record) =>
        {
            const stringFields = ["id","accountId","providerId","userId","accessToken","refreshToken","idToken","scope","password"] as const;
            for (const field of stringFields)
            {
                if (!IDBUtils.whereStringFilter(record, field, whereClause[field])) return null;
            }
            const dateTimeFields = ["accessTokenExpiresAt","refreshTokenExpiresAt","createdAt","updatedAt"] as const;
            for (const field of dateTimeFields)
            {
                if (!IDBUtils.whereDateTimeFilter(record, field, whereClause[field])) return null;
            }
            if (whereClause.user)
            {
                const { is, isNot, ...rest } = whereClause.user
                if (is !== null && is !== undefined)
                {
                    const relatedRecord = await this.client.user.findFirst({ where: { ...is, id: record.userId } }, tx)
                    if (!relatedRecord) return null;
                }
                if (isNot !== null && isNot !== undefined)
                {
                    const relatedRecord = await this.client.user.findFirst({ where: { ...isNot, id: record.userId } }, tx)
                    if (relatedRecord) return null;
                }
                if (Object.keys(rest).length)
                {
                    const relatedRecord = await this.client.user.findFirst({ where: { ...whereClause.user, id: record.userId } }, tx);
                    if (!relatedRecord) return null;
                }
            }
            return record;
        }
        ))).filter((result) => result !== null);;
    }

    private _applySelectClause<S extends Prisma.Args<Prisma.AccountDelegate, 'findMany'>['select']>(records: Prisma.Result<Prisma.AccountDelegate, object, 'findFirstOrThrow'>[], selectClause: S): Prisma.Result<Prisma.AccountDelegate, { select: S }, 'findFirstOrThrow'>[] {
        if (!selectClause)
        {
            return records as Prisma.Result<Prisma.AccountDelegate, { select: S }, 'findFirstOrThrow'>[];
        }
        return records.map((record) => 
        {
            const partialRecord: Partial<typeof record> = record;
            for (const untypedKey of ["id","accountId","providerId","userId","user","accessToken","refreshToken","idToken","accessTokenExpiresAt","refreshTokenExpiresAt","scope","password","createdAt","updatedAt"]) 
            {
                const key = untypedKey as keyof typeof record & keyof S;
                if (!selectClause[key]) delete partialRecord[key];
            }
            return partialRecord;
        }
        ) as Prisma.Result<Prisma.AccountDelegate, { select: S }, 'findFirstOrThrow'>[];
    }

    private async _applyRelations<Q extends Prisma.Args<Prisma.AccountDelegate, 'findMany'>>(records: Prisma.Result<Prisma.AccountDelegate, object, 'findFirstOrThrow'>[], tx: IDBUtils.TransactionType, query?: Q): Promise<Prisma.Result<Prisma.AccountDelegate, Q, 'findFirstOrThrow'>[]> {
        if (!query) return records as Prisma.Result<Prisma.AccountDelegate, Q, 'findFirstOrThrow'>[];
        const recordsWithRelations = records.map(async (record) => 
        {
            const unsafeRecord = record as Record<string, unknown>;
            const attach_user = query.select?.user || query.include?.user;
            if (attach_user)
            {
                unsafeRecord['user'] = 
                await this.client.user.findUnique(
                {
                    ...(attach_user === true ? {} : attach_user),
                    where: { id: record.userId! }
                }
                , tx)
            }
            return unsafeRecord;
        }
        );
        return (await Promise.all(recordsWithRelations)) as Prisma.Result<Prisma.AccountDelegate, Q, 'findFirstOrThrow'>[];
    }

    async _applyOrderByClause<O extends Prisma.Args<Prisma.AccountDelegate, 'findMany'>['orderBy'], R extends Prisma.Result<Prisma.AccountDelegate, object, "findFirstOrThrow">>(records: R[], orderByClause: O, tx: IDBUtils.TransactionType): Promise<void> {
        if (orderByClause === undefined) return;
        const orderByClauses = IDBUtils.convertToArray(orderByClause);
        const indexedKeys = await Promise.all(
        records.map(async (record) => 
        {
            const keys = await Promise.all(
            orderByClauses.map(async (clause) => await this._resolveOrderByKey(record, clause, tx)),
            );
            return { keys, record };
        }
        ));
        indexedKeys.sort((a, b) => 
        {
            for (let i = 0; i < orderByClauses.length; i++)
            {
                const clause = orderByClauses[i];
                const comparison = IDBUtils.genericComparator(a.keys[i], b.keys[i], this._resolveSortOrder(clause));
                if (comparison !== 0) return comparison;
            }
            return 0;
        }
        );
        for (let i = 0; i < records.length; i++)
        {
            records[i] = indexedKeys[i].record;
        }
    }

    async _resolveOrderByKey(record: Prisma.Result<Prisma.AccountDelegate, object, "findFirstOrThrow">, orderByInput: Prisma.AccountOrderByWithRelationInput, tx: IDBUtils.TransactionType): Promise<unknown> {
        const scalarFields = ["id","accountId","providerId","userId","accessToken","refreshToken","idToken","accessTokenExpiresAt","refreshTokenExpiresAt","scope","password","createdAt","updatedAt"] as const;
        for (const field of scalarFields) if (orderByInput[field]) return record[field];
        if (orderByInput.user)
        {
            return await this.client.user._resolveOrderByKey(await this.client.user.findFirstOrThrow({ where: { id: record.userId } }), orderByInput.user, tx);
        }
    }

    _resolveSortOrder(orderByInput: Prisma.AccountOrderByWithRelationInput): Prisma.SortOrder | { sort: Prisma.SortOrder, nulls?: 'first' | 'last' } {
        const scalarFields = ["id","accountId","providerId","userId","accessToken","refreshToken","idToken","accessTokenExpiresAt","refreshTokenExpiresAt","scope","password","createdAt","updatedAt"] as const;
        for (const field of scalarFields) if (orderByInput[field]) return orderByInput[field];
        if (orderByInput.user)
        {
            return this.client.user._resolveSortOrder(orderByInput.user);
        }
        throw new Error("No field in orderBy clause");
    }

    private async _fillDefaults<D extends Prisma.Args<Prisma.AccountDelegate, "create">["data"]>(data: D, tx?: IDBUtils.ReadwriteTransactionType): Promise<D> {
        if (data === undefined) data = {} as NonNullable<D>;
        if (data.accessToken === undefined) 
        {
            data.accessToken = null;
        }
        if (data.refreshToken === undefined) 
        {
            data.refreshToken = null;
        }
        if (data.idToken === undefined) 
        {
            data.idToken = null;
        }
        if (data.accessTokenExpiresAt === undefined) 
        {
            data.accessTokenExpiresAt = null;
        }
        if (data.refreshTokenExpiresAt === undefined) 
        {
            data.refreshTokenExpiresAt = null;
        }
        if (data.scope === undefined) 
        {
            data.scope = null;
        }
        if (data.password === undefined) 
        {
            data.password = null;
        }
        if (typeof data.accessTokenExpiresAt === 'string')
        {
            data.accessTokenExpiresAt = new Date(data.accessTokenExpiresAt)
        }
        if (typeof data.refreshTokenExpiresAt === 'string')
        {
            data.refreshTokenExpiresAt = new Date(data.refreshTokenExpiresAt)
        }
        if (typeof data.createdAt === 'string')
        {
            data.createdAt = new Date(data.createdAt)
        }
        if (typeof data.updatedAt === 'string')
        {
            data.updatedAt = new Date(data.updatedAt)
        }
        return data;
    }

    _getNeededStoresForWhere<W extends Prisma.Args<Prisma.AccountDelegate, "findMany">['where']>(whereClause: W, neededStores: Set<StoreNames<PrismaIDBSchema>>) {
        if (whereClause === undefined) return;
        for (const param of IDBUtils.LogicalParams)
        {
            if (whereClause[param])
            {
                for (const clause of IDBUtils.convertToArray(whereClause[param]))
                {
                    this._getNeededStoresForWhere(clause, neededStores);
                }
            }
        }
        if (whereClause.user)
        {
            neededStores.add("User");
            this.client.user._getNeededStoresForWhere(whereClause.user, neededStores)
        }
    }

    _getNeededStoresForFind<Q extends Prisma.Args<Prisma.AccountDelegate, "findMany">>(query?: Q): Set<StoreNames<PrismaIDBSchema>> {
        const neededStores: Set<StoreNames<PrismaIDBSchema>> = new Set();
        neededStores.add("Account");
        this._getNeededStoresForWhere(query?.where, neededStores);
        if (query?.orderBy)
        {
            const orderBy = IDBUtils.convertToArray(query.orderBy);
            const orderBy_user = orderBy.find((clause) => clause.user);
            if (orderBy_user)
            {
                this.client.user
                ._getNeededStoresForFind({ orderBy: orderBy_user.user })
                .forEach((storeName) => neededStores.add(storeName));
            }
        }
        if (query?.select?.user || query?.include?.user)
        {
            neededStores.add("User");
            if (typeof query.select?.user === "object")
            {
                this.client.user._getNeededStoresForFind(query.select.user).forEach((storeName) => neededStores.add(storeName));
            }
            if (typeof query.include?.user === "object")
            {
                this.client.user._getNeededStoresForFind(query.include.user).forEach((storeName) => neededStores.add(storeName));
            }
        }
        return neededStores;
    }

    _getNeededStoresForCreate<D extends Partial<Prisma.Args<Prisma.AccountDelegate, "create">['data']>>(data: D): Set<StoreNames<PrismaIDBSchema>> {
        const neededStores: Set<StoreNames<PrismaIDBSchema>> = new Set();
        neededStores.add("Account");
        if (data?.user)
        {
            neededStores.add('User')
            if (data.user.create)
            {
                const createData = Array.isArray(data.user.create) ? data.user.create : [data.user.create];
                createData.forEach((record) => 
                this.client.user._getNeededStoresForCreate(record).forEach((storeName) => neededStores.add(storeName))
                );
            }
            if (data.user.connectOrCreate)
            {
                IDBUtils.convertToArray(data.user.connectOrCreate).forEach((record) => 
                this.client.user._getNeededStoresForCreate(record.create).forEach((storeName) => neededStores.add(storeName))
                );
            }
        }
        if (data.userId !== undefined)
        {
            neededStores.add("User")
        }
        return neededStores;
    }

    _getNeededStoresForUpdate<Q extends Prisma.Args<Prisma.AccountDelegate, "update">>(query: Partial<Q>): Set<StoreNames<PrismaIDBSchema>> {
        const neededStores = this._getNeededStoresForFind(query).union(this._getNeededStoresForCreate(query.data as Prisma.Args<Prisma.AccountDelegate, "create">["data"]));
        if (query.data?.user?.connect)
        {
            neededStores.add("User");
            IDBUtils.convertToArray(query.data.user.connect).forEach((connect) => 
            {
                this.client.user._getNeededStoresForWhere(connect, neededStores);
            }
            );
        }
        if (query.data?.user?.update)
        {
            neededStores.add("User");
            IDBUtils.convertToArray(query.data.user.update).forEach((update) => 
            {
                this.client.user._getNeededStoresForUpdate(update as Prisma.Args<Prisma.UserDelegate, "update">).forEach((store) => neededStores.add(store));
            }
            )
        }
        if (query.data?.user?.upsert)
        {
            neededStores.add("User");
            IDBUtils.convertToArray(query.data.user.upsert).forEach((upsert) => 
            {
                const update = { where: upsert.where, data: { ...upsert.update, ...upsert.create } } as Prisma.Args<Prisma.UserDelegate, "update">;
                this.client.user._getNeededStoresForUpdate(update).forEach((store) => neededStores.add(store));
            }
            )
        }
        return neededStores;
    }

    _getNeededStoresForNestedDelete(neededStores: Set<StoreNames<PrismaIDBSchema>>): void {
        neededStores.add("Account");
    }

    private _removeNestedCreateData<D extends Prisma.Args<Prisma.AccountDelegate, "create">["data"]>(data: D): Prisma.Result<Prisma.AccountDelegate, object, "findFirstOrThrow"> {
        const recordWithoutNestedCreate = structuredClone(data);
        delete recordWithoutNestedCreate?.user;
        return recordWithoutNestedCreate as Prisma.Result<Prisma.AccountDelegate, object, "findFirstOrThrow">;
    }

    private _preprocessListFields(records: Prisma.Result<Prisma.AccountDelegate, object, "findMany">): void {
    }

    async findMany<Q extends Prisma.Args<Prisma.AccountDelegate, 'findMany'>>(query?: Q, tx?: IDBUtils.TransactionType): Promise<Prisma.Result<Prisma.AccountDelegate, Q, 'findMany'>> {
        tx = tx ?? this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), "readonly");
        const records = await this._applyWhereClause(await tx.objectStore("Account").getAll(), query?.where, tx);
        await this._applyOrderByClause(records, query?.orderBy, tx);
        const relationAppliedRecords = (await this._applyRelations(records, tx, query)) as Prisma.Result<Prisma.AccountDelegate, object, 'findFirstOrThrow'>[];
        const selectClause = query?.select;
        let selectAppliedRecords = this._applySelectClause(relationAppliedRecords, selectClause);
        if (query?.distinct)
        {
            const distinctFields = IDBUtils.convertToArray(query.distinct);
            const seen = new Set<string>();
            selectAppliedRecords = selectAppliedRecords.filter((record) => 
            {
                const key = distinctFields.map((field) => record[field]).join("|");
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            }
            );
        }
        this._preprocessListFields(selectAppliedRecords);
        return selectAppliedRecords as Prisma.Result<Prisma.AccountDelegate, Q, 'findMany'>;
    }

    async findFirst<Q extends Prisma.Args<Prisma.AccountDelegate, 'findFirst'>>(query?: Q, tx?: IDBUtils.TransactionType): Promise<Prisma.Result<Prisma.AccountDelegate, Q, 'findFirst'>> {
        tx = tx ?? this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), "readonly");
        return (await this.findMany(query, tx))[0] ?? null;
    }

    async findFirstOrThrow<Q extends Prisma.Args<Prisma.AccountDelegate, "findFirstOrThrow">>(query?: Q, tx?: IDBUtils.TransactionType): Promise<Prisma.Result<Prisma.AccountDelegate, Q, "findFirstOrThrow">> {
        tx = tx ?? this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), "readonly");
        const record = await this.findFirst(query, tx);
        if (!record)
        {
            tx.abort();
            throw new Error("Record not found");
        }
        return record;
    }

    async findUnique<Q extends Prisma.Args<Prisma.AccountDelegate, 'findUnique'>>(query: Q, tx?: IDBUtils.TransactionType): Promise<Prisma.Result<Prisma.AccountDelegate, Q, 'findUnique'>> {
        tx = tx ?? this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), "readonly");
        let record;
        if (query.where.id !== undefined)
        {
            record = await tx.objectStore("Account").get([query.where.id]);
        }
        if (!record) return null;

        const recordWithRelations = this._applySelectClause(await this._applyRelations(await this._applyWhereClause([record], query.where, tx), tx, query), query.select)[0];
        this._preprocessListFields([recordWithRelations]);
        return recordWithRelations as Prisma.Result<Prisma.AccountDelegate, Q, "findUnique">;
    }

    async findUniqueOrThrow<Q extends Prisma.Args<Prisma.AccountDelegate, "findUniqueOrThrow">>(query: Q, tx?: IDBUtils.TransactionType): Promise<Prisma.Result<Prisma.AccountDelegate, Q, "findUniqueOrThrow">> {
        tx = tx ?? this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), "readonly");
        const record = await this.findUnique(query, tx);
        if (!record)
        {
            tx.abort();
            throw new Error("Record not found");
        }
        return record;
    }

    async count<Q extends Prisma.Args<Prisma.AccountDelegate, 'count'>>(query?: Q, tx?: IDBUtils.TransactionType): Promise<Prisma.Result<Prisma.AccountDelegate, Q, 'count'>> {
        tx = tx ?? this.client._db.transaction(["Account"], "readonly");
        if (!query?.select || query.select === true)
        {
            const records = await this.findMany({ where: query?.where }, tx);
            return records.length as Prisma.Result<Prisma.AccountDelegate, Q, "count">;
        }
        const result: Partial<Record<keyof Prisma.AccountCountAggregateInputType, number>> = {};
        for (const key of Object.keys(query.select))
        {
            const typedKey = key as keyof typeof query.select;
            if (typedKey === "_all")
            {
                result[typedKey] = (await this.findMany({ where: query.where }, tx)).length;
                continue;
            }
            result[typedKey] = (await this.findMany({ where: { [`${typedKey}`]: { not: null } } }, tx)).length;
        }
        return result as Prisma.Result<Prisma.AccountDelegate, Q, "count">;
    }

    async create<Q extends Prisma.Args<Prisma.AccountDelegate, "create">>(query: Q, tx?: IDBUtils.ReadwriteTransactionType): Promise<Prisma.Result<Prisma.AccountDelegate, Q, "create">> {
        const storesNeeded = this._getNeededStoresForCreate(query.data);
        tx = tx ?? this.client._db.transaction(Array.from(storesNeeded), "readwrite");
        if (query.data.user)
        {
            const fk: Partial<PrismaIDBSchema['User']['key']> = [];
            if (query.data.user?.create)
            {
                const record = await this.client.user.create({ data: query.data.user.create }, tx);
                fk[0] = record.id
            }
            if (query.data.user?.connect)
            {
                const record = await this.client.user.findUniqueOrThrow({ where: query.data.user.connect }, tx);
                delete query.data.user.connect;
                fk[0] = record.id;
            }
            if (query.data.user?.connectOrCreate)
            {
                const record = await this.client.user.upsert({
                where: query.data.user.connectOrCreate.where,
                create: query.data.user.connectOrCreate.create,
                update: {},
                }, tx);
                fk[0] = record.id;
            }
            const unsafeData = query.data as Record<string, unknown>;
            unsafeData.userId = fk[0];
            delete unsafeData.user;
        }
        else if (query.data?.userId !== undefined && query.data.userId !== null)
        {
            await this.client.user.findUniqueOrThrow(
            {
                where: { id: query.data.userId }
            }
            , tx);
        }
        const record = this._removeNestedCreateData(await this._fillDefaults(query.data, tx));
        const keyPath = await tx.objectStore("Account").add(record);
        const data = (await tx.objectStore("Account").get(keyPath))!;
        const recordsWithRelations = this._applySelectClause(await this._applyRelations<object>([data], tx, query), query.select)[0];
        this._preprocessListFields([recordsWithRelations]);
        this.emit("create", keyPath);
        return recordsWithRelations as Prisma.Result<Prisma.AccountDelegate, Q, "create">;
    }

    async createMany<Q extends Prisma.Args<Prisma.AccountDelegate, "createMany">>(query: Q, tx?: IDBUtils.ReadwriteTransactionType): Promise<Prisma.Result<Prisma.AccountDelegate, Q, "createMany">> {
        const createManyData = IDBUtils.convertToArray(query.data);
        tx = tx ?? this.client._db.transaction(["Account"], "readwrite");
        for (const createData of createManyData)
        {
            const record = this._removeNestedCreateData(await this._fillDefaults(createData, tx));
            const keyPath = await tx.objectStore("Account").add(record);
            this.emit("create", keyPath);
        }
        return { count: createManyData.length };
    }

    async createManyAndReturn<Q extends Prisma.Args<Prisma.AccountDelegate, "createManyAndReturn">>(query: Q, tx?: IDBUtils.ReadwriteTransactionType): Promise<Prisma.Result<Prisma.AccountDelegate, Q, "createManyAndReturn">> {
        const createManyData = IDBUtils.convertToArray(query.data);
        const records: Prisma.Result<Prisma.AccountDelegate, object, "findMany"> = [];
        tx = tx ?? this.client._db.transaction(["Account"], "readwrite");
        for (const createData of createManyData)
        {
            const record = this._removeNestedCreateData(await this._fillDefaults(createData, tx));
            const keyPath = await tx.objectStore("Account").add(record);
            this.emit("create", keyPath);
            records.push(this._applySelectClause([record], query.select)[0]);
        }
        this._preprocessListFields(records);
        return records as Prisma.Result<Prisma.AccountDelegate, Q, "createManyAndReturn">;
    }

    async delete<Q extends Prisma.Args<Prisma.AccountDelegate, 'delete'>>(query: Q, tx?: IDBUtils.ReadwriteTransactionType): Promise<Prisma.Result<Prisma.AccountDelegate, Q, 'delete'>> {
        const storesNeeded = this._getNeededStoresForFind(query);
        this._getNeededStoresForNestedDelete(storesNeeded);
        tx = tx ?? this.client._db.transaction(Array.from(storesNeeded), "readwrite");
        const record = await this.findUnique(query, tx);
        if (!record) throw new Error("Record not found");
        await tx.objectStore("Account").delete([record.id]);
        this.emit("delete", [record.id]);
        return record;
    }

    async deleteMany<Q extends Prisma.Args<Prisma.AccountDelegate, 'deleteMany'>>(query?: Q, tx?: IDBUtils.ReadwriteTransactionType): Promise<Prisma.Result<Prisma.AccountDelegate, Q, 'deleteMany'>> {
        const storesNeeded = this._getNeededStoresForFind(query);
        this._getNeededStoresForNestedDelete(storesNeeded);
        tx = tx ?? this.client._db.transaction(Array.from(storesNeeded), "readwrite");
        const records = await this.findMany(query, tx);
        for (const record of records)
        {
            await this.delete({ where: { id: record.id } }, tx);
        }
        return { count: records.length };
    }

    async update<Q extends Prisma.Args<Prisma.AccountDelegate, 'update'>>(query: Q, tx?: IDBUtils.ReadwriteTransactionType): Promise<Prisma.Result<Prisma.AccountDelegate, Q, 'update'>> {
        tx = tx ?? this.client._db.transaction(
        Array.from(this._getNeededStoresForUpdate(query)), "readwrite");
        const record = await this.findUnique({ where: query.where }, tx);
        if (record === null)
        {
            tx.abort();
            throw new Error("Record not found");
        }
        const startKeyPath: PrismaIDBSchema["Account"]["key"] = [record.id];
        const stringFields = ["id","accountId","providerId","userId","accessToken","refreshToken","idToken","scope","password"] as const;
        for (const field of stringFields)
        {
            IDBUtils.handleStringUpdateField(record, field, query.data[field]);
        }
        const dateTimeFields = ["accessTokenExpiresAt","refreshTokenExpiresAt","createdAt","updatedAt"] as const;
        for (const field of dateTimeFields)
        {
            IDBUtils.handleDateTimeUpdateField(record, field, query.data[field]);
        }
        if (query.data.user)
        {
            if (query.data.user.connect)
            {
                const other = await this.client.user.findUniqueOrThrow({ where: query.data.user.connect }, tx);
                record.userId = other.id;
            }
            if (query.data.user.create)
            {
                const other = await this.client.user.create({ data: query.data.user.create }, tx);
                record.userId = other.id;
            }
            if (query.data.user.update)
            {
                const updateData = query.data.user.update.data ?? query.data.user.update;
                await this.client.user.update({ where: { ...query.data.user.update.where, id: record.userId! } as Prisma.UserWhereUniqueInput, data: updateData }, tx);
            }
            if (query.data.user.upsert)
            {
                await this.client.user.upsert({ where: { ...query.data.user.upsert.where, id: record.userId! } as Prisma.UserWhereUniqueInput, create: { ...query.data.user.upsert.create, id: record.userId! } as Prisma.Args<Prisma.UserDelegate, "upsert">['create'], update: query.data.user.upsert.update, }, tx);
            }
            if (query.data.user.connectOrCreate)
            {
                await this.client.user.upsert(
                {
                    where: { ...query.data.user.connectOrCreate.where, id: record.userId! },
                    create: { ...query.data.user.connectOrCreate.create, id: record.userId! } as Prisma.Args<Prisma.UserDelegate, "upsert">['create'],
                    update: { id: record.userId! },
                }
                , tx);
            }
        }
        if (query.data.userId !== undefined)
        {
            const related = await this.client.user.findUnique({ where: { id: record.userId } }, tx);
            if (!related) throw new Error("Related record not found");
        }
        const endKeyPath: PrismaIDBSchema["Account"]["key"] = [record.id];
        for (let i = 0; i < startKeyPath.length; i++)
        {
            if (startKeyPath[i] !== endKeyPath[i])
            {
                if (await tx.objectStore("Account").get(endKeyPath) !== undefined)
                {
                    throw new Error("Record with the same keyPath already exists");
                }
                await tx.objectStore("Account").delete(startKeyPath);
                break;
            }
        }
        const keyPath = await tx.objectStore("Account").put(record);
        this.emit("update", keyPath, startKeyPath);
        for (let i = 0; i < startKeyPath.length; i++)
        {
            if (startKeyPath[i] !== endKeyPath[i])
            {
                break;
            }
        }
        const recordWithRelations = (await this.findUnique(
        {
            where: { id: keyPath[0] },
        }
        , tx))!;
        return recordWithRelations as Prisma.Result<Prisma.AccountDelegate, Q, "update">;
    }

    async updateMany<Q extends Prisma.Args<Prisma.AccountDelegate, "updateMany">>(query: Q, tx?: IDBUtils.ReadwriteTransactionType): Promise<Prisma.Result<Prisma.AccountDelegate, Q, "updateMany">> {
        tx = tx ?? this.client._db.transaction(
        Array.from(this._getNeededStoresForFind(query)), "readwrite");
        const records = await this.findMany({ where: query.where }, tx);
        await Promise.all(
        records.map(async (record) =>
        {
            await this.update({ where: { id: record.id }, data: query.data }, tx);
        }
        ));
        return { count: records.length };
    }

    async upsert<Q extends Prisma.Args<Prisma.AccountDelegate, "upsert">>(query: Q, tx?: IDBUtils.ReadwriteTransactionType): Promise<Prisma.Result<Prisma.AccountDelegate, Q, "upsert">> {
        const neededStores = this._getNeededStoresForUpdate({ ...query, data: { ...query.update, ...query.create } as Prisma.Args<Prisma.AccountDelegate, "update">["data"] });
        tx = tx ?? this.client._db.transaction(Array.from(neededStores), "readwrite");
        let record = await this.findUnique({ where: query.where }, tx);
        if (!record) record = await this.create({ data: query.create }, tx);
        else record = await this.update({ where: query.where, data: query.update }, tx);
        record = await this.findUniqueOrThrow({ where: { id: record.id }, select: query.select, include: query.include }, tx);
        return record as Prisma.Result<Prisma.AccountDelegate, Q, "upsert">;
    }

    async aggregate<Q extends Prisma.Args<Prisma.AccountDelegate, 'aggregate'>>(query?: Q, tx?: IDBUtils.TransactionType): Promise<Prisma.Result<Prisma.AccountDelegate, Q, 'aggregate'>> {
        tx = tx ?? this.client._db.transaction(["Account"], "readonly");
        const records = await this.findMany({ where: query?.where }, tx);
        const result: Partial<Prisma.Result<Prisma.AccountDelegate, Q, "aggregate">> = {};
        if (query?._count)
        {
            if (query._count === true)
            {
                (result._count as number) = records.length;
            }
            else
            {
                for (const key of Object.keys(query._count))
                {
                    const typedKey = key as keyof typeof query._count;
                    if (typedKey === "_all")
                    {
                        (result._count as Record<string, number>)[typedKey] = records.length;
                        continue;
                    }
                    (result._count as Record<string, number>)[typedKey] = (
                    await this.findMany({ where: { [`${typedKey}`]: { not: null } } }, tx)
                    ).length;
                }
            }
        }
        if (query?._min)
        {
            const minResult = {} as Prisma.Result<Prisma.AccountDelegate, Q, "aggregate">["_min"];
            const dateTimeFields = ["accessTokenExpiresAt","refreshTokenExpiresAt","createdAt","updatedAt"] as const;
            for (const field of dateTimeFields)
            {
                if (!query._min[field]) continue;
                const values = records.map((record) => record[field]?.getTime()).filter((value) => value !== undefined);
                (minResult[field as keyof typeof minResult] as Date) = new Date(Math.min(...values));
            }
            const stringFields = ["id","accountId","providerId","userId","accessToken","refreshToken","idToken","scope","password"] as const;
            for (const field of stringFields)
            {
                if (!query._min[field]) continue;
                const values = records.map((record) => record[field] as string).filter((value) => value !== undefined);
                (minResult[field as keyof typeof minResult] as string) = values.sort()[0];
            }
            result._min = minResult;
        }
        if (query?._max)
        {
            const maxResult = {} as Prisma.Result<Prisma.AccountDelegate, Q, "aggregate">["_max"];
            const dateTimeFields = ["accessTokenExpiresAt","refreshTokenExpiresAt","createdAt","updatedAt"] as const;
            for (const field of dateTimeFields)
            {
                if (!query._max[field]) continue;
                const values = records.map((record) => record[field]?.getTime()).filter((value) => value !== undefined);
                (maxResult[field as keyof typeof maxResult] as Date) = new Date(Math.max(...values));
            }
            const stringFields = ["id","accountId","providerId","userId","accessToken","refreshToken","idToken","scope","password"] as const;
            for (const field of stringFields)
            {
                if (!query._max[field]) continue;
                const values = records.map((record) => record[field] as string).filter((value) => value !== undefined);
                (maxResult[field as keyof typeof maxResult] as string) = values.sort().reverse()[0];
            }
            result._max = maxResult;
        }
        return result as unknown as Prisma.Result<Prisma.AccountDelegate, Q, "aggregate">;
    }
}

class VerificationIDBClass extends BaseIDBModelClass<"Verification"> {
    private async _applyWhereClause<W extends Prisma.Args<Prisma.VerificationDelegate, 'findFirstOrThrow'>['where'], R extends Prisma.Result<Prisma.VerificationDelegate, object, 'findFirstOrThrow'>>(records: R[], whereClause: W, tx: IDBUtils.TransactionType): Promise<R[]> {
        if (!whereClause) return records;
        records = await IDBUtils.applyLogicalFilters<Prisma.VerificationDelegate, R, W>(
        records, whereClause, tx, this.keyPath, this._applyWhereClause.bind(this),
        )
        return (await Promise.all(records.map(async (record) =>
        {
            const stringFields = ["id","identifier","value"] as const;
            for (const field of stringFields)
            {
                if (!IDBUtils.whereStringFilter(record, field, whereClause[field])) return null;
            }
            const dateTimeFields = ["expiresAt","createdAt","updatedAt"] as const;
            for (const field of dateTimeFields)
            {
                if (!IDBUtils.whereDateTimeFilter(record, field, whereClause[field])) return null;
            }
            return record;
        }
        ))).filter((result) => result !== null);;
    }

    private _applySelectClause<S extends Prisma.Args<Prisma.VerificationDelegate, 'findMany'>['select']>(records: Prisma.Result<Prisma.VerificationDelegate, object, 'findFirstOrThrow'>[], selectClause: S): Prisma.Result<Prisma.VerificationDelegate, { select: S }, 'findFirstOrThrow'>[] {
        if (!selectClause)
        {
            return records as Prisma.Result<Prisma.VerificationDelegate, { select: S }, 'findFirstOrThrow'>[];
        }
        return records.map((record) => 
        {
            const partialRecord: Partial<typeof record> = record;
            for (const untypedKey of ["id","identifier","value","expiresAt","createdAt","updatedAt"]) 
            {
                const key = untypedKey as keyof typeof record & keyof S;
                if (!selectClause[key]) delete partialRecord[key];
            }
            return partialRecord;
        }
        ) as Prisma.Result<Prisma.VerificationDelegate, { select: S }, 'findFirstOrThrow'>[];
    }

    private async _applyRelations<Q extends Prisma.Args<Prisma.VerificationDelegate, 'findMany'>>(records: Prisma.Result<Prisma.VerificationDelegate, object, 'findFirstOrThrow'>[], tx: IDBUtils.TransactionType, query?: Q): Promise<Prisma.Result<Prisma.VerificationDelegate, Q, 'findFirstOrThrow'>[]> {
        if (!query) return records as Prisma.Result<Prisma.VerificationDelegate, Q, 'findFirstOrThrow'>[];
        const recordsWithRelations = records.map(async (record) => 
        {
            const unsafeRecord = record as Record<string, unknown>;
            return unsafeRecord;
        }
        );
        return (await Promise.all(recordsWithRelations)) as Prisma.Result<Prisma.VerificationDelegate, Q, 'findFirstOrThrow'>[];
    }

    async _applyOrderByClause<O extends Prisma.Args<Prisma.VerificationDelegate, 'findMany'>['orderBy'], R extends Prisma.Result<Prisma.VerificationDelegate, object, "findFirstOrThrow">>(records: R[], orderByClause: O, tx: IDBUtils.TransactionType): Promise<void> {
        if (orderByClause === undefined) return;
        const orderByClauses = IDBUtils.convertToArray(orderByClause);
        const indexedKeys = await Promise.all(
        records.map(async (record) => 
        {
            const keys = await Promise.all(
            orderByClauses.map(async (clause) => await this._resolveOrderByKey(record, clause, tx)),
            );
            return { keys, record };
        }
        ));
        indexedKeys.sort((a, b) => 
        {
            for (let i = 0; i < orderByClauses.length; i++)
            {
                const clause = orderByClauses[i];
                const comparison = IDBUtils.genericComparator(a.keys[i], b.keys[i], this._resolveSortOrder(clause));
                if (comparison !== 0) return comparison;
            }
            return 0;
        }
        );
        for (let i = 0; i < records.length; i++)
        {
            records[i] = indexedKeys[i].record;
        }
    }

    async _resolveOrderByKey(record: Prisma.Result<Prisma.VerificationDelegate, object, "findFirstOrThrow">, orderByInput: Prisma.VerificationOrderByWithRelationInput, tx: IDBUtils.TransactionType): Promise<unknown> {
        const scalarFields = ["id","identifier","value","expiresAt","createdAt","updatedAt"] as const;
        for (const field of scalarFields) if (orderByInput[field]) return record[field];
    }

    _resolveSortOrder(orderByInput: Prisma.VerificationOrderByWithRelationInput): Prisma.SortOrder | { sort: Prisma.SortOrder, nulls?: 'first' | 'last' } {
        const scalarFields = ["id","identifier","value","expiresAt","createdAt","updatedAt"] as const;
        for (const field of scalarFields) if (orderByInput[field]) return orderByInput[field];
        throw new Error("No field in orderBy clause");
    }

    private async _fillDefaults<D extends Prisma.Args<Prisma.VerificationDelegate, "create">["data"]>(data: D, tx?: IDBUtils.ReadwriteTransactionType): Promise<D> {
        if (data === undefined) data = {} as NonNullable<D>;
        if (data.createdAt === undefined) 
        {
            data.createdAt = null;
        }
        if (data.updatedAt === undefined) 
        {
            data.updatedAt = null;
        }
        if (typeof data.expiresAt === 'string')
        {
            data.expiresAt = new Date(data.expiresAt)
        }
        if (typeof data.createdAt === 'string')
        {
            data.createdAt = new Date(data.createdAt)
        }
        if (typeof data.updatedAt === 'string')
        {
            data.updatedAt = new Date(data.updatedAt)
        }
        return data;
    }

    _getNeededStoresForWhere<W extends Prisma.Args<Prisma.VerificationDelegate, "findMany">['where']>(whereClause: W, neededStores: Set<StoreNames<PrismaIDBSchema>>) {
        if (whereClause === undefined) return;
        for (const param of IDBUtils.LogicalParams)
        {
            if (whereClause[param])
            {
                for (const clause of IDBUtils.convertToArray(whereClause[param]))
                {
                    this._getNeededStoresForWhere(clause, neededStores);
                }
            }
        }
    }

    _getNeededStoresForFind<Q extends Prisma.Args<Prisma.VerificationDelegate, "findMany">>(query?: Q): Set<StoreNames<PrismaIDBSchema>> {
        const neededStores: Set<StoreNames<PrismaIDBSchema>> = new Set();
        neededStores.add("Verification");
        this._getNeededStoresForWhere(query?.where, neededStores);
        if (query?.orderBy)
        {
            const orderBy = IDBUtils.convertToArray(query.orderBy);
        }
        return neededStores;
    }

    _getNeededStoresForCreate<D extends Partial<Prisma.Args<Prisma.VerificationDelegate, "create">['data']>>(data: D): Set<StoreNames<PrismaIDBSchema>> {
        const neededStores: Set<StoreNames<PrismaIDBSchema>> = new Set();
        neededStores.add("Verification");
        return neededStores;
    }

    _getNeededStoresForUpdate<Q extends Prisma.Args<Prisma.VerificationDelegate, "update">>(query: Partial<Q>): Set<StoreNames<PrismaIDBSchema>> {
        const neededStores = this._getNeededStoresForFind(query).union(this._getNeededStoresForCreate(query.data as Prisma.Args<Prisma.VerificationDelegate, "create">["data"]));
        return neededStores;
    }

    _getNeededStoresForNestedDelete(neededStores: Set<StoreNames<PrismaIDBSchema>>): void {
        neededStores.add("Verification");
    }

    private _removeNestedCreateData<D extends Prisma.Args<Prisma.VerificationDelegate, "create">["data"]>(data: D): Prisma.Result<Prisma.VerificationDelegate, object, "findFirstOrThrow"> {
        const recordWithoutNestedCreate = structuredClone(data);
        return recordWithoutNestedCreate as Prisma.Result<Prisma.VerificationDelegate, object, "findFirstOrThrow">;
    }

    private _preprocessListFields(records: Prisma.Result<Prisma.VerificationDelegate, object, "findMany">): void {
    }

    async findMany<Q extends Prisma.Args<Prisma.VerificationDelegate, 'findMany'>>(query?: Q, tx?: IDBUtils.TransactionType): Promise<Prisma.Result<Prisma.VerificationDelegate, Q, 'findMany'>> {
        tx = tx ?? this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), "readonly");
        const records = await this._applyWhereClause(await tx.objectStore("Verification").getAll(), query?.where, tx);
        await this._applyOrderByClause(records, query?.orderBy, tx);
        const relationAppliedRecords = (await this._applyRelations(records, tx, query)) as Prisma.Result<Prisma.VerificationDelegate, object, 'findFirstOrThrow'>[];
        const selectClause = query?.select;
        let selectAppliedRecords = this._applySelectClause(relationAppliedRecords, selectClause);
        if (query?.distinct)
        {
            const distinctFields = IDBUtils.convertToArray(query.distinct);
            const seen = new Set<string>();
            selectAppliedRecords = selectAppliedRecords.filter((record) => 
            {
                const key = distinctFields.map((field) => record[field]).join("|");
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            }
            );
        }
        this._preprocessListFields(selectAppliedRecords);
        return selectAppliedRecords as Prisma.Result<Prisma.VerificationDelegate, Q, 'findMany'>;
    }

    async findFirst<Q extends Prisma.Args<Prisma.VerificationDelegate, 'findFirst'>>(query?: Q, tx?: IDBUtils.TransactionType): Promise<Prisma.Result<Prisma.VerificationDelegate, Q, 'findFirst'>> {
        tx = tx ?? this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), "readonly");
        return (await this.findMany(query, tx))[0] ?? null;
    }

    async findFirstOrThrow<Q extends Prisma.Args<Prisma.VerificationDelegate, "findFirstOrThrow">>(query?: Q, tx?: IDBUtils.TransactionType): Promise<Prisma.Result<Prisma.VerificationDelegate, Q, "findFirstOrThrow">> {
        tx = tx ?? this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), "readonly");
        const record = await this.findFirst(query, tx);
        if (!record)
        {
            tx.abort();
            throw new Error("Record not found");
        }
        return record;
    }

    async findUnique<Q extends Prisma.Args<Prisma.VerificationDelegate, 'findUnique'>>(query: Q, tx?: IDBUtils.TransactionType): Promise<Prisma.Result<Prisma.VerificationDelegate, Q, 'findUnique'>> {
        tx = tx ?? this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), "readonly");
        let record;
        if (query.where.id !== undefined)
        {
            record = await tx.objectStore("Verification").get([query.where.id]);
        }
        if (!record) return null;

        const recordWithRelations = this._applySelectClause(await this._applyRelations(await this._applyWhereClause([record], query.where, tx), tx, query), query.select)[0];
        this._preprocessListFields([recordWithRelations]);
        return recordWithRelations as Prisma.Result<Prisma.VerificationDelegate, Q, "findUnique">;
    }

    async findUniqueOrThrow<Q extends Prisma.Args<Prisma.VerificationDelegate, "findUniqueOrThrow">>(query: Q, tx?: IDBUtils.TransactionType): Promise<Prisma.Result<Prisma.VerificationDelegate, Q, "findUniqueOrThrow">> {
        tx = tx ?? this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), "readonly");
        const record = await this.findUnique(query, tx);
        if (!record)
        {
            tx.abort();
            throw new Error("Record not found");
        }
        return record;
    }

    async count<Q extends Prisma.Args<Prisma.VerificationDelegate, 'count'>>(query?: Q, tx?: IDBUtils.TransactionType): Promise<Prisma.Result<Prisma.VerificationDelegate, Q, 'count'>> {
        tx = tx ?? this.client._db.transaction(["Verification"], "readonly");
        if (!query?.select || query.select === true)
        {
            const records = await this.findMany({ where: query?.where }, tx);
            return records.length as Prisma.Result<Prisma.VerificationDelegate, Q, "count">;
        }
        const result: Partial<Record<keyof Prisma.VerificationCountAggregateInputType, number>> = {};
        for (const key of Object.keys(query.select))
        {
            const typedKey = key as keyof typeof query.select;
            if (typedKey === "_all")
            {
                result[typedKey] = (await this.findMany({ where: query.where }, tx)).length;
                continue;
            }
            result[typedKey] = (await this.findMany({ where: { [`${typedKey}`]: { not: null } } }, tx)).length;
        }
        return result as Prisma.Result<Prisma.VerificationDelegate, Q, "count">;
    }

    async create<Q extends Prisma.Args<Prisma.VerificationDelegate, "create">>(query: Q, tx?: IDBUtils.ReadwriteTransactionType): Promise<Prisma.Result<Prisma.VerificationDelegate, Q, "create">> {
        const storesNeeded = this._getNeededStoresForCreate(query.data);
        tx = tx ?? this.client._db.transaction(Array.from(storesNeeded), "readwrite");
        const record = this._removeNestedCreateData(await this._fillDefaults(query.data, tx));
        const keyPath = await tx.objectStore("Verification").add(record);
        const data = (await tx.objectStore("Verification").get(keyPath))!;
        const recordsWithRelations = this._applySelectClause(await this._applyRelations<object>([data], tx, query), query.select)[0];
        this._preprocessListFields([recordsWithRelations]);
        this.emit("create", keyPath);
        return recordsWithRelations as Prisma.Result<Prisma.VerificationDelegate, Q, "create">;
    }

    async createMany<Q extends Prisma.Args<Prisma.VerificationDelegate, "createMany">>(query: Q, tx?: IDBUtils.ReadwriteTransactionType): Promise<Prisma.Result<Prisma.VerificationDelegate, Q, "createMany">> {
        const createManyData = IDBUtils.convertToArray(query.data);
        tx = tx ?? this.client._db.transaction(["Verification"], "readwrite");
        for (const createData of createManyData)
        {
            const record = this._removeNestedCreateData(await this._fillDefaults(createData, tx));
            const keyPath = await tx.objectStore("Verification").add(record);
            this.emit("create", keyPath);
        }
        return { count: createManyData.length };
    }

    async createManyAndReturn<Q extends Prisma.Args<Prisma.VerificationDelegate, "createManyAndReturn">>(query: Q, tx?: IDBUtils.ReadwriteTransactionType): Promise<Prisma.Result<Prisma.VerificationDelegate, Q, "createManyAndReturn">> {
        const createManyData = IDBUtils.convertToArray(query.data);
        const records: Prisma.Result<Prisma.VerificationDelegate, object, "findMany"> = [];
        tx = tx ?? this.client._db.transaction(["Verification"], "readwrite");
        for (const createData of createManyData)
        {
            const record = this._removeNestedCreateData(await this._fillDefaults(createData, tx));
            const keyPath = await tx.objectStore("Verification").add(record);
            this.emit("create", keyPath);
            records.push(this._applySelectClause([record], query.select)[0]);
        }
        this._preprocessListFields(records);
        return records as Prisma.Result<Prisma.VerificationDelegate, Q, "createManyAndReturn">;
    }

    async delete<Q extends Prisma.Args<Prisma.VerificationDelegate, 'delete'>>(query: Q, tx?: IDBUtils.ReadwriteTransactionType): Promise<Prisma.Result<Prisma.VerificationDelegate, Q, 'delete'>> {
        const storesNeeded = this._getNeededStoresForFind(query);
        this._getNeededStoresForNestedDelete(storesNeeded);
        tx = tx ?? this.client._db.transaction(Array.from(storesNeeded), "readwrite");
        const record = await this.findUnique(query, tx);
        if (!record) throw new Error("Record not found");
        await tx.objectStore("Verification").delete([record.id]);
        this.emit("delete", [record.id]);
        return record;
    }

    async deleteMany<Q extends Prisma.Args<Prisma.VerificationDelegate, 'deleteMany'>>(query?: Q, tx?: IDBUtils.ReadwriteTransactionType): Promise<Prisma.Result<Prisma.VerificationDelegate, Q, 'deleteMany'>> {
        const storesNeeded = this._getNeededStoresForFind(query);
        this._getNeededStoresForNestedDelete(storesNeeded);
        tx = tx ?? this.client._db.transaction(Array.from(storesNeeded), "readwrite");
        const records = await this.findMany(query, tx);
        for (const record of records)
        {
            await this.delete({ where: { id: record.id } }, tx);
        }
        return { count: records.length };
    }

    async update<Q extends Prisma.Args<Prisma.VerificationDelegate, 'update'>>(query: Q, tx?: IDBUtils.ReadwriteTransactionType): Promise<Prisma.Result<Prisma.VerificationDelegate, Q, 'update'>> {
        tx = tx ?? this.client._db.transaction(
        Array.from(this._getNeededStoresForUpdate(query)), "readwrite");
        const record = await this.findUnique({ where: query.where }, tx);
        if (record === null)
        {
            tx.abort();
            throw new Error("Record not found");
        }
        const startKeyPath: PrismaIDBSchema["Verification"]["key"] = [record.id];
        const stringFields = ["id","identifier","value"] as const;
        for (const field of stringFields)
        {
            IDBUtils.handleStringUpdateField(record, field, query.data[field]);
        }
        const dateTimeFields = ["expiresAt","createdAt","updatedAt"] as const;
        for (const field of dateTimeFields)
        {
            IDBUtils.handleDateTimeUpdateField(record, field, query.data[field]);
        }
        const endKeyPath: PrismaIDBSchema["Verification"]["key"] = [record.id];
        for (let i = 0; i < startKeyPath.length; i++)
        {
            if (startKeyPath[i] !== endKeyPath[i])
            {
                if (await tx.objectStore("Verification").get(endKeyPath) !== undefined)
                {
                    throw new Error("Record with the same keyPath already exists");
                }
                await tx.objectStore("Verification").delete(startKeyPath);
                break;
            }
        }
        const keyPath = await tx.objectStore("Verification").put(record);
        this.emit("update", keyPath, startKeyPath);
        for (let i = 0; i < startKeyPath.length; i++)
        {
            if (startKeyPath[i] !== endKeyPath[i])
            {
                break;
            }
        }
        const recordWithRelations = (await this.findUnique(
        {
            where: { id: keyPath[0] },
        }
        , tx))!;
        return recordWithRelations as Prisma.Result<Prisma.VerificationDelegate, Q, "update">;
    }

    async updateMany<Q extends Prisma.Args<Prisma.VerificationDelegate, "updateMany">>(query: Q, tx?: IDBUtils.ReadwriteTransactionType): Promise<Prisma.Result<Prisma.VerificationDelegate, Q, "updateMany">> {
        tx = tx ?? this.client._db.transaction(
        Array.from(this._getNeededStoresForFind(query)), "readwrite");
        const records = await this.findMany({ where: query.where }, tx);
        await Promise.all(
        records.map(async (record) =>
        {
            await this.update({ where: { id: record.id }, data: query.data }, tx);
        }
        ));
        return { count: records.length };
    }

    async upsert<Q extends Prisma.Args<Prisma.VerificationDelegate, "upsert">>(query: Q, tx?: IDBUtils.ReadwriteTransactionType): Promise<Prisma.Result<Prisma.VerificationDelegate, Q, "upsert">> {
        const neededStores = this._getNeededStoresForUpdate({ ...query, data: { ...query.update, ...query.create } as Prisma.Args<Prisma.VerificationDelegate, "update">["data"] });
        tx = tx ?? this.client._db.transaction(Array.from(neededStores), "readwrite");
        let record = await this.findUnique({ where: query.where }, tx);
        if (!record) record = await this.create({ data: query.create }, tx);
        else record = await this.update({ where: query.where, data: query.update }, tx);
        record = await this.findUniqueOrThrow({ where: { id: record.id }, select: query.select }, tx);
        return record as Prisma.Result<Prisma.VerificationDelegate, Q, "upsert">;
    }

    async aggregate<Q extends Prisma.Args<Prisma.VerificationDelegate, 'aggregate'>>(query?: Q, tx?: IDBUtils.TransactionType): Promise<Prisma.Result<Prisma.VerificationDelegate, Q, 'aggregate'>> {
        tx = tx ?? this.client._db.transaction(["Verification"], "readonly");
        const records = await this.findMany({ where: query?.where }, tx);
        const result: Partial<Prisma.Result<Prisma.VerificationDelegate, Q, "aggregate">> = {};
        if (query?._count)
        {
            if (query._count === true)
            {
                (result._count as number) = records.length;
            }
            else
            {
                for (const key of Object.keys(query._count))
                {
                    const typedKey = key as keyof typeof query._count;
                    if (typedKey === "_all")
                    {
                        (result._count as Record<string, number>)[typedKey] = records.length;
                        continue;
                    }
                    (result._count as Record<string, number>)[typedKey] = (
                    await this.findMany({ where: { [`${typedKey}`]: { not: null } } }, tx)
                    ).length;
                }
            }
        }
        if (query?._min)
        {
            const minResult = {} as Prisma.Result<Prisma.VerificationDelegate, Q, "aggregate">["_min"];
            const dateTimeFields = ["expiresAt","createdAt","updatedAt"] as const;
            for (const field of dateTimeFields)
            {
                if (!query._min[field]) continue;
                const values = records.map((record) => record[field]?.getTime()).filter((value) => value !== undefined);
                (minResult[field as keyof typeof minResult] as Date) = new Date(Math.min(...values));
            }
            const stringFields = ["id","identifier","value"] as const;
            for (const field of stringFields)
            {
                if (!query._min[field]) continue;
                const values = records.map((record) => record[field] as string).filter((value) => value !== undefined);
                (minResult[field as keyof typeof minResult] as string) = values.sort()[0];
            }
            result._min = minResult;
        }
        if (query?._max)
        {
            const maxResult = {} as Prisma.Result<Prisma.VerificationDelegate, Q, "aggregate">["_max"];
            const dateTimeFields = ["expiresAt","createdAt","updatedAt"] as const;
            for (const field of dateTimeFields)
            {
                if (!query._max[field]) continue;
                const values = records.map((record) => record[field]?.getTime()).filter((value) => value !== undefined);
                (maxResult[field as keyof typeof maxResult] as Date) = new Date(Math.max(...values));
            }
            const stringFields = ["id","identifier","value"] as const;
            for (const field of stringFields)
            {
                if (!query._max[field]) continue;
                const values = records.map((record) => record[field] as string).filter((value) => value !== undefined);
                (maxResult[field as keyof typeof maxResult] as string) = values.sort().reverse()[0];
            }
            result._max = maxResult;
        }
        return result as unknown as Prisma.Result<Prisma.VerificationDelegate, Q, "aggregate">;
    }
}
