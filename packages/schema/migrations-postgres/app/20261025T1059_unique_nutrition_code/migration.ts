#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/52513ac073657030ce7026329ba07799eeeed6e0605c8a2b42554290fdef4c82/contract';
import startContract from '../../snapshots/52513ac073657030ce7026329ba07799eeeed6e0605c8a2b42554290fdef4c82/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/629292428441ee1057e4b6a6806b7e244d6a24514218d74d22927aabe29e9b0c/contract';
import endContract from '../../snapshots/629292428441ee1057e4b6a6806b7e244d6a24514218d74d22927aabe29e9b0c/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, rawSql } from '@prisma/orm-postgres/migration';

/** Repair earlier repeated imports before enforcing one row per food code. */
export default class M extends Migration<Start, End> {
	override readonly startContractJson = startContract;
	override readonly endContractJson = endContract;

	override get operations() {
		return [
			// NutritionData has no foreign keys. Retain an existing id for each code,
			// preferring the best-scanned record, with a stable tie-break on id.
			rawSql({
				id: 'data.deduplicate_nutrition_codes',
				label: 'Remove duplicate nutrition codes before adding uniqueness',
				operationClass: 'destructive',
				target: {
					id: 'postgres',
					details: { schema: 'public', objectType: 'table', name: 'NutritionData' }
				},
				precheck: [],
				execute: [
					{
						description: 'Keep the most-scanned existing row for each code',
						sql: `DELETE FROM public."NutritionData" WHERE id IN (
            SELECT id FROM (
              SELECT id, row_number() OVER (
                PARTITION BY code ORDER BY "uniqueScans" DESC, completeness DESC, id
              ) AS position
              FROM public."NutritionData"
            ) ranked WHERE position > 1
          )`
					}
				],
				postcheck: [
					{
						description: 'Verify that every nutrition code is unique',
						sql: 'SELECT NOT EXISTS (SELECT 1 FROM public."NutritionData" GROUP BY code HAVING count(*) > 1) AS result'
					}
				]
			}),
			this.dropIndex({
				schema: 'public',
				table: 'NutritionData',
				index: 'NutritionData_code_idx_8e43b86b'
			}),
			this.addUnique({
				schema: 'public',
				table: 'NutritionData',
				constraint: 'NutritionData_code_key',
				columns: ['code']
			})
		];
	}
}

MigrationCLI.run(import.meta.url, M);
