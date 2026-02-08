SELECT id
FROM "NutritionData"
WHERE search_vector @@ to_tsquery('english', $1)
ORDER BY ts_rank_cd(search_vector, to_tsquery('english', $1)) DESC
LIMIT 20;