-- @param {String} $1:search - The search term to look for
-- @param {Int} $2:offset - Number of results to skip (for pagination)
-- @param {Int} $3:limit - Number of results to return

SELECT
  id,
  code,
  "productName",
  brands,
  "energyKcal_100g",
  "servingSize",
  "servingQuantity"
FROM "NutritionData"
WHERE
  "searchVector" @@ websearch_to_tsquery('english', unaccent($1::text))
  OR "productName" % $1::text
  OR brands % $1::text
ORDER BY
  -- Full-text rank (weighted higher)
  ts_rank_cd(
    "searchVector",
    websearch_to_tsquery('english', unaccent($1::text))
  ) * 0.7
  +
  -- Trigram similarity (weighted lower)
  GREATEST(
    similarity("productName", $1::text),
    similarity(COALESCE(brands, ''), $1::text)
  ) * 0.3
  DESC,
  id ASC
LIMIT $3
OFFSET $2;
