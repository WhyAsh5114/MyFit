import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { after, before, test } from 'node:test';
import postgres from '@prisma/orm-postgres/runtime';
import { Client } from 'pg';
import type { ServerContract } from '@myfit/schema/server';
import { searchFoods } from './search-foods.ts';

// Small synthetic counterparts to the labelled food-search intents and distractors.
// Keep popular ingredient-based products: they exposed the original ranking failures.
const foods = [
	['yogurt', 'Greek Yogurt', 'Dannon', 10],
	['yogurt-plain', 'Greek Yogurt Plain', 'Chobani', 20],
	['biscuit', 'Greek yogurt flavored biscuit sandwiches', 'Lance', 10000],
	['chicken', 'Chicken Breast', 'Hormel', 20],
	['chicken-cooked', 'Chicken breast cured, cooked, baked', 'Dulano', 30],
	['breakfast', 'Breakfast Chocolate chips', 'Carrefour', 10000],
	['whey', 'Whey', null, 10],
	['whey-protein', 'Whey Protein', 'Optimum Nutrition', 20],
	['wheat', 'Wheat bran', null, 10000],
	['oats', 'Oats', null, 10],
	['quaker', 'Quaker Oats', 'Quaker', 30],
	['quaker-syrup', 'Maple Syrup', 'Quaker Oats', 10000],
	['oasis', 'Oasis tropical drink', 'Oasis', 10000],
	['flakes', "Flocons d'avoine", 'Bjorg', 10],
	['oat-bread', "Pain aux flocons d'avoine et graines", 'Bio', 10000],
	['jalapeno', 'Jalapeño', 'Crème Brûlée', 10],
	['milk', 'Milk', 'Milbona', 10],
	['chocolate-milk', 'Chocolate milk', 'Milbona', 10000]
] as const;

const databaseUrl = process.env.NUTRITION_SEARCH_TEST_DATABASE_URL;
if (!databaseUrl)
	throw new Error('Set NUTRITION_SEARCH_TEST_DATABASE_URL to a test Postgres database.');
const schema = `nutrition_search_test_${randomUUID().replaceAll('-', '')}`;
const admin = new Client({ connectionString: databaseUrl });
const url = new URL(databaseUrl);
url.searchParams.set('options', `-csearch_path=${schema},public`);
const contractJson = JSON.parse(
	await readFile(
		new URL('../../../../../packages/schema/src/schema.postgres.generated.json', import.meta.url),
		'utf8'
	)
);
const db = postgres<ServerContract>({ contractJson });

before(async () => {
	await admin.connect();
	await admin.query(`CREATE SCHEMA "${schema}"`);
	await admin.query(`CREATE TABLE "${schema}"."NutritionData" (
		id text PRIMARY KEY, code text NOT NULL, "productName" text NOT NULL, brands text,
		"energyKcal_100g" float8 NOT NULL DEFAULT 100, "servingSize" text,
		"servingQuantity" float8, "uniqueScans" int NOT NULL, completeness float8 DEFAULT 1
	)`);
	for (const [id, name, brands, scans] of foods) {
		await admin.query(
			`INSERT INTO "${schema}"."NutritionData" (id, code, "productName", brands, "uniqueScans")
			 VALUES ($1, $1, $2, $3, $4)`,
			[id, name, brands, scans]
		);
	}
	await db.connect({ url: url.toString() });
});

after(async () => {
	await db.close();
	await admin.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
	await admin.end();
});

test('labelled food intents lead their ingredient, brand and fuzzy distractors', async () => {
	const cases = [
		['greek yogurt', ['yogurt', 'yogurt-plain']],
		['greek yog', ['yogurt', 'yogurt-plain']],
		['chiken breast', ['chicken', 'chicken-cooked']],
		['wehy', ['whey', 'whey-protein']],
		['oast', ['oats', 'quaker']],
		['breast chicken', ['chicken', 'chicken-cooked']],
		['Quaker oats', ['quaker']],
		['flocons d’avoine', ['flakes']],
		['oa', ['oats', 'quaker']]
	] as const;
	for (const [query, expected] of cases) {
		const hits = await searchFoods(db, query, 0, 5);
		assert.ok((expected as readonly string[]).includes(hits[0]?.id), query);
	}
	const typoHits = await searchFoods(db, 'chiken breast', 0, 10);
	assert.ok(typoHits.every((hit) => hit.id !== 'breakfast'));
	const exactHits = await searchFoods(db, 'whey', 0, 10);
	assert.deepEqual(exactHits.map((hit) => hit.id).sort(), ['whey', 'whey-protein']);
});

test('finds accented names and brands with unaccented input', async () => {
	for (const query of ['jalapeno', 'jalapeño', 'creme brulee', 'crème brule']) {
		const hits = await searchFoods(db, query, 0, 5);
		assert.equal(hits[0]?.id, 'jalapeno', query);
		assert.equal(hits[0]?.productName, 'Jalapeño', query);
	}
});

test('normalizes Unicode and whitespace and rejects non-searchable or excessive input', async () => {
	const hits = await searchFoods(db, '　ＧＲＥＥＫ　   yogurt\t', 0, 5);
	assert.equal(hits[0]?.id, 'yogurt');
	for (const query of [
		'',
		'   ',
		'!!!',
		'🥦',
		'a',
		'1',
		'a b',
		'x'.repeat(121),
		'oats '.repeat(9)
	]) {
		assert.deepEqual(await searchFoods(db, query, 0, 5), [], query);
	}
	assert.deepEqual(await searchFoods(db, 'the', 0, 5), []);
	assert.deepEqual(await searchFoods(db, 'zzzzzzzz', 0, 5), []);
});

test('honors phrases, OR and exclusions without fuzzy recovery or operator-only scans', async () => {
	for (const operator of ['or', 'OR', 'Or']) {
		const hits = await searchFoods(db, `whey ${operator} oats`, 0, 10);
		assert.deepEqual(
			hits.map((hit) => hit.id).sort(),
			['oats', 'quaker', 'quaker-syrup', 'whey', 'whey-protein'],
			operator
		);
	}
	assert.deepEqual(
		(await searchFoods(db, 'milk -chocolate', 0, 10)).map((hit) => hit.id),
		['milk']
	);
	assert.deepEqual(await searchFoods(db, '-milk', 0, 10), []);
	assert.deepEqual(await searchFoods(db, '"wehy"', 0, 10), []);
	assert.deepEqual(await searchFoods(db, "'; DROP TABLE NutritionData; --", 0, 10), []);
	assert.equal((await searchFoods(db, 'milk', 0, 10))[0]?.id, 'milk');
});

test('paginates each candidate mode without falling through to a different mode', async () => {
	for (const query of ['greek yog', 'wehy', 'chiken breast']) {
		const all = await searchFoods(db, query, 0, 10);
		assert.ok(all.length >= 2, query);
		assert.deepEqual(await searchFoods(db, query, 1, 1), all.slice(1, 2), query);
		assert.deepEqual(await searchFoods(db, query, all.length, 5), [], query);
	}
});
