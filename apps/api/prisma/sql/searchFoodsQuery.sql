-- @param {String} $1:search - The search term to look for
-- @param {Int} $2:offset - Number of rows to skip for pagination
-- @param {Int} $3:limit - Number of results to return
SELECT
  id,
  code,
  "productName",
  brands,
  "energyKcal_100g"
FROM "NutritionData"
WHERE
  -- Use trigram similarity operator (uses GIN index efficiently)
  "productName" % $1::text
  OR brands % $1::text
  OR "searchVector" @@ websearch_to_tsquery('english', unaccent($1::text))
ORDER BY
  -- Use distance operators for fast ordering (also uses indexes)
  "productName" <-> $1::text,
  brands <-> $1::text,
  LENGTH("productName") ASC
LIMIT $3::INT
OFFSET $2::INT;