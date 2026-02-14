-- @param {String} $1:search - The search term to look for
-- @param {Int} $2:offset - Number of rows to skip for pagination
-- @param {Int} $3:limit - Number of results to return
SELECT
  id,
  code,
  product_name,
  brands,
  energy_kcal_100g
FROM "NutritionData"
WHERE
  -- Use trigram similarity operator (uses GIN index efficiently)
  product_name % $1
  OR brands % $1
  OR search_vector @@ websearch_to_tsquery('english', unaccent($1))
ORDER BY
  -- Use distance operators for fast ordering (also uses indexes)
  product_name <-> $1,
  brands <-> $1,
  LENGTH(product_name) ASC
LIMIT $3::INT
OFFSET $2::INT;