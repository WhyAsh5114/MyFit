#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/818a2238897d8b712f4de89a15b5018676a9e943ee7fedff429314691705364f/contract';
import endContract from '../../snapshots/818a2238897d8b712f4de89a15b5018676a9e943ee7fedff429314691705364f/contract.json' with { type: 'json' };
import {
	Migration,
	MigrationCLI,
	checkExpression,
	col,
	fn,
	lit,
	primaryKey,
	sql
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<never, End> {
	override readonly endContractJson = endContract;

	override get operations() {
		return [
			this.createSchema({ schema: 'public' }),
			this.createTable({
				schema: 'public',
				table: 'ActivityEntry',
				columns: [
					col('calories', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
					col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
					col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
					col('performedAt', 'timestamptz', {
						notNull: true,
						codecRef: { codecId: 'pg/timestamptz-date@1' }
					}),
					col('quantity', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
					col('quantityUnit', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
					col('systemGenerated', 'bool', {
						notNull: true,
						default: lit(false),
						codecRef: { codecId: 'pg/bool@1' }
					}),
					col('userId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } })
				],
				constraints: [primaryKey(['id'])]
			}),
			this.createTable({
				schema: 'public',
				table: 'ActivityPreferences',
				columns: [
					col('adjustmentType', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
					col('effectiveFrom', 'timestamptz', {
						notNull: true,
						default: fn(sql`now()`),
						codecRef: { codecId: 'pg/timestamptz-date@1' }
					}),
					col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
					col('staticCalories', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
					col('userId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } })
				],
				constraints: [
					primaryKey(['id']),
					checkExpression(
						'ActivityPreferences_adjustmentType_check_7ecb78f0',
						sql`"adjustmentType" IN ('Static', 'Dynamic', 'Manual')`
					)
				]
			}),
			this.createTable({
				schema: 'public',
				table: 'Changelog',
				columns: [
					col('createdAt', 'timestamptz', {
						notNull: true,
						default: fn(sql`now()`),
						codecRef: { codecId: 'pg/timestamptz-date@1' }
					}),
					col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
					col('keyPath', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
					col('model', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
					col('operation', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
					col('outboxEventId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
					col('scopeKey', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } })
				],
				constraints: [
					primaryKey(['id']),
					checkExpression(
						'Changelog_operation_check_ff8db64b',
						sql`"operation" IN ('create', 'update', 'delete')`
					)
				]
			}),
			this.createTable({
				schema: 'public',
				table: 'FoodEntry',
				columns: [
					col('alcoholG_100g', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
					col('brands', 'text', { codecRef: { codecId: 'pg/text@1' } }),
					col('caffeineMg_100g', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
					col('calciumMg_100g', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
					col('carbohydratesG_100g', 'float8', {
						notNull: true,
						codecRef: { codecId: 'pg/float8@1' }
					}),
					col('cholesterolMg_100g', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
					col('copperMg_100g', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
					col('eatenAt', 'timestamptz', {
						notNull: true,
						codecRef: { codecId: 'pg/timestamptz-date@1' }
					}),
					col('energyKcal_100g', 'float8', { notNull: true, codecRef: { codecId: 'pg/float8@1' } }),
					col('fatG_100g', 'float8', { notNull: true, codecRef: { codecId: 'pg/float8@1' } }),
					col('fiberG_100g', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
					col('folatesMcg_100g', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
					col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
					col('ironMg_100g', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
					col('magnesiumMg_100g', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
					col('manganeseMg_100g', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
					col('mealId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
					col('monounsaturatedFatG_100g', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
					col('phosphorusMg_100g', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
					col('polyolsG_100g', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
					col('polyunsaturatedFatG_100g', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
					col('potassiumMg_100g', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
					col('preferredUnit', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
					col('productName', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
					col('proteinsG_100g', 'float8', { notNull: true, codecRef: { codecId: 'pg/float8@1' } }),
					col('quantityG', 'float8', { notNull: true, codecRef: { codecId: 'pg/float8@1' } }),
					col('recipeId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
					col('saltG_100g', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
					col('saturatedFatG_100g', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
					col('servingQuantity', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
					col('servingSize', 'text', { codecRef: { codecId: 'pg/text@1' } }),
					col('sodiumMg_100g', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
					col('sugarsG_100g', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
					col('transFatG_100g', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
					col('unsaturatedFatG_100g', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
					col('userId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
					col('vitaminAIU_100g', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
					col('vitaminB12Mcg_100g', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
					col('vitaminB1Mg_100g', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
					col('vitaminB2Mg_100g', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
					col('vitaminB6Mg_100g', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
					col('vitaminB9Mcg_100g', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
					col('vitaminCMg_100g', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
					col('vitaminDIU_100g', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
					col('vitaminEMg_100g', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
					col('vitaminKMcg_100g', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
					col('zincMg_100g', 'float8', { codecRef: { codecId: 'pg/float8@1' } })
				],
				constraints: [
					primaryKey(['id']),
					checkExpression(
						'FoodEntry_preferredUnit_check_7796ba41',
						sql`"preferredUnit" IN ('g', 'serving')`
					)
				]
			}),
			this.createTable({
				schema: 'public',
				table: 'MacroMetrics',
				columns: [
					col('age', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
					col('bodyFatPercentage', 'float8', {
						notNull: true,
						codecRef: { codecId: 'pg/float8@1' }
					}),
					col('bodyweight', 'float8', { notNull: true, codecRef: { codecId: 'pg/float8@1' } }),
					col('bodyweightUnit', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
					col('effectiveFrom', 'timestamptz', {
						notNull: true,
						default: fn(sql`now()`),
						codecRef: { codecId: 'pg/timestamptz-date@1' }
					}),
					col('gender', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
					col('height', 'float8', { notNull: true, codecRef: { codecId: 'pg/float8@1' } }),
					col('heightUnit', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
					col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
					col('userId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } })
				],
				constraints: [
					primaryKey(['id']),
					checkExpression(
						'MacroMetrics_bodyweightUnit_check_7ef04994',
						sql`"bodyweightUnit" IN ('kg', 'lb')`
					),
					checkExpression(
						'MacroMetrics_gender_check_4e1fa08e',
						sql`"gender" IN ('Male', 'Female')`
					),
					checkExpression(
						'MacroMetrics_heightUnit_check_782ea762',
						sql`"heightUnit" IN ('cm', 'in')`
					)
				]
			}),
			this.createTable({
				schema: 'public',
				table: 'MacroTargets',
				columns: [
					col('carbsG', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
					col('effectiveFrom', 'timestamptz', {
						notNull: true,
						default: fn(sql`now()`),
						codecRef: { codecId: 'pg/timestamptz-date@1' }
					}),
					col('fatG', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
					col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
					col('proteinG', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
					col('quantifier', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
					col('userId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
					col('weeklyCaloricChange', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } })
				],
				constraints: [
					primaryKey(['id']),
					checkExpression(
						'MacroTargets_quantifier_check_f19662d9',
						sql`"quantifier" IN ('Percentage', 'Absolute')`
					)
				]
			}),
			this.createTable({
				schema: 'public',
				table: 'Meal',
				columns: [
					col('active', 'bool', {
						notNull: true,
						default: lit(true),
						codecRef: { codecId: 'pg/bool@1' }
					}),
					col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
					col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
					col('sortOrder', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
					col('userId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } })
				],
				constraints: [primaryKey(['id'])]
			}),
			this.createTable({
				schema: 'public',
				table: 'Recipe',
				columns: [
					col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
					col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
					col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
					col('userId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } })
				],
				constraints: [primaryKey(['id'])]
			}),
			this.createTable({
				schema: 'public',
				table: 'RecipeIngredient',
				columns: [
					col('alcoholG_100g', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
					col('brands', 'text', { codecRef: { codecId: 'pg/text@1' } }),
					col('caffeineMg_100g', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
					col('calciumMg_100g', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
					col('carbohydratesG_100g', 'float8', {
						notNull: true,
						codecRef: { codecId: 'pg/float8@1' }
					}),
					col('cholesterolMg_100g', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
					col('copperMg_100g', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
					col('energyKcal_100g', 'float8', { notNull: true, codecRef: { codecId: 'pg/float8@1' } }),
					col('fatG_100g', 'float8', { notNull: true, codecRef: { codecId: 'pg/float8@1' } }),
					col('fiberG_100g', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
					col('folatesMcg_100g', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
					col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
					col('ironMg_100g', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
					col('magnesiumMg_100g', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
					col('manganeseMg_100g', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
					col('monounsaturatedFatG_100g', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
					col('phosphorusMg_100g', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
					col('polyolsG_100g', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
					col('polyunsaturatedFatG_100g', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
					col('potassiumMg_100g', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
					col('preferredUnit', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
					col('productName', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
					col('proteinsG_100g', 'float8', { notNull: true, codecRef: { codecId: 'pg/float8@1' } }),
					col('quantityG', 'float8', { notNull: true, codecRef: { codecId: 'pg/float8@1' } }),
					col('recipeId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
					col('saltG_100g', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
					col('saturatedFatG_100g', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
					col('servingQuantity', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
					col('servingSize', 'text', { codecRef: { codecId: 'pg/text@1' } }),
					col('sodiumMg_100g', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
					col('sugarsG_100g', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
					col('transFatG_100g', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
					col('unsaturatedFatG_100g', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
					col('vitaminAIU_100g', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
					col('vitaminB12Mcg_100g', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
					col('vitaminB1Mg_100g', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
					col('vitaminB2Mg_100g', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
					col('vitaminB6Mg_100g', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
					col('vitaminB9Mcg_100g', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
					col('vitaminCMg_100g', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
					col('vitaminDIU_100g', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
					col('vitaminEMg_100g', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
					col('vitaminKMcg_100g', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
					col('zincMg_100g', 'float8', { codecRef: { codecId: 'pg/float8@1' } })
				],
				constraints: [
					primaryKey(['id']),
					checkExpression(
						'RecipeIngredient_preferredUnit_check_7796ba41',
						sql`"preferredUnit" IN ('g', 'serving')`
					)
				]
			}),
			this.createTable({
				schema: 'public',
				table: 'account',
				columns: [
					col('accessToken', 'text', { codecRef: { codecId: 'pg/text@1' } }),
					col('accessTokenExpiresAt', 'timestamptz', {
						codecRef: { codecId: 'pg/timestamptz-date@1' }
					}),
					col('accountId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
					col('createdAt', 'timestamptz', {
						notNull: true,
						default: fn(sql`now()`),
						codecRef: { codecId: 'pg/timestamptz-date@1' }
					}),
					col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
					col('idToken', 'text', { codecRef: { codecId: 'pg/text@1' } }),
					col('password', 'text', { codecRef: { codecId: 'pg/text@1' } }),
					col('providerId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
					col('refreshToken', 'text', { codecRef: { codecId: 'pg/text@1' } }),
					col('refreshTokenExpiresAt', 'timestamptz', {
						codecRef: { codecId: 'pg/timestamptz-date@1' }
					}),
					col('scope', 'text', { codecRef: { codecId: 'pg/text@1' } }),
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
				table: 'session',
				columns: [
					col('createdAt', 'timestamptz', {
						notNull: true,
						default: fn(sql`now()`),
						codecRef: { codecId: 'pg/timestamptz-date@1' }
					}),
					col('expiresAt', 'timestamptz', {
						notNull: true,
						codecRef: { codecId: 'pg/timestamptz-date@1' }
					}),
					col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
					col('ipAddress', 'text', { codecRef: { codecId: 'pg/text@1' } }),
					col('token', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
					col('updatedAt', 'timestamptz', {
						notNull: true,
						codecRef: { codecId: 'pg/timestamptz-date@1' }
					}),
					col('userAgent', 'text', { codecRef: { codecId: 'pg/text@1' } }),
					col('userId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } })
				],
				constraints: [primaryKey(['id'])]
			}),
			this.createTable({
				schema: 'public',
				table: 'user',
				columns: [
					col('autoUpdate', 'bool', {
						notNull: true,
						default: lit(true),
						codecRef: { codecId: 'pg/bool@1' }
					}),
					col('createdAt', 'timestamptz', {
						notNull: true,
						default: fn(sql`now()`),
						codecRef: { codecId: 'pg/timestamptz-date@1' }
					}),
					col('email', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
					col('emailVerified', 'bool', {
						notNull: true,
						default: lit(false),
						codecRef: { codecId: 'pg/bool@1' }
					}),
					col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
					col('image', 'text', { codecRef: { codecId: 'pg/text@1' } }),
					col('isAnonymous', 'bool', { codecRef: { codecId: 'pg/bool@1' } }),
					col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
					col('updatedAt', 'timestamptz', {
						notNull: true,
						codecRef: { codecId: 'pg/timestamptz-date@1' }
					})
				],
				constraints: [primaryKey(['id'])]
			}),
			this.createTable({
				schema: 'public',
				table: 'verification',
				columns: [
					col('createdAt', 'timestamptz', {
						notNull: true,
						default: fn(sql`now()`),
						codecRef: { codecId: 'pg/timestamptz-date@1' }
					}),
					col('expiresAt', 'timestamptz', {
						notNull: true,
						codecRef: { codecId: 'pg/timestamptz-date@1' }
					}),
					col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
					col('identifier', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
					col('updatedAt', 'timestamptz', {
						notNull: true,
						codecRef: { codecId: 'pg/timestamptz-date@1' }
					}),
					col('value', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } })
				],
				constraints: [primaryKey(['id'])]
			}),
			this.addUnique({
				schema: 'public',
				table: 'ActivityPreferences',
				constraint: 'ActivityPreferences_userId_effectiveFrom_key',
				columns: ['userId', 'effectiveFrom']
			}),
			this.addUnique({
				schema: 'public',
				table: 'Changelog',
				constraint: 'Changelog_outboxEventId_key',
				columns: ['outboxEventId']
			}),
			this.addUnique({
				schema: 'public',
				table: 'MacroMetrics',
				constraint: 'MacroMetrics_userId_effectiveFrom_key',
				columns: ['userId', 'effectiveFrom']
			}),
			this.addUnique({
				schema: 'public',
				table: 'MacroTargets',
				constraint: 'MacroTargets_userId_effectiveFrom_key',
				columns: ['userId', 'effectiveFrom']
			}),
			this.addUnique({
				schema: 'public',
				table: 'Meal',
				constraint: 'Meal_userId_name_key',
				columns: ['userId', 'name']
			}),
			this.addUnique({
				schema: 'public',
				table: 'Recipe',
				constraint: 'Recipe_userId_name_key',
				columns: ['userId', 'name']
			}),
			this.addUnique({
				schema: 'public',
				table: 'session',
				constraint: 'session_token_key',
				columns: ['token']
			}),
			this.addUnique({
				schema: 'public',
				table: 'user',
				constraint: 'user_email_key',
				columns: ['email']
			}),
			this.createIndex({
				schema: 'public',
				table: 'ActivityEntry',
				index: 'ActivityEntry_userId_idx_a489d58a',
				columns: ['userId']
			}),
			this.createIndex({
				schema: 'public',
				table: 'ActivityPreferences',
				index: 'ActivityPreferences_userId_idx_a489d58a',
				columns: ['userId']
			}),
			this.createIndex({
				schema: 'public',
				table: 'Changelog',
				index: 'Changelog_scopeKey_id_idx_9635f6eb',
				columns: ['scopeKey', 'id']
			}),
			this.createIndex({
				schema: 'public',
				table: 'FoodEntry',
				index: 'FoodEntry_mealId_idx_12b177d9',
				columns: ['mealId']
			}),
			this.createIndex({
				schema: 'public',
				table: 'FoodEntry',
				index: 'FoodEntry_recipeId_idx_037d8d32',
				columns: ['recipeId']
			}),
			this.createIndex({
				schema: 'public',
				table: 'FoodEntry',
				index: 'FoodEntry_userId_idx_a489d58a',
				columns: ['userId']
			}),
			this.createIndex({
				schema: 'public',
				table: 'MacroMetrics',
				index: 'MacroMetrics_userId_idx_a489d58a',
				columns: ['userId']
			}),
			this.createIndex({
				schema: 'public',
				table: 'MacroTargets',
				index: 'MacroTargets_userId_idx_a489d58a',
				columns: ['userId']
			}),
			this.createIndex({
				schema: 'public',
				table: 'Meal',
				index: 'Meal_userId_idx_a489d58a',
				columns: ['userId']
			}),
			this.createIndex({
				schema: 'public',
				table: 'Recipe',
				index: 'Recipe_userId_idx_a489d58a',
				columns: ['userId']
			}),
			this.createIndex({
				schema: 'public',
				table: 'RecipeIngredient',
				index: 'RecipeIngredient_recipeId_idx_037d8d32',
				columns: ['recipeId']
			}),
			this.createIndex({
				schema: 'public',
				table: 'account',
				index: 'account_userId_idx_a489d58a',
				columns: ['userId']
			}),
			this.createIndex({
				schema: 'public',
				table: 'session',
				index: 'session_userId_idx_a489d58a',
				columns: ['userId']
			}),
			this.createIndex({
				schema: 'public',
				table: 'verification',
				index: 'verification_identifier_idx_79a0dbb3',
				columns: ['identifier']
			}),
			this.addForeignKey({
				schema: 'public',
				table: 'ActivityEntry',
				foreignKey: {
					name: 'ActivityEntry_userId_fkey',
					columns: ['userId'],
					references: { schema: 'public', table: 'user', columns: ['id'] }
				}
			}),
			this.addForeignKey({
				schema: 'public',
				table: 'ActivityPreferences',
				foreignKey: {
					name: 'ActivityPreferences_userId_fkey',
					columns: ['userId'],
					references: { schema: 'public', table: 'user', columns: ['id'] }
				}
			}),
			this.addForeignKey({
				schema: 'public',
				table: 'FoodEntry',
				foreignKey: {
					name: 'FoodEntry_mealId_fkey',
					columns: ['mealId'],
					references: { schema: 'public', table: 'Meal', columns: ['id'] }
				}
			}),
			this.addForeignKey({
				schema: 'public',
				table: 'FoodEntry',
				foreignKey: {
					name: 'FoodEntry_recipeId_fkey',
					columns: ['recipeId'],
					references: { schema: 'public', table: 'Recipe', columns: ['id'] }
				}
			}),
			this.addForeignKey({
				schema: 'public',
				table: 'FoodEntry',
				foreignKey: {
					name: 'FoodEntry_userId_fkey',
					columns: ['userId'],
					references: { schema: 'public', table: 'user', columns: ['id'] }
				}
			}),
			this.addForeignKey({
				schema: 'public',
				table: 'MacroMetrics',
				foreignKey: {
					name: 'MacroMetrics_userId_fkey',
					columns: ['userId'],
					references: { schema: 'public', table: 'user', columns: ['id'] }
				}
			}),
			this.addForeignKey({
				schema: 'public',
				table: 'MacroTargets',
				foreignKey: {
					name: 'MacroTargets_userId_fkey',
					columns: ['userId'],
					references: { schema: 'public', table: 'user', columns: ['id'] }
				}
			}),
			this.addForeignKey({
				schema: 'public',
				table: 'Meal',
				foreignKey: {
					name: 'Meal_userId_fkey',
					columns: ['userId'],
					references: { schema: 'public', table: 'user', columns: ['id'] }
				}
			}),
			this.addForeignKey({
				schema: 'public',
				table: 'Recipe',
				foreignKey: {
					name: 'Recipe_userId_fkey',
					columns: ['userId'],
					references: { schema: 'public', table: 'user', columns: ['id'] }
				}
			}),
			this.addForeignKey({
				schema: 'public',
				table: 'RecipeIngredient',
				foreignKey: {
					name: 'RecipeIngredient_recipeId_fkey',
					columns: ['recipeId'],
					references: { schema: 'public', table: 'Recipe', columns: ['id'] },
					onDelete: 'cascade'
				}
			}),
			this.addForeignKey({
				schema: 'public',
				table: 'account',
				foreignKey: {
					name: 'account_userId_fkey',
					columns: ['userId'],
					references: { schema: 'public', table: 'user', columns: ['id'] },
					onDelete: 'cascade'
				}
			}),
			this.addForeignKey({
				schema: 'public',
				table: 'session',
				foreignKey: {
					name: 'session_userId_fkey',
					columns: ['userId'],
					references: { schema: 'public', table: 'user', columns: ['id'] },
					onDelete: 'cascade'
				}
			})
		];
	}
}

MigrationCLI.run(import.meta.url, M);
