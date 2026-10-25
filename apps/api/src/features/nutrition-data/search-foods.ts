import type { getDb } from '../../../lib/db.js';
import { NUTRITION_DATA_SEARCH_MAX_OFFSET } from '../../../lib/constants.ts';

/** Connected database client used by the search query. */
type Db = Awaited<ReturnType<typeof getDb>>;

const MAX_SEARCH_CANDIDATES = 1_000;
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
	const spellings = operators ? [tokens.join(' ')] : spellingCandidates(tokens);
	const fuzzy = !operators && tokens.every((token) => [...token].length >= MIN_FUZZY_TOKEN_LENGTH);
	return { raw, tokens, operators, spellings, fuzzy };
}

/**
 * Search names and brands with final-word typeahead, then bounded typo recovery.
 * Quotes, OR and exclusions retain web-search semantics and disable recovery.
 * Recovery runs only when the preceding candidate set is empty, across all pages.
 * Each mode selects a stable popularity pool before scoring or fuzzy word checks.
 * Broad queries trade recall for bounded ranking work; refine input for rarer foods.
 * Trigram expressions must match the immutable wrapper indexes in schema.prisma.
 * The document expression must match the schema's nutrition_data_search index.
 */
export async function searchFoods(
	db: Db,
	search: string,
	offset: number,
	limit: number
): Promise<FoodSearchHit[]> {
	if (
		!Number.isInteger(offset) ||
		offset < 0 ||
		offset >= NUTRITION_DATA_SEARCH_MAX_OFFSET ||
		!Number.isInteger(limit) ||
		limit <= 0
	)
		return [];
	const query = prepareSearch(search);
	if (!query) return [];
	const { raw, tokens, operators, spellings, fuzzy } = query;
	const plan = db.raw.sql`
WITH lexemes AS (
  -- Fold before quoting: unaccent can turn punctuation into tsquery syntax.
  SELECT spelling.ordinal AS spelling, token.ordinal AS position,
    quote_literal(public.immutable_unaccent(token.value)) AS lexeme
  FROM jsonb_array_elements(${JSON.stringify(spellings.map((spelling) => spelling.split(' ')))}::jsonb)
    WITH ORDINALITY AS spelling(words, ordinal),
    jsonb_array_elements_text(spelling.words) WITH ORDINALITY AS token(value, ordinal)
),
spellings AS (
  SELECT spelling, string_agg(lexeme, ' & ' ORDER BY position) AS exact,
    string_agg(lexeme || CASE WHEN position = ${tokens.length} THEN ':*' ELSE '' END,
      ' & ' ORDER BY position) AS prefix
  FROM lexemes GROUP BY spelling
),
query AS (
  SELECT
    CASE WHEN ${operators}::boolean THEN websearch_to_tsquery('english', public.immutable_unaccent(${raw}::text))
      ELSE to_tsquery('english', (SELECT prefix FROM spellings WHERE spelling = 1)) END AS tsq,
    to_tsquery('english', (SELECT string_agg('(' || exact || ')', ' | ') FROM spellings)) AS corrections,
    public.immutable_unaccent(${raw}::text) AS raw, ${JSON.stringify(tokens)}::jsonb AS tokens,
    ${JSON.stringify(spellings)}::jsonb AS spellings
),
doc AS NOT MATERIALIZED (
  SELECT n.id, n.code, n."productName", n.brands, n."energyKcal_100g",
    n."servingSize", n."servingQuantity", n."uniqueScans", n.completeness,
    setweight(to_tsvector('english', public.immutable_unaccent(coalesce(n."productName", ''))), 'A') ||
      setweight(to_tsvector('english', public.immutable_unaccent(coalesce(n.brands, ''))), 'B') AS document
  FROM "NutritionData" n
),
matched AS MATERIALIZED (
  SELECT n.id FROM doc n, query q
  WHERE querytree(q.tsq) <> 'T' AND n.document @@ q.tsq
  ORDER BY n."uniqueScans" DESC, n.id ASC
  LIMIT ${MAX_SEARCH_CANDIDATES}
),
corrected AS MATERIALIZED (
  SELECT n.id FROM doc n, query q
  WHERE ${!operators}::boolean AND NOT EXISTS (SELECT 1 FROM matched)
    AND numnode(q.tsq) > 0 AND n.document @@ q.corrections
  ORDER BY n."uniqueScans" DESC, n.id ASC
  LIMIT ${MAX_SEARCH_CANDIDATES}
),
fuzzy_pool AS MATERIALIZED (
  SELECT n.id FROM "NutritionData" n, query q
  WHERE ${fuzzy}::boolean
    AND numnode(q.tsq) > 0
    AND NOT EXISTS (SELECT 1 FROM matched)
    AND NOT EXISTS (SELECT 1 FROM corrected)
    AND (public.immutable_unaccent(n."productName") % q.raw OR public.immutable_unaccent(n.brands) % q.raw)
  ORDER BY n."uniqueScans" DESC, n.id ASC
  LIMIT ${MAX_SEARCH_CANDIDATES}
),
candidates AS MATERIALIZED (
  SELECT id, 0 AS mode FROM matched
  UNION ALL SELECT id, 1 AS mode FROM corrected
  UNION ALL
  SELECT n.id, 2 AS mode FROM fuzzy_pool f JOIN "NutritionData" n ON n.id = f.id CROSS JOIN query q
    -- Require every word so unrelated popular products cannot fill missing intent.
  WHERE NOT EXISTS (
      SELECT 1 FROM jsonb_array_elements_text(q.tokens) AS token(value)
      WHERE strict_word_similarity(public.immutable_unaccent(token.value), public.immutable_unaccent(n."productName" || ' ' || coalesce(n.brands, ''))) < 0.35
    )
)
SELECT n.id, n.code, n."productName", n.brands, n."energyKcal_100g",
  n."servingSize", n."servingQuantity"
FROM candidates c JOIN doc n ON n.id = c.id CROSS JOIN query q
ORDER BY
  CASE WHEN ${tokens.length === 1 && [...tokens[0]].length === MIN_SEARCH_TOKEN_LENGTH}::boolean
    THEN similarity(q.raw, public.immutable_unaccent(n."productName")) ELSE 0 END DESC,
  CASE WHEN c.mode = 2 THEN strict_word_similarity(q.raw, public.immutable_unaccent(n."productName"))
    ELSE ts_rank_cd('{0.1, 0.2, 0.4, 1.0}', n.document,
      CASE WHEN c.mode = 0 THEN q.tsq ELSE q.corrections END,
      2) * 0.4 -- Divide cover-density rank by document length.
      + 0.6 * CASE WHEN c.mode = 0 THEN similarity(q.raw, public.immutable_unaccent(n."productName")) ELSE (
        SELECT max(similarity(public.immutable_unaccent(spelling.value), public.immutable_unaccent(n."productName")))
        FROM jsonb_array_elements_text(q.spellings) AS spelling(value)
      ) END
      -- Reduce popularity (0.2 to 0.05) and completeness (0.1 to 0.025)
      -- so strong name matches outrank popular ingredient-based products.
      + LEAST(LN(GREATEST(n."uniqueScans", 1)) / LN(10000), 1.0) * 0.05
      + coalesce(n.completeness, 0) * 0.025
  END DESC,
  n."uniqueScans" DESC, n.completeness DESC, n.id ASC
LIMIT ${Math.min(limit, NUTRITION_DATA_SEARCH_MAX_OFFSET - offset)} OFFSET ${offset}`
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
