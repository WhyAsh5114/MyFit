#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/2cb77723bb8e71b0bf16d95d5ee3f308989253d3c3c363638268a883a653a3c6/contract';
import startContract from '../../snapshots/2cb77723bb8e71b0bf16d95d5ee3f308989253d3c3c363638268a883a653a3c6/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/4d7f38ec72f894e2aab2b36df9fb958e5ea3f3c97eadbd2e047cfe38d2d9ffc0/contract';
import endContract from '../../snapshots/4d7f38ec72f894e2aab2b36df9fb958e5ea3f3c97eadbd2e047cfe38d2d9ffc0/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, primaryKey, sql } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
	override readonly startContractJson = startContract;
	override readonly endContractJson = endContract;

	override get operations() {
		return [
			this.createTable({
				schema: 'public',
				table: 'Chat',
				columns: [
					col('createdAt', 'timestamptz', {
						notNull: true,
						default: fn(sql`now()`),
						codecRef: { codecId: 'pg/timestamptz-date@1' }
					}),
					col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
					col('title', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
					col('updatedAt', 'timestamptz', {
						notNull: true,
						codecRef: { codecId: 'pg/timestamptz-date@1' }
					}),
					col('userId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } })
				],
				constraints: [primaryKey(['id'])]
			}),
			this.createTable({
				schema: 'public',
				table: 'ChatMessage',
				columns: [
					col('chatId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
					col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
					col('parts', 'json', { notNull: true, codecRef: { codecId: 'pg/json@1' } }),
					col('position', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
					col('role', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } })
				],
				constraints: [primaryKey(['id'])]
			}),
			this.addUnique({
				schema: 'public',
				table: 'ChatMessage',
				constraint: 'ChatMessage_chatId_position_key',
				columns: ['chatId', 'position']
			}),
			this.createIndex({
				schema: 'public',
				table: 'Chat',
				index: 'Chat_userId_idx_a489d58a',
				columns: ['userId']
			}),
			this.createIndex({
				schema: 'public',
				table: 'ChatMessage',
				index: 'ChatMessage_chatId_idx_53965835',
				columns: ['chatId']
			}),
			this.addForeignKey({
				schema: 'public',
				table: 'Chat',
				foreignKey: {
					name: 'Chat_userId_fkey',
					columns: ['userId'],
					references: { schema: 'public', table: 'user', columns: ['id'] }
				}
			}),
			this.addForeignKey({
				schema: 'public',
				table: 'ChatMessage',
				foreignKey: {
					name: 'ChatMessage_chatId_fkey',
					columns: ['chatId'],
					references: { schema: 'public', table: 'Chat', columns: ['id'] },
					onDelete: 'cascade'
				}
			})
		];
	}
}

MigrationCLI.run(import.meta.url, M);
