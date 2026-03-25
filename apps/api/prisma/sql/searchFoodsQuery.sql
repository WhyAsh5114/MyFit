-- @param {String} $1:search - The search term to look for
-- @param {Int} $2:offset - Number of results to skip (for pagination)
-- @param {Int} $3:limit - Number of results to return

WITH query AS (
  SELECT
    websearch_to_tsquery('english', unaccent($1::text)) AS tsq,
    $1::text AS raw
)
SELECT
  n.id,
  n.code,
  n."productName",
  n.brands,
  n."energyKcal_100g",
  n."servingSize",
  n."servingQuantity"
FROM "NutritionData" n, query q
WHERE
  n."searchVector" @@ q.tsq
  OR n."productName" % q.raw
  OR n.brands % q.raw
ORDER BY
  (
    -- Full-text rank: normalization flag 32 divides by (1 + unique-word count)
    -- This penalizes keyword-stuffed entries like "chicken chicken chicken"
    -- Weights: {D, C, B, A} = {0.1, 0.2, 0.4, 1.0} — productName (A) > brands (B)
    ts_rank_cd(
      '{0.1, 0.2, 0.4, 1.0}',
      n."searchVector",
      q.tsq,
      32
    ) * 0.7
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
LIMIT $3
OFFSET $2;
