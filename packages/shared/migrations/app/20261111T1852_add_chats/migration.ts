#!/usr/bin/env -S npx tsx
import {
	Migration,
	MigrationCLI,
	createIndexOp,
	createObjectStoreOp
} from '@prisma-idb/target-idb/migration';

export default class M extends Migration {
	override describe() {
		return {
			from: '329bd9102170df5a3a05c5e27e6b5a45a1ea2b27f5828426f2c890c38fc8c0b5',
			to: '5989cbf9fdeafef36e5cb62d7edb69eaf08cf8924db9991ad93bad2242ff7263'
		};
	}

	override get operations() {
		return [
			createObjectStoreOp('chat', { keyPath: 'id', indexes: { userId: { keyPath: 'userId' } } }),
			createIndexOp('chat', 'userId', { keyPath: 'userId' }),
			createObjectStoreOp('chatMessage', {
				keyPath: 'id',
				indexes: {
					chatId: { keyPath: 'chatId' },
					chatId_position_unique: { keyPath: ['chatId', 'position'], unique: true }
				}
			}),
			createIndexOp('chatMessage', 'chatId', { keyPath: 'chatId' }),
			createIndexOp('chatMessage', 'chatId_position_unique', {
				keyPath: ['chatId', 'position'],
				unique: true
			})
		];
	}
}

MigrationCLI.run(import.meta.url, M);
