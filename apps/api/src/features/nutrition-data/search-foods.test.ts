import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { searchFoods } from './search-foods.ts';
import { createSearchFixture } from './search-foods.fixture.ts';
import { nutritionSearchQuery } from './search-query.ts';

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
	['jalapeno-sauce', 'Jalapeno sauce', 'Creme Brulee', 20],
	['cafe', 'Café au lait', null, 10],
	['cafe-plain', 'Cafe au lait', null, 20],
	['pate', 'Pâté', null, 10],
	['pate-plain', 'Pate', null, 20],
	['milk', 'Milk', 'Milbona', 10],
	['chocolate-milk', 'Chocolate milk', 'Milbona', 10000]
] as const;

let fixture: Awaited<ReturnType<typeof createSearchFixture>>;
let db: Awaited<ReturnType<typeof createSearchFixture>>['db'];

before(async () => {
	fixture = await createSearchFixture();
	db = fixture.db;
	for (const [id, name, brands, scans] of foods) {
		await fixture.admin.query(
			`INSERT INTO ${fixture.table} (id, code, "productName", brands, "uniqueScans")
			 VALUES ($1, $1, $2, $3, $4)`,
			[id, name, brands, scans]
		);
	}
});

after(async () => {
	await fixture?.close();
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

test('finds both accent spellings even when full-text matches compete', async () => {
	const cases = [
		['jalapeno', ['jalapeno', 'jalapeno-sauce']],
		['jalapeño', ['jalapeno', 'jalapeno-sauce']],
		['jalap', ['jalapeno', 'jalapeno-sauce']],
		['jlaapeño', ['jalapeno', 'jalapeno-sauce']],
		['creme brulee', ['jalapeno', 'jalapeno-sauce']],
		['crème brule', ['jalapeno', 'jalapeno-sauce']],
		['cafe au lait', ['cafe', 'cafe-plain']],
		['café au lait', ['cafe', 'cafe-plain']],
		['pate', ['pate', 'pate-plain']],
		['pâté', ['pate', 'pate-plain']],
		['"cafe au lait"', ['cafe', 'cafe-plain']],
		['"crème brûlée"', ['jalapeno', 'jalapeno-sauce']],
		['jalapeño OR pâté', ['jalapeno', 'jalapeno-sauce', 'pate', 'pate-plain']],
		['jalapeno -"creme brulee"', []]
	] as const;
	for (const [query, expected] of cases) {
		const hits = await searchFoods(db, query, 0, 10);
		assert.deepEqual(hits.map((hit) => hit.id).sort(), [...expected].sort(), query);
		const accented = hits.find((hit) => hit.id === 'jalapeno');
		if (accented) assert.equal(accented.productName, 'Jalapeño', query);
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

test('bounds broad candidate modes and ends pagination without switching recovery modes', async () => {
	await fixture.admin
		.query(`INSERT INTO ${fixture.table} (id, code, "productName", brands, "uniqueScans")
		SELECT 'budget-' || i, 'budget-' || i, 'Lentil soup ' || i, 'Lentil', 100
		FROM generate_series(1, 1200) i
		UNION ALL SELECT 'budget-exact', 'budget-exact', 'Lentil', 'Lentil', 1`);
	try {
		for (const query of ['lentil', 'lnetil', 'lentel']) {
			const all = await searchFoods(db, query, 0, 500);
			assert.equal(all.length, 500, query);
			assert.deepEqual(await searchFoods(db, query, 0, 1000), all, query);
			assert.ok(
				all.every((hit) => hit.id !== 'budget-exact'),
				query
			);
			assert.deepEqual(await searchFoods(db, query, 480, 20), all.slice(480), query);
			assert.deepEqual(await searchFoods(db, query, 500, 20), [], query);
		}
	} finally {
		await fixture.admin.query(`DELETE FROM ${fixture.table} WHERE id LIKE 'budget-%'`);
	}
});

test('validates the pagination ceiling and defaults at the API boundary', () => {
	assert.equal(nutritionSearchQuery.parse({ search: 'milk' }).offset, 0);
	assert.equal(nutritionSearchQuery.parse({ search: 'milk', offset: '500' }).offset, 500);
	for (const offset of ['501', '-1', '1.5', 'Infinity', 'nope']) {
		assert.equal(nutritionSearchQuery.safeParse({ search: 'milk', offset }).success, false, offset);
	}
});

test('rejects invalid pagination for internal callers', async () => {
	for (const offset of [-1, 501, 1.5, Infinity, NaN]) {
		assert.deepEqual(await searchFoods(db, 'milk', offset, 20), []);
	}
	for (const limit of [-1, 0, 1.5, Infinity, NaN]) {
		assert.deepEqual(await searchFoods(db, 'milk', 0, limit), []);
	}
});
