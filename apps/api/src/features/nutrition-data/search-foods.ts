import type { getDb } from '../../../lib/db.js';

type Db = Awaited<ReturnType<typeof getDb>>;

/** One ranked search hit: the columns the food list shows. */
export type FoodSearchHit = {
	id: string;
	code: string;
	productName: string;
	brands: string | null;
	energyKcal_100g: number;
	servingSize: string | null;
	servingQuantity: number | null;
};

/**
 * Ranked food search over `NutritionData`: full-text (weighted tsvector) plus
 * trigram similarity for typos, nudged by scan popularity and completeness.
 *
 * Prisma's ORM can filter and rank by full text (`fullTextMatches`/`fullTextRank`)
 * but has no trigram operators and no way to blend the rank with popularity, so
 * this query runs on the raw lane. Its search document must stay identical to the
 * one `@@fullTextIndex` `nutrition_data_search` builds in `schema.prisma`, or
 * Postgres stops using the index (no error, just a sequential scan).
 */
export async function searchFoods(
	db: Db,
	search: string,
	offset: number,
	limit: number
): Promise<FoodSearchHit[]> {
	const plan = db.raw.sql`
WITH query AS (
  SELECT websearch_to_tsquery('english', ${search}::text) AS tsq, ${search}::text AS raw
),
doc AS (
  SELECT
    n.*,
    setweight(to_tsvector('english', coalesce(n."productName", '')), 'A') ||
      setweight(to_tsvector('english', coalesce(n.brands, '')), 'B') AS document
  FROM "NutritionData" n
)
SELECT
  n.id,
  n.code,
  n."productName",
  n.brands,
  n."energyKcal_100g",
  n."servingSize",
  n."servingQuantity"
FROM doc n, query q
WHERE
  n.document @@ q.tsq
  OR n."productName" % q.raw
  OR n.brands % q.raw
ORDER BY
  (
    -- Full-text rank: normalization flag 32 divides by (1 + unique-word count)
    -- This penalizes keyword-stuffed entries like "chicken chicken chicken"
    -- Weights: {D, C, B, A} = {0.1, 0.2, 0.4, 1.0} — productName (A) > brands (B)
    ts_rank_cd('{0.1, 0.2, 0.4, 1.0}', n.document, q.tsq, 32) * 0.7
    +
    -- Trigram similarity for fuzzy/typo matching
    GREATEST(
      similarity(n."productName", q.raw),
      similarity(COALESCE(n.brands, ''), q.raw)
    ) * 0.3
  ) * 0.7
  +
  -- Scan popularity: log-normalized to prevent mega-popular items dominating
  LEAST(LN(GREATEST(n."uniqueScans", 1)) / LN(10000), 1.0) * 0.2
  +
  -- Completeness: already 0–1 float
  COALESCE(n.completeness, 0) * 0.1
  DESC,
  n.id ASC
LIMIT ${limit}
OFFSET ${offset}`
		.returnsRow({
			id: 'pg/text@1',
			code: 'pg/text@1',
			productName: 'pg/text@1',
			brands: 'pg/text@1',
			energyKcal_100g: 'pg/float8@1',
			servingSize: 'pg/text@1',
			servingQuantity: 'pg/float8@1'
		})
		.build();

	const hits: FoodSearchHit[] = [];
	for await (const hit of db.runtime().query(plan)) hits.push(hit as FoodSearchHit);
	return hits;
}
