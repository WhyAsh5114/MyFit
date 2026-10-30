#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/2cb77723bb8e71b0bf16d95d5ee3f308989253d3c3c363638268a883a653a3c6/contract';
import endContract from '../../snapshots/2cb77723bb8e71b0bf16d95d5ee3f308989253d3c3c363638268a883a653a3c6/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/629292428441ee1057e4b6a6806b7e244d6a24514218d74d22927aabe29e9b0c/contract';
import startContract from '../../snapshots/629292428441ee1057e4b6a6806b7e244d6a24514218d74d22927aabe29e9b0c/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, sql } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
	override readonly startContractJson = startContract;
	override readonly endContractJson = endContract;

	override get operations() {
		return [
			this.createIndex({
				schema: 'public',
				table: 'NutritionData',
				index: 'nutrition_data_search_popular_ac7e03d8',
				expression: sql`(setweight(to_tsvector('english', public.immutable_unaccent(coalesce("productName", ''))), 'A') || setweight(to_tsvector('english', public.immutable_unaccent(coalesce("brands", ''))), 'B'))`,
				extras: { type: 'gin', where: sql`"uniqueScans" >= 10` }
			}),
			this.createIndex({
				schema: 'public',
				table: 'NutritionData',
				index: 'nutrition_data_search_seen_a424f517',
				expression: sql`(setweight(to_tsvector('english', public.immutable_unaccent(coalesce("productName", ''))), 'A') || setweight(to_tsvector('english', public.immutable_unaccent(coalesce("brands", ''))), 'B'))`,
				extras: { type: 'gin', where: sql`"uniqueScans" >= 1` }
			})
		];
	}
}

MigrationCLI.run(import.meta.url, M);
