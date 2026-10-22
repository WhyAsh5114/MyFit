#!/usr/bin/env -S npx tsx
import {
	Migration,
	MigrationCLI,
	createIndexOp,
	createMarkerStoreOp,
	createObjectStoreOp
} from '@prisma-idb/target-idb/migration';

export default class M extends Migration {
	override describe() {
		return {
			from: null,
			to: '329bd9102170df5a3a05c5e27e6b5a45a1ea2b27f5828426f2c890c38fc8c0b5'
		};
	}

	override get operations() {
		return [
			createMarkerStoreOp(),
			createObjectStoreOp('activityEntry', {
				keyPath: 'id',
				indexes: { userId: { keyPath: 'userId' } }
			}),
			createIndexOp('activityEntry', 'userId', { keyPath: 'userId' }),
			createObjectStoreOp('activityPreferences', {
				keyPath: 'id',
				indexes: {
					userId: { keyPath: 'userId' },
					userId_effectiveFrom_unique: { keyPath: ['userId', 'effectiveFrom'], unique: true }
				}
			}),
			createIndexOp('activityPreferences', 'userId', { keyPath: 'userId' }),
			createIndexOp('activityPreferences', 'userId_effectiveFrom_unique', {
				keyPath: ['userId', 'effectiveFrom'],
				unique: true
			}),
			createObjectStoreOp('foodEntry', {
				keyPath: 'id',
				indexes: {
					mealId: { keyPath: 'mealId' },
					recipeId: { keyPath: 'recipeId' },
					userId: { keyPath: 'userId' }
				}
			}),
			createIndexOp('foodEntry', 'mealId', { keyPath: 'mealId' }),
			createIndexOp('foodEntry', 'recipeId', { keyPath: 'recipeId' }),
			createIndexOp('foodEntry', 'userId', { keyPath: 'userId' }),
			createObjectStoreOp('macroMetrics', {
				keyPath: 'id',
				indexes: {
					userId: { keyPath: 'userId' },
					userId_effectiveFrom_unique: { keyPath: ['userId', 'effectiveFrom'], unique: true }
				}
			}),
			createIndexOp('macroMetrics', 'userId', { keyPath: 'userId' }),
			createIndexOp('macroMetrics', 'userId_effectiveFrom_unique', {
				keyPath: ['userId', 'effectiveFrom'],
				unique: true
			}),
			createObjectStoreOp('macroTargets', {
				keyPath: 'id',
				indexes: {
					userId: { keyPath: 'userId' },
					userId_effectiveFrom_unique: { keyPath: ['userId', 'effectiveFrom'], unique: true }
				}
			}),
			createIndexOp('macroTargets', 'userId', { keyPath: 'userId' }),
			createIndexOp('macroTargets', 'userId_effectiveFrom_unique', {
				keyPath: ['userId', 'effectiveFrom'],
				unique: true
			}),
			createObjectStoreOp('meal', {
				keyPath: 'id',
				indexes: {
					userId: { keyPath: 'userId' },
					userId_name_unique: { keyPath: ['userId', 'name'], unique: true }
				}
			}),
			createIndexOp('meal', 'userId', { keyPath: 'userId' }),
			createIndexOp('meal', 'userId_name_unique', { keyPath: ['userId', 'name'], unique: true }),
			createObjectStoreOp('recipe', {
				keyPath: 'id',
				indexes: {
					userId: { keyPath: 'userId' },
					userId_name_unique: { keyPath: ['userId', 'name'], unique: true }
				}
			}),
			createIndexOp('recipe', 'userId', { keyPath: 'userId' }),
			createIndexOp('recipe', 'userId_name_unique', { keyPath: ['userId', 'name'], unique: true }),
			createObjectStoreOp('recipeIngredient', {
				keyPath: 'id',
				indexes: { recipeId: { keyPath: 'recipeId' } }
			}),
			createIndexOp('recipeIngredient', 'recipeId', { keyPath: 'recipeId' }),
			createObjectStoreOp('user', {
				keyPath: 'id',
				indexes: { email_unique: { keyPath: 'email', unique: true } }
			}),
			createIndexOp('user', 'email_unique', { keyPath: 'email', unique: true })
		];
	}
}

MigrationCLI.run(import.meta.url, M);
