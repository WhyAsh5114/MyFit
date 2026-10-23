import type { getDb } from '../../../lib/db.js';

type Db = Awaited<ReturnType<typeof getDb>>;

const MAX_SEARCH_LENGTH = 120;
const MAX_SEARCH_TOKENS = 8;
const MIN_SEARCH_TOKEN_LENGTH = 2;
const MIN_FUZZY_TOKEN_LENGTH = 3;
const MIN_TRANSPOSITION_LENGTH = 3;
const MAX_TRANSPOSITION_LENGTH = 24;

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

/** Quote a token as a tsquery lexeme, independently of SQL parameter binding. */
function quoteLexeme(token: string): string {
	return `'${token.replace(/\\/g, '\\\\').replace(/'/g, "''")}'`;
}

/** Try one adjacent-letter swap; keep short words and long identifiers literal. */
function transpositions(token: string): string[] {
	const letters = [...token];
	const variants = new Set([token]);
	if (letters.length >= MIN_TRANSPOSITION_LENGTH && letters.length <= MAX_TRANSPOSITION_LENGTH) {
		for (let i = 0; i < letters.length - 1; i++) {
			const swapped = [...letters];
			[swapped[i], swapped[i + 1]] = [swapped[i + 1], swapped[i]];
			variants.add(swapped.join(''));
		}
	}
	return [...variants];
}

/** Change at most one word so spelling candidates do not expand into combinations. */
function spellingCandidates(tokens: string[]): string[] {
	const spellings = new Set([tokens.join(' ')]);
	for (let i = 0; i < tokens.length; i++) {
		for (const variant of transpositions(tokens[i])) {
			const words = [...tokens];
			words[i] = variant;
			spellings.add(words.join(' '));
		}
	}
	return [...spellings];
}

/** Normalize search-box input and bound prefix and spelling expansion work. */
function prepareSearch(search: string) {
	const raw = search.normalize('NFKC').trim().replace(/\s+/g, ' ');
	if (raw.length > MAX_SEARCH_LENGTH) return null;
	const tokens = raw.toLowerCase().match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu) ?? [];
	if (
		tokens.length > MAX_SEARCH_TOKENS ||
		!tokens.some((token) => [...token].length >= MIN_SEARCH_TOKEN_LENGTH)
	) {
		return null;
	}
	const operators = /"|(?:^|\s)-[\p{L}\p{N}]|(?:^|\s)OR(?:\s|$)/iu.test(raw);
	const prefix = tokens
		.map((token, i) => quoteLexeme(token) + (i === tokens.length - 1 ? ':*' : ''))
		.join(' & ');
	const spellings = operators ? [tokens.join(' ')] : spellingCandidates(tokens);
	const corrections = spellings
		.map((spelling) => '(' + spelling.split(' ').map(quoteLexeme).join(' & ') + ')')
		.join(' | ');
	const fuzzy = !operators && tokens.every((token) => [...token].length >= MIN_FUZZY_TOKEN_LENGTH);
	return { raw, tokens, operators, prefix, corrections, spellings, fuzzy };
}

/**
 * Search names and brands with final-word typeahead, then bounded typo recovery.
 * Quotes, OR and exclusions retain web-search semantics and disable recovery.
 * Recovery runs only when the preceding candidate set is empty, across all pages.
 * The document expression must match the schema's nutrition_data_search index.
 */
export async function searchFoods(
	db: Db,
	search: string,
	offset: number,
	limit: number
): Promise<FoodSearchHit[]> {
	const query = prepareSearch(search);
	if (!query) return [];
	const { raw, tokens, operators, prefix, corrections, spellings, fuzzy } = query;
	const plan = db.raw.sql`
WITH query AS (
  SELECT
    CASE WHEN ${operators}::boolean THEN websearch_to_tsquery('english', ${raw}::text)
      ELSE to_tsquery('english', ${prefix}::text) END AS tsq,
    to_tsquery('english', ${corrections}::text) AS corrections,
    ${raw}::text AS raw, ${JSON.stringify(tokens)}::jsonb AS tokens,
    ${JSON.stringify(spellings)}::jsonb AS spellings
),
doc AS NOT MATERIALIZED (
  SELECT n.id, n.code, n."productName", n.brands, n."energyKcal_100g",
    n."servingSize", n."servingQuantity", n."uniqueScans", n.completeness,
    setweight(to_tsvector('english', coalesce(n."productName", '')), 'A') ||
      setweight(to_tsvector('english', coalesce(n.brands, '')), 'B') AS document
  FROM "NutritionData" n
),
matched AS MATERIALIZED (
  SELECT n.*, 0 AS mode FROM doc n, query q
  WHERE querytree(q.tsq) <> 'T' AND n.document @@ q.tsq
),
corrected AS MATERIALIZED (
  SELECT n.*, 1 AS mode FROM doc n, query q
  WHERE ${!operators}::boolean AND NOT EXISTS (SELECT 1 FROM matched)
    AND numnode(q.tsq) > 0 AND n.document @@ q.corrections
),
candidates AS (
  SELECT * FROM matched
  UNION ALL SELECT * FROM corrected
  UNION ALL
  SELECT n.*, 2 AS mode FROM doc n, query q
  WHERE ${fuzzy}::boolean
    AND numnode(q.tsq) > 0
    AND NOT EXISTS (SELECT 1 FROM matched)
    AND NOT EXISTS (SELECT 1 FROM corrected)
    AND (n."productName" % q.raw OR n.brands % q.raw)
    -- Require every word so unrelated popular products cannot fill missing intent.
    AND NOT EXISTS (
      SELECT 1 FROM jsonb_array_elements_text(q.tokens) AS token(value)
      WHERE strict_word_similarity(token.value, n."productName" || ' ' || coalesce(n.brands, '')) < 0.35
    )
)
SELECT n.id, n.code, n."productName", n.brands, n."energyKcal_100g",
  n."servingSize", n."servingQuantity"
FROM candidates n, query q
ORDER BY
  CASE WHEN ${tokens.length === 1 && [...tokens[0]].length === MIN_SEARCH_TOKEN_LENGTH}::boolean
    THEN similarity(q.raw, n."productName") ELSE 0 END DESC,
  CASE WHEN n.mode = 2 THEN strict_word_similarity(q.raw, n."productName")
    ELSE ts_rank_cd('{0.1, 0.2, 0.4, 1.0}', n.document,
      CASE WHEN n.mode = 0 THEN q.tsq ELSE q.corrections END,
      2) * 0.4 -- Divide cover-density rank by document length.
      + 0.6 * CASE WHEN n.mode = 0 THEN similarity(q.raw, n."productName") ELSE (
        SELECT max(similarity(spelling.value, n."productName"))
        FROM jsonb_array_elements_text(q.spellings) AS spelling(value)
      ) END
      -- Reduce popularity (0.2 to 0.05) and completeness (0.1 to 0.025)
      -- so strong name matches outrank popular ingredient-based products.
      + LEAST(LN(GREATEST(n."uniqueScans", 1)) / LN(10000), 1.0) * 0.05
      + coalesce(n.completeness, 0) * 0.025
  END DESC,
  n."uniqueScans" DESC, n.completeness DESC, n.id ASC
LIMIT ${limit} OFFSET ${offset}`
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
