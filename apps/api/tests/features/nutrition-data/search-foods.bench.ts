import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import { createSearchFixture } from './search-foods.fixture.ts';
import { searchFoods } from '../../../src/features/nutrition-data/search-foods.ts';

const fixture = await createSearchFixture();
try {
	// Match the five expression indexes in the application schema.
	const document = `(setweight(to_tsvector('english', public.immutable_unaccent(coalesce("productName", ''))), 'A') ||
			setweight(to_tsvector('english', public.immutable_unaccent(coalesce(brands, ''))), 'B'))`;
	await fixture.admin.query(`
		CREATE INDEX ON ${fixture.table} USING gin (${document});
		CREATE INDEX ON ${fixture.table} USING gin (${document}) WHERE "uniqueScans" >= 10;
		CREATE INDEX ON ${fixture.table} USING gin (${document}) WHERE "uniqueScans" >= 1;
		CREATE INDEX ON ${fixture.table} USING gin (public.immutable_unaccent("productName") gin_trgm_ops);
		CREATE INDEX ON ${fixture.table} USING gin (public.immutable_unaccent(brands) gin_trgm_ops)
	`);
	const measurements = [];
	for (const rows of [1_000, 10_000, 100_000]) {
		await fixture.admin.query(`TRUNCATE ${fixture.table}`);
		await fixture.admin.query(
			`INSERT INTO ${fixture.table} (id, code, "productName", brands, "uniqueScans")
			 SELECT i::text, i::text,
			   CASE WHEN i % 5 = 0 THEN 'Tomato sauce ' ELSE 'Lentil soup with vegetables ' END || i,
			   'Lentil', i % 10000 + 1 FROM generate_series(1, $1::int) i`,
			[rows]
		);
		await fixture.admin.query(`ANALYZE ${fixture.table}`);
		for (const query of ['lentil', 'lnetil', 'lentel']) {
			for (const offset of [0, 480]) {
				await searchFoods(fixture.db, query, offset, 20);
				const timings = [];
				for (let sample = 0; sample < 3; sample++) {
					const start = performance.now();
					const hits = await searchFoods(fixture.db, query, offset, 20);
					timings.push(performance.now() - start);
					assert.equal(hits.length, 20, `${query}, offset ${offset}, ${rows} rows`);
				}
				timings.sort((a, b) => a - b);
				measurements.push({ rows, query, offset, medianMs: Number(timings[1].toFixed(2)) });
			}
		}
	}
	console.table(measurements);
} finally {
	await fixture.close();
}
