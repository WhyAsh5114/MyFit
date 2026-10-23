#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/20668c294305a05ca2cab6567a067382f9267afe79e0e4f3d2bfd6a5fe8488a7/contract';
import endContract from '../../snapshots/20668c294305a05ca2cab6567a067382f9267afe79e0e4f3d2bfd6a5fe8488a7/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/818a2238897d8b712f4de89a15b5018676a9e943ee7fedff429314691705364f/contract';
import startContract from '../../snapshots/818a2238897d8b712f4de89a15b5018676a9e943ee7fedff429314691705364f/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, primaryKey, sql } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
	override readonly startContractJson = startContract;
	override readonly endContractJson = endContract;

	override get operations() {
		return [
			// The trigram indexes below need pg_trgm's operator classes. This is idempotent,
			// so databases that already have the extension are fine.
			this.installExtension({
				extensionName: 'pg_trgm',
				invariantId: 'install-pg-trgm',
				id: 'extension.pg_trgm',
				label: 'Install the pg_trgm extension'
			}),
			this.createTable({
				schema: 'public',
				table: 'NutritionData',
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
					col('code', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
					col('completeness', 'float8', { notNull: true, codecRef: { codecId: 'pg/float8@1' } }),
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
					col('productName', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
					col('proteinsG_100g', 'float8', { notNull: true, codecRef: { codecId: 'pg/float8@1' } }),
					col('saltG_100g', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
					col('saturatedFatG_100g', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
					col('servingQuantity', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
					col('servingSize', 'text', { codecRef: { codecId: 'pg/text@1' } }),
					col('sodiumMg_100g', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
					col('sugarsG_100g', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
					col('transFatG_100g', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
					col('uniqueScans', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
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
				constraints: [primaryKey(['id'])]
			}),
			this.createIndex({
				schema: 'public',
				table: 'NutritionData',
				index: 'NutritionData_code_idx_8e43b86b',
				columns: ['code']
			}),
			this.createIndex({
				schema: 'public',
				table: 'NutritionData',
				index: 'nutrition_data_brands_trgm_bfc86f7b',
				expression: sql`brands gin_trgm_ops`,
				extras: { type: 'gin' }
			}),
			this.createIndex({
				schema: 'public',
				table: 'NutritionData',
				index: 'nutrition_data_product_name_trgm_85e6f92c',
				expression: sql`"productName" gin_trgm_ops`,
				extras: { type: 'gin' }
			}),
			this.createIndex({
				schema: 'public',
				table: 'NutritionData',
				index: 'nutrition_data_search_5d8ee8f9',
				expression: sql`(setweight(to_tsvector('english', coalesce("productName", '')), 'A') || setweight(to_tsvector('english', coalesce("brands", '')), 'B'))`,
				extras: { type: 'gin' }
			})
		];
	}
}

MigrationCLI.run(import.meta.url, M);
